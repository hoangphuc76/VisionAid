import { PanGestureHandler, State } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export type GestureType =
  | "double-swipe-left"
  | "double-swipe-right"
  | "double-swipe-up"
  | "double-swipe-down"
  | "long-press";
export type GestureCallback = (gestureType: GestureType) => void;

export interface GestureEvent {
  nativeEvent: {
    translationX: number;
    translationY: number;
    velocityX: number;
    velocityY: number;
    state: State;
  };
}

export class GestureDetectionService {
  private static instance: GestureDetectionService;
  private callbacks: Set<GestureCallback> = new Set();

  // Gesture detection thresholds - Optimized for better detection
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for a swipe (increased for better detection)
  private readonly VELOCITY_THRESHOLD = 100; // Minimum velocity for a swipe
  private readonly DOUBLE_SWIPE_TIME_WINDOW = 600; // Time window for double swipe (ms) - faster response
  private readonly LONG_PRESS_DURATION = 2000; // Long press duration (ms) - reduced to 2s for better UX

  // State tracking
  private lastSwipeTime: number = 0;
  private lastSwipeDirection: string | null = null;
  private gestureCount: number = 0;
  private longPressTimer: any = null;
  private isLongPressing: boolean = false;

  private constructor() {}

  public static getInstance(): GestureDetectionService {
    if (!GestureDetectionService.instance) {
      GestureDetectionService.instance = new GestureDetectionService();
    }
    return GestureDetectionService.instance;
  }

  public addCallback(callback: GestureCallback): void {
    this.callbacks.add(callback);
  }

  public removeCallback(callback: GestureCallback): void {
    this.callbacks.delete(callback);
  }

  private notifyCallbacks(gestureType: GestureType): void {
    console.log(`\n🎉🎉🎉 GESTURE SUCCESS! 🎉🎉🎉`);
    console.log(`✅ Detected: ${gestureType}`);
    console.log(`✅ Callbacks registered: ${this.callbacks.size}`);
    console.log(`================================\n`);

    // Add haptic feedback
    this.triggerHapticFeedback("gesture");

    // Notify all registered callbacks
    this.callbacks.forEach((callback) => {
      try {
        console.log(`📞 Calling callback for: ${gestureType}`);
        callback(gestureType);
      } catch (error) {
        console.error("❌ Error in gesture callback:", error);
      }
    });
  }

  private async triggerHapticFeedback(
    type: "gesture" | "confirm" | "error"
  ): Promise<void> {
    try {
      switch (type) {
        case "gesture":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "confirm":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;
        case "error":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
      }
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  }

  private detectSwipeDirection(
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ): string | null {
    console.log(`\n📏 [Detect] Raw gesture data:`);
    console.log(`   X: ${translationX.toFixed(2)}, Y: ${translationY.toFixed(2)}`);
    console.log(`   vX: ${velocityX.toFixed(2)}, vY: ${velocityY.toFixed(2)}`);

    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    console.log(`   absX: ${absX.toFixed(2)} (threshold: ${this.SWIPE_THRESHOLD})`);
    console.log(`   absY: ${absY.toFixed(2)} (threshold: ${this.SWIPE_THRESHOLD})`);

    if (absX < this.SWIPE_THRESHOLD && absY < this.SWIPE_THRESHOLD) {
      console.log(`❌ [Detect] Swipe too short! Need at least ${this.SWIPE_THRESHOLD}px`);
      return null;
    }

    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);

    console.log(`   absVelX: ${absVelX.toFixed(2)} (threshold: ${this.VELOCITY_THRESHOLD})`);
    console.log(`   absVelY: ${absVelY.toFixed(2)} (threshold: ${this.VELOCITY_THRESHOLD})`);

    if (
      absVelX < this.VELOCITY_THRESHOLD &&
      absVelY < this.VELOCITY_THRESHOLD
    ) {
      console.log(`❌ [Detect] Swipe too slow! Need at least ${this.VELOCITY_THRESHOLD} velocity`);
      return null;
    }

    if (absX > absY) {
      const direction = translationX > 0 ? "right" : "left";
      console.log(`✅ [Detect] Horizontal swipe detected: ${direction.toUpperCase()}`);
      return direction;
    } else {
      const direction = translationY > 0 ? "down" : "up";
      console.log(`✅ [Detect] Vertical swipe detected: ${direction.toUpperCase()}`);
      return direction;
    }
  }

  private handleSwipe(direction: string): void {
    const currentTime = Date.now();
    const timeSinceLastSwipe = currentTime - this.lastSwipeTime;
    
    console.log(`\n👆 [Swipe] Handling swipe...`);
    console.log(`   Direction: ${direction}`);
    console.log(`   Last direction: ${this.lastSwipeDirection}`);
    console.log(`   Current count: ${this.gestureCount}`);
    console.log(`   Time since last: ${timeSinceLastSwipe}ms (max: ${this.DOUBLE_SWIPE_TIME_WINDOW}ms)`);

    if (
      this.lastSwipeDirection === direction &&
      timeSinceLastSwipe < this.DOUBLE_SWIPE_TIME_WINDOW
    ) {
      this.gestureCount++;
      console.log(`\n🔥 [Swipe] SAME DIRECTION within time window!`);
      console.log(`   Count increased to: ${this.gestureCount}`);

      if (this.gestureCount >= 2) {
        console.log(`\n🎯 [Swipe] ✅✅✅ DOUBLE SWIPE CONFIRMED: ${direction.toUpperCase()} ✅✅✅`);
        this.gestureCount = 0;
        this.lastSwipeDirection = null;

        switch (direction) {
          case "left":
            console.log(`👈👈 Triggering DOUBLE-SWIPE-LEFT`);
            this.notifyCallbacks("double-swipe-left");
            break;
          case "right":
            console.log(`👉👉 Triggering DOUBLE-SWIPE-RIGHT`);
            this.notifyCallbacks("double-swipe-right");
            break;
          case "up":
            console.log(`👆👆 Triggering DOUBLE-SWIPE-UP`);
            this.notifyCallbacks("double-swipe-up");
            break;
          case "down":
            console.log(`👇👇 Triggering DOUBLE-SWIPE-DOWN`);
            this.notifyCallbacks("double-swipe-down");
            break;
        }
      } else {
        console.log(`⏳ [Swipe] Waiting for one more swipe... (count: ${this.gestureCount})`);
      }
    } else {
      if (timeSinceLastSwipe >= this.DOUBLE_SWIPE_TIME_WINDOW) {
        console.log(`⏱️ [Swipe] Time window expired! Starting fresh.`);
      } else if (this.lastSwipeDirection !== direction) {
        console.log(`🔄 [Swipe] Different direction! Starting fresh.`);
      }
      console.log(`1️⃣ [Swipe] First swipe in direction: ${direction}`);
      this.gestureCount = 1;
      this.lastSwipeDirection = direction;
    }

    this.lastSwipeTime = currentTime;
    console.log(`⏰ Last swipe time updated\n`);
  }

  private startLongPressTimer(): void {
    this.clearLongPressTimer();
    this.isLongPressing = true;

    this.longPressTimer = setTimeout(() => {
      if (this.isLongPressing) {
        this.notifyCallbacks("long-press");
        this.isLongPressing = false;
      }
    }, this.LONG_PRESS_DURATION);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isLongPressing = false;
  }

  public handlePanGesture = (event: GestureEvent): void => {
    console.log('🎯 [DEBUG] handlePanGesture called!', event.nativeEvent.state);
    
    const { translationX, translationY, velocityX, velocityY, state } =
      event.nativeEvent;

    const stateNames: { [key: number]: string } = {
      [State.UNDETERMINED]: "UNDETERMINED",
      [State.FAILED]: "FAILED", 
      [State.BEGAN]: "BEGAN",
      [State.CANCELLED]: "CANCELLED",
      [State.ACTIVE]: "ACTIVE",
      [State.END]: "END",
    };

    console.log(
      `\n👋 [Gesture] Event received - State: ${stateNames[state] || state} (${state})`,
      `\n   Position: X=${translationX.toFixed(2)}, Y=${translationY.toFixed(2)}`,
      `\n   Velocity: vX=${velocityX.toFixed(2)}, vY=${velocityY.toFixed(2)}`
    );

    switch (state) {
      case State.BEGAN:
        console.log("🟢 [Gesture] Touch BEGAN - starting long press timer");
        this.startLongPressTimer();
        break;

      case State.ACTIVE:
        console.log("🔵 [Gesture] Touch ACTIVE - finger moving");
        // Detect move cancellation for long press
        if (
          this.isLongPressing &&
          (Math.abs(translationX) > 20 || Math.abs(translationY) > 20)
        ) {
          console.log("❌ [Gesture] Movement detected, canceling long press");
          this.clearLongPressTimer();
        }
        break;

      case State.END:
        console.log("🔴 [Gesture] Touch END - analyzing gesture...");
        console.log(`   Final position: X=${translationX.toFixed(2)}, Y=${translationY.toFixed(2)}`);
        console.log(`   Final velocity: vX=${velocityX.toFixed(2)}, vY=${velocityY.toFixed(2)}`);
        this.clearLongPressTimer();

        const direction = this.detectSwipeDirection(
          translationX,
          translationY,
          velocityX,
          velocityY
        );
        console.log(`🔍 [Gesture] Analysis complete. Direction: ${direction || 'NONE'}`);

        if (direction) {
          console.log(`✅ [Gesture] Valid swipe! Handling: ${direction}`);
          this.handleSwipe(direction);
        } else {
          console.log("❌ [Gesture] No valid swipe detected (too short or too slow)");
        }
        break;

      case State.CANCELLED:
        console.log("🟡 [Gesture] Touch CANCELLED");
        this.clearLongPressTimer();
        break;
        
      case State.FAILED:
        console.log("⚫ [Gesture] Touch FAILED");
        this.clearLongPressTimer();
        break;

      default:
        console.log(`❓ [Gesture] Unknown state: ${state}`);
        break;
    }
  };

  public reset(): void {
    this.lastSwipeTime = 0;
    this.lastSwipeDirection = null;
    this.gestureCount = 0;
    this.clearLongPressTimer();
  }
}

// Export singleton instance
export const gestureService = GestureDetectionService.getInstance();
