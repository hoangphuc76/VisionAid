import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const authApi = {
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Lưu tokens vào SecureStore (bảo mật hơn AsyncStorage)
      if (accessToken) {
        await SecureStore.setItemAsync('access_token', accessToken);
      }
      if (refreshToken) {
        await SecureStore.setItemAsync('refresh_token', refreshToken);
      }
      
      // Lưu user info vào AsyncStorage (không nhạy cảm)
      if (user) {
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
      }
      
      console.log('✅ Login successful, tokens saved');
      return { ...response.data, accessToken, refreshToken, user };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },
  
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Lưu tokens cho user mới đăng ký
      if (accessToken) {
        await SecureStore.setItemAsync('access_token', accessToken);
      }
      if (refreshToken) {
        await SecureStore.setItemAsync('refresh_token', refreshToken);
      }
      if (user) {
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async logout() {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await AsyncStorage.removeItem('user_info');
      console.log('✅ Logout successful, tokens cleared');
    } catch (err) {
      console.error('❌ Error clearing tokens:', err);
    }
  },

  async getCurrentUser() {
    try {
      const userInfo = await AsyncStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.log('Get current user error:', error);
      return null;
    }
  },

  async isLoggedIn() {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      return !!token;
    } catch (error) {
      console.log('Check login status error:', error);
      return false;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await axiosInstance.post('/auth/refresh-token', {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Lưu tokens mới
      if (accessToken) {
        await SecureStore.setItemAsync('access_token', accessToken);
      }
      if (newRefreshToken) {
        await SecureStore.setItemAsync('refresh_token', newRefreshToken);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Refresh token failed:', error);
      throw error;
    }
  }
};
