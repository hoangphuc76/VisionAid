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

  // Gesture detection thresholds
  private readonly SWIPE_THRESHOLD = 20; // Minimum distance for a swipe
  private readonly VELOCITY_THRESHOLD = 80; // Minimum velocity for a swipe
  private readonly DOUBLE_SWIPE_TIME_WINDOW = 800; // Time window for double swipe (ms)
  private readonly LONG_PRESS_DURATION = 3000; // Long press duration (ms)

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
    // Add haptic feedback
    this.triggerHapticFeedback("gesture");

    // Notify all registered callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(gestureType);
      } catch (error) {
        console.error("Error in gesture callback:", error);
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
    console.log(
      `[Detect] Raw gesture -> X:${translationX}, Y:${translationY}, vX:${velocityX}, vY:${velocityY}`
    );

    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    if (absX < this.SWIPE_THRESHOLD && absY < this.SWIPE_THRESHOLD) {
      console.log("[Detect] Swipe too short");
      return null;
    }

    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);

    if (
      absVelX < this.VELOCITY_THRESHOLD &&
      absVelY < this.VELOCITY_THRESHOLD
    ) {
      console.log("[Detect] Swipe too slow");
      return null;
    }

    if (absX > absY) {
      console.log(
        "[Detect] Horizontal swipe:",
        translationX > 0 ? "right" : "left"
      );
      return translationX > 0 ? "right" : "left";
    } else {
      console.log("[Detect] Vertical swipe:", translationY > 0 ? "down" : "up");
      return translationY > 0 ? "down" : "up";
    }
  }

  private handleSwipe(direction: string): void {
    const currentTime = Date.now();
    console.log(
      `[Swipe] Direction=${direction}, Last=${this.lastSwipeDirection}, Count=${this.gestureCount}`
    );

    if (
      this.lastSwipeDirection === direction &&
      currentTime - this.lastSwipeTime < this.DOUBLE_SWIPE_TIME_WINDOW
    ) {
      this.gestureCount++;
      console.log(
        `[Swipe] Possible double swipe: Count = ${this.gestureCount}`
      );

      if (this.gestureCount >= 2) {
        console.log(`[Swipe] ✅ Double swipe detected: ${direction}`);
        this.gestureCount = 0;
        this.lastSwipeDirection = null;

        switch (direction) {
          case "left":
            this.notifyCallbacks("double-swipe-left");
            break;
          case "right":
            this.notifyCallbacks("double-swipe-right");
            break;
          case "up":
            this.notifyCallbacks("double-swipe-up");
            break;
          case "down":
            this.notifyCallbacks("double-swipe-down");
            break;
        }
      }
    } else {
      console.log(`[Swipe] First swipe detected in direction: ${direction}`);
      this.gestureCount = 1;
      this.lastSwipeDirection = direction;
    }

    this.lastSwipeTime = currentTime;
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
    const { translationX, translationY, velocityX, velocityY, state } =
      event.nativeEvent;

    console.log(
      "[Gesture] State:",
      state,
      "X:",
      translationX,
      "Y:",
      translationY,
      "vX:",
      velocityX,
      "vY:",
      velocityY
    );

    switch (state) {
      case State.BEGAN:
        console.log("[Gesture] Touch began - starting long press timer");
        this.startLongPressTimer();
        break;

      case State.ACTIVE:
        // Detect move cancellation for long press
        if (
          this.isLongPressing &&
          (Math.abs(translationX) > 20 || Math.abs(translationY) > 20)
        ) {
          console.log("[Gesture] Movement detected, canceling long press");
          this.clearLongPressTimer();
        }
        break;

      case State.END:
        console.log("[Gesture] Touch ended - checking swipe or long press");
        this.clearLongPressTimer();

        const direction = this.detectSwipeDirection(
          translationX,
          translationY,
          velocityX,
          velocityY
        );
        console.log("[Gesture] Detected direction:", direction);

        if (direction) {
          console.log("[Gesture] Handling swipe:", direction);
          this.handleSwipe(direction);
        } else {
          console.log("[Gesture] No valid swipe detected");
        }
        break;

      case State.CANCELLED:
      case State.FAILED:
        console.log("[Gesture] Cancel or failed state");
        this.clearLongPressTimer();
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
