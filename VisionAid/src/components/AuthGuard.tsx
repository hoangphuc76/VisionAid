import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../api';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await authApi.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (requireAuth && !loggedIn) {
        router.replace('/(tabs)');
      } else if (!requireAuth && loggedIn) {
        router.replace('/(tabs)/main');
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
