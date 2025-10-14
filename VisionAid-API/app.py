"""
VisionAid FastAPI Web Application
Simple web interface for Vision to Speech conversion
"""
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from vision_to_speech import VTS
from config import get_config

# Load environment variables
config = get_config()

# Validate configuration on startup
if not config.validate():
    print("❌ Configuration error! Please check your .env file.")
    print("💡 Copy .env.example to .env and add your real API keys")
    exit(1)

# Create directories for uploads and outputs
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
STATIC_DIR = Path("static")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="VisionAid - Vision to Speech API",
    description="Convert images to speech for visually impaired users",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Global VTS instance
vts_instance = None

def get_vts_instance():
    """Get or create VTS instance"""
    global vts_instance
    if vts_instance is None:
        # VTS will automatically load from config
        vts_instance = VTS()
    return vts_instance

# Pydantic models
class ConversionResponse(BaseModel):
    success: bool
    message: str
    text_result: Optional[str] = None
    audio_url: Optional[str] = None
    audio_filename: Optional[str] = None
    voice_used: Optional[str] = None
    error: Optional[str] = None

class ConversionStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    progress: int  # 0-100
    result: Optional[ConversionResponse] = None

# In-memory task storage (in production, use Redis or database)
conversion_tasks = {}

@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the main HTML page"""
    return FileResponse("index.html")

@app.post("/upload", response_model=ConversionResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice_id: str = Form("JBFqnCBsd6RMkjVDRZzb")
):
    """
    Upload image and convert to speech
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        unique_id = str(uuid.uuid4())
        upload_filename = f"{unique_id}{file_extension}"
        upload_path = UPLOAD_DIR / upload_filename
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate output filename
        output_filename = f"{unique_id}.mp3"
        output_path = OUTPUT_DIR / output_filename
        
        # Get VTS instance
        vts = get_vts_instance()
        vts.set_voice(voice_id)
        
        # Perform conversion
        result = vts.convert(
            image_path=str(upload_path),
            output_mp3_path=str(output_path)
        )
        
        # Clean up uploaded file
        try:
            os.remove(upload_path)
        except:
            pass
        
        if result["success"]:
            return ConversionResponse(
                success=True,
                message="Conversion completed successfully!",
                text_result=result["text_result"],
                audio_url=f"/outputs/{output_filename}",
                audio_filename=output_filename,
                voice_used=result["voice_id"]
            )
        else:
            # Clean up output file if exists
            try:
                if os.path.exists(output_path):
                    os.remove(output_path)
            except:
                pass
            
            return ConversionResponse(
                success=False,
                message="Conversion failed",
                error=result["error"]
            )
    
    except Exception as e:
        # Clean up files
        try:
            if os.path.exists(upload_path):
                os.remove(upload_path)
            if os.path.exists(output_path):
                os.remove(output_path)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/upload-async")
async def upload_image_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice_id: str = Form("JBFqnCBsd6RMkjVDRZzb")
):
    """
    Upload image and convert to speech asynchronously
    Returns task ID for status checking
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    # Initialize task status
    conversion_tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "result": None
    }
    
    # Add background task
    background_tasks.add_task(
        process_conversion_async, 
        task_id, 
        file, 
        voice_id
    )
    
    return {"task_id": task_id, "message": "Processing started"}

async def process_conversion_async(task_id: str, file: UploadFile, voice_id: str):
    """Background task for processing conversion"""
    try:
        # Update status
        conversion_tasks[task_id]["progress"] = 10
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        upload_filename = f"{unique_id}{file_extension}"
        upload_path = UPLOAD_DIR / upload_filename
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        conversion_tasks[task_id]["progress"] = 30
        
        # Generate output filename
        output_filename = f"{unique_id}.mp3"
        output_path = OUTPUT_DIR / output_filename
        
        # Get VTS instance
        vts = get_vts_instance()
        vts.set_voice(voice_id)
        
        conversion_tasks[task_id]["progress"] = 50
        
        # Perform conversion
        result = vts.convert(
            image_path=str(upload_path),
            output_mp3_path=str(output_path)
        )
        
        conversion_tasks[task_id]["progress"] = 90
        
        # Clean up uploaded file
        try:
            os.remove(upload_path)
        except:
            pass
        
        if result["success"]:
            conversion_tasks[task_id].update({
                "status": "completed",
                "progress": 100,
                "result": ConversionResponse(
                    success=True,
                    message="Conversion completed successfully!",
                    text_result=result["text_result"],
                    audio_url=f"/outputs/{output_filename}",
                    audio_filename=output_filename,
                    voice_used=result["voice_id"]
                )
            })
        else:
            # Clean up output file if exists
            try:
                if os.path.exists(output_path):
                    os.remove(output_path)
            except:
                pass
            
            conversion_tasks[task_id].update({
                "status": "failed",
                "progress": 100,
                "result": ConversionResponse(
                    success=False,
                    message="Conversion failed",
                    error=result["error"]
                )
            })
    
    except Exception as e:
        conversion_tasks[task_id].update({
            "status": "failed",
            "progress": 100,
            "result": ConversionResponse(
                success=False,
                message="Processing error",
                error=str(e)
            )
        })

@app.get("/status/{task_id}")
async def get_conversion_status(task_id: str):
    """Get conversion status by task ID"""
    if task_id not in conversion_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = conversion_tasks[task_id]
    return ConversionStatus(
        task_id=task_id,
        status=task_data["status"],
        progress=task_data["progress"],
        result=task_data["result"]
    )

@app.get("/voices")
async def get_available_voices():
    """Get list of available TTS voices"""
    return {
        "voices": [
            {"code": "banmai", "name": "Ban Mai (Nam miền Bắc)", "gender": "male"},
            {"code": "lannhi", "name": "Lan Nhi (Nữ miền Bắc)", "gender": "female"},
            {"code": "myan", "name": "My An (Nữ miền Nam)", "gender": "female"},
            {"code": "giahuy", "name": "Gia Huy (Nam trẻ)", "gender": "male"},
            {"code": "minhquang", "name": "Minh Quang (Nam miền Nam)", "gender": "male"}
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test VTS instance creation
        vts = get_vts_instance()
        return {
            "status": "healthy",
            "message": "VisionAid API is running",
            "voice": vts.voice
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": str(e)
        }

# Cleanup old files periodically
@app.on_event("startup")
async def startup_event():
    """Clean up old files on startup"""
    cleanup_old_files()

def cleanup_old_files():
    """Remove files older than 1 hour"""
    import time
    current_time = time.time()
    
    for directory in [UPLOAD_DIR, OUTPUT_DIR]:
        for file_path in directory.glob("*"):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > 3600:  # 1 hour
                    try:
                        file_path.unlink()
                    except:
                        pass

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )