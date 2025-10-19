# 🚀 Hướng dẫn chạy VisionAid# � Hướng dẫn chạy VisionAid



## 📋 Yêu cầu## � Yêu cầu



- **Python 3.7+**- **Python 3.7+**

- **Kết nối Internet**- **Kết nối Internet**

- **API Keys**: Google Gemini AI + ElevenLabs TTS- **API Keys**: Gemini AI + FPT.AI TTS



## 🔑 Bước 1: Chuẩn bị API Keys## � Bước 1: Chuẩn bị API Keys



### Lấy API Keys:### Lấy API Keys:

- **Gemini AI**: https://aistudio.google.com/ (Free)- **Gemini AI**: https://aistudio.google.com/

- **ElevenLabs**: https://elevenlabs.io/ (Free tier: 10,000 characters/month)- **FPT.AI TTS**: https://fpt.ai/



### Tạo file `.env` từ template:### Tạo file `.env`:

```bash```env

# Copy file mẫuGEMINI_API_KEY=your_gemini_api_key_here

cp .env.example .envFPT_API_KEY=your_fpt_api_key_here

DEFAULT_VOICE=banmai

# Hoặc trên Windows```

copy .env.example .env

```⚠️ **Thay API keys thực tế của bạn!**



### Mở file `.env` và điền API keys:## ⚡ Bước 2: Cài đặt và chạy (3 bước đơn giản)

```env

GEMINI_API_KEY=your_actual_gemini_api_key_here### 1. Tạo và kích hoạt môi trường ảo:

ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here```bash

DEFAULT_VOICE_ID=JBFqnCBsd6RMkjVDRZzb# Tạo môi trường ảo

```python3 -m venv venv



⚠️ **Quan trọng**: Thay thế bằng API keys thực tế của bạn!# Kích hoạt môi trường ảo

# Linux/Mac:

## ⚡ Bước 2: Cài đặt và chạy (3 bước đơn giản)source venv/bin/activate

# Windows:

### 1. Tạo và kích hoạt môi trường ảo:venv\Scripts\activate

```bash```

# Tạo môi trường ảo

python -m venv venv### 2. Cài đặt dependencies:

```bash

# Kích hoạt môi trường ảopip install -r requirements.txt

# Windows PowerShell:```

venv\Scripts\Activate.ps1

### 3. Chạy ứng dụng:

# Windows CMD:```bash

venv\Scripts\activate.batpython app.py

```

# Linux/Mac:

source venv/bin/activate✅ **Xong!** Server sẽ chạy tại: http://localhost:8000

```

## 🌐 Truy cập ứng dụng

### 2. Cài đặt dependencies:

```bash- **Web Interface**: http://localhost:8000

pip install -r requirements.txt- **API Docs**: http://localhost:8000/docs

```

## 📱 Cách sử dụng

### 3. Chạy ứng dụng:

```bash1. Mở http://localhost:8000

# Chạy web application2. Kéo thả ảnh vào trang web

python app.py3. Chọn giọng đọc

4. Nhấn "Chuyển đổi"

# Hoặc chạy demo đơn giản5. Nghe kết quả âm thanh

python demo.py

```## � Troubleshooting



✅ **Xong!** Server sẽ chạy tại: http://localhost:8000**Lỗi "Module not found":**

```bash

## 🌐 Truy cập ứng dụngpip install -r requirements.txt

```

- **Web Interface**: http://localhost:8000

- **API Docs**: http://localhost:8000/docs**Lỗi "API key not configured":**

- **Redoc**: http://localhost:8000/redoc- Kiểm tra file `.env` có đúng API keys chưa



## 📱 Cách sử dụng**Lỗi "Port 8000 đã được sử dụng":**

```bash

### Sử dụng Web Interface:# Kill process trên port 8000

1. Mở http://localhost:8000lsof -ti:8000 | xargs kill -9

2. Kéo thả ảnh vào trang web```

3. (Tùy chọn) Chọn voice ID

4. Nhấn "Chuyển đổi"## 🎵 Giọng đọc có sẵn

5. Nghe kết quả âm thanh MP3

- `banmai` - Nam miền Bắc (mặc định)

### Sử dụng trong code:- `lannhi` - Nữ miền Bắc  

```python- `myan` - Nữ miền Nam

from vision_to_speech import VTS- `giahuy` - Nam trẻ

- `minhquang` - Nam miền Nam
# Tự động load từ .env
vts = VTS()

result = vts.convert(
    image_path="path/to/image.jpg",
    output_mp3_path="output.mp3"
)

if result["success"]:
    print(f"✅ Success: {result['audio_path']}")
else:
    print(f"❌ Error: {result['error']}")
```

## 🐛 Troubleshooting

**Lỗi "Module not found":**
```bash
pip install -r requirements.txt
```

**Lỗi "GEMINI_API_KEY not configured" hoặc "ELEVENLABS_API_KEY not configured":**
- Kiểm tra file `.env` đã tạo chưa
- Kiểm tra API keys đã điền đúng chưa
- Đảm bảo không có khoảng trắng thừa trong `.env`

**Lỗi "Import elevenlabs.client could not be resolved":**
```bash
pip install --upgrade elevenlabs
```

**Lỗi "Port 8000 đã được sử dụng":**
```bash
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

**Lỗi kết nối ElevenLabs:**
- Kiểm tra API key còn valid không
- Kiểm tra quota còn không (free tier: 10,000 chars/month)
- Thử với text ngắn hơn

## 🎵 ElevenLabs Voice IDs

### Voice IDs phổ biến:
- `JBFqnCBsd6RMkjVDRZzb` - George (multilingual, **mặc định**, hỗ trợ tiếng Việt)
- `pNInz6obpgDQGcFmaJgB` - Adam (deep male voice)
- `EXAVITQu4vr4xnSDxMaL` - Bella (soft female voice)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (calm female voice)

### Tìm thêm voices:
- Truy cập: https://elevenlabs.io/voice-library
- Chọn voice bạn thích
- Copy Voice ID
- Thay đổi trong `.env` hoặc code

### Thay đổi voice trong code:
```python
vts = VTS(voice_id="pNInz6obpgDQGcFmaJgB")  # Adam voice
```

## 🔧 Advanced Configuration

### Custom prompt:
```python
vts = VTS()
vts.set_prompt("""
Mô tả chi tiết hình ảnh cho người khiếm thị.
Tập trung vào màu sắc, vị trí, và các đối tượng quan trọng.
""")
```

### Check configuration:
```python
from config import get_config

config = get_config()
if config.validate():
    print("✅ Configuration OK")
    print(f"Voice ID: {config.default_voice_id}")
else:
    print("❌ Configuration error")
```

## 📊 Kiểm tra logs

Ứng dụng sẽ hiển thị logs trong terminal:
```
🔧 Loading configuration from .env file...
✅ Configuration loaded successfully!
🚀 Starting image to speech conversion...
🔍 Đang phân tích ảnh với Gemini Flash Lite...
📄 Kết quả phân tích (100 ký tự đầu): ...
🔊 Đang chuyển văn bản thành giọng nói...
✅ Đã lưu file âm thanh tại: output.mp3
```

## 🎯 Next Steps

- Đọc [README.md](README.md) để hiểu rõ hơn về API
- Đọc [CONFIG_README.md](CONFIG_README.md) để tìm hiểu về configuration
- Đọc [QUICKSTART.md](QUICKSTART.md) cho quick start guide
- Xem [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu kiến trúc hệ thống
