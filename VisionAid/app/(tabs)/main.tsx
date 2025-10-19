import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useAuth } from "../../src/hooks/useAuth";
import { voiceService } from "../../src/services/VoiceServiceAudio";
import { gestureService, GestureType } from "../../src/services/GestureService"; 

export default function MainScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLogoutConfirmation, setIsLogoutConfirmation] = useState(false);

  useEffect(() => {
    initializeScreen();
    setupGestureHandlers();
    
    return () => {
      // Cleanup gesture handlers
      gestureService.removeCallback(handleGesture);
    };
  }, []);


  const initializeScreen = async () => {
    // Initialize voice service
    await voiceService.initialize();
    
    // Announce home screen after a short delay
    setTimeout(async () => {
      await voiceService.announceHomeScreen();
    }, 1000);
  };

  const setupGestureHandlers = () => {
    gestureService.addCallback(handleGesture);
  };

  const handleGesture = async (gestureType: GestureType) => {
    switch (gestureType) {
      case 'double-swipe-left':
        await voiceService.announceGestureDetected('camera');
        setTimeout(() => {
          router.push("/CameraScreen");
        }, 500);
        break;
        
      case 'double-swipe-right':
        await voiceService.announceGestureDetected('gps');
        setTimeout(() => {
          router.push("/(tabs)/gps");
        }, 500);
        break;
        
      case 'double-swipe-up':
        await voiceService.announceGestureDetected('premium');
        setTimeout(() => {
          router.push("/(tabs)/premium");
        }, 500);
        break;
        
      case 'double-swipe-down':
        if (isLogoutConfirmation) {
          setIsLogoutConfirmation(false);
          await voiceService.announceHomeScreen();
        } else {
          await voiceService.announceGestureDetected('home');
          await voiceService.announceHomeScreen();
        }
        break;
        
      case 'long-press':
        if (isLogoutConfirmation) {
          // Confirm logout
          handleLogout();
        } else {
          // Start logout confirmation
          setIsLogoutConfirmation(true);
          await voiceService.announceGestureDetected('logout');
          await voiceService.announceLogoutConfirmation();
        }
        break;
        
      default:
        await voiceService.announceGestureNotRecognized();
        break;
    }
  };

  const handlePress = (label: string) => {
    // Keep button functionality for testing, but announce that gestures should be used
    voiceService.speak(`Đã chạm nút ${label}. Để trải nghiệm tốt nhất, vui lòng sử dụng cử chỉ vuốt.`);
    
    if (label === "Camera") {
      router.push("/CameraScreen"); 
    } else if (label === "GPS") {
      const userId = user?.uid ?? "userA";
      const otherUserId = "userB";
      router.push({
        pathname: "/(tabs)/map",
        params: { userId, otherUserId },
      } as any);
    } else {
      Alert.alert(`Bạn đã bấm nút: ${label}`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(tabs)");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <PanGestureHandler onGestureEvent={gestureService.handlePanGesture}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeTitle}>Xin chào!</Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || "Người dùng"}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Chức năng chính</Text>
            
            {/* Gesture Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Cách sử dụng:</Text>
              <Text style={styles.instructionItem}>👆 Vuốt 2 lần trái: Mở Camera AI</Text>
              <Text style={styles.instructionItem}>👉 Vuốt 2 lần phải: Mở định vị GPS</Text>
              <Text style={styles.instructionItem}>👆 Vuốt 2 lần lên: Mở Premium</Text>
              <Text style={styles.instructionItem}>⏰ Chạm giữ 3 giây: Đăng xuất</Text>
              {isLogoutConfirmation && (
                <Text style={styles.logoutConfirmText}>
                  Đang chờ xác nhận đăng xuất. Chạm giữ để xác nhận hoặc vuốt xuống để hủy.
                </Text>
              )}
            </View>
            
            <View style={styles.buttonsContainer}>
              {/* Camera Button */}
              <TouchableOpacity
                style={[styles.featureButton, styles.cameraButton]}
                onPress={() => handlePress("Camera")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Camera AI - Vuốt hai lần trái để mở"
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>📷</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureButtonText}>Camera AI</Text>
                  <Text style={styles.featureDescription}>Vuốt 2 lần trái để mở</Text>
                </View>
              </TouchableOpacity>

              {/* GPS Button */}
              <TouchableOpacity
                style={[styles.featureButton, styles.gpsButton]}
                onPress={() => handlePress("GPS")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Định vị GPS - Vuốt hai lần phải để mở"
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>📍</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureButtonText}>Định vị GPS</Text>
                  <Text style={styles.featureDescription}>Vuốt 2 lần phải để mở</Text>
                </View>
              </TouchableOpacity>

              {/* Premium Button */}
              <TouchableOpacity
                style={[styles.featureButton, styles.membershipButton]}
                onPress={() => handlePress("Premium")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Thành viên Premium - Vuốt hai lần lên để mở"
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>⭐</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureButtonText}>Premium</Text>
                  <Text style={styles.featureDescription}>Vuốt 2 lần lên để mở</Text>
                </View>
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 16,
  },
  featureButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  featureButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#6b7280",
    position: "absolute",
    left: 92,
    bottom: 20,
  },
  cameraButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  gpsButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  membershipButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 20,
  },
  logoutConfirmText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  featureContent: {
    flex: 1,
  },
});