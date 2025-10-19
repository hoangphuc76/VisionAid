"""
Demo sử dụng VisionAid - vision_to_speech.py
"""
import os
from vision_to_speech import VTS
from config import get_config


def main():
    # Load configuration from .env file
    print("🔧 Loading configuration from .env file...")
    config = get_config()
    
    # Validate configuration
    if not config.validate():
        print("\n💡 Tip: Copy .env.example to .env and add your real API keys")
        return
    
    print("✅ Configuration loaded successfully!")
    
    # Initialize VTS (automatically loads from config)
    vts = VTS()
    
    # Đường dẫn ảnh để test (thay bằng đường dẫn ảnh thực tế của bạn)
    image_path = r"C:\Users\Acer\Pictures\468466513_10162493290024085_1276394749601914608_n.jpg"  # Thay bằng đường dẫn ảnh thực tế
    output_path = "output.mp3"
    
    print("🚀 Starting image to speech conversion...")
    
    # Chuyển đổi ảnh thành âm thanh
    result = vts.convert(
        image_path=image_path,
        output_mp3_path=output_path
    )
    
    # Hiển thị kết quả
    if result["success"]:
        print("\n" + "="*50)
        print("✅ CONVERSION COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"📄 Analysis Result:")
        print(result['text_result'])
        print(f"\n🔊 Audio saved to: {result['audio_path']}")
        print(f"🎵 Voice ID used: {result['voice_id']}")
    else:
        print("\n" + "="*50)
        print("❌ CONVERSION FAILED!")
        print("="*50)
        print(f"Error: {result['error']}")
    
    print("\n🎯 Demo completed!")
    print("\n💡 Tip: All API keys are loaded from .env file automatically!")

if __name__ == "__main__":
    main()