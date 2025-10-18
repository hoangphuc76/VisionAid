# 🎙️ VisionAid Audio Recording Guide

## Overview
This guide provides all scripts and specifications for recording the 30+ Vietnamese audio files needed for VisionAid's pre-recorded audio system.

## 📋 Recording Specifications

### Technical Requirements
- **Format**: MP3
- **Bitrate**: 128 kbps
- **Sample Rate**: 44.1 kHz
- **Normalization**: -3 dB (for consistent volume)
- **Voice**: Professional Vietnamese native speaker
- **Tone**: Warm, clear, calm, reassuring
- **Pace**: Slow and deliberate (for accessibility)
- **Style**: Conversational, friendly, supportive

### Recording Environment
- Quiet studio environment (no background noise)
- Professional microphone (condenser recommended)
- Pop filter to reduce plosives
- Room treatment to minimize echo

### Voice Characteristics
- **Gender**: Neutral/Female voice preferred (research shows better accessibility)
- **Age**: Mature voice (30-50 years) - conveys trust and authority
- **Accent**: Standard Northern Vietnamese (Hanoi accent)
- **Emotion**: Warm and encouraging, not robotic

---

## 📝 Recording Scripts

### 1️⃣ Authentication Audio (6 files)

#### `/assets/audio/authentication/welcome.mp3`
**Vietnamese**: "Chào mừng bạn đến với VisionAid. Vui lòng xác thực vân tay hoặc khuôn mặt để tiếp tục."
**English**: Welcome to VisionAid. Please authenticate with fingerprint or face to continue.
**Duration**: ~4-5 seconds
**Priority**: HIGH
**Tone**: Warm, welcoming

#### `/assets/audio/authentication/login_success.mp3`
**Vietnamese**: "Xác thực thành công. Chào mừng bạn trở lại."
**English**: Authentication successful. Welcome back.
**Duration**: ~2-3 seconds
**Priority**: CRITICAL
**Tone**: Positive, reassuring

#### `/assets/audio/authentication/login_failed.mp3`
**Vietnamese**: "Xác thực thất bại. Vui lòng thử lại."
**English**: Authentication failed. Please try again.
**Duration**: ~2-3 seconds
**Priority**: CRITICAL
**Tone**: Calm, not alarming

#### `/assets/audio/authentication/biometric_unavailable.mp3`
**Vietnamese**: "Xác thực sinh học không khả dụng trên thiết bị này."
**English**: Biometric authentication is not available on this device.
**Duration**: ~3 seconds
**Priority**: HIGH
**Tone**: Informative

#### `/assets/audio/authentication/setup_required.mp3`
**Vietnamese**: "Vui lòng thiết lập xác thực sinh học trong cài đặt thiết bị."
**English**: Please set up biometric authentication in device settings.
**Duration**: ~3-4 seconds
**Priority**: HIGH
**Tone**: Helpful, instructive

#### `/assets/audio/authentication/gesture_instructions.mp3`
**Vietnamese**: "Chạm đúp để bắt đầu xác thực. Vuốt hai lần sang trái để thoát."
**English**: Double tap to start authentication. Double swipe left to exit.
**Duration**: ~4 seconds
**Priority**: MEDIUM
**Tone**: Clear, instructive

---

### 2️⃣ Navigation Audio (8 files)

#### `/assets/audio/navigation/home_screen.mp3`
**Vietnamese**: "Bạn đang ở màn hình chính. Vuốt hai lần sang trái để mở máy ảnh. Vuốt hai lần sang phải để chia sẻ vị trí. Vuốt hai lần lên trên để mở gói cao cấp. Nhấn giữ để đăng xuất."
**English**: You are on the home screen. Double swipe left for camera. Double swipe right to share location. Double swipe up for premium. Long press to logout.
**Duration**: ~10 seconds
**Priority**: HIGH
**Tone**: Clear, instructive

#### `/assets/audio/navigation/opening_camera.mp3`
**Vietnamese**: "Đang mở máy ảnh."
**English**: Opening camera.
**Duration**: ~1-2 seconds
**Priority**: HIGH
**Tone**: Quick, informative

#### `/assets/audio/navigation/opening_gps.mp3`
**Vietnamese**: "Đang mở chia sẻ vị trí."
**English**: Opening location sharing.
**Duration**: ~1-2 seconds
**Priority**: HIGH
**Tone**: Quick, informative

#### `/assets/audio/navigation/opening_premium.mp3`
**Vietnamese**: "Đang mở gói cao cấp."
**English**: Opening premium plans.
**Duration**: ~1-2 seconds
**Priority**: HIGH
**Tone**: Quick, informative

#### `/assets/audio/navigation/returning_home.mp3`
**Vietnamese**: "Đang quay về màn hình chính."
**English**: Returning to home screen.
**Duration**: ~1-2 seconds
**Priority**: HIGH
**Tone**: Quick, informative

#### `/assets/audio/navigation/logout_confirmation.mp3`
**Vietnamese**: "Vuốt hai lần lên trên để xác nhận đăng xuất. Vuốt hai lần xuống dưới để hủy."
**English**: Double swipe up to confirm logout. Double swipe down to cancel.
**Duration**: ~4 seconds
**Priority**: HIGH
**Tone**: Clear, asking for confirmation

#### `/assets/audio/navigation/gesture_not_recognized.mp3`
**Vietnamese**: "Cử chỉ không được nhận diện. Vui lòng thử lại."
**English**: Gesture not recognized. Please try again.
**Duration**: ~2-3 seconds
**Priority**: MEDIUM
**Tone**: Patient, encouraging

#### `/assets/audio/navigation/screen_loading.mp3`
**Vietnamese**: "Đang tải. Vui lòng đợi."
**English**: Loading. Please wait.
**Duration**: ~1-2 seconds
**Priority**: MEDIUM
**Tone**: Patient

---

### 3️⃣ Camera Audio (7 files)

#### `/assets/audio/camera/camera_mode.mp3`
**Vietnamese**: "Chế độ máy ảnh. Chạm đúp màn hình để chụp ảnh. Vuốt hai lần sang phải để quay lại."
**English**: Camera mode. Double tap screen to take photo. Double swipe right to go back.
**Duration**: ~5 seconds
**Priority**: HIGH
**Tone**: Clear, instructive

#### `/assets/audio/camera/capturing_photo.mp3`
**Vietnamese**: "Đang chụp ảnh."
**English**: Capturing photo.
**Duration**: ~1 second
**Priority**: HIGH
**Tone**: Quick confirmation

#### `/assets/audio/camera/processing_image.mp3`
**Vietnamese**: "Đang xử lý hình ảnh."
**English**: Processing image.
**Duration**: ~1-2 seconds
**Priority**: MEDIUM
**Tone**: Informative

#### `/assets/audio/camera/analyzing_content.mp3`
**Vietnamese**: "Đang phân tích nội dung hình ảnh."
**English**: Analyzing image content.
**Duration**: ~2 seconds
**Priority**: MEDIUM
**Tone**: Informative

#### `/assets/audio/camera/analysis_complete.mp3`
**Vietnamese**: "Phân tích hoàn tất. Kết quả:"
**English**: Analysis complete. Results:
**Duration**: ~2 seconds
**Priority**: HIGH
**Tone**: Positive, transitional

#### `/assets/audio/camera/next_action.mp3`
**Vietnamese**: "Chạm đúp để chụp ảnh khác. Vuốt hai lần sang phải để quay lại."
**English**: Double tap for another photo. Double swipe right to go back.
**Duration**: ~3-4 seconds
**Priority**: LOW
**Tone**: Helpful

#### `/assets/audio/camera/capture_failed.mp3`
**Vietnamese**: "Không thể chụp ảnh. Vui lòng thử lại."
**English**: Cannot capture photo. Please try again.
**Duration**: ~2-3 seconds
**Priority**: HIGH
**Tone**: Calm, encouraging

---

### 4️⃣ GPS Audio (4 files)

#### `/assets/audio/gps/gps_mode.mp3`
**Vietnamese**: "Chế độ chia sẻ vị trí. Chạm đúp để lấy vị trí hiện tại. Vuốt hai lần sang trái để quay lại."
**English**: Location sharing mode. Double tap to get current location. Double swipe left to go back.
**Duration**: ~5 seconds
**Priority**: HIGH
**Tone**: Clear, instructive

#### `/assets/audio/gps/location_found.mp3`
**Vietnamese**: "Đã tìm thấy vị trí của bạn."
**English**: Your location has been found.
**Duration**: ~2 seconds
**Priority**: MEDIUM
**Tone**: Positive

#### `/assets/audio/gps/location_shared.mp3`
**Vietnamese**: "Vị trí đã được chia sẻ với người liên hệ khẩn cấp."
**English**: Location has been shared with emergency contacts.
**Duration**: ~3 seconds
**Priority**: HIGH
**Tone**: Reassuring

#### `/assets/audio/gps/gps_unavailable.mp3`
**Vietnamese**: "Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí trong cài đặt."
**English**: Cannot get location. Please check location permissions in settings.
**Duration**: ~4 seconds
**Priority**: HIGH
**Tone**: Helpful, instructive

---

### 5️⃣ Premium Audio (1 file)

#### `/assets/audio/premium/premium_mode.mp3`
**Vietnamese**: "Gói cao cấp. Vuốt hai lần lên trên để xem chi tiết. Vuốt hai lần xuống dưới để quay lại."
**English**: Premium plans. Double swipe up for details. Double swipe down to go back.
**Duration**: ~4 seconds
**Priority**: HIGH
**Tone**: Professional, inviting

---

### 6️⃣ Error Audio (4 files)

#### `/assets/audio/errors/network_error.mp3`
**Vietnamese**: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại."
**English**: Network connection error. Please check internet connection and try again.
**Duration**: ~4 seconds
**Priority**: CRITICAL
**Tone**: Calm, helpful

#### `/assets/audio/errors/general_error.mp3`
**Vietnamese**: "Đã xảy ra lỗi. Vui lòng thử lại sau."
**English**: An error occurred. Please try again later.
**Duration**: ~2-3 seconds
**Priority**: CRITICAL
**Tone**: Calm, reassuring

#### `/assets/audio/errors/camera_permission.mp3`
**Vietnamese**: "Quyền truy cập máy ảnh bị từ chối. Vui lòng cấp quyền trong cài đặt."
**English**: Camera permission denied. Please grant permission in settings.
**Duration**: ~4 seconds
**Priority**: CRITICAL
**Tone**: Clear, instructive

#### `/assets/audio/errors/service_unavailable.mp3`
**Vietnamese**: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."
**English**: Service temporarily unavailable. Please try again later.
**Duration**: ~3 seconds
**Priority**: CRITICAL
**Tone**: Apologetic, reassuring

---

## 🎬 Recording Process

### Phase 1: Preparation (Day 1)
1. ✅ Hire professional Vietnamese voice talent
2. ✅ Book recording studio (minimum 4 hours)
3. ✅ Print all scripts with phonetic notes
4. ✅ Test recording equipment

### Phase 2: Recording Session (Day 2)
1. **Warm-up**: Voice exercises (10 minutes)
2. **Test recordings**: Record first 3 scripts for quality check
3. **Batch recording**: Record by category (authentication → navigation → camera → GPS → premium → errors)
4. **Multiple takes**: Record each script 3 times minimum
5. **Alternative versions**: Record variations in tone/pacing for testing
6. **Backup recordings**: Record everything to multiple devices

### Phase 3: Post-Production (Day 3-4)
1. **Editing**: Remove mouth clicks, breaths, long pauses
2. **Normalization**: Normalize all files to -3 dB
3. **Compression**: Export as MP3 128 kbps
4. **Quality check**: Listen to all files on different devices
5. **File naming**: Use exact filenames from AudioManager.ts
6. **Organization**: Place in correct directory structure

### Phase 4: Testing (Day 5)
1. **Technical test**: Verify all files load in AudioManager
2. **User test**: Test with visually impaired users
3. **Timing test**: Verify audio doesn't overlap inappropriately
4. **Priority test**: Confirm CRITICAL interrupts MEDIUM correctly
5. **Iteration**: Re-record any unclear or poorly-paced audio

---

## 📊 Recording Checklist

### ✅ Authentication (6 files)
- [ ] welcome.mp3
- [ ] login_success.mp3
- [ ] login_failed.mp3
- [ ] biometric_unavailable.mp3
- [ ] setup_required.mp3
- [ ] gesture_instructions.mp3

### ✅ Navigation (8 files)
- [ ] home_screen.mp3
- [ ] opening_camera.mp3
- [ ] opening_gps.mp3
- [ ] opening_premium.mp3
- [ ] returning_home.mp3
- [ ] logout_confirmation.mp3
- [ ] gesture_not_recognized.mp3
- [ ] screen_loading.mp3

### ✅ Camera (7 files)
- [ ] camera_mode.mp3
- [ ] capturing_photo.mp3
- [ ] processing_image.mp3
- [ ] analyzing_content.mp3
- [ ] analysis_complete.mp3
- [ ] next_action.mp3
- [ ] capture_failed.mp3

### ✅ GPS (4 files)
- [ ] gps_mode.mp3
- [ ] location_found.mp3
- [ ] location_shared.mp3
- [ ] gps_unavailable.mp3

### ✅ Premium (1 file)
- [ ] premium_mode.mp3

### ✅ Errors (4 files)
- [ ] network_error.mp3
- [ ] general_error.mp3
- [ ] camera_permission.mp3
- [ ] service_unavailable.mp3

**TOTAL: 30 audio files**

---

## 💰 Budget Estimate

- **Voice talent**: 3,000,000 - 5,000,000 VND (4 hours)
- **Studio rental**: 1,000,000 - 2,000,000 VND
- **Audio engineer**: 1,500,000 - 2,500,000 VND
- **Post-production**: 1,000,000 - 2,000,000 VND
- **Total**: ~6,500,000 - 11,500,000 VND (~$270 - $480 USD)

---

## 🔄 Future Updates

When adding new features, follow this process:

1. **Design**: Write script in Vietnamese and English
2. **Review**: Have native speaker review for naturalness
3. **Record**: Book voice talent for additional session
4. **Integrate**: Add to AudioManager.ts getAudioSource()
5. **Update**: Add to VoiceServiceAudio.ts with appropriate method
6. **Test**: Verify audio plays correctly in app context

---

## 📞 Recommended Voice Talent (Vietnam)

Contact professional Vietnamese voice-over artists through:
- **FPT.AI Voice**: https://fpt.ai/vi/voice
- **Vbee.vn**: https://vbee.vn (TTS service, but they have voice talent)
- **Freelancer.vn**: Search "lồng tiếng"
- **Upwork**: Filter for Vietnamese voice-over artists
- **Local studios**: Hanoi and HCMC have many professional recording studios

---

## ✅ Quality Assurance

Each audio file must pass:
1. **Clarity test**: Understandable at 0.8x to 1.2x speed
2. **Volume test**: Consistent volume across all files
3. **Noise test**: No background noise, clicks, or pops
4. **Timing test**: Appropriate pace for visually impaired users
5. **Tone test**: Warm and reassuring, not robotic
6. **User test**: Validated by actual visually impaired users

---

## 📝 Notes

- **Priority**: Authentication and Navigation audio first (these are most critical)
- **Accessibility**: Test with actual blind users throughout process
- **Consistency**: Same voice talent for all recordings
- **Backup**: Keep all raw recordings for future re-editing
- **Documentation**: Keep notes on tone/pacing decisions for future recordings

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Ready for recording
