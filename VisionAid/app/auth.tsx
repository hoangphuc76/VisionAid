import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BiometricAuth } from '../src/components/BiometricAuth';
import { voiceService } from '../src/services/VoiceServiceAudio';
import { useAuth } from '../src/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();
  const { login, isLoggedIn, isLoading } = useAuth();
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    initializeAuthScreen();
  }, []);

  useEffect(() => {
    // If user is already logged in, navigate to main screen
    if (isLoggedIn && !isLoading) {
      router.replace('/(tabs)/main');
    }
  }, [isLoggedIn, isLoading]);

  const initializeAuthScreen = async () => {
    // Initialize voice service
    await voiceService.initialize();
    
    // Brief delay to ensure everything is loaded
    setTimeout(() => {
      setAuthAttempted(true);
    }, 500);
  };

  const handleAuthSuccess = async () => {
    try {
      // For now, we'll simulate a successful login
      // In a real app, you'd extract user info from biometric auth
      await login('user@example.com', 'biometric-auth');
      
      // Play login success sound
      await voiceService.announceAuthSuccess();
      
      // Wait a bit before playing gesture instructions
      setTimeout(async () => {
        await voiceService.announceGestureInstructions();
      }, 1500);
      
      // Navigate to main screen after a short delay
      setTimeout(() => {
        router.replace('/(tabs)/main');
      }, 2000);
    } catch (error) {
      console.error('Login error after biometric auth:', error);
      await voiceService.announceGenericError();
    }
  };

  const handleAuthFail = async () => {
    await voiceService.announceAuthFailed();
  };

  if (isLoading || !authAttempted) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      <BiometricAuth 
        onAuthSuccess={handleAuthSuccess}
        onAuthFail={handleAuthFail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
