import { useState, useEffect } from 'react';
import { authApi } from '../api';
import { SecureStorageService } from '../services/SecureStorageService';
import { TokenService } from '../services/TokenService';

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await authApi.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);

      // Save tokens to secure storage
      if (result.accessToken && result.refreshToken) {
        await SecureStorageService.saveTokens(
          result.accessToken,
          result.refreshToken
        );
        console.log('✅ Tokens saved to secure storage');
      }

      // Save user data
      if (result.user) {
        await SecureStorageService.saveUserData(result.user);
      }

      setIsLoggedIn(true);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    try {
      const result = await TokenService.authenticateWithBiometricAndRefresh();

      if (result.success && result.user) {
        setIsLoggedIn(true);
        setUser(result.user);
        return result;
      } else {
        throw new Error(result.error || 'Biometric authentication failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Get refresh token before clearing
      const refreshToken = await SecureStorageService.getRefreshToken();

      // Call API to revoke refresh token
      if (refreshToken) {
        await authApi.logout();
      }

      // Clear all secure storage
      await SecureStorageService.clearAll();

      setIsLoggedIn(false);
      setUser(null);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.log('Logout error:', error);
      // Vẫn clear state local và storage ngay cả khi API call failed
      await SecureStorageService.clearAll();
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const refreshAuthStatus = () => {
    checkAuthStatus();
  };

  return {
    isLoggedIn,
    user,
    isLoading,
    login,
    loginWithBiometric,
    logout,
    refreshAuthStatus
  };
};
