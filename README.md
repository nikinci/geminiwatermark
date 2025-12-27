# ByeWatermark.io - Deployment Guide

## Quick Start

### 1. Backend (API)

**Option A: VPS with Docker (Recommended)**

```bash
# On your VPS (Hetzner €4/mo or DigitalOcean $6/mo)
git clone <your-repo>
cd byewatermark

# Build and run
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

**Option B: Direct on VPS**

```bash
# Install dependencies
sudo apt update
sudo apt install python3 python3-pip wget unzip

# Download watermark tool
cd /opt
sudo mkdir byewatermark && cd byewatermark
sudo wget https://github.com/allenk/GeminiWatermarkTool/releases/download/v1.1.0/GeminiWatermarkTool-Linux-x64.zip
sudo unzip GeminiWatermarkTool-Linux-x64.zip
sudo chmod +x GeminiWatermarkTool

# Setup app
cd /home/ubuntu/byewatermark/backend
pip3 install -r requirements.txt --break-system-packages

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
```

### 2. Frontend

**Option A: Cloudflare Pages (Free, Recommended)**

1. Push `frontend/` folder to GitHub
2. Connect repo to Cloudflare Pages
3. Deploy settings: just static files, no build needed
4. Set custom domain: byewatermark.io

**Option B: Vercel**

```bash
cd frontend
npx vercel --prod
```

**Option C: Same VPS with Nginx**

```bash
sudo apt install nginx
sudo cp frontend/index.html /var/www/html/
sudo systemctl restart nginx
```

### 3. Domain & SSL Setup

**Cloudflare (Recommended)**

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Add DNS records:
   - `A` record: `@` → your VPS IP (for API)
   - `CNAME` record: `api` → your VPS IP
4. Enable SSL/TLS (Full strict)
5. Enable "Always HTTPS"

**API subdomain:**
- Point `api.byewatermark.io` to your VPS
- Update `API_URL` in `index.html`

### 4. Nginx Config (for API)

```nginx
server {
    listen 80;
    server_name api.byewatermark.io;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 15M;
    }
}
```

### 5. Systemd Service (for auto-restart)

Create `/etc/systemd/system/byewatermark.service`:

```ini
[Unit]
Description=ByeWatermark API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/byewatermark/backend
ExecStart=/usr/local/bin/gunicorn --bind 127.0.0.1:5000 --workers 2 --timeout 120 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable byewatermark
sudo systemctl start byewatermark
```

## Costs

| Service | Cost |
|---------|------|
| VPS (Hetzner CX22) | €4/month |
| Domain (.io) | ~$35/year |
| Cloudflare | Free |
| **Total** | **~$7/month** |

## Monetization Ideas

1. **Freemium**: 3 free/day, $2.99/month unlimited
2. **Pay-per-use**: $0.25/image after free tier
3. **Ads**: Google AdSense sidebar (less recommended)

## Adding Stripe (for payments)

```bash
pip install stripe
```

Add to `app.py`:
```python
import stripe
stripe.api_key = 'sk_...'

@app.route('/api/create-checkout', methods=['POST'])
def create_checkout():
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': 'price_xxx',  # Your Stripe price ID
            'quantity': 1,
        }],
        mode='subscription',
        success_url='https://byewatermark.io/success',
        cancel_url='https://byewatermark.io/',
    )
    return jsonify({'url': session.url})
```

## Security Checklist

- [x] Rate limiting (IP-based)
- [x] File size limits
- [x] File type validation
- [x] Auto-cleanup of files
- [ ] Add CAPTCHA if needed
- [ ] Use Redis for rate limiting (production)
- [ ] Add request logging
