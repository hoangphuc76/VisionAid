import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { voiceService } from '../services/VoiceServiceAudio';
import { gestureService, GestureType } from '../services/GestureService';
import { PanGestureHandler } from 'react-native-gesture-handler';

interface BiometricAuthProps {
  onAuthSuccess: () => void;
  onAuthFail?: () => void;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ 
  onAuthSuccess, 
  onAuthFail 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    initializeBiometricAuth();
    setupGestureHandlers();
    
    return () => {
      // Cleanup gesture handlers
      gestureService.removeCallback(handleGesture);
    };
  }, []);

  const initializeBiometricAuth = async () => {
    try {
      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        await voiceService.speak(
          "Thiết bị không hỗ trợ xác thực sinh trắc học. Vui lòng sử dụng phương thức đăng nhập khác."
        );
        setIsSupported(false);
        return;
      }

      // Check if biometric records are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        await voiceService.speak(
          "Chưa thiết lập xác thực sinh trắc học. Vui lòng thiết lập trong cài đặt thiết bị."
        );
        setIsSupported(false);
        return;
      }

      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let authTypeText = '';
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        authTypeText = 'Face ID';
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        authTypeText = 'vân tay';
        setBiometricType('Fingerprint');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        authTypeText = 'mống mắt';
        setBiometricType('Iris');
      }

      setIsSupported(true);
      
      // Announce welcome and authentication method
      await voiceService.announceWelcome();
      
      // Auto-start authentication after announcement
      setTimeout(() => {
        startAuthentication();
      }, 2000);
      
    } catch (error) {
      console.error('Biometric initialization error:', error);
      await voiceService.announceGenericError();
      setIsSupported(false);
    }
  };

  const setupGestureHandlers = () => {
    gestureService.addCallback(handleGesture);
  };

  const handleGesture = async (gestureType: GestureType) => {
    switch (gestureType) {
      case 'double-swipe-down':
        // Retry authentication
        await voiceService.speak("Thử lại xác thực");
        startAuthentication();
        break;
      case 'long-press':
        // Alternative authentication or exit
        await voiceService.speak("Thoát ứng dụng");
        // Handle exit logic here
        break;
    }
  };

  const startAuthentication = async () => {
    if (!isSupported || isAuthenticating) return;

    setIsAuthenticating(true);
    
    try {
      await voiceService.speak(`Vui lòng đặt ${biometricType === 'Face ID' ? 'mặt' : 'ngón tay'} để xác thực`);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để tiếp tục - Sử dụng sinh trắc học để truy cập VisionAid',
        fallbackLabel: 'Sử dụng mật khẩu',
        cancelLabel: 'Hủy',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await voiceService.announceAuthSuccess();
        setTimeout(() => {
          onAuthSuccess();
        }, 1000);
      } else {
        await voiceService.announceAuthFailed();
        
        if (result.error === 'user_cancel') {
          await voiceService.speak("Đã hủy xác thực. Vuốt hai lần xuống để thử lại.");
        } else if (result.error === 'user_fallback') {
          // Handle fallback authentication
          await voiceService.speak("Chuyển sang xác thực thay thế");
          handleFallbackAuth();
        } else {
          await voiceService.speak("Xác thực thất bại. Vuốt hai lần xuống để thử lại.");
        }
        
        if (onAuthFail) {
          onAuthFail();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      await voiceService.announceGenericError();
      if (onAuthFail) {
        onAuthFail();
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFallbackAuth = () => {
    // This could navigate to a traditional login form
    // For now, just show an alert
    Alert.alert(
      "Xác thực thay thế",
      "Tính năng đăng nhập bằng mật khẩu sẽ được thêm vào phiên bản tiếp theo.",
      [
        {
          text: "Thử lại sinh trắc học",
          onPress: () => startAuthentication()
        }
      ]
    );
  };

  const renderFallbackContent = () => {
    if (!isSupported) {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.errorText}>
            Thiết bị không hỗ trợ xác thực sinh trắc học
          </Text>
          <TouchableOpacity 
            style={styles.fallbackButton}
            onPress={handleFallbackAuth}
            accessible={true}
            accessibilityLabel="Đăng nhập bằng mật khẩu"
          >
            <Text style={styles.fallbackButtonText}>
              Đăng nhập khác
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureService.handlePanGesture}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>👁️‍🗨️</Text>
            <Text style={styles.appName}>VisionAid</Text>
            <Text style={styles.subtitle}>Hỗ trợ người khiếm thị</Text>
          </View>

          <View style={styles.authContainer}>
            {isSupported ? (
              <>
                <Text style={styles.authTitle}>Xác thực để tiếp tục</Text>
                <Text style={styles.authSubtitle}>
                  Sử dụng {biometricType === 'Face ID' ? 'Face ID' : 'vân tay'} để đăng nhập
                </Text>
                
                <TouchableOpacity
                  style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
                  onPress={startAuthentication}
                  disabled={isAuthenticating}
                  accessible={true}
                  accessibilityLabel={`Xác thực bằng ${biometricType}`}
                >
                  <Text style={styles.authIcon}>
                    {biometricType === 'Face ID' ? '🔓' : '👆'}
                  </Text>
                  <Text style={styles.authButtonText}>
                    {isAuthenticating ? 'Đang xác thực...' : 'Chạm để xác thực'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.instructionText}>
                  Vuốt hai lần xuống để thử lại{'\n'}
                  Chạm giữ để thoát
                </Text>
              </>
            ) : (
              renderFallbackContent()
            )}
          </View>
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  authContainer: {
    alignItems: 'center',
    width: '100%',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 32,
    minWidth: 200,
  },
  authButtonDisabled: {
    backgroundColor: '#1e40af',
    opacity: 0.7,
  },
  authIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  fallbackContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  fallbackButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fallbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
