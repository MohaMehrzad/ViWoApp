import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'viwoapp_access_token';
const REFRESH_TOKEN_KEY = 'viwoapp_refresh_token';
const SAVED_EMAIL_KEY = 'viwoapp_saved_email';
const REMEMBER_ME_KEY = 'viwoapp_remember_me';

export const TokenStorage = {
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save access token:', error);
      throw error;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw error;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      // Don't throw, just log - we want to clear as much as possible
    }
  },

  async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  },

  // Remember Me functionality
  async setSavedEmail(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email);
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
    } catch (error) {
      console.error('Failed to save email:', error);
    }
  },

  async getSavedEmail(): Promise<string | null> {
    try {
      const rememberMe = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
      if (rememberMe === 'true') {
        return await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
      }
      return null;
    } catch (error) {
      console.error('Failed to get saved email:', error);
      return null;
    }
  },

  async clearSavedEmail(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SAVED_EMAIL_KEY);
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    } catch (error) {
      console.error('Failed to clear saved email:', error);
    }
  },

  async isRememberMeEnabled(): Promise<boolean> {
    try {
      const rememberMe = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
      return rememberMe === 'true';
    } catch (error) {
      console.error('Failed to check remember me status:', error);
      return false;
    }
  },
};

