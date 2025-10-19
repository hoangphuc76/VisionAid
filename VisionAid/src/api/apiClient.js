import axiosInstance from './axiosInstance';
import axios from 'axios';

let pythonUrl = 'http://192.168.0.104:8000'

export const apiClient = {
  // Analyze image API
  async analyzeImage(imageData) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.name || 'image.jpg'
      });

      const response = await axios.post(`${pythonUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response from Python server:', response.data);

      // Transform response để match với format component expect
      return {
        success: response.data.success,
        message: response.data.message,
        textResult: response.data.text_result,
        audioUrl: `${pythonUrl}${response.data.audio_url}`, // Tạo full URL
        audioFilename: response.data.audio_filename,
        voiceUsed: response.data.voice_used,
        error: response.data.error
      };
    } catch (error) {
      throw error;
    }
  },


  // User profile APIs
  async getUserProfile() {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateUserProfile(profileData) {
    try {
      const response = await axiosInstance.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generic API methods
  async get(endpoint, params = {}) {
    try {
      const response = await axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post(endpoint, data = {}) {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put(endpoint, data = {}) {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
