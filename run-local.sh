#!/bin/bash

# ============================================
# GeminiWatermark.ai - Local Development Setup
# ============================================

echo "🚀 Setting up local development environment..."

# 1. Download the watermark tool
echo ""
echo "📥 Step 1: Download GeminiWatermarkTool"
echo "----------------------------------------"

if [[ "$OSTYPE" == "darwin"* ]]; then
    TOOL_URL="https://github.com/allenk/GeminiWatermarkTool/releases/download/v1.1.0/GeminiWatermarkTool-macOS-Universal.zip"
    TOOL_NAME="GeminiWatermarkTool-macOS-Universal"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    TOOL_URL="https://github.com/allenk/GeminiWatermarkTool/releases/download/v1.1.0/GeminiWatermarkTool-Linux-x64.zip"
    TOOL_NAME="GeminiWatermarkTool-Linux-x64"
else
    echo "❌ Windows detected. Run this in WSL or use the Windows version manually."
    exit 1
fi

mkdir -p tools
cd tools

if [ ! -f "GeminiWatermarkTool" ]; then
    echo "Downloading $TOOL_NAME..."
    curl -L -o tool.zip "$TOOL_URL"
    unzip -o tool.zip
    chmod +x GeminiWatermarkTool
    rm tool.zip
    echo "✅ Tool downloaded!"
else
    echo "✅ Tool already exists"
fi

cd ..

# 2. Setup Python environment
echo ""
echo "🐍 Step 2: Setup Python environment"
echo "------------------------------------"

cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo "✅ Dependencies installed"

# 3. Set environment variables
export WATERMARK_TOOL_PATH="$(pwd)/../tools/GeminiWatermarkTool"
export FLASK_ENV=development

# 4. Run the server
echo ""
echo "🌐 Step 3: Starting server..."
echo "-----------------------------"
echo ""
echo "API running at: http://localhost:5000"
echo "Tool path: $WATERMARK_TOOL_PATH"
echo ""
echo "Test endpoints:"
echo "  GET  http://localhost:5000/api/health"
echo "  GET  http://localhost:5000/api/remaining"
echo "  POST http://localhost:5000/api/remove (multipart/form-data with 'file')"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python app.py
