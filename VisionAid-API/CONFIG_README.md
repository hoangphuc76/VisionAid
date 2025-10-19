# 🔧 Configuration Management

## Overview

VisionAid sử dụng hệ thống quản lý cấu hình tập trung thông qua module `config.py`. Tất cả API keys được quản lý qua file `.env`, đảm bảo bảo mật và dễ dàng quản lý.

## 📁 File Structure

```
VisionAid/
├── .env.example       # Template cho file .env
├── .env              # File chứa API keys thật (không được commit)
├── config.py         # Module quản lý cấu hình
└── vision_to_speech.py  # Sử dụng config
```

## 🚀 Cách sử dụng

### 1. Tạo file .env

```bash
# Copy file mẫu
cp .env.example .env

# Mở và điền API keys của bạn
```

**Nội dung file .env:**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key
DEFAULT_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

### 2. Sử dụng trong code

#### Cách 1: Tự động load (Khuyến khích)
```python
from vision_to_speech import VTS

# VTS tự động load config từ .env
vts = VTS()

result = vts.convert("image.jpg", "output.mp3")
```

#### Cách 2: Load config thủ công
```python
from config import get_config

config = get_config()

# Kiểm tra cấu hình
if config.validate():
    print(f"✅ Gemini Key: {config.gemini_api_key[:10]}...")
    print(f"✅ ElevenLabs Key: {config.elevenlabs_api_key[:10]}...")
    print(f"✅ Voice ID: {config.default_voice_id}")
```

#### Cách 3: Cung cấp keys trực tiếp (Không khuyến khích)
```python
from vision_to_speech import VTS

vts = VTS(
    gemini_api_key="your_key",
    elevenlabs_api_key="your_key",
    voice_id="custom_voice_id"
)
```

## 🔐 Bảo mật

### ✅ ĐÚNG:
- Lưu API keys trong file `.env`
- File `.env` đã được thêm vào `.gitignore`
- Sử dụng `get_config()` để load keys
- Commit file `.env.example` làm template

### ❌ SAI:
- Hardcode API keys trong code
- Commit file `.env` lên Git
- Chia sẻ API keys public
- Lưu keys trong source code

## 📝 Config Module API

### Class: `Config`

```python
config = get_config()
```

#### Properties:
- `config.gemini_api_key` - Gemini API key
- `config.elevenlabs_api_key` - ElevenLabs API key
- `config.default_voice_id` - Default voice ID

#### Methods:
- `config.validate()` - Kiểm tra cấu hình có hợp lệ không

### Function: `load_env()`

```python
from config import load_env

load_env()  # Load từ .env
load_env("custom.env")  # Load từ file khác
```

## 🔄 Migration từ phiên bản cũ

Nếu bạn đang sử dụng phiên bản cũ (Google Gemini + FPT.AI hoặc các TTS khác):

**Cấu hình cũ:**
```bash
# .env (old)
GEMINI_API_KEY=...
FPT_API_KEY=...
DEFAULT_VOICE=banmai
```

**Cấu hình mới:**
```bash
# .env (new)
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...
DEFAULT_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

**Code cũ:**
```python
vts = VTS(
    gemini_api_key=os.getenv("GEMINI_API_KEY"),
    fpt_api_key=os.getenv("FPT_API_KEY"),
    voice="banmai"
)
```

**Code mới:**
```python
# Chỉ cần tạo file .env với GEMINI_API_KEY và ELEVENLABS_API_KEY
vts = VTS()  # Tự động load từ .env
```

## 🐛 Troubleshooting

### Lỗi: "GEMINI_API_KEY not configured"

**Nguyên nhân:** Chưa tạo file `.env` hoặc key không hợp lệ

**Giải pháp:**
```bash
# 1. Copy file mẫu
cp .env.example .env

# 2. Mở .env và điền key thật
# GEMINI_API_KEY=your_real_key_here
```

### Lỗi: "ValueError: ELEVENLABS_API_KEY not configured"

**Nguyên nhân:** Thiếu ElevenLabs API key

**Giải pháp:**
1. Đăng ký tại https://elevenlabs.io/
2. Lấy API key từ Settings → API Keys
3. Thêm vào file `.env`:
```
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Kiểm tra config

```python
from config import get_config

config = get_config()
if config.validate():
    print("✅ Configuration OK!")
else:
    print("❌ Configuration error - check .env file")
```

## 📚 Examples

### Example 1: Demo script
```python
from vision_to_speech import VTS
from config import get_config

# Validate config trước
config = get_config()
if not config.validate():
    print("Please setup .env file")
    exit(1)

# Sử dụng VTS
vts = VTS()
result = vts.convert("test.jpg", "output.mp3")
```

### Example 2: Web application
```python
from fastapi import FastAPI
from vision_to_speech import VTS
from config import get_config

app = FastAPI()

# Validate config khi khởi động
config = get_config()
if not config.validate():
    print("❌ Configuration error!")
    exit(1)

# Tạo VTS instance
vts = VTS()

@app.post("/convert")
async def convert_image(file: UploadFile):
    result = vts.convert(file.filename, "output.mp3")
    return result
```

## 🎯 Best Practices

1. **Luôn sử dụng .env file** cho API keys
2. **Validate config** trước khi sử dụng
3. **Không commit .env** lên Git
4. **Sử dụng .env.example** làm template
5. **Load config một lần** ở đầu chương trình

## 📖 Đọc thêm

- [README.md](README.md) - Tổng quan về VisionAid
- [QUICKSTART.md](QUICKSTART.md) - Hướng dẫn nhanh
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
