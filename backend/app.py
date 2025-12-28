from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import subprocess
import os
import uuid
import time
import threading
from functools import wraps
import hashlib

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Config
UPLOAD_FOLDER = '/tmp/uploads'
OUTPUT_FOLDER = '/tmp/outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
TOOL_PATH = os.environ.get('WATERMARK_TOOL_PATH', '/opt/byewatermark/GeminiWatermarkTool')

# Rate limiting (simple in-memory, use Redis in production)
rate_limit_store = {}
FREE_LIMIT_PER_DAY = 100

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def get_client_ip():
    return request.headers.get('CF-Connecting-IP', 
           request.headers.get('X-Forwarded-For', 
           request.remote_addr))

def check_rate_limit(ip):
    today = time.strftime('%Y-%m-%d')
    key = f"{ip}:{today}"
    count = rate_limit_store.get(key, 0)
    return count < FREE_LIMIT_PER_DAY

def increment_rate_limit(ip):
    today = time.strftime('%Y-%m-%d')
    key = f"{ip}:{today}"
    rate_limit_store[key] = rate_limit_store.get(key, 0) + 1

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_files():
    """Remove files older than 1 hour"""
    while True:
        time.sleep(3600)
        now = time.time()
        for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
            for f in os.listdir(folder):
                path = os.path.join(folder, f)
                if os.path.isfile(path) and now - os.path.getmtime(path) > 3600:
                    os.remove(path)

# Start cleanup thread
threading.Thread(target=cleanup_old_files, daemon=True).start()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/remaining', methods=['GET'])
def remaining():
    ip = get_client_ip()
    today = time.strftime('%Y-%m-%d')
    key = f"{ip}:{today}"
    used = rate_limit_store.get(key, 0)
    return jsonify({
        'remaining': max(0, FREE_LIMIT_PER_DAY - used),
        'limit': FREE_LIMIT_PER_DAY
    })

@app.route('/api/remove', methods=['POST'])
def remove_watermark():
    ip = get_client_ip()
    
    # Check rate limit
    if not check_rate_limit(ip):
        return jsonify({
            'error': 'Daily limit reached. Upgrade to Pro for unlimited access.',
            'code': 'RATE_LIMITED'
        }), 429
    
    # Check file
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use PNG, JPG, or WebP.'}), 400
    
    # Check file size
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large. Max 10MB.'}), 400
    
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        ext = file.filename.rsplit('.', 1)[1].lower()
        input_filename = f"{file_id}.{ext}"
        input_path = os.path.join(UPLOAD_FOLDER, input_filename)
        file.save(input_path)
        
        # Output path
        output_filename = f"{file_id}_clean.{ext}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        # Run the tool
        result = subprocess.run(
            [TOOL_PATH, '-i', input_path, '-o', output_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            return jsonify({'error': 'Processing failed. Try another image.'}), 500
        
        if not os.path.exists(output_path):
            return jsonify({'error': 'Processing failed. No output generated.'}), 500
        
        # Increment rate limit on success
        increment_rate_limit(ip)
        
        # Return download URL
        return jsonify({
            'success': True,
            'download_id': file_id,
            'filename': output_filename
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Processing timeout. Try a smaller image.'}), 500
    except Exception as e:
        return jsonify({'error': 'Server error. Please try again.'}), 500
    finally:
        # Cleanup input file
        if os.path.exists(input_path):
            os.remove(input_path)

@app.route('/api/download/<file_id>', methods=['GET'])
def download(file_id):
    # Find file with this ID
    for f in os.listdir(OUTPUT_FOLDER):
        if f.startswith(file_id):
            path = os.path.join(OUTPUT_FOLDER, f)
            return send_file(path, as_attachment=True, download_name=f'cleaned_{f}')
    
    return jsonify({'error': 'File not found or expired'}), 404

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode)