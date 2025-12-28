# GeminiWatermark.ai

The free AI-powered tool designed to remove Google Gemini's visible logo watermarks.

## 🚀 Quick Start (Recommended)

The easiest way to run the project locally (Backend + Frontend setup) is using the helper script:

```bash
./run-local.sh
```

This script will automatically:
1.  Download the required AI tool binary.
2.  Set up a Python virtual environment (`backend/venv`).
3.  Install backend dependencies (Flask, Pillow, etc.).
4.  Start the Backend server on port **5001**.
5.  Guide you to start the Frontend.

After the script finishes setting up the backend, open a **new terminal** window for the frontend:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to use the app.

---

## 🛠 Manual Setup

If you prefer to set up manually:

### 1. Backend (Python/Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Download the `GeminiWatermarkTool` binary (ask repo owner for the link) and place it in the `tools/` directory.

Run the server:
```bash
python app.py
```
*Port: 5001*

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
*Port: 3000*

---

## 📱 Mobile Testing (Local Network)

To test the app from your phone (connected to the same Wi-Fi):

1.  **Find your computer's Local IP** (Settings -> Wi-Fi -> IP Address, e.g., `192.168.1.106`).
2.  **Update Frontend Config:**
    Open `frontend/.env.local` and update the API URL to use your IP instead of `localhost`:
    ```env
    NEXT_PUBLIC_API_URL=http://192.168.1.106:5001
    ```
    *(Replace `192.168.1.106` with your actual IP)*
3.  **Restart Frontend:** `npm run dev`
4.  **Visit on Phone:** Open `http://192.168.1.106:3000` in your mobile browser.

---

## ⚠️ Common Issues

### "Processing Failed" with "Low Resolution"
If you see a yellow warning about "Image Quality Issue":
*   **Cause:** You uploaded a thumbnail or preview image (e.g., < 800px). The AI tool needs high-resolution patterns to work.
*   **Fix:**
    *   **Mobile:** Choose **"Actual Size"** (Gerçek Boyut) when uploading from iOS/Android.
    *   **Web:** Download the **original** image from Gemini, not the preview.

### "Failed to fetch" on Mobile
*   **Cause:** Your phone cannot see `localhost`.
*   **Fix:** Follow the [Mobile Testing](#mobile-testing-local-network) guide above to use your LAN IP.

### Red/Black Artifacts
*   **Red:** Image was too small (see Low Resolution above).
*   **Black:** Tool had issues with Transparency (Alpha channel). The backend now automatically converts images to RGB and maximum quality to prevent this.
