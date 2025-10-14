# 👁️‍🗨️ VisionAid - Vision to Speech (VTS) API

![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash%20Lite-orange.svg)
![TTS](https://img.shields.io/badge/TTS-ElevenLabs-green.svg)
![Accessibility](https://img.shields.io/badge/Accessibility-♿-purple.svg)

VisionAid là một API đơn giản và mạnh mẽ để chuyển đổi hình ảnh thành âm thanh, được thiết kế đặc biệt để hỗ trợ người khiếm thị tiếp cận thông tin hình ảnh một cách dễ dàng.

## 📋 Về VisionAid

VisionAid sử dụng công nghệ AI tiên tiến để biến hình ảnh thành những mô tả âm thanh chi tiết, giúp người khiếm thị có thể "nhìn" thấy thế giới xung quanh thông qua âm thanh. Dự án kết hợp Google Gemini Flash Lite để phân tích hình ảnh và ElevenLabs để tạo ra giọng nói tự nhiên.

## 🎯 Tính năng

- **Phân tích ảnh thông minh**: Sử dụng Google Gemini Flash Lite để:
  - OCR tài liệu và format lại nội dung hoàn chỉnh
  - Mô tả cảnh vật và bối cảnh
  - Trích xuất thông tin hóa đơn
  - **Phát hiện nguy hiểm**: Cảnh báo về lửa, dao, xe đang chạy, hố sâu...
- **Chuyển đổi văn bản thành giọng nói**: Sử dụng ElevenLabs với giọng nói đa ngôn ngữ chất lượng cao
- **API đơn giản**: Chỉ cần 1 dòng import và sử dụng
- **Nhanh và hiệu quả**: Sử dụng Gemini Flash Lite và ElevenLabs Flash v2.5 cho tốc độ tối ưu

## 🚀 Cài đặt

### Yêu cầu
```bash
pip install -r requirements.txt
```

### Dependencies
- `requests`: Để gọi API
- `google-generativeai`: Để phân tích hình ảnh với Gemini
- `elevenlabs`: Để chuyển văn bản thành giọng nói
- `google-genai`: Thư viện Google GenAI
- `time`, `os`: Built-in Python modules

## 📖 Sử dụng cơ bản

### Bước 1: Cấu hình API Keys
```bash
# Copy file .env.example thành .env
cp .env.example .env

# Mở file .env và điền API keys của bạn
# GEMINI_API_KEY=your_actual_gemini_key
# ELEVENLABS_API_KEY=your_actual_elevenlabs_key
```

### Bước 2: Import và khởi tạo
```python
from vision_to_speech import VTS

# Khởi tạo VTS (tự động load từ .env file)
vts = VTS()

# Hoặc cung cấp API keys trực tiếp (không khuyến khích)
# vts = VTS(
#     gemini_api_key="YOUR_KEY",
#     elevenlabs_api_key="YOUR_KEY", 
#     voice_id="JBFqnCBsd6RMkjVDRZzb"
# )
```

### Bước 3: Chuyển đổi hình ảnh thành âm thanh
```python
# Chuyển đổi đơn giản
result = vts.convert(
    image_path="path/to/your/image.jpg",
    output_mp3_path="output.mp3"
)

if result["success"]:
    print(f"✅ Success! Audio saved to: {result['audio_path']}")
    print(f"📄 Analysis: {result['text_result']}")
else:
    print(f"❌ Error: {result['error']}")
```

## 🔧 API Reference

### Class: `VTS`

#### `__init__(gemini_api_key, elevenlabs_api_key, voice_id="JBFqnCBsd6RMkjVDRZzb")`
Khởi tạo VTS instance.

**Parameters:**
- `gemini_api_key` (str): Google Gemini API key
- `elevenlabs_api_key` (str): ElevenLabs API key  
- `voice_id` (str): ElevenLabs Voice ID (mặc định: JBFqnCBsd6RMkjVDRZzb - George multilingual)

#### `convert(image_path, output_mp3_path)`
Chuyển đổi hình ảnh thành file MP3.

**Parameters:**
- `image_path` (str): Đường dẫn đến file hình ảnh
- `output_mp3_path` (str): Đường dẫn lưu file MP3

**Returns:**
```python
{
    "success": bool,           # Trạng thái thành công
    "error": str or None,      # Thông báo lỗi (nếu có)
    "text_result": str,        # Kết quả phân tích văn bản
    "audio_path": str,         # Đường dẫn file audio
    "voice_id": str            # Voice ID đã sử dụng
}
```

#### `set_voice(voice_id)`
Thay đổi giọng đọc.

#### `set_voice(voice_id)`
Thay đổi voice ID cho ElevenLabs.

#### `set_prompt(prompt)`
Tùy chỉnh prompt phân tích hình ảnh.

## 📋 Ví dụ chi tiết

### Ví dụ 1: Sử dụng cơ bản (Auto-load từ .env)
```python
from vision_to_speech import VTS

# Tự động load API keys từ .env file
vts = VTS()

result = vts.convert("document.jpg", "output.mp3")
print(result["text_result"])  # In kết quả phân tích
```

### Ví dụ 2: Tùy chỉnh giọng
```python
# Load từ .env nhưng custom voice
vts = VTS(voice_id="pNInz6obpgDQGcFmaJgB")  # Adam - deep voice

result = vts.convert(
    image_path="image.jpg",
    output_mp3_path="result.mp3"
)
```

### Ví dụ 3: Tùy chỉnh prompt
```python
vts = VTS()  # Auto-load từ .env

# Tùy chỉnh prompt cho mục đích cụ thể
custom_prompt = """
Hãy mô tả chi tiết màu sắc và đối tượng trong ảnh.
Tập trung vào thông tin hữu ích cho người khiếm thị.
Cảnh báo nếu có nguy hiểm.
"""
vts.set_prompt(custom_prompt)

result = vts.convert("photo.jpg", "description.mp3")
```

## 🎵 ElevenLabs Voice IDs

Một số voice ID phổ biến:
- `JBFqnCBsd6RMkjVDRZzb` - George (multilingual) - mặc định, hỗ trợ tiếng Việt
- `pNInz6obpgDQGcFmaJgB` - Adam (deep voice)
- `EXAVITQu4vr4xnSDxMaL` - Bella (soft female)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (calm female)

Xem thêm voices tại: [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)

## 🔑 Lấy API Keys

### Google Gemini API
1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Tạo API key mới
3. Copy API key để sử dụng

### ElevenLabs API  
1. Đăng ký tại [ElevenLabs](https://elevenlabs.io/)
2. Vào Settings → API Keys
3. Copy API key để sử dụng

## 🚨 Lưu ý bảo mật

- **KHÔNG** commit API keys vào source code
- **BẮT BUỘC** sử dụng file `.env` để lưu API keys:

```bash
# 1. Copy file mẫu
cp .env.example .env

# 2. Mở .env và điền API keys thật của bạn
# GEMINI_API_KEY=your_actual_key_here
# ELEVENLABS_API_KEY=your_actual_key_here

# 3. File .env đã được thêm vào .gitignore, không bị commit
```

**Cách sử dụng trong code:**
```python
from vision_to_speech import VTS

# Cách 1: Tự động load từ .env (KHUYẾN KHÍCH)
vts = VTS()

# Cách 2: Load thủ công với os.getenv (nếu cần)
import os
vts = VTS(
    gemini_api_key=os.getenv("GEMINI_API_KEY"),
    elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY")
)
```

## 📁 Cấu trúc file

```
VisionAid/
├── vision_to_speech.py    # Main API file
├── config.py              # Configuration management (NEW!)
├── demo.py               # Demo usage
├── app.py                # FastAPI web application
├── requirements.txt      # Dependencies
├── .env.example          # Environment variables template
├── .env                  # Your API keys (create from .env.example)
├── LICENSE               # License file
└── README.md            # Documentation
```

## 🔧 Troubleshooting

### Lỗi "Import could not be resolved"
Cài đặt dependencies:
```bash
pip install requests google-generativeai
```

### Lỗi "Image file not found"
Kiểm tra đường dẫn file hình ảnh:
```python
import os
print(os.path.exists("your-image-path.jpg"))
```

### Lỗi TTS timeout
Tăng `wait_time`:
```python
result = vts.convert("image.jpg", "output.wav", wait_time=20)
```

### Lỗi API key
Kiểm tra API keys hợp lệ và còn quota.

## 🤝 Đóng góp cho VisionAid

VisionAid là một dự án mã nguồn mở nhằm hỗ trợ cộng đồng người khiếm thị. Chúng tôi hoan nghênh mọi đóng góp:

- 🐛 Báo cáo lỗi và đề xuất tính năng
- 💡 Cải thiện thuật toán phân tích hình ảnh  
- 🌍 Hỗ trợ thêm ngôn ngữ khác
- � Cập nhật documentation
- 🎯 Tối ưu hiệu suất và độ chính xác

## �📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra API keys và network connection
2. Xem log error chi tiết trong response
3. Tham khảo documentation của [Google Gemini](https://ai.google.dev/) và [ElevenLabs](https://elevenlabs.io/docs)
4. Tạo issue trên GitHub repository để được hỗ trợ

---

**VisionAid** - Mang ánh sáng đến cho thế giới thông qua công nghệ 🌟