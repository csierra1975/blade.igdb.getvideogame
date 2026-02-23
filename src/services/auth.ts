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
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshPromise: Promise<string> | null = null;
  private axios: AxiosInstance;
  // fetchNewToken uses a closure to avoid storing clientSecret on `this`
  private readonly fetchNewToken: () => Promise<string>;

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are required');
    }

    this.clientId = clientId;
    this.axios = axios.create();

    // Capture secret in a closure — never assigned to `this`
    const secret = clientSecret;
    this.fetchNewToken = async (): Promise<string> => {
      try {
        const response = await this.axios.post<TokenResponse>(TWITCH_AUTH_URL, null, {
          params: {
            client_id: this.clientId,
            client_secret: secret,
            grant_type: 'client_credentials'
          }
        });

        const { access_token, expires_in } = response.data;

        // Store token and set expiry with 60 second buffer
        this.accessToken = access_token;
        this.tokenExpiry = Date.now() + (expires_in - 60) * 1000;

        console.error(
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
    };
  }

  /**
   * Get a valid access token, refreshing if necessary.
   * Deduplicates concurrent refresh requests to avoid token endpoint hammering.
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      console.error('[TwitchAuth] Using cached access token');
      return this.accessToken;
    }

    if (!this.refreshPromise) {
      console.error('[TwitchAuth] Acquiring new access token from Twitch');
      this.refreshPromise = this.fetchNewToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
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

      console.error(
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
    console.error('[TwitchAuth] Token cache cleared');
  }
}
