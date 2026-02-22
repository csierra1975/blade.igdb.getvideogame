/**
 * Tests for Twitch Authentication Service
 */

import { TwitchAuthService } from '../src/services/auth';

describe('TwitchAuthService', () => {
  const mockClientId = 'test-client-id';
  const mockClientSecret = 'test-client-secret';

  describe('Constructor', () => {
    test('should throw error if TWITCH_CLIENT_ID is missing', () => {
      expect(
        () => new TwitchAuthService('', mockClientSecret)
      ).toThrow('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are required');
    });

    test('should throw error if TWITCH_CLIENT_SECRET is missing', () => {
      expect(
        () => new TwitchAuthService(mockClientId, '')
      ).toThrow('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are required');
    });

    test('should initialize with valid credentials', () => {
      const authService = new TwitchAuthService(mockClientId, mockClientSecret);
      expect(authService).toBeDefined();
    });
  });

  describe('Token Management', () => {
    test('should clear cached token', () => {
      const authService = new TwitchAuthService(mockClientId, mockClientSecret);
      // Token clearing is internal, just verify method exists and doesn't throw
      expect(() => authService.clearToken()).not.toThrow();
    });
  });

  // Note: Integration tests for token fetching would require mocking axios
  // and Twitch API responses
});
