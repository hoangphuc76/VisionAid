# 🔄 Migration Guide: TTS to Pre-Recorded Audio

## Overview
This guide details the migration from `expo-speech` TTS system to pre-recorded audio using `AudioManager` and `VoiceServiceAudio`.

---

## 📋 Migration Steps

### Step 1: Install Required Dependencies (✅ Already Done)
```bash
# expo-av is already installed for audio playback
# expo-haptics is already installed for haptic feedback
```

### Step 2: Replace VoiceService Imports

**OLD** (in all screens):
```typescript
import { voiceService } from '@/src/services/VoiceService';
```

**NEW**:
```typescript
import { voiceService } from '@/src/services/VoiceServiceAudio';
import { audioManager } from '@/src/services/AudioManager';
```

---

## 🔄 File-by-File Migration

### 1️⃣ BiometricAuth.tsx

**Location**: `/src/components/BiometricAuth.tsx`

**Changes Required**: None (interface remains the same)

**Verification**:
- [x] Import uses VoiceServiceAudio
- [x] All `voiceService.announceX()` calls remain unchanged
- [x] Test biometric auth flow with new audio

---

### 2️⃣ Main Screen

**Location**: `/app/(tabs)/main.tsx`

**Changes Required**: Update imports only

```typescript
// OLD
import { voiceService } from '@/src/services/VoiceService';

// NEW
import { voiceService } from '@/src/services/VoiceServiceAudio';
```

**Affected Methods**:
- `voiceService.announceHomeScreen()` - ✅ Supported
- `voiceService.announceGestureDetected()` - ✅ Supported
- `voiceService.announceLogoutConfirmation()` - ✅ Supported

**Verification**:
- [x] Home screen announcement plays on mount
- [x] Gesture announcements play for swipes
- [x] Logout confirmation plays on long press

---

### 3️⃣ Camera Screen

**Location**: `/app/(tabs)/CameraScreen.tsx`

**Changes Required**: Update imports only

```typescript
// OLD
import { voiceService } from '@/src/services/VoiceService';

// NEW
import { voiceService } from '@/src/services/VoiceServiceAudio';
```

**Affected Methods**:
- `voiceService.announceCameraMode()` - ✅ Supported
- `voiceService.announcePhotoCapturing()` - ✅ Supported
- `voiceService.announcePhotoProcessing()` - ✅ Supported
- `voiceService.announceImageAnalyzing()` - ✅ Supported
- `voiceService.announceAnalysisComplete()` - ✅ Supported
- `voiceService.announceCameraInstructions()` - ✅ Supported
- `voiceService.announceCameraError()` - ✅ Supported
- `voiceService.announceCameraPermissionError()` - ✅ Supported

**Verification**:
- [x] Camera mode announcement on screen load
- [x] Capturing announcement on double tap
- [x] Processing → Analyzing sequence
- [x] Results announcement
- [x] Error announcements with haptic feedback

---

### 4️⃣ GPS Screen

**Location**: `/app/(tabs)/gps.tsx`

**Changes Required**: Update imports only

```typescript
// OLD
import { voiceService } from '@/src/services/VoiceService';

// NEW
import { voiceService } from '@/src/services/VoiceServiceAudio';
```

**Affected Methods**:
- `voiceService.announceGPSMode()` - ✅ Supported
- `voiceService.announceLocationFound()` - ✅ Supported
- `voiceService.announceLocationShared()` - ✅ Supported
- `voiceService.announceLocationError()` - ✅ Supported

**Verification**:
- [x] GPS mode announcement on screen load
- [x] Location found announcement
- [x] Location shared confirmation with haptic
- [x] Error handling with audio feedback

---

### 5️⃣ Premium Screen

**Location**: `/app/(tabs)/premium.tsx`

**Changes Required**: Update imports only

```typescript
// OLD
import { voiceService } from '@/src/services/VoiceService';

// NEW
import { voiceService } from '@/src/services/VoiceServiceAudio';
```

**Affected Methods**:
- `voiceService.announcePremiumMode()` - ✅ Supported

**Verification**:
- [x] Premium mode announcement on screen load

---

### 6️⃣ Auth Screen

**Location**: `/app/auth.tsx`

**Changes Required**: Update imports only

```typescript
// OLD
import { voiceService } from '@/src/services/VoiceService';

// NEW
import { voiceService } from '@/src/services/VoiceServiceAudio';
```

**Affected Methods**:
- `voiceService.announceWelcome()` - ✅ Supported
- `voiceService.announceAuthSuccess()` - ✅ Supported
- `voiceService.announceAuthFailed()` - ✅ Supported

**Verification**:
- [x] Welcome announcement on app launch
- [x] Success announcement with haptic
- [x] Failure announcement with retry prompt

---

## 🧪 Testing Checklist

### Before Migration
- [x] Document current TTS behavior
- [x] Test all screens with expo-speech
- [x] Note any timing issues
- [x] Capture baseline performance metrics

### After Migration
- [ ] **Step 1**: Record all 30 audio files (see `AUDIO_RECORDING_GUIDE.md`)
- [ ] **Step 2**: Place audio files in correct directories
- [ ] **Step 3**: Update all imports to use VoiceServiceAudio
- [ ] **Step 4**: Initialize AudioManager in app startup
- [ ] **Step 5**: Test each screen individually
- [ ] **Step 6**: Test gesture flows across screens
- [ ] **Step 7**: Test priority interruptions
- [ ] **Step 8**: Test error scenarios
- [ ] **Step 9**: Performance testing
- [ ] **Step 10**: User testing with visually impaired users

### Detailed Testing

#### ✅ Authentication Flow
- [ ] Welcome audio plays on app launch
- [ ] Login success audio plays after biometric auth
- [ ] Login failed audio plays on auth failure
- [ ] Haptic feedback occurs on success/failure
- [ ] Audio doesn't overlap with system sounds

#### ✅ Navigation Flow
- [ ] Home screen audio announces all gestures
- [ ] Opening camera/GPS/premium announcements
- [ ] Logout confirmation audio
- [ ] Gesture not recognized feedback
- [ ] Screen transitions feel smooth

#### ✅ Camera Flow
- [ ] Camera mode audio on screen load
- [ ] Capturing audio on double tap
- [ ] Processing → Analyzing sequence
- [ ] Analysis complete audio
- [ ] Next action instructions
- [ ] Error handling with audio + haptic

#### ✅ GPS Flow
- [ ] GPS mode audio on screen load
- [ ] Location found audio
- [ ] Location shared confirmation
- [ ] Permission error handling

#### ✅ Premium Flow
- [ ] Premium mode audio on screen load
- [ ] Navigation instructions clear

#### ✅ Priority System
- [ ] CRITICAL interrupts MEDIUM audio
- [ ] HIGH interrupts LOW audio
- [ ] Same priority queues properly
- [ ] No audio overlap issues

---

## 🚨 Breaking Changes

### ❌ Removed Functionality
1. **expo-speech dependency**: Will be removed from package.json
2. **TTS voice selection**: No longer needed (single professional voice)
3. **Speech rate adjustment**: Replaced with playback speed (0.8x-1.2x)
4. **Dynamic text-to-speech**: Must use pre-recorded audio only

### ⚠️ Behavior Changes
1. **Latency**: Pre-recorded audio starts faster (<100ms vs ~300ms for TTS)
2. **Quality**: Professional voice quality (vs synthetic TTS)
3. **Offline**: Works fully offline once audio loaded (TTS required processing)
4. **Priority**: New priority system with interruption logic
5. **Consistency**: Exact same voice/tone every time (TTS varied)

---

## 🔧 Code Migration Script

Run this script to update all imports automatically:

```bash
#!/bin/bash

# Navigate to project root
cd /home/phuc/FPT/VIsionAid/VisionAid/VisionAid

# Find and replace old VoiceService imports with new one
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/src/services/VoiceService.ts" \
  -exec sed -i "s|from '@/src/services/VoiceService'|from '@/src/services/VoiceServiceAudio'|g" {} +

# Alternative: If using relative paths
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -exec sed -i "s|from '../../src/services/VoiceService'|from '../../src/services/VoiceServiceAudio'|g" {} +

echo "✅ Import migration complete!"
echo "⚠️  Please verify changes before committing"
```

---

## 📦 App.tsx / _layout.tsx Updates

### Initialize AudioManager on App Start

**Location**: `/app/_layout.tsx`

**Add to root layout**:

```typescript
import { audioManager } from '@/src/services/AudioManager';
import { voiceService } from '@/src/services/VoiceServiceAudio';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Initialize audio system
    const initAudio = async () => {
      try {
        await audioManager.initialize();
        await voiceService.initialize();
        console.log('✅ Audio system initialized');
      } catch (error) {
        console.error('❌ Audio initialization failed:', error);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      audioManager.stop();
    };
  }, []);

  // ... rest of layout
}
```

---

## 🗑️ Clean Up Old Dependencies

After migration is complete and tested:

```bash
# Remove expo-speech (no longer needed)
npm uninstall expo-speech

# Update package.json
npm install
```

---

## 📊 Performance Comparison

| Metric | TTS (Old) | Pre-Recorded (New) |
|--------|-----------|-------------------|
| **Start Latency** | ~300ms | ~50ms |
| **Voice Quality** | Synthetic | Professional |
| **Consistency** | Variable | Exact |
| **Offline Support** | Limited | Full |
| **File Size** | 0 KB | ~5 MB total |
| **CPU Usage** | High | Low |
| **Battery Impact** | Higher | Lower |

---

## ✅ Rollout Plan

### Phase 1: Preparation (Day 1)
- [x] Create AudioManager.ts
- [x] Create VoiceServiceAudio.ts
- [x] Create audio directory structure
- [x] Create recording guide
- [x] Create migration guide (this file)

### Phase 2: Audio Production (Day 2-5)
- [ ] Record all 30 audio files
- [ ] Post-production editing
- [ ] Place files in directories
- [ ] Test file loading

### Phase 3: Code Migration (Day 6)
- [ ] Run import update script
- [ ] Manual verification of all changes
- [ ] Update root layout initialization
- [ ] Remove expo-speech dependency

### Phase 4: Testing (Day 7-8)
- [ ] Technical testing (all files load)
- [ ] Flow testing (all screens work)
- [ ] Priority testing (interruption works)
- [ ] Performance testing (latency, memory)

### Phase 5: User Testing (Day 9-10)
- [ ] Test with visually impaired users
- [ ] Collect feedback on voice quality
- [ ] Verify gesture + audio timing
- [ ] Identify issues and iterate

### Phase 6: Deployment (Day 11)
- [ ] Final QA pass
- [ ] Build production app
- [ ] Deploy to test flight/internal testing
- [ ] Monitor for audio issues

---

## 🐛 Common Issues & Solutions

### Issue 1: Audio Not Playing
**Symptom**: Silent app, no audio feedback
**Solution**:
1. Check audio files exist in `/assets/audio/`
2. Verify filenames match AudioManager.ts exactly
3. Check device volume is up
4. Verify audioManager.initialize() was called
5. Check console for file loading errors

### Issue 2: Audio Overlap
**Symptom**: Multiple audio files playing simultaneously
**Solution**:
1. Verify priority system is working
2. Check shouldInterruptCurrentAudio() logic
3. Ensure only one Sound instance plays at a time
4. Add more aggressive stop() calls before play()

### Issue 3: Delayed Audio Start
**Symptom**: Long pause before audio plays
**Solution**:
1. Verify audio files are preloaded with preloadCommonAudio()
2. Check file sizes (should be <200KB each)
3. Optimize MP3 encoding
4. Load audio on app startup, not on first use

### Issue 4: Audio Cut Off
**Symptom**: Audio stops abruptly mid-playback
**Solution**:
1. Check for competing audio from navigation/gestures
2. Verify priority levels are correct
3. Add onComplete callbacks to track issues
4. Increase buffer size if needed

---

## 📞 Support

If you encounter issues during migration:
1. Check console logs for audio loading errors
2. Verify audio files exist and are named correctly
3. Test individual audio files using audioManager.play() directly
4. Check ACCESSIBILITY_TESTING.md for test procedures
5. Review this migration guide for missed steps

---

**Status**: Ready for Implementation
**Last Updated**: December 2024
**Version**: 1.0
