import axiosInstance from './axiosInstance';

export const apiClient = {
  // Analyze image API
  async analyzeImage(imageData) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.name || 'image.jpg'
      });

      const response = await axiosInstance.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
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
