import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useAuth } from "../../src/hooks/useAuth";
import { voiceService } from "../../src/services/VoiceServiceAudio";
import { gestureService, GestureType } from "../../src/services/GestureService"; 

export default function MainScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLogoutConfirmation, setIsLogoutConfirmation] = useState(false);
  const hasPlayedInstructionsRef = useRef(false);

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
    try {
      await voiceService.initialize();
      
      // Play gesture instructions only once per app session
      if (!hasPlayedInstructionsRef.current) {
        setTimeout(async () => {
          try {
            console.log('🎓 Playing gesture instructions (first time)...');
            await voiceService.announceGestureInstructions();
            hasPlayedInstructionsRef.current = true;
          } catch (err) {
            console.log('⚠️ Gesture instructions playback failed');
          }
        }, 1000);
      } else {
        // Subsequent visits - play normal home screen
        setTimeout(async () => {
          try {
            await voiceService.announceHomeScreen();
          } catch (err) {
            console.log('⚠️ Audio playback skipped');
          }
        }, 1000);
      }
    } catch (err) {
      console.log('⚠️ Voice service initialization skipped');
    }
  };

  const setupGestureHandlers = () => {
    console.log('\n🔧 Setting up gesture handlers...');
    gestureService.addCallback(handleGesture);
    console.log('✅ Gesture callback registered!\n');
  };

  const handleGesture = async (gestureType: GestureType) => {
    console.log(`\n🎯🎯🎯 MAIN SCREEN - Gesture callback triggered! 🎯🎯🎯`);
    console.log(`   Type: ${gestureType}`);
    console.log(`================================================\n`);
    
    switch (gestureType) {
      case 'double-swipe-left':
        console.log('📸📸📸 Opening Camera from double swipe left...');
        console.log('   Step 1: Announcing gesture...');
        try {
          await voiceService.announceGestureDetected('camera');
        } catch {
          console.log('   ⚠️ Audio skipped');
        }
        console.log('   Step 2: Navigating to camera...');
        setTimeout(() => {
          console.log('   Step 3: Executing navigation!');
          router.push("/(tabs)/CameraScreen");
          console.log('   ✅ Navigation command sent!');
        }, 500);
        break;
        
      case 'double-swipe-right':
        console.log('🗺️ Opening GPS from double swipe right...');
        await voiceService.announceGestureDetected('gps');
        setTimeout(() => {
          router.push("/(tabs)/gps");
        }, 500);
        break;
        
      case 'double-swipe-up':
        console.log('⭐ Opening Premium from double swipe up...');
        await voiceService.announceGestureDetected('premium');
        setTimeout(() => {
          router.push("/(tabs)/premium");
        }, 500);
        break;
        
      case 'double-swipe-down':
        console.log('🏠 Returning to home...');
        if (isLogoutConfirmation) {
          setIsLogoutConfirmation(false);
          await voiceService.announceHomeScreen();
        } else {
          await voiceService.announceGestureDetected('home');
          await voiceService.announceHomeScreen();
        }
        break;
        
      case 'long-press':
        console.log('🔐 Long press detected - Logout flow...');
        if (isLogoutConfirmation) {
          // Confirm logout
          handleLogout();
        } else {
          // Start logout confirmation
          setIsLogoutConfirmation(true);
          await voiceService.announceGestureDetected('logout');
          await voiceService.announceLogoutConfirmation();
          
          // Auto-cancel logout confirmation after 5 seconds
          setTimeout(() => {
            if (isLogoutConfirmation) {
              setIsLogoutConfirmation(false);
              voiceService.speak('Đã hủy đăng xuất');
            }
          }, 5000);
        }
        break;
        
      default:
        console.log('❓ Unknown gesture');
        await voiceService.announceGestureNotRecognized();
        break;
    }
  };

  const handlePress = (label: string) => {
    // Keep button functionality for testing, but announce that gestures should be used
    voiceService.speak(`Đã chạm nút ${label}. Để trải nghiệm tốt nhất, vui lòng sử dụng cử chỉ vuốt.`);
    
    if (label === "Camera") {
      router.push("/CameraScreen"); 
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
      
      <PanGestureHandler 
        onHandlerStateChange={gestureService.handlePanGesture}
        minPointers={1}
        maxPointers={1}
        shouldCancelWhenOutside={false}
        enabled={true}
      >
        <Animated.View style={styles.container}>
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
              onPress={() => {
                voiceService.speak("Chạm giữ để đăng xuất hoặc sử dụng cử chỉ");
              }}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Chức năng chính</Text>
            
            {/* Gesture Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>🎯 Hướng dẫn cử chỉ:</Text>
              <Text style={styles.instructionItem}>👈👈 Vuốt trái 2 lần: Mở Camera AI</Text>
              <Text style={styles.instructionItem}>👉👉 Vuốt phải 2 lần: Mở định vị GPS</Text>
              <Text style={styles.instructionItem}>👆👆 Vuốt lên 2 lần: Mở Premium</Text>
              <Text style={styles.instructionItem}>👇👇 Vuốt xuống 2 lần: Về màn hình chính</Text>
              <Text style={styles.instructionItem}>⏱️ Giữ 2 giây: Đăng xuất</Text>
              <Text style={styles.instructionItem}>💡 Vuốt ở bất kỳ đâu trên màn hình!</Text>
              
              {/* Test Button for Instructions Audio */}
              <TouchableOpacity 
                style={styles.testAudioButton}
                onPress={async () => {
                  try {
                    console.log('🧪 Test: Playing gesture instructions...');
                    await voiceService.announceGestureInstructions();
                  } catch (error) {
                    console.log('⚠️ Failed to play instructions');
                  }
                }}
              >
                <Text style={styles.testAudioText}>🔊 Nghe hướng dẫn cử chỉ</Text>
              </TouchableOpacity>
              
              {isLogoutConfirmation && (
                <View style={styles.logoutConfirmContainer}>
                  <Text style={styles.logoutConfirmText}>
                    ⚠️ Đang chờ xác nhận đăng xuất
                  </Text>
                  <Text style={styles.logoutConfirmSubtext}>
                    Giữ lại 2 giây để xác nhận hoặc vuốt xuống để hủy
                  </Text>
                </View>
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
        </Animated.View>
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
  testAudioButton: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  testAudioText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  logoutConfirmContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  logoutConfirmText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  logoutConfirmSubtext: {
    fontSize: 12,
    color: "#991b1b",
    textAlign: "center",
  },
  featureContent: {
    flex: 1,
  },
});