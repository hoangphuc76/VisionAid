import { useState, useEffect } from 'react';
import { authApi } from '../api';

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
      setIsLoggedIn(true);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
      // Vẫn clear state local ngay cả khi API call failed
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
    logout,
    refreshAuthStatus
  };
};
