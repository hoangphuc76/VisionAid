# ⚡ Quick Start - VisionAid

## 🚀 Chạy trong 30 giây

### 1. Chuẩn bị API Keys
```bash
# Copy file mẫu
cp .env.example .env

# Mở .env và điền API keys
# GEMINI_API_KEY=your_gemini_key_here
# ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### 2. Cài đặt và chạy
```bash
# Tạo môi trường ảo
python3 -m venv venv

# Kích hoạt (Linux/Mac)
source venv/bin/activate
# Hoặc Windows: venv\Scripts\activate

# Cài đặt
pip install -r requirements.txt

# Chạy
python app.py
```

### 3. Sử dụng
Mở: http://localhost:8000

🎯 **Xong!** Kéo thả ảnh và nghe kết quả!

---

## 🔑 Lấy API Keys

- **Gemini**: https://aistudio.google.com/ (Free)
- **ElevenLabs**: https://elevenlabs.io/ (Free tier: 10,000 characters/month)

## 🎵 Voice IDs
- `JBFqnCBsd6RMkjVDRZzb` - George (multilingual, default) 
- `pNInz6obpgDQGcFmaJgB` - Adam (deep voice)
- `EXAVITQu4vr4xnSDxMaL` - Bella (soft female)

Xem thêm: https://elevenlabs.io/voice-library

## 🚨 Lỗi thường gặp
```bash
# Thiếu module
pip install -r requirements.txt

# Port đã dùng
lsof -ti:8000 | xargs kill -9

# API key sai
# Kiểm tra lại file .env
```