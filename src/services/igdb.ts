/**
 * IGDB API Service
 * Handles all interactions with the IGDB API
 */

import axios, { AxiosInstance } from 'axios';
import { TwitchAuthService } from './auth.js';
import { RateLimiter } from './rateLimit.js';
import {
  Game,
  Platform,
  Genre,
  Franchise,
  Company,
  GameMode,
  GameStatus,
  ToolResponse
} from '../types/igdb.js';

export class IGDBService {
  private apiUrl: string;
  private authService: TwitchAuthService;
  private rateLimiter: RateLimiter;
  private axios: AxiosInstance;

  constructor(
    apiUrl: string,
    authService: TwitchAuthService,
    rateLimiter: RateLimiter
  ) {
    this.apiUrl = apiUrl;
    this.authService = authService;
    this.rateLimiter = rateLimiter;

    this.axios = axios.create({
      baseURL: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Generic method to make IGDB API requests
   */
  private async makeRequest<T>(
    endpoint: string,
    body: string
  ): Promise<T[]> {
    await this.rateLimiter.waitForSlot();

    const token = await this.authService.getAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error('TWITCH_CLIENT_ID is not set');
    }

    try {
      console.error(
        `[IGDBService] Making request to ${endpoint} with query: ${body.substring(0, 100)}...`
      );

      const response = await this.axios.post<T[]>(
        `/${endpoint}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Client-ID': clientId
          }
        }
      );

      console.error(
        `[IGDBService] Request to ${endpoint} successful, received ${response.data.length} results`
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        console.error(`[IGDBService] Error on ${endpoint}: ${message}`);
        throw new Error(`IGDB API Error: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Search games by name
   */
  async searchGames(
    searchTerm: string,
    fields: string[] = ['name', 'alternative_names', 'slug']
  ): Promise<Game[]> {
    const fieldList = fields.join(', ');
    const body = `
      search "${searchTerm}";
      fields ${fieldList};
      limit 10;
    `;

    return this.makeRequest<Game>('games', body);
  }

  /**
   * Get detailed information about a game by ID
   */
  async getGameDetails(
    gameId: number,
    fields: string[] = [
      'name',
      'slug',
      'summary',
      'storyline',
      'rating',
      'aggregated_rating',
      'first_release_date',
      'release_dates',
      'platforms',
      'genres',
      'game_modes',
      'themes',
      'keywords',
      'involved_companies',
      'cover',
      'artworks',
      'screenshots',
      'videos',
      'external_games'
    ]
  ): Promise<Game[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = ${gameId};
    `;

    return this.makeRequest<Game>('games', body);
  }

  /**
   * Get games by company involvement
   */
  async getGamesByCompany(
    companyId: number,
    fields: string[] = ['name', 'involved_companies.company.name', 'involved_companies.developer']
  ): Promise<Game[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where involved_companies.company = ${companyId};
      limit 10;
    `;

    return this.makeRequest<Game>('games', body);
  }

  /**
   * Get upcoming games by release date
   */
  async getGamesByReleaseDate(
    dateFrom?: number,
    dateTo?: number,
    fields: string[] = ['name', 'first_release_date', 'platforms', 'status'],
    limit: number = 10
  ): Promise<Game[]> {
    const now = Math.floor(Date.now() / 1000);
    const from = typeof dateFrom === 'number' ? dateFrom : now;
    const to = typeof dateTo === 'number' ? dateTo : (from + (90 * 24 * 60 * 60)); // default 90 days
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where first_release_date >= ${from} & first_release_date <= ${to};
      sort first_release_date asc;
      limit ${limit};
    `;

    return this.makeRequest<Game>('games', body);
  }

  /**
   * Get games with Coming Soon status
   */
  async getComingSoonGames(
    fields: string[] = ['name', 'first_release_date', 'platforms', 'status']
  ): Promise<Game[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where status = ${GameStatus.COMING_SOON};
      sort first_release_date asc;
      limit 10;
    `;

    return this.makeRequest<Game>('games', body);
  }

  /**
   * Get platform information
   */
  async getPlatforms(
    fields: string[] = ['name', 'slug', 'abbreviation', 'category']
  ): Promise<Platform[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      limit 50;
    `;

    return this.makeRequest<Platform>('platforms', body);
  }

  /**
   * Get genres
   */
  async getGenres(
    fields: string[] = ['name', 'slug']
  ): Promise<Genre[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      limit 50;
    `;

    return this.makeRequest<Genre>('genres', body);
  }

  /**
   * Get franchises
   */
  async getFranchises(
    fields: string[] = ['name', 'slug', 'url']
  ): Promise<Franchise[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      limit 50;
    `;

    return this.makeRequest<Franchise>('franchises', body);
  }

  /**
   * Get companies (developers and publishers)
   */
  async getCompanies(
    fields: string[] = ['name', 'slug', 'description', 'country']
  ): Promise<Company[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      limit 50;
    `;

    return this.makeRequest<Company>('companies', body);
  }

  /**
   * Get game modes
   */
  async getGameModes(
    fields: string[] = ['name', 'slug']
  ): Promise<GameMode[]> {
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      limit 50;
    `;

    return this.makeRequest<GameMode>('game_modes', body);
  }

  /**
   * Helper to format results as ToolResponse
   */
  formatResponse(data: any[], message?: string): ToolResponse {
    return {
      success: true,
      data,
      message: message || `Found ${data.length} result(s)`
    };
  }

  /**
   * Helper to format error responses
   */
  formatError(error: Error): ToolResponse {
    console.error(`[IGDBService] Error: ${error.message}`);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}
