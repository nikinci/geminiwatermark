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
import hmac
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timezone

# Load env vars from .env and .env.local
load_dotenv() 
load_dotenv('.env.local')

import re

app = Flask(__name__)

# Security: Allowed Origins
ALLOWED_ORIGINS = [
    r"http://localhost:3000",
    r"http://127\.0\.0\.1:3000",
    r"http://192\.168\.\d{1,3}\.\d{1,3}:3000", # Local Network
    r"https://.*\.railway\.app", # Railway domains
    r"https://(www\.)?geminiwatermark\.ai", # Production domain (www and naked)
]

def is_origin_allowed(origin):
    if not origin: return False
    return any(re.match(pattern, origin) for pattern in ALLOWED_ORIGINS)

# 1. Strict CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}) # We'll enforce stricter logic in before_request

# Supabase Setup
# Supabase Setup
# Supabase Setup
# Supabase Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️  WARNING: Supabase credentials not found. Pro user verification will FAIL.")
    print("   Please set SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.local")
    supabase = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        supabase = None

# Lemon Squeezy Setup
LEMONSQUEEZY_WEBHOOK_SECRET = os.environ.get("LEMONSQUEEZY_WEBHOOK_SECRET")

# 2. Origin/Referer Validation Middleware
@app.before_request
def check_security():
    # Allow OPTIONS requests (Preflight)
    if request.method == 'OPTIONS':
        return

    origin = request.headers.get('Origin')
    referer = request.headers.get('Referer')
    client_ip = get_client_ip()

    # Skip check for Health check and Webhooks
    if request.path == '/api/health' or request.path.startswith('/api/webhooks'):
        return

    # In Production: Enforce Origin/Referer
    # In Local Dev: We can be more lenient, but let's test logic
    # If Origin is present, it MUST be allowed
    if origin and not is_origin_allowed(origin):
        # logger.warning(f"⛔ Blocked unauthorized Origin: {origin} from IP {client_ip}") 
        return jsonify({'error': 'Unauthorized Origin'}), 403

    # If no Origin (e.g. direct browser navigation or curl), check Referer
    # APIs called from fetch() usually have Origin.
    # Note: Curl/Postman can spoof this, but it stops simple browser console attacks from other sites.

# Config
UPLOAD_FOLDER = '/tmp/uploads'
OUTPUT_FOLDER = '/tmp/outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
TOOL_PATH = os.environ.get('WATERMARK_TOOL_PATH', '/opt/byewatermark/GeminiWatermarkTool')

# Rate limiting (Redis -> In-Memory Fallback)
rate_limit_store = {}
FREE_LIMIT_PER_DAY = 3

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
        except Exception as e:
            print(f"⚠️ Redis READ error: {e}")
            pass # Fallback to memory
            
    return rate_limit_store.get(key, 0)

# Check User Subscription Status
# Check User Subscription Status
def is_pro_user(user_id):
    if not supabase or not user_id:
        return False
    try:
        # Check profiles table for is_pro AND pro_expires_at
        response = supabase.table('profiles').select('is_pro, pro_expires_at').eq('id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            user_data = response.data[0]
            
            # 1. Check permanent Pro status
            if user_data.get('is_pro'):
                return True
                
            # 2. Check temporary/expiring Pro status
            expires_at_str = user_data.get('pro_expires_at')
            if expires_at_str:
                # Handle ISO format from Supabase (may contain Z or offset)
                try:
                    # Helper to handle 'Z' if python < 3.11, though fromisoformat usually handles it in newer pythons
                    # Being safe by replacing Z with +00:00
                    expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                    
                    # Ensure timezone awareness for comparison
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                        
                    now = datetime.now(timezone.utc)
                    
                    if expires_at > now:
                        return True
                except ValueError:
                    print(f"⚠️ Date parse error for user {user_id}: {expires_at_str}")
                    
    except Exception as e:
        print(f"Supabase Check Error: {e}")
    return False

def check_rate_limit(ip, user_id=None):
    # 1. If User is Pro, perform NO LIMIT check
    if user_id and is_pro_user(user_id):
        return True # Unlimited

    # 2. Else, check daily limit by IP
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
        except Exception as e:
            print(f"⚠️ Redis WRITE error: {e}")
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

# --- WEBHOOKS ---
@app.route('/api/webhooks/lemonsqueezy', methods=['POST'])
def lemonsqueezy_webhook():
    if not LEMONSQUEEZY_WEBHOOK_SECRET:
        return jsonify({'error': 'Server configuration error'}), 500

    # 1. Verify Signature
    signature = request.headers.get('X-Signature')
    if not signature:
        return jsonify({'error': 'No signature'}), 401

    # Digest payload
    digest = hmac.new(
        LEMONSQUEEZY_WEBHOOK_SECRET.encode('utf-8'),
        request.data,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(digest, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    # 2. Process Event
    data = request.json
    event_name = data.get('meta', {}).get('event_name')
    payload = data.get('data', {}).get('attributes', {})
    
    # Custom Data contains User ID
    custom_data = data.get('meta', {}).get('custom_data', {})
    user_id = custom_data.get('user_id')

    print(f"🔔 Webhook received: {event_name} for User {user_id}")

    if not user_id or not supabase:
        print("⚠️ Missing User ID or Supabase Client")
        return jsonify({'status': 'ignored'}), 200

    try:
        if event_name == 'subscription_created' or event_name == 'subscription_updated':
            status = payload.get('status')
            # Active statuses: active, on_trial, past_due (usually give grace period)
            is_active = status in ['active', 'on_trial']
            
            supabase.table('profiles').update({
                'is_pro': is_active,
                'subscription_id': data.get('data', {}).get('id'),
                'customer_id': payload.get('customer_id')
            }).eq('id', user_id).execute()
            
            print(f"✅ User {user_id} Updated: Pro={is_active}")

        elif event_name == 'subscription_cancelled' or event_name == 'subscription_expired':
            supabase.table('profiles').update({
                'is_pro': False
            }).eq('id', user_id).execute()
            print(f"❌ User {user_id} Cancelled Pro")

    except Exception as e:
        print(f"🔥 Webhook Error: {e}")
        return jsonify({'error': str(e)}), 500

    return jsonify({'status': 'ok'})

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
    user_id = request.form.get('user_id') # Get User ID from Frontend
    
    # Check rate limit
    if not check_rate_limit(ip, user_id):
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
        return jsonify({'error': 'File too large. Max 25MB.'}), 400
    
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

@app.route('/api/contact', methods=['POST'])
def contact_form():
    data = request.json
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')

    if not email or not message:
        return jsonify({'error': 'Email and Message are required'}), 400

    # Rate Limit Check for Contact Form (reuse IP check)
    ip = get_client_ip()
    # Optional: Implement strict rate limit for contact form to prevent spam
    
    api_key = os.environ.get('RESEND_API_KEY')
    admin_email = os.environ.get('ADMIN_EMAIL', 'onboarding@resend.dev') # Default sender if verified

    if api_key:
        try:
            import resend
            resend.api_key = api_key
            
            # Email Template
            html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
                    <h2 style="color: #2563eb; margin: 0; font-size: 24px;">GeminiWatermark.ai</h2>
                    <span style="font-size: 14px; color: #6b7280;">New Contact Message</span>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">From</p>
                    <p style="margin: 4px 0 0; color: #111827; font-weight: 600; font-size: 16px;">{email}</p>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Subject</p>
                    <p style="margin: 4px 0 0; color: #111827; font-weight: 600; font-size: 16px;">{subject}</p>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; color: #374151; line-height: 1.6;">
                    {message}
                </div>
                
                <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Sent via GeminiWatermark Contact Form
                </div>
              </div>
            </div>
            """

            # Send email
            r = resend.Emails.send({
                "from": "GeminiWatermark Contact <onboarding@resend.dev>",
                "to": admin_email, # Send TO the admin
                "reply_to": email,
                "subject": f"[GeminiWatermark.ai] {subject}",
                "html": html_content
            })
            return jsonify({'success': True, 'id': r.get('id')})
        except Exception as e:
            logger.error(f"Resend Error: {e}")
            return jsonify({'error': 'Failed to send email'}), 500
    else:
        # Mock send (Log only)
        logger.info(f"MOCK EMAIL SENT: From={email}, Subject={subject}, Message={message}")
        return jsonify({'success': True, 'mock': True})

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode)