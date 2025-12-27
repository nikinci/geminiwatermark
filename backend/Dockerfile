FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and setup the watermark tool
WORKDIR /opt/byewatermark
RUN wget -q https://github.com/allenk/GeminiWatermarkTool/releases/download/v0.1.2/GeminiWatermarkTool-Linux-x64.zip \
    && unzip GeminiWatermarkTool-Linux-x64.zip \
    && chmod +x GeminiWatermarkTool \
    && rm GeminiWatermarkTool-Linux-x64.zip

# Setup Python app
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
