/**
 * Tests for IGDB Service
 */

import { IGDBService } from '../src/services/igdb';
import { TwitchAuthService } from '../src/services/auth';
import { RateLimiter } from '../src/services/rateLimit';
import { ToolResponse } from '../src/types/igdb';

describe('IGDBService', () => {
  let igdbService: IGDBService;

  beforeEach(() => {
    const mockAuthService = {
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
      validateToken: jest.fn(),
      clearToken: jest.fn()
    } as any;

    const rateLimiter = new RateLimiter({
      maxRequests: 4,
      windowMs: 1000
    });

    igdbService = new IGDBService(
      'https://api.igdb.com/v4',
      mockAuthService,
      rateLimiter,
      'mock-client-id'
    );
  });

  describe('Response Formatting', () => {
    test('should format successful response', () => {
      const data = [
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' }
      ];

      const response = igdbService.formatResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Found 2 result(s)');
      expect(response.error).toBeUndefined();
    });

    test('should format successful response with custom message', () => {
      const data = [{ id: 1, name: 'Game 1' }];
      const customMessage = 'Found 1 game';

      const response = igdbService.formatResponse(data, customMessage);

      expect(response.success).toBe(true);
      expect(response.message).toBe(customMessage);
    });

    test('should format error response', () => {
      const error = new Error('Test error');

      const response = igdbService.formatError(error);

      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Test error');
    });
  });

  describe('Response Structure', () => {
    test('ToolResponse should have correct structure', () => {
      const data = [{ id: 1, name: 'Test' }];
      const response: ToolResponse = igdbService.formatResponse(data);

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('message');
      expect(typeof response.success).toBe('boolean');
      expect(Array.isArray(response.data) || response.data === null).toBe(true);
    });
  });
});
