import { Audio, AVPlaybackStatus } from 'expo-av';
import { Asset } from 'expo-asset';

export type AudioPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AudioOptions {
  priority?: AudioPriority;
  canInterrupt?: boolean;
  hapticFeedback?: boolean;
  onComplete?: () => void;
}

/**
 * Simple AudioManager for VisionAid
 * Plays pre-recorded audio files
 */
export class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
      console.log('✅ AudioManager initialized');
    } catch (error) {
      console.error('❌ AudioManager initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Play an audio file
   * @param audioPath - Path relative to assets/audio/ (e.g., 'authentication/welcome')
   * @param options - Audio playback options
   */
  public async play(audioPath: string, options: AudioOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Stop current sound if playing
      if (this.currentSound && this.isPlaying) {
        await this.stop();
      }

      // Load audio file
      const audioFile = this.getAudioFile(audioPath);
      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );

      this.currentSound = sound;
      this.isPlaying = true;

      console.log(`🔊 Playing audio: ${audioPath}`);
    } catch (error) {
      console.error(`❌ Failed to play audio: ${audioPath}`, error);
    }
  }

  /**
   * Stop current audio
   */
  public async stop(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.isPlaying = false;
        console.log('⏹️ Audio stopped');
      }
    } catch (error) {
      console.error('❌ Failed to stop audio:', error);
    }
  }

  /**
   * Check if audio is playing
   */
  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Replay last audio (stub for compatibility)
   */
  public async replayLast(): Promise<void> {
    console.log('⚠️ replayLast not implemented in simple AudioManager');
  }

  /**
   * Set playback rate (stub for compatibility)
   */
  public async setPlaybackRate(rate: number): Promise<void> {
    console.log(`⚠️ setPlaybackRate(${rate}) not implemented in simple AudioManager`);
  }

  /**
   * Playback status update callback
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      this.isPlaying = false;
      this.currentSound?.unloadAsync();
      this.currentSound = null;
      console.log('✅ Audio playback finished');
    }
  };

  /**
   * Get audio file from assets
   */
  private getAudioFile(audioPath: string): any {
    // Map audio paths to require statements
    const audioFiles: Record<string, any> = {
      // Authentication
      'authentication/welcome': require('../../assets/audio/authentication/welcome.mp3'),
      'authentication/login_success': require('../../assets/audio/authentication/login_success.mp3'),
      'authentication/login_failed': require('../../assets/audio/authentication/login_failed.mp3'),
      'authentication/gesture_instructions': require('../../assets/audio/authentication/gesture_instructions.mp3'),
      'authentication/biometric_unavailable': require('../../assets/audio/authentication/biometric_unavailable.mp3'),
      'authentication/setup_required': require('../../assets/audio/authentication/setup_required.mp3'),
      
      // Navigation
      'navigation/home_screen': require('../../assets/audio/navigation/home_screen.mp3'),
      'navigation/opening_camera': require('../../assets/audio/navigation/opening_camera.mp3'),
      'navigation/opening_gps': require('../../assets/audio/navigation/opening_gps.mp3'),
      'navigation/opening_premium': require('../../assets/audio/navigation/opening_premium.mp3'),
      'navigation/returning_home': require('../../assets/audio/navigation/returning_home.mp3'),
      'navigation/logout_confirmation': require('../../assets/audio/navigation/logout_confirmation.mp3'),
      'navigation/gesture_not_recognized': require('../../assets/audio/navigation/gesture_not_recognized.mp3'),
      'navigation/screen_loading': require('../../assets/audio/navigation/screen_loading.mp3'),
      
      // Camera
      'camera/camera_mode': require('../../assets/audio/camera/camera_mode.mp3'),
      'camera/capturing_photo': require('../../assets/audio/camera/capturing_photo.mp3'),
      
      // Errors
      'errors/general_error': require('../../assets/audio/errors/general_error.mp3'),
    };

    const audioFile = audioFiles[audioPath];
    if (!audioFile) {
      console.warn(`⚠️ Audio file not found: ${audioPath}`);
      // Return a fallback or throw error
      return audioFiles['errors/general_error'];
    }

    return audioFile;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
