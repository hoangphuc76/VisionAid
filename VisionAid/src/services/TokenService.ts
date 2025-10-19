/**
 * Token Service
 * Handles token refresh and management
 */

import { SecureStorageService } from './SecureStorageService';
import { axiosInstance } from '../api';
import { AxiosError } from 'axios';

// API Configuration

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TokenRefreshError {
  success: false;
  error: string;
  shouldRelogin: boolean;
}

export class TokenService {


  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse | TokenRefreshError> {
    try {
      console.log('🔄 Refreshing access token...', refreshToken);

      const response = await axiosInstance.post<RefreshTokenResponse>(
        '/auth/refresh-token',
        { refreshToken }
      );

      if (response.data && response.data.success) {
        console.log('✅ Access token refreshed successfully');

        // Store new tokens
        await this.storeTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        return response.data;
      } else {
        console.log('❌ Token refresh failed: Invalid response');
        return {
          success: false,
          error: 'Invalid response from server',
          shouldRelogin: true,
        };
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return this.handleRefreshError(error as AxiosError);
    }
  }

  /**
   * Handle refresh token errors
   */
  private static handleRefreshError(error: AxiosError): TokenRefreshError {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const errorData: any = error.response.data;

      if (status === 401) {
        // Refresh token expired or invalid
        return {
          success: false,
          error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          shouldRelogin: true,
        };
      } else if (status === 404) {
        return {
          success: false,
          error: 'Refresh token không hợp lệ',
          shouldRelogin: true,
        };
      } else {
        return {
          success: false,
          error: errorData?.error || 'Không thể làm mới token',
          shouldRelogin: false,
        };
      }
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.',
        shouldRelogin: false,
      };
    } else {
      // Unknown error
      return {
        success: false,
        error: 'Đã xảy ra lỗi không xác định',
        shouldRelogin: false,
      };
    }
  }

  /**
   * Store tokens securely
   */
  static async storeTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await SecureStorageService.saveTokens(accessToken, refreshToken);
      console.log('✅ Tokens stored successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Không thể lưu token');
    }
  }

  /**
   * Get stored refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStorageService.getRefreshToken();
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStorageService.getAccessToken();
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await SecureStorageService.clearTokens();
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  /**
   * Check if tokens exist
   */
  static async hasTokens(): Promise<boolean> {
    try {
      return await SecureStorageService.hasValidTokens();
    } catch (error) {
      console.error('❌ Failed to check tokens:', error);
      return false;
    }
  }

  /**
   * Biometric authentication with token refresh
   * This is the main method to use in the login flow
   */
  static async authenticateWithBiometricAndRefresh(): Promise<{
    success: boolean;
    accessToken?: string;
    user?: any;
    error?: string;
    shouldRelogin?: boolean;
  }> {
    try {
      // Get refresh token from secure storage
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        console.log('❌ No refresh token found');
        return {
          success: false,
          error: 'Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.',
          shouldRelogin: true,
        };
      }

      // Refresh access token
      const result = await this.refreshAccessToken(refreshToken);

      if ('success' in result && result.success) {
        console.log('✅ Biometric authentication with token refresh successful');
        return {
          success: true,
          accessToken: result.accessToken,
          user: result.user,
        };
      } else {
        console.log('❌ Token refresh failed');
        const errorResult = result as TokenRefreshError;
        return {
          success: false,
          error: errorResult.error,
          shouldRelogin: errorResult.shouldRelogin,
        };
      }
    } catch (error) {
      console.error('❌ Biometric authentication with token refresh error:', error);
      return {
        success: false,
        error: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        shouldRelogin: false,
      };
    }
  }
}

export default TokenService;
