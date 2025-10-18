import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = {
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      const { accessToken, user } = response.data;
      
      // Lưu tokens vào AsyncStorage
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        // ['refresh_token', refreshToken],
        ['user_info', JSON.stringify(user)]
      ]);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async logout() {
    try {
      // Gọi API logout (nếu có)
      await axiosInstance.post('/logout');
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      // Xóa tất cả thông tin đăng nhập
      await AsyncStorage.multiRemove([
        'access_token', 
        'refresh_token', 
        'user_info'
      ]);
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
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      console.log('Check login status error:', error);
      return false;
    }
  }
};
