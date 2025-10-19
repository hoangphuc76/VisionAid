# 🎯 Audio Generation Implementation Guide

## Quick Start Options

You have **3 options** for generating audio files for development/testing:

---

## Option 1: Silent Placeholders (Fastest)

Use this for pure structural testing without actual audio.

### Steps:
```bash
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio

# Install ffmpeg if needed
sudo apt-get install ffmpeg  # Ubuntu/Debian
# OR
brew install ffmpeg  # macOS

# Run the generation script
bash generate_silent_placeholders.sh
```

### Create `generate_silent_placeholders.sh`:
```bash
#!/bin/bash

echo "Generating silent placeholder audio files..."

# Authentication
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/welcome.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/login_success.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/login_failed.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/biometric_unavailable.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/setup_required.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame authentication/gesture_instructions.mp3 -y

# Navigation
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/home_screen.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_camera.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_gps.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/opening_premium.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/returning_home.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/logout_confirmation.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/gesture_not_recognized.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame navigation/screen_loading.mp3 -y

# Camera
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/camera_mode.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/capturing_photo.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/processing_image.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/analyzing_content.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/analysis_complete.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/next_action.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame camera/capture_failed.mp3 -y

# GPS
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/gps_mode.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/location_found.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/location_shared.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame gps/gps_unavailable.mp3 -y

# Premium
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame premium/premium_mode.mp3 -y

# Errors
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/network_error.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/general_error.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/camera_permission.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 -q:a 9 -acodec libmp3lame errors/service_unavailable.mp3 -y

echo "✅ All 30 silent placeholder files created!"
```

**Pros**: Instant, no API needed, file structure verified
**Cons**: No actual audio to test with users

---

## Option 2: FPT.AI TTS (Best for Development)

Use FPT.AI to generate temporary Vietnamese audio files.

### Manual Generation (Using VisionAid-API)

1. **Start VisionAid-API server**:
```bash
cd /home/phuc/FPT/VIsionAid/VisionAid-API
python app.py
```

2. **Use curl to generate each file**:
```bash
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio

# Example: Generate welcome audio
curl -X POST http://localhost:8000/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Chào mừng bạn đến với VisionAid. Vui lòng xác thực vân tay hoặc khuôn mặt để tiếp tục.",
    "voice": "banmai",
    "speed": 0.9
  }' \
  --output authentication/welcome.mp3

# Repeat for all 30 audio files...
```

### Automated Script

Create `generate_with_fpt.sh`:
```bash
#!/bin/bash

API_URL="http://localhost:8000/text-to-speech"
AUDIO_DIR="/home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio"

echo "🎙️ Generating audio files with FPT.AI TTS..."

# Authentication
curl -X POST $API_URL -H "Content-Type: application/json" \
  -d '{"text":"Chào mừng bạn đến với VisionAid. Vui lòng xác thực vân tay hoặc khuôn mặt để tiếp tục.","voice":"banmai","speed":0.9}' \
  -o "$AUDIO_DIR/authentication/welcome.mp3"

curl -X POST $API_URL -H "Content-Type: application/json" \
  -d '{"text":"Xác thực thành công. Chào mừng bạn trở lại.","voice":"banmai","speed":0.9}' \
  -o "$AUDIO_DIR/authentication/login_success.mp3"

# ... continue for all 30 files ...

echo "✅ Generation complete!"
```

**Pros**: Actual Vietnamese audio, good for testing
**Cons**: Synthetic voice, not as clear as professional recording

---

## Option 3: Professional Recording (Production)

See `AUDIO_RECORDING_GUIDE.md` for full specifications.

### Quick Summary:
1. **Hire**: Professional Vietnamese voice talent
2. **Book**: Recording studio (4 hours)
3. **Record**: All 30 scripts at 44.1kHz
4. **Edit**: Normalize to -3dB, export as MP3 128kbps
5. **Place**: In `/assets/audio/` directories

**Pros**: Highest quality, best for users
**Cons**: Expensive, time-consuming

---

## Verification After Generation

Regardless of which option you use, verify all files:

```bash
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio

# Check all files exist
echo "Checking authentication..."
ls -lh authentication/

echo "Checking navigation..."
ls -lh navigation/

echo "Checking camera..."
ls -lh camera/

echo "Checking gps..."
ls -lh gps/

echo "Checking premium..."
ls -lh premium/

echo "Checking errors..."
ls -lh errors/

# Count total files
echo ""
echo "Total audio files:"
find . -name "*.mp3" | wc -l
echo "(Should be 30)"
```

---

## Testing in App

After generating files:

1. **Update root layout** to initialize AudioManager:
```typescript
// app/_layout.tsx
import { audioManager } from '@/src/services/AudioManager';
import { voiceService } from '@/src/services/VoiceServiceAudio';

useEffect(() => {
  const init = async () => {
    await audioManager.initialize();
    await voiceService.initialize();
  };
  init();
}, []);
```

2. **Start Expo**:
```bash
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid
npx expo start
```

3. **Test each screen**:
- Auth screen: Should play welcome audio
- Main screen: Should play home screen audio
- Camera: Should play camera mode audio
- GPS: Should play GPS mode audio
- Premium: Should play premium mode audio

---

## Troubleshooting

### Files Not Loading
```typescript
// Check in AudioManager.ts getAudioSource()
// Verify paths match exactly:
case 'authentication/welcome':
  return require('@/assets/audio/authentication/welcome.mp3');
```

### Audio Not Playing
```typescript
// Add debug logging
console.log('Audio file path:', audioPath);
console.log('Audio source:', audioSource);
console.log('Sound status:', await sound.getStatusAsync());
```

### Permission Errors
```bash
# Make audio files readable
chmod -R 644 /home/phuc/FPT/VIsionAid/VisionAid/VisionAid/assets/audio/**/*.mp3
```

---

## Recommendation

For **immediate development**: Use **Option 1** (silent placeholders) to verify file structure and AudioManager integration.

For **realistic testing**: Use **Option 2** (FPT.AI TTS) to test with actual Vietnamese audio.

For **production deployment**: Use **Option 3** (professional recording) for highest quality.

---

## Next Steps

1. ✅ Choose generation method
2. ✅ Generate all 30 audio files
3. ✅ Verify files exist and load correctly
4. ✅ Update all screen imports to use VoiceServiceAudio
5. ✅ Test app with audio playback
6. ✅ User test with visually impaired users
7. ✅ Replace with professional recordings before production

---

**Status**: Ready to implement
**Estimated Time**: 
- Option 1: 5 minutes
- Option 2: 1 hour
- Option 3: 5 days
