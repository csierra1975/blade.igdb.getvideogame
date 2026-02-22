/**
 * Twitch OAuth2 Authentication Service
 * Handles token acquisition and refresh for IGDB API access
 */

import axios, { AxiosInstance } from 'axios';

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ValidationResponse {
  client_id: string;
  login: string;
  user_id: string;
  scopes: string[];
  expires_in: number;
}

export class TwitchAuthService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private axios: AxiosInstance;

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are required');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.axios = axios.create();
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If token exists and hasn't expired, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      console.log('[TwitchAuth] Using cached access token');
      return this.accessToken;
    }

    console.log('[TwitchAuth] Acquiring new access token from Twitch');
    return this.fetchNewToken();
  }

  /**
   * Fetch a new token from Twitch
   */
  private async fetchNewToken(): Promise<string> {
    try {
      const response = await this.axios.post<TokenResponse>(TWITCH_AUTH_URL, null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }
      });

      const { access_token, expires_in } = response.data;

      // Store token and set expiry with 60 second buffer
      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + (expires_in - 60) * 1000;

      console.log(
        `[TwitchAuth] Token acquired successfully, expires in ${expires_in} seconds`
      );

      return access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to acquire Twitch token: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Validate the current token
   */
  async validateToken(): Promise<ValidationResponse> {
    const token = await this.getAccessToken();

    try {
      const response = await this.axios.get<ValidationResponse>(TWITCH_VALIDATE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(
        `[TwitchAuth] Token validated for user: ${response.data.login}`
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Token validation failed: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Clear cached token to force refresh on next request
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    console.log('[TwitchAuth] Token cache cleared');
  }
}
