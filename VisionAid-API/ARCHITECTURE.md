# 🏗️ VisionAid FastAPI Architecture

## Kiến trúc hệ thống

```
VisionAid/
├── app.py                 # FastAPI main application
├── vision_to_speech.py    # Core VTS processing class
├── config.py              # Configuration management
├── index.html             # Web interface
├── .env                   # Environment variables (API keys)
├── .env.example           # Environment template
├── requirements.txt       # Python dependencies
├── uploads/              # Temporary upload directory
├── outputs/              # Generated audio files (MP3)
└── static/               # Static assets (CSS, JS, images)
```

## Các thành phần chính

### 1. Configuration Management (`config.py`)
- **Features**:
  - Centralized API key management
  - Auto-load from .env file
  - Validation and error handling
  - Singleton pattern for global access

### 2. FastAPI Backend (`app.py`)
- **Endpoints**:
  - `GET /`: Serve HTML interface
  - `POST /upload`: Synchronous image to speech conversion
  - `POST /upload-async`: Asynchronous processing with task tracking
  - `GET /status/{task_id}`: Check conversion status
  - `GET /voices`: Available TTS voices (ElevenLabs)
  - `GET /health`: Health check endpoint

### 3. Web Interface (`index.html`)
- **Features**:
  - Drag & drop image upload
  - Voice ID selection (ElevenLabs voices)
  - Real-time progress tracking
  - Audio player with controls
  - Download generated audio (MP3)
  - Responsive design for mobile

### 4. VTS Core (`vision_to_speech.py`)
- **AI Integration**:
  - Google Gemini Flash Lite for fast image analysis
  - ElevenLabs Flash v2.5 for multilingual TTS
  - Smart categorization: Document, Invoice, Context
  - Danger detection for safety warnings

## API Endpoints

### Upload Image (Sync)
```http
POST /upload
Content-Type: multipart/form-data

file: <image_file>
voice_id: string (ElevenLabs Voice ID, optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion completed successfully!",
  "text_result": "Analyzed content...",
  "audio_url": "/outputs/audio_file.mp3",
  "audio_filename": "audio_file.mp3",
  "voice_used": "JBFqnCBsd6RMkjVDRZzb"
}
```

### Upload Image (Async)
```http
POST /upload-async
Content-Type: multipart/form-data

file: <image_file>
voice_id: string (ElevenLabs Voice ID, optional)
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "message": "Processing started"
}
```

### Check Status
```http
GET /status/{task_id}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "completed|processing|failed",
  "progress": 100,
  "result": { /* ConversionResponse */ }
}
```

### Available Voices
```http
GET /voices
```

**Response:**
```json
{
  "voices": [
    {
      "voice_id": "JBFqnCBsd6RMkjVDRZzb",
      "name": "George",
      "description": "Multilingual (supports Vietnamese)"
    },
    {
      "voice_id": "pNInz6obpgDQGcFmaJgB",
      "name": "Adam",
      "description": "Deep male voice"
    }
  ]
}
```

## Workflow

1. **Configuration Loading**:
   - App starts, loads config from .env
   - Validates API keys (Gemini + ElevenLabs)
   - Exits if configuration invalid

2. **Image Upload**:
   - User selects/drags image to web interface
   - Client validates file type and size
   - Image uploaded to `/uploads/` directory

3. **Processing**:
   - VTS analyzes image with Gemini Flash Lite
   - Classifies: [Tài liệu], [Hóa đơn], or [Ngữ cảnh]
   - For [Ngữ cảnh]: checks for dangerous objects
   - Sends text to ElevenLabs for TTS conversion (streaming)
   - Saves MP3 audio to `/outputs/`

4. **Response**:
   - Returns JSON with success status and audio URL
   - Web interface displays results and audio player
   - User can play MP3 audio or download file

## Security Features

- ✅ File type validation (images only)
- ✅ File size limits (10MB max)
- ✅ Environment variables for API keys
- ✅ Automatic cleanup of old files
- ✅ CORS configuration for web access
- ✅ Input sanitization

## Scalability Features

- 🚀 Asynchronous processing with background tasks
- 🚀 Task status tracking
- 🚀 File cleanup system
- 🚀 Progress indicators
- 🚀 Error handling and recovery

## Deployment Ready

- 📦 Complete dependency management
- 📦 Cross-platform startup scripts
- 📦 Health check endpoint
- 📦 Production-ready configuration
- 📦 Static file serving
- 📦 API documentation (FastAPI auto-generated)