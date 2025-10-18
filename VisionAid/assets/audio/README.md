# Placeholder Audio Files

This directory contains placeholder audio files for development and testing.

## ⚠️ TEMPORARY FILES

These are **NOT** the final audio files. They are silent placeholders to:
1. Allow AudioManager to load without errors
2. Enable testing of app flow and timing
3. Verify audio file paths are correct
4. Test priority and interruption logic

## 🎙️ Final Audio Production

Replace these placeholder files with professional Vietnamese recordings using the specifications in `/AUDIO_RECORDING_GUIDE.md`.

## 📋 Required Files

All files should be MP3 format, 128kbps, normalized to -3dB.

### Authentication (6 files)
- ✅ welcome.mp3
- ✅ login_success.mp3
- ✅ login_failed.mp3
- ✅ biometric_unavailable.mp3
- ✅ setup_required.mp3
- ✅ gesture_instructions.mp3

### Navigation (8 files)
- ✅ home_screen.mp3
- ✅ opening_camera.mp3
- ✅ opening_gps.mp3
- ✅ opening_premium.mp3
- ✅ returning_home.mp3
- ✅ logout_confirmation.mp3
- ✅ gesture_not_recognized.mp3
- ✅ screen_loading.mp3

### Camera (7 files)
- ✅ camera_mode.mp3
- ✅ capturing_photo.mp3
- ✅ processing_image.mp3
- ✅ analyzing_content.mp3
- ✅ analysis_complete.mp3
- ✅ next_action.mp3
- ✅ capture_failed.mp3

### GPS (4 files)
- ✅ gps_mode.mp3
- ✅ location_found.mp3
- ✅ location_shared.mp3
- ✅ gps_unavailable.mp3

### Premium (1 file)
- ✅ premium_mode.mp3

### Errors (4 files)
- ✅ network_error.mp3
- ✅ general_error.mp3
- ✅ camera_permission.mp3
- ✅ service_unavailable.mp3

## 🔄 Generating Placeholder Files

To create silent MP3 files for testing:

```bash
# Install ffmpeg if not already installed
# Ubuntu/Debian:
sudo apt-get install ffmpeg

# macOS:
brew install ffmpeg

# Generate silent 2-second MP3 files
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio

# Authentication
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/welcome.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/login_success.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/login_failed.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/biometric_unavailable.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/setup_required.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/gesture_instructions.mp3

# Navigation
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/home_screen.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_camera.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_gps.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_premium.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/returning_home.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/logout_confirmation.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/gesture_not_recognized.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/screen_loading.mp3

# Camera
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/camera_mode.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/capturing_photo.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/processing_image.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/analyzing_content.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/analysis_complete.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/next_action.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/capture_failed.mp3

# GPS
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/gps_mode.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/location_found.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/location_shared.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/gps_unavailable.mp3

# Premium
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame premium/premium_mode.mp3

# Errors
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/network_error.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/general_error.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/camera_permission.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/service_unavailable.mp3

echo "✅ All placeholder audio files created!"
```

## 🎯 Alternative: Use FPT.AI TTS for Temporary Files

If you want to test with actual Vietnamese audio before professional recording:

```bash
# Use the VisionAid-API to generate temporary audio files
# This requires the FPT.AI API key to be configured

cd /home/phuc/FPT/VIsionAid/VisionAid-API

# Create a script to generate all audio files
python generate_audio_placeholders.py
```

See `/generate_audio_placeholders.py` for implementation.

## 📝 Next Steps

1. **For Development**: Use silent placeholders or FPT.AI generated audio
2. **For Production**: Replace with professional recordings
3. **Test**: Verify all files load correctly in AudioManager
4. **Deploy**: Only deploy with professional audio recordings

---

**Status**: Placeholder files for development
**Replace with**: Professional Vietnamese voice recordings
**See**: `/AUDIO_RECORDING_GUIDE.md` for production requirements
