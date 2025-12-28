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
from dotenv import load_dotenv

# Load env vars from .env and .env.local
load_dotenv() 
load_dotenv('.env.local')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Config
UPLOAD_FOLDER = '/tmp/uploads'
OUTPUT_FOLDER = '/tmp/outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
TOOL_PATH = os.environ.get('WATERMARK_TOOL_PATH', '/opt/byewatermark/GeminiWatermarkTool')

# Rate limiting (Redis -> In-Memory Fallback)
rate_limit_store = {}
FREE_LIMIT_PER_DAY = 100

# Redis Setup
redis_client = None
if os.environ.get('REDIS_URL'):
    try:
        import redis
        redis_client = redis.from_url(os.environ.get('REDIS_URL'))
        redis_client.ping() # Test connection
        print("✅ Connected to Redis")
    except Exception as e:
        print(f"⚠️ Redis connection failed: {e}")
        redis_client = None
else:
    print("ℹ️  No REDIS_URL found. Using In-Memory rate limiting (Local Dev Mode).")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def get_client_ip():
    return request.headers.get('CF-Connecting-IP', 
           request.headers.get('X-Forwarded-For', 
           request.remote_addr))

def get_rate_limit_usage(ip):
    today = time.strftime('%Y-%m-%d')
    key = f"rate_limit:{ip}:{today}"
    
    if redis_client:
        try:
            val = redis_client.get(key)
            return int(val) if val else 0
        except Exception:
            pass # Fallback to memory on temporary Redis failure
            
    return rate_limit_store.get(key, 0)

def check_rate_limit(ip):
    count = get_rate_limit_usage(ip)
    return count < FREE_LIMIT_PER_DAY

def increment_rate_limit(ip):
    today = time.strftime('%Y-%m-%d')
    key = f"rate_limit:{ip}:{today}"
    
    if redis_client:
        try:
            redis_client.incr(key)
            redis_client.expire(key, 86400) # Expire in 24 hours
            return
        except Exception:
            pass
            
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
    used = get_rate_limit_usage(ip)
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
        
        # Save raw upload (SINGLE TIME)
        file.save(input_path)

        # Pre-process: Fix orientation AND enforce RGB (removes Alpha/RGBA issues)
        try:
            from PIL import Image, ImageOps
            
            # Open and fix orientation
            with Image.open(input_path) as img:
                fixed_img = ImageOps.exif_transpose(img)
                
                # Force convert to RGB (drops Alpha channel, standardizes format)
                # This fixes the "black watermark" issue if input was RGBA
                if fixed_img.mode != 'RGB':
                    fixed_img = fixed_img.convert('RGB')
                
                # Always save back to ensure standardized format (Pillow default JPEG/PNG)
                # We reuse the input_path. If it was PNG, we might want to ensure it has .png extension,
                # but the tool handles extensions based on file content usually, or we trust flask extension.
                
                # VALIDATION: Check for low resolution (thumbnail/preview images)
                # The tool requires sufficient resolution to detect the watermark pattern accurately.
                MIN_DIMENSION = 800
                if fixed_img.width < MIN_DIMENSION and fixed_img.height < MIN_DIMENSION:
                     return jsonify({
                        'error': 'Image resolution too low for accurate removal.',
                        'code': 'LOW_RESOLUTION',
                        'message': 'Uploaded image is a low-quality preview (likely from Gemini App). Please upload the original high-res image.'
                     }), 400

                # OPTIMIZATION: Use Max Quality settings to prevent generation loss
                save_kwargs = {}
                # Check format or extension
                is_jpeg = img.format == 'JPEG' or ext in ['jpg', 'jpeg']
                is_webp = img.format == 'WEBP' or ext == 'webp'
                
                if is_jpeg:
                    save_kwargs = {'quality': 100, 'subsampling': 0}
                elif is_webp:
                    save_kwargs = {'quality': 100, 'lossless': True}
                
                fixed_img.save(input_path, **save_kwargs)
                
        except Exception as e:
            print(f"Image pre-processing failed: {e}")
            # Fallback to raw file if Pillow fails
        
        # Output path
        output_filename = f"{file_id}_clean.{ext}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        # Run the tool
        if not os.path.exists(TOOL_PATH):
             print(f"CRITICAL: Tool not found at {TOOL_PATH}")
             return jsonify({'error': f'Server Config Error: Tool not found at {TOOL_PATH}'}), 500

        # Run the tool
        # Enable verbose logging only if needed for critical debugging, otherwise standard run
        result = subprocess.run(
            [TOOL_PATH, '-i', input_path, '-o', output_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            print(f"TOOL FAILED: {result.stderr}")
            return jsonify({'error': f'Tool execution failed: {result.stderr}'}), 500
        
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
        print(f"CRITICAL SERVER ERROR: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
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