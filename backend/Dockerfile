FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and setup the watermark tool
# gwt-mini: headless CLI-only build (no GUI/SDL/dbus dependencies), identical flags
WORKDIR /opt/byewatermark
RUN wget -q https://github.com/allenk/GeminiWatermarkTool/releases/download/v0.3.1/gwt-mini-linux-x64.zip \
    && unzip gwt-mini-linux-x64.zip \
    && mv gwt-mini GeminiWatermarkTool \
    && chmod +x GeminiWatermarkTool \
    && rm gwt-mini-linux-x64.zip

# Setup Python app
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "180", "app:app"]
