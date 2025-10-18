// import { Audio, AVPlaybackStatus } from 'expo-av';
// import * as Haptics from 'expo-haptics';

// export type AudioPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// export interface AudioOptions {
//   priority?: AudioPriority;
//   canInterrupt?: boolean;
//   hapticFeedback?: boolean;
//   onComplete?: () => void;
// }

// interface QueuedAudio {
//   path: string;
//   options: AudioOptions;
// }

// /**
//  * AudioManager - Manages playback of pre-recorded audio files for VisionAid
//  * Replaces TTS with high-quality Vietnamese audio recordings
//  */
// export class AudioManager {
//   private static instance: AudioManager;
//   private currentSound: Audio.Sound | null = null;
//   private audioQueue: QueuedAudio[] = [];
//   private isPlaying: boolean = false;
//   private preloadedSounds: Map<string, Audio.Sound> = new Map();
//   private isInitialized: boolean = false;

//   // Priority hierarchy for interruption logic
//   private priorityLevels: Record<AudioPriority, number> = {
//     CRITICAL: 4,
//     HIGH: 3,
//     MEDIUM: 2,
//     LOW: 1,
//   };

//   private currentPriority: AudioPriority = 'LOW';

//   private constructor() {}

//   public static getInstance(): AudioManager {
//     if (!AudioManager.instance) {
//       AudioManager.instance = new AudioManager();
//     }
//     return AudioManager.instance;
//   }

//   /**
//    * Initialize audio system and preload common audio files
//    */
//   public async initialize(): Promise<void> {
//     if (this.isInitialized) return;

//     try {
//       // Configure audio mode for optimal playback
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: false,
//         shouldDuckAndroid: true,
//       });

//       // Preload frequently used audio files
//       await this.preloadCommonAudio();

//       this.isInitialized = true;
//       console.log('✅ AudioManager initialized successfully');
//     } catch (error) {
//       console.error('❌ AudioManager initialization failed:', error);
//       this.isInitialized = false;
//     }
//   }

//   /**
//    * Preload commonly used audio files for instant playback
//    */
//   private async preloadCommonAudio(): Promise<void> {
//     const commonAudioPaths = [
//       'authentication/welcome',
//       'authentication/login_success',
//       'authentication/login_failed',
//       'navigation/home_screen',
//       'navigation/opening_camera',
//       'navigation/opening_gps',
//       'navigation/opening_premium',
//       'navigation/gesture_not_recognized',
//       'camera/camera_mode',
//       'camera/capturing_photo',
//       'errors/general_error',
//     ];

//     for (const path of commonAudioPaths) {
//       try {
//         // Note: In production, replace with actual audio file paths
//         // For now, we'll load them dynamically when needed
//         console.log(`Preloading audio: ${path}`);
//       } catch (error) {
//         console.error(`Failed to preload audio: ${path}`, error);
//       }
//     }
//   }

//   /**
//    * Play an audio file
//    */
//   public async play(
//     audioPath: string,
//     options: AudioOptions = {}
//   ): Promise<void> {
//     if (!this.isInitialized) {
//       await this.initialize();
//     }

//     const defaultOptions: AudioOptions = {
//       priority: 'MEDIUM',
//       canInterrupt: true,
//       hapticFeedback: true,
//     };

//     const finalOptions = { ...defaultOptions, ...options };

//     // Check if we should interrupt current audio
//     const shouldInterrupt = this.shouldInterruptCurrentAudio(finalOptions.priority!);

//     if (this.isPlaying && !shouldInterrupt) {
//       // Add to queue if we can't interrupt
//       this.audioQueue.push({ path: audioPath, options: finalOptions });
//       return;
//     }

//     // Stop current audio if interrupting
//     if (this.isPlaying && shouldInterrupt) {
//       await this.stop();
//     }

//     // Play the audio
//     await this.playAudioFile(audioPath, finalOptions);
//   }

//   /**
//    * Actually play the audio file
//    */
//   private async playAudioFile(
//     audioPath: string,
//     options: AudioOptions
//   ): Promise<void> {
//     try {
//       this.isPlaying = true;
//       this.currentPriority = options.priority || 'MEDIUM';

//       // Add haptic feedback
//       if (options.hapticFeedback) {
//         await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       }

//       // Check if audio is preloaded
//       let sound = this.preloadedSounds.get(audioPath);

//       if (!sound) {
//         // Load audio file dynamically
//         const audioSource = this.getAudioSource(audioPath);
//         const { sound: newSound } = await Audio.Sound.createAsync(audioSource);
//         sound = newSound;
//       }

//       this.currentSound = sound;

//       // Set up playback status update
//       sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate.bind(this, options));

//       // Play the audio
//       await sound.playAsync();

//       console.log(`🔊 Playing audio: ${audioPath} (Priority: ${options.priority})`);
//     } catch (error) {
//       console.error(`❌ Failed to play audio: ${audioPath}`, error);
//       this.isPlaying = false;
//       this.playNext(); // Try to play next in queue
//     }
//   }

//   /**
//    * Handle playback status updates
//    */
//   private onPlaybackStatusUpdate = (
//     options: AudioOptions,
//     status: AVPlaybackStatus
//   ): void => {
//     if (status.isLoaded && status.didJustFinish) {
//       console.log('✅ Audio playback completed');
      
//       // Cleanup
//       this.cleanup();

//       // Call completion callback
//       if (options.onComplete) {
//         options.onComplete();
//       }

//       // Play next audio in queue
//       this.playNext();
//     }
//   };

//   /**
//    * Stop current audio playback
//    */
//   public async stop(): Promise<void> {
//     if (this.currentSound) {
//       try {
//         await this.currentSound.stopAsync();
//         await this.currentSound.unloadAsync();
//       } catch (error) {
//         console.error('Error stopping audio:', error);
//       }
//       this.cleanup();
//     }
//   }

//   /**
//    * Cleanup after playback
//    */
//   private cleanup(): void {
//     this.currentSound = null;
//     this.isPlaying = false;
//     this.currentPriority = 'LOW';
//   }

//   /**
//    * Play next audio in queue
//    */
//   private async playNext(): Promise<void> {
//     if (this.audioQueue.length > 0) {
//       const next = this.audioQueue.shift();
//       if (next) {
//         await this.play(next.path, next.options);
//       }
//     }
//   }

//   /**
//    * Determine if current audio should be interrupted
//    */
//   private shouldInterruptCurrentAudio(newPriority: AudioPriority): boolean {
//     if (!this.isPlaying) return true;

//     const currentLevel = this.priorityLevels[this.currentPriority];
//     const newLevel = this.priorityLevels[newPriority];

//     return newLevel > currentLevel;
//   }

//   /**
//    * Get audio source based on path
//    * Maps audio paths to actual require() statements
//    */
//   private getAudioSource(audioPath: string): any {
//     // In production, this would map to actual audio files in assets
//     // For now, we'll create a mapping structure
    
//     const audioMap: Record<string, any> = {
//       // Authentication
//       'authentication/welcome': require('../../assets/audio/authentication/welcome.mp3'),
//       'authentication/login_success': require('../../assets/audio/authentication/login_success.mp3'),
//       'authentication/login_failed': require('../../assets/audio/authentication/login_failed.mp3'),
      
//       // Navigation
//       'navigation/home_screen': require('../../assets/audio/navigation/home_screen.mp3'),
//       'navigation/opening_camera': require('../../assets/audio/navigation/opening_camera.mp3'),
//       'navigation/opening_gps': require('../../assets/audio/navigation/opening_gps.mp3'),
//       'navigation/opening_premium': require('../../assets/audio/navigation/opening_premium.mp3'),
//       'navigation/returning_home': require('../../assets/audio/navigation/returning_home.mp3'),
//       'navigation/gesture_not_recognized': require('../../assets/audio/navigation/gesture_not_recognized.mp3'),
      
//       // Camera
//       'camera/camera_mode': require('../../assets/audio/camera/camera_mode.mp3'),
//       'camera/capturing_photo': require('../../assets/audio/camera/capturing_photo.mp3'),
//       'camera/photo_captured': require('../../assets/audio/camera/photo_captured.mp3'),
//       'camera/processing_image': require('../../assets/audio/camera/processing_image.mp3'),
//       'camera/analyzing_content': require('../../assets/audio/camera/analyzing_content.mp3'),
//       'camera/analysis_complete': require('../../assets/audio/camera/analysis_complete.mp3'),
//       'camera/next_action': require('../../assets/audio/camera/next_action.mp3'),
//       'camera/capture_failed': require('../../assets/audio/camera/capture_failed.mp3'),
      
//       // GPS
//       'gps/gps_mode': require('../../assets/audio/gps/gps_mode.mp3'),
//       'gps/location_found': require('../../assets/audio/gps/location_found.mp3'),
//       'gps/location_shared': require('../../assets/audio/gps/location_shared.mp3'),
//       'gps/gps_unavailable': require('../../assets/audio/gps/gps_unavailable.mp3'),
      
//       // Errors
//       'errors/general_error': require('../../assets/audio/errors/general_error.mp3'),
//       'errors/network_error': require('../../assets/audio/errors/network_error.mp3'),
//       'errors/camera_permission': require('../../assets/audio/errors/camera_permission.mp3'),
      
//       // Premium
//       'premium/premium_mode': require('../../assets/audio/premium/premium_mode.mp3'),
//     };

//     // Try to get from map, fallback to dynamic require
//     if (audioMap[audioPath]) {
//     return audioMap[audioPath];
//     } else {
//     console.warn(`⚠️ Missing audio file: ${audioPath}`);
//     return audioMap['errors/general_error']; // fallback an toàn
//     }

//   }

//   /**
//    * Clear audio queue
//    */
//   public clearQueue(): void {
//     this.audioQueue = [];
//   }

//   /**
//    * Check if audio is currently playing
//    */
//   public isAudioPlaying(): boolean {
//     return this.isPlaying;
//   }

//   /**
//    * Get queue length
//    */
//   public getQueueLength(): number {
//     return this.audioQueue.length;
//   }

//   /**
//    * Replay last audio (triple tap feature)
//    */
//   private lastPlayedAudio: string | null = null;
  
//   public async replayLast(): Promise<void> {
//     if (this.lastPlayedAudio) {
//       await this.play(this.lastPlayedAudio, { priority: 'HIGH' });
//     }
//   }

//   /**
//    * Set playback rate (for user preference)
//    */
//   public async setPlaybackRate(rate: number): Promise<void> {
//     if (this.currentSound) {
//       try {
//         await this.currentSound.setRateAsync(rate, true);
//       } catch (error) {
//         console.error('Error setting playback rate:', error);
//       }
//     }
//   }
// }

// // Export singleton instance
// export const audioManager = AudioManager.getInstance();
