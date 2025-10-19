/**
 * Secure Storage Service
 * Handles secure storage of tokens and sensitive data
 */

import * as SecureStore from 'expo-secure-store';

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

export class SecureStorageService {
  /**
   * Save access token
   */
  static async saveAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
      console.log("✅ Access token saved securely", token);
    } catch (error) {
      console.error("❌ Failed to save access token:", error);
      throw new Error("Failed to save access token");
    }
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      console.log("Retrieved access token:", token);
      return token;
    } catch (error) {
      console.error("❌ Failed to get access token:", error);
      return null;
    }
  }

  /**
   * Save refresh token
   */
  static async saveRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
      console.log("✅ Refresh token saved securely", token);
    } catch (error) {
      console.error("❌ Failed to save refresh token:", error);
      throw new Error("Failed to save refresh token");
    }
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
      console.log("Retrieved refresh token:", token);
      return token;
    } catch (error) {
      console.error("❌ Failed to get refresh token:", error);
      return null;
    }
  }

  /**
   * Save both tokens at once
   */
  static async saveTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      console.log("✅ Tokens saved securely");
    } catch (error) {
      console.error("❌ Failed to save tokens:", error);
      throw new Error("Failed to save tokens");
    }
  }

  /**
   * Save user data
   */
  static async saveUserData(userData: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(userData));
      console.log("✅ User data saved securely", userData);
    } catch (error) {
      console.error("❌ Failed to save user data:", error);
      throw new Error("Failed to save user data");
    }
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
      console.log("Retrieved user data:", userData);
    } catch (error) {
      console.error("❌ Failed to get user data:", error);
      return null;
    }
  }

  /**
   * Check if biometric is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
      return enabled === "true";
    } catch (error) {
      console.error("❌ Failed to check biometric status:", error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, "true");
      console.log("✅ Biometric authentication enabled");
    } catch (error) {
      console.error("❌ Failed to enable biometric:", error);
      throw new Error("Failed to enable biometric");
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, "false");
      console.log("✅ Biometric authentication disabled");
    } catch (error) {
      console.error("❌ Failed to disable biometric:", error);
      throw new Error("Failed to disable biometric");
    }
  }

  /**
   * Clear access token only
   */
  static async clearAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
      console.log("✅ Access token cleared");
    } catch (error) {
      console.error("❌ Failed to clear access token:", error);
    }
  }

  /**
   * Clear all tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN)]);
      console.log("✅ All tokens cleared");
    } catch (error) {
      console.error("❌ Failed to clear tokens:", error);
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.USER_DATA),
        SecureStore.deleteItemAsync(KEYS.BIOMETRIC_ENABLED),
      ]);
      console.log("✅ All secure data cleared");
    } catch (error) {
      console.error("❌ Failed to clear all data:", error);
      throw new Error("Failed to clear all data");
    }
  }

  /**
   * Check if user has valid tokens
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      console.log("Checked valid tokens:", !!refreshToken);
      return !!refreshToken;
    } catch (error) {
      console.error("❌ Failed to check tokens:", error);
      return false;
    }
  }
}

export default SecureStorageService;
