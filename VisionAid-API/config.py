"""
VisionAid - Configuration Management
Centralized configuration and environment variable loading
"""
import os
from pathlib import Path


def load_env(env_file: str = ".env"):
    """
    Load environment variables from .env file
    
    Args:
        env_file (str): Path to .env file (default: ".env")
    """
    env_path = Path(env_file)
    
    if not env_path.exists():
        print(f"⚠️  Warning: {env_file} file not found. Using environment variables or defaults.")
        return
    
    with open(env_path, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse key=value pairs
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Only set if not already in environment
                if key not in os.environ:
                    os.environ[key] = value


class Config:
    """
    VisionAid Configuration Class
    Provides centralized access to all configuration values
    """
    
    def __init__(self):
        """Initialize configuration by loading .env file"""
        load_env()
    
    @property
    def gemini_api_key(self) -> str:
        """Get Gemini API key from environment"""
        key = os.getenv("GEMINI_API_KEY", "")
        if not key or key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY not configured. "
                "Please copy .env.example to .env and set your API key."
            )
        return key
    
    @property
    def elevenlabs_api_key(self) -> str:
        """Get ElevenLabs API key from environment"""
        key = os.getenv("ELEVENLABS_API_KEY", "")
        if not key or key == "your_elevenlabs_api_key_here":
            raise ValueError(
                "ELEVENLABS_API_KEY not configured. "
                "Please copy .env.example to .env and set your API key."
            )
        return key
    
    @property
    def default_voice_id(self) -> str:
        """Get default ElevenLabs voice ID"""
        return os.getenv("DEFAULT_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    
    def validate(self) -> bool:
        """
        Validate that all required configuration is present
        
        Returns:
            bool: True if all required config is valid
        """
        try:
            _ = self.gemini_api_key
            _ = self.elevenlabs_api_key
            return True
        except ValueError as e:
            print(f"❌ Configuration Error: {e}")
            return False


# Global config instance
_config = None


def get_config() -> Config:
    """
    Get or create global config instance
    
    Returns:
        Config: Global configuration instance
    """
    global _config
    if _config is None:
        _config = Config()
    return _config


# Example usage
if __name__ == "__main__":
    config = get_config()
    
    if config.validate():
        print("✅ Configuration valid!")
        print(f"   Gemini API Key: {config.gemini_api_key[:10]}...")
        print(f"   ElevenLabs API Key: {config.elevenlabs_api_key[:10]}...")
        print(f"   Default Voice ID: {config.default_voice_id}")
    else:
        print("❌ Configuration invalid. Please check your .env file.")
