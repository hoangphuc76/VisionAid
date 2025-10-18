"""
VisionAid - Vision to Speech API
Simple and powerful API for converting images to speech, designed to help visually impaired people
access visual information through audio.
"""
import os
import time
import requests
from typing import Optional, Dict, Any
from google import genai
from google.genai import types
from elevenlabs.client import ElevenLabs
from config import get_config


class VTS:
    """
    VisionAid Vision to Speech - Convert images to audio files
    
    A simple yet powerful API that converts images to MP3 audio files,
    specifically designed to help visually impaired people access visual information.
    
    Features:
    - Smart image analysis using Google Gemini Flash Lite
    - Natural Vietnamese text-to-speech using ElevenLabs
    - OCR for documents and contextual description for scenes
    """
    
    def __init__(self, gemini_api_key: Optional[str] = None, elevenlabs_api_key: Optional[str] = None, voice_id: Optional[str] = None):
        """
        Initialize VTS with API keys
        
        Args:
            gemini_api_key (str, optional): Google Gemini API key (loads from .env if not provided)
            elevenlabs_api_key (str, optional): ElevenLabs API key (loads from .env if not provided)
            voice_id (str, optional): ElevenLabs voice ID (loads from .env if not provided, default: George - multilingual)
        """
        # Load config if keys not provided
        config = get_config()
        
        self.gemini_client = genai.Client(api_key=gemini_api_key or config.gemini_api_key)
        self.eleven_client = ElevenLabs(api_key=elevenlabs_api_key or config.elevenlabs_api_key)
        self.voice_id = voice_id or config.default_voice_id
        self.model = "gemini-2.5-flash-lite"
        
        print(f"[DEBUG] ElevenLabs API Key: {elevenlabs_api_key or config.elevenlabs_api_key}")

        # Enhanced prompt with danger detection
        self.prompt = """
Nhiệm vụ:
1. Phân loại ảnh thành một trong ba loại:
   - [Tài liệu]: Nếu bức ảnh là tài liệu/trang giấy → OCR toàn bộ nội dung và format lại hoàn chỉnh, không tóm tắt.
   - [Ngữ cảnh]: Nếu bức ảnh là cảnh vật/bối cảnh → mô tả tổng thể bằng tiếng Việt tự nhiên.
   - [Hóa đơn]: Nếu bức ảnh là hóa đơn/phiếu thanh toán → trích xuất thông tin (tên cửa hàng, ngày, mặt hàng, giá, tổng tiền).
2. Nếu thể loại là [Ngữ cảnh], hãy kiểm tra vật thể nguy hiểm (lửa, dao, xe đang chạy, hố sâu...):
   - Nếu có → thêm dòng "⚠️ Cảnh báo: ..." ngắn gọn, dễ hiểu.
   - Nếu không → ghi "Không phát hiện nguy hiểm."
Format trả kết quả:
Thể loại: [Tài liệu | Hóa đơn | Ngữ cảnh]
Nội dung: <nội dung tương ứng>
"""
            
    def convert(self, image_path: str, output_mp3_path: str) -> Dict[str, Any]:
        """
        Convert image to speech MP3 file
        
        Args:
            image_path (str): Path to input image file
            output_mp3_path (str): Path for output MP3 file
            
        Returns:
            Dict with success status and details
        """
        try:
            # Step 1: Check if image exists
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"File không tồn tại: {image_path}",
                    "text_result": None,
                    "audio_path": None
                }
            
            print("🔍 Đang phân tích ảnh với Gemini Flash Lite...")
            
            # Step 2: Read image and send to Gemini
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            
            response = self.gemini_client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    self.prompt
                ]
            )
            
            text_result = response.text.strip()
            print(f"📄 Kết quả phân tích (100 ký tự đầu): {text_result[:100]}...")
            
            # Step 3: Convert text to speech with ElevenLabs
            print("🔊 Đang chuyển văn bản thành giọng nói...")
            
            audio_stream = self.eleven_client.text_to_speech.convert(
                text=text_result,
                voice_id=self.voice_id,
                model_id="eleven_flash_v2_5",
                output_format="mp3_44100_128",
            )
            
            # Step 4: Save MP3 file
            output_dir = os.path.dirname(output_mp3_path)
            if output_dir:  # Only create directory if output_dir is not empty
                os.makedirs(output_dir, exist_ok=True)
            with open(output_mp3_path, "wb") as f:
                for chunk in audio_stream:
                    f.write(chunk)
            
            print(f"✅ Đã lưu file âm thanh tại: {output_mp3_path}")
            
            return {
                "success": True,
                "error": None,
                "text_result": text_result,
                "audio_path": output_mp3_path,
                "voice_id": self.voice_id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text_result": None,
                "audio_path": None
            }
    
    def set_voice(self, voice_id: str):
        """Change ElevenLabs voice ID"""
        self.voice_id = voice_id
    
    def set_prompt(self, prompt: str):
        """Change analysis prompt"""
        self.prompt = prompt


# Example usage:
if __name__ == "__main__":
    # Option 1: Auto-load from .env file (recommended)
    vts = VTS()
    
    # Option 2: Provide keys explicitly
    # vts = VTS(
    #     gemini_api_key="YOUR_GEMINI_API_KEY", 
    #     elevenlabs_api_key="YOUR_ELEVENLABS_API_KEY",
    #     voice_id="JBFqnCBsd6RMkjVDRZzb"
    # )
    
    # Convert image to speech
    result = vts.convert(
        image_path="path/to/your/image.jpg",
        output_mp3_path="output.mp3"
    )
    
    if result["success"]:
        print("✅ Hoàn tất chuyển đổi!")
        print(f"📄 Văn bản: {result['text_result']}")
        print(f"🔊 File âm thanh: {result['audio_path']}")
    else:
        print(f"❌ Lỗi: {result['error']}")