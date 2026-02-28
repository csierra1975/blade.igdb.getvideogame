/**
 * Tests for IGDB Service
 */

import axios from 'axios';
import { IGDBService } from '../src/services/igdb';
import { TwitchAuthService } from '../src/services/auth';
import { RateLimiter } from '../src/services/rateLimit';
import { ToolResponse } from '../src/types/igdb';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IGDBService', () => {
  let igdbService: IGDBService;
  let mockPost: jest.Mock;

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

    mockPost = jest.fn();
    mockedAxios.create = jest.fn().mockReturnValue({
      post: mockPost
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

  describe('getGamesByIds', () => {
    test('should return empty array when ids is empty', async () => {
      const result = await igdbService.getGamesByIds([]);
      expect(result).toEqual([]);
      expect(mockPost).not.toHaveBeenCalled();
    });

    test('should query games with where id = (ids)', async () => {
      const mockGames = [
        { id: 119171, name: 'Elden Ring', rating: 95 },
        { id: 1942,   name: 'The Witcher 3', rating: 92 }
      ];
      mockPost.mockResolvedValueOnce({ data: mockGames });

      const result = await igdbService.getGamesByIds([119171, 1942]);

      expect(result).toEqual(mockGames);
      expect(mockPost).toHaveBeenCalledTimes(1);
      const [, body] = mockPost.mock.calls[0];
      expect(body).toContain('where id = (119171, 1942)');
    });

    test('should cap IDs to 50 and respect limit', async () => {
      const ids = Array.from({ length: 60 }, (_, i) => i + 1);
      mockPost.mockResolvedValueOnce({ data: [] });

      await igdbService.getGamesByIds(ids, undefined, 30);

      const [, body] = mockPost.mock.calls[0];
      // Should only use first 50 IDs
      expect(body).toContain('where id = (');
      expect(body).not.toContain('51,');
      expect(body).toContain('limit 30');
    });

    test('should use default fields when none provided', async () => {
      mockPost.mockResolvedValueOnce({ data: [{ id: 1, name: 'Game' }] });

      await igdbService.getGamesByIds([1]);

      const [, body] = mockPost.mock.calls[0];
      expect(body).toContain('name');
      expect(body).toContain('rating');
      expect(body).toContain('platforms');
      expect(body).toContain('genres');
    });

    test('should use custom fields when provided', async () => {
      mockPost.mockResolvedValueOnce({ data: [{ id: 1, name: 'Game' }] });

      await igdbService.getGamesByIds([1], ['id', 'name', 'slug']);

      const [, body] = mockPost.mock.calls[0];
      expect(body).toContain('fields id, name, slug');
    });
  });

  describe('searchGamesByNames', () => {
    test('should return empty array when names is empty', async () => {
      const result = await igdbService.searchGamesByNames([]);
      expect(result).toEqual([]);
      expect(mockPost).not.toHaveBeenCalled();
    });

    test('should search each name and batch-fetch details', async () => {
      const mockSearchIco = [{ id: 7170, name: 'Ico' }];
      const mockSearchSekiro = [{ id: 76882, name: 'Sekiro: Shadows Die Twice' }];
      const mockDetails = [
        { id: 7170, name: 'Ico', rating: 85 },
        { id: 76882, name: 'Sekiro: Shadows Die Twice', rating: 91 }
      ];

      mockPost
        .mockResolvedValueOnce({ data: mockSearchIco })
        .mockResolvedValueOnce({ data: mockSearchSekiro })
        .mockResolvedValueOnce({ data: mockDetails });

      const result = await igdbService.searchGamesByNames(['Ico', 'Sekiro']);

      expect(result).toEqual(mockDetails);
      // 2 search calls + 1 batch details call
      expect(mockPost).toHaveBeenCalledTimes(3);
      // Last call should be the batch by IDs
      const [, batchBody] = mockPost.mock.calls[2];
      expect(batchBody).toContain('where id = (7170, 76882)');
    });

    test('should skip names that return no search results', async () => {
      mockPost
        .mockResolvedValueOnce({ data: [{ id: 134, name: 'Devil May Cry' }] })
        .mockResolvedValueOnce({ data: [] }) // no results for second name
        .mockResolvedValueOnce({ data: [{ id: 134, name: 'Devil May Cry', rating: 81 }] });

      const result = await igdbService.searchGamesByNames(['Devil May Cry', 'NonExistentGame']);

      expect(result).toHaveLength(1);
      const [, batchBody] = mockPost.mock.calls[2];
      expect(batchBody).toContain('where id = (134)');
    });
  });

  describe('getFranchisesByIds', () => {
    test('should return empty array when ids is empty', async () => {
      const result = await igdbService.getFranchisesByIds([]);
      expect(result).toEqual([]);
      expect(mockPost).not.toHaveBeenCalled();
    });

    test('should query franchises with where id = (ids)', async () => {
      const mockFranchises = [
        { id: 532, name: 'The Legend of Zelda', slug: 'the-legend-of-zelda' },
        { id: 13,  name: 'Final Fantasy',       slug: 'final-fantasy' }
      ];
      mockPost.mockResolvedValueOnce({ data: mockFranchises });

      const result = await igdbService.getFranchisesByIds([532, 13]);

      expect(result).toEqual(mockFranchises);
      expect(mockPost).toHaveBeenCalledTimes(1);
      const [, body] = mockPost.mock.calls[0];
      expect(body).toContain('where id = (532, 13)');
    });

    test('should hit the franchises endpoint', async () => {
      mockPost.mockResolvedValueOnce({ data: [] });

      await igdbService.getFranchisesByIds([1]);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe('/franchises');
    });

    test('should use default fields including games', async () => {
      mockPost.mockResolvedValueOnce({ data: [{ id: 1, name: 'Franchise' }] });

      await igdbService.getFranchisesByIds([1]);

      const [, body] = mockPost.mock.calls[0];
      expect(body).toContain('games');
      expect(body).toContain('slug');
    });
  });
});
