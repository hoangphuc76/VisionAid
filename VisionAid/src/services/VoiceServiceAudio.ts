import { audioManager, AudioPriority } from './AudioManager.simple';
import * as Haptics from 'expo-haptics';

/**
 * VoiceService - High-level interface for app voice feedback
 * Uses pre-recorded audio files via AudioManager
 */
export class VoiceService {
  private static instance: VoiceService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await audioManager.initialize();
      this.isInitialized = true;
      console.log('✅ VoiceService initialized');
    } catch (error) {
      console.error('❌ VoiceService initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Stop current audio
   */
  public stop(): void {
    audioManager.stop();
  }

  /**
   * Check if audio is playing
   */
  public isSpeaking(): boolean {
    return audioManager.isAudioPlaying();
  }

  // ===========================================
  // AUTHENTICATION ANNOUNCEMENTS
  // ===========================================

  public async announceWelcome(): Promise<void> {
    await audioManager.play('authentication/welcome', {
      priority: 'HIGH',
      hapticFeedback: true,
    });
  }

  public async announceAuthSuccess(): Promise<void> {
    await audioManager.play('authentication/login_success', {
      priority: 'CRITICAL',
      hapticFeedback: true,
    });
  }

  public async announceAuthFailed(): Promise<void> {
    await audioManager.play('authentication/login_failed', {
      priority: 'CRITICAL',
      hapticFeedback: true,
    });
  }

  public async announceGestureInstructions(): Promise<void> {
    await audioManager.play('authentication/gesture_instructions', {
      priority: 'HIGH',
      hapticFeedback: false,
    });
  }

  // ===========================================
  // NAVIGATION ANNOUNCEMENTS
  // ===========================================

  public async announceHomeScreen(): Promise<void> {
    await audioManager.play('navigation/home_screen', {
      priority: 'HIGH',
    });
  }

  public async announceGestureDetected(gesture: string): Promise<void> {
    const gestureMappings: Record<string, string> = {
      camera: 'navigation/opening_camera',
      gps: 'navigation/opening_gps',
      premium: 'navigation/opening_premium',
      home: 'navigation/returning_home',
      logout: 'navigation/logout_confirmation',
    };

    const audioPath = gestureMappings[gesture];
    if (audioPath) {
      await audioManager.play(audioPath, {
        priority: 'HIGH',
        hapticFeedback: true,
      });
    }
  }

  public async announceGestureNotRecognized(): Promise<void> {
    await audioManager.play('navigation/gesture_not_recognized', {
      priority: 'MEDIUM',
      hapticFeedback: true,
    });
  }

  // ===========================================
  // CAMERA ANNOUNCEMENTS
  // ===========================================

  public async announceCameraMode(): Promise<void> {
    await audioManager.play('camera/camera_mode', {
      priority: 'HIGH',
    });
  }

  public async announcePhotoCapturing(): Promise<void> {
    await audioManager.play('camera/capturing_photo', {
      priority: 'HIGH',
      hapticFeedback: true,
    });
  }

  public async announcePhotoProcessing(): Promise<void> {
    await audioManager.play('camera/processing_image', {
      priority: 'MEDIUM',
    });
  }

  public async announceImageAnalyzing(): Promise<void> {
    await audioManager.play('camera/analyzing_content', {
      priority: 'MEDIUM',
    });
  }

  public async announceAnalysisComplete(result?: string): Promise<void> {
    // Play analysis complete audio first
    await audioManager.play('camera/analysis_complete', {
      priority: 'HIGH',
      onComplete: async () => {
        // If there's a result audio URL from API, play it next
        if (result) {
          // Note: If the API returns an audio URL, we'd play it here
          // For now, we'll just log it
          console.log('Analysis result:', result);
        }
      },
    });
  }

  public async announceCameraInstructions(): Promise<void> {
    await audioManager.play('camera/next_action', {
      priority: 'LOW',
    });
  }

  public async announceCameraError(): Promise<void> {
    await audioManager.play('camera/capture_failed', {
      priority: 'HIGH',
      hapticFeedback: true,
    });
  }

  // ===========================================
  // GPS ANNOUNCEMENTS
  // ===========================================

  public async announceGPSMode(): Promise<void> {
    await audioManager.play('gps/gps_mode', {
      priority: 'HIGH',
    });
  }

  public async announceLocationFound(): Promise<void> {
    await audioManager.play('gps/location_found', {
      priority: 'MEDIUM',
    });
  }

  public async announceLocationShared(): Promise<void> {
    await audioManager.play('gps/location_shared', {
      priority: 'HIGH',
      hapticFeedback: true,
    });
  }

  public async announceLocationError(): Promise<void> {
    await audioManager.play('gps/gps_unavailable', {
      priority: 'HIGH',
      hapticFeedback: true,
    });
  }

  // ===========================================
  // PREMIUM ANNOUNCEMENTS
  // ===========================================

  public async announcePremiumMode(): Promise<void> {
    await audioManager.play('premium/premium_mode', {
      priority: 'HIGH',
    });
  }

  // ===========================================
  // ERROR ANNOUNCEMENTS
  // ===========================================

  public async announceNetworkError(): Promise<void> {
    await audioManager.play('errors/network_error', {
      priority: 'CRITICAL',
      hapticFeedback: true,
    });
  }

  public async announceGenericError(): Promise<void> {
    await audioManager.play('errors/general_error', {
      priority: 'CRITICAL',
      hapticFeedback: true,
    });
  }

  public async announceCameraPermissionError(): Promise<void> {
    await audioManager.play('errors/camera_permission', {
      priority: 'CRITICAL',
      hapticFeedback: true,
    });
  }

  // ===========================================
  // LOGOUT ANNOUNCEMENTS
  // ===========================================

  public async announceLogoutConfirmation(): Promise<void> {
    await audioManager.play('navigation/logout_confirmation', {
      priority: 'HIGH',
    });
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Play custom audio file (for dynamic content from API)
   */
  public async playCustomAudio(audioUrl: string): Promise<void> {
    // This would handle playing audio URLs returned from the API
    // For analysis results, the API would return a pre-generated audio file
    console.log('Playing custom audio from URL:', audioUrl);
    
    // Implementation would use expo-av to play remote audio
    // Similar to how we handle local audio files
  }

  /**
   * Speak custom text (fallback for development/testing)
   * In production, all text should have corresponding audio files
   */
  public async speak(text: string): Promise<void> {
    console.warn('⚠️ speak() called with text:', text);
    console.warn('⚠️ All voice feedback should use pre-recorded audio files');
    console.warn('⚠️ Please record audio file for this message');
    
    // For development, we could fall back to TTS, but in production
    // this should never be called - all feedback should be pre-recorded
  }

  /**
   * Replay last audio (for triple-tap gesture)
   */
  public async replayLast(): Promise<void> {
    await audioManager.replayLast();
  }

  /**
   * Set playback speed (user preference)
   */
  public async setPlaybackSpeed(speed: number): Promise<void> {
    // Speed range: 0.8x to 1.2x
    const clampedSpeed = Math.max(0.8, Math.min(1.2, speed));
    await audioManager.setPlaybackRate(clampedSpeed);
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance();
