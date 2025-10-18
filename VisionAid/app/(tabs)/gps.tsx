import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { PanGestureHandler } from "react-native-gesture-handler";
import * as Location from "expo-location";
import { voiceService } from "../../src/services/VoiceServiceAudio";
import { gestureService, GestureType } from "../../src/services/GestureService";

export default function GPSScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    initializeGPSScreen();
    setupGestureHandlers();
    
    return () => {
      gestureService.removeCallback(handleGesture);
    };
  }, []);

  const initializeGPSScreen = async () => {
    await voiceService.announceGPSMode();
    await getCurrentLocation();
  };

  const setupGestureHandlers = () => {
    gestureService.addCallback(handleGesture);
  };

  const handleGesture = async (gestureType: GestureType) => {
    switch (gestureType) {
      case 'double-swipe-down':
        await voiceService.announceGestureDetected('home');
        setTimeout(() => {
          router.back();
        }, 500);
        break;
        
      case 'double-swipe-left':
        await voiceService.announceGestureDetected('camera');
        setTimeout(() => {
          router.push("/CameraScreen");
        }, 500);
        break;
        
      case 'double-swipe-up':
        await voiceService.announceGestureDetected('premium');
        setTimeout(() => {
          router.push("/(tabs)/premium");
        }, 500);
        break;
        
      default:
        await voiceService.announceGestureNotRecognized();
        break;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocating(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        await voiceService.speak(
          "Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt để sử dụng tính năng này."
        );
        setIsLocating(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
      await voiceService.announceLocationFound();
      
      // Auto-share location after finding it
      setTimeout(() => {
        shareLocation(currentLocation);
      }, 1000);
      
    } catch (error) {
      console.error('Location error:', error);
      await voiceService.announceLocationError();
      setIsLocating(false);
    }
  };

  const shareLocation = async (locationData: Location.LocationObject) => {
    try {
      setIsSharing(true);
      
      const { latitude, longitude } = locationData.coords;
      
      // Simulate sharing with emergency contacts
      // In a real app, this would integrate with your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await voiceService.announceLocationShared();
      
      // Additional info about the location
      const locationInfo = `Vị trí hiện tại: Vĩ độ ${latitude.toFixed(6)}, Kinh độ ${longitude.toFixed(6)}. Độ chính xác ${Math.round(locationData.coords.accuracy || 0)} mét.`;
      
      setTimeout(async () => {
        await voiceService.speak(locationInfo);
      }, 2000);
      
    } catch (error) {
      console.error('Share location error:', error);
      await voiceService.speak("Không thể chia sẻ vị trí. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsSharing(false);
    }
  };

  const getLocationStatusText = () => {
    if (isLocating) {
      return "Đang xác định vị trí...";
    } else if (location && isSharing) {
      return "Đang chia sẻ vị trí...";
    } else if (location) {
      return "Vị trí đã được chia sẻ thành công";
    } else {
      return "Không thể xác định vị trí";
    }
  };

  const formatLocationInfo = () => {
    if (!location) return "";
    
    const { latitude, longitude, accuracy } = location.coords;
    return `Vĩ độ: ${latitude.toFixed(6)}\nKinh độ: ${longitude.toFixed(6)}\nĐộ chính xác: ${Math.round(accuracy || 0)}m`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <PanGestureHandler onGestureEvent={gestureService.handlePanGesture}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📍 Định vị GPS</Text>
            <Text style={styles.headerSubtitle}>Chia sẻ vị trí với người thân</Text>
          </View>

          {/* Status Content */}
          <View style={styles.content}>
            <View style={styles.statusContainer}>
              <View style={styles.statusIcon}>
                <Text style={styles.iconText}>
                  {isLocating ? "🔍" : location ? "✅" : "❌"}
                </Text>
              </View>
              
              <Text style={styles.statusText}>
                {getLocationStatusText()}
              </Text>
              
              {location && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>
                    {formatLocationInfo()}
                  </Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Cách sử dụng:</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần xuống: Về trang chính</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần trái: Mở Camera</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần lên: Mở Premium</Text>
            </View>
          </View>
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e6fffa",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  statusContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  locationInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
});
