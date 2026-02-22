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
  ToolResponse,
  Cover,
  Screenshot,
  ReleaseDate,
  InvolvedCompany,
  Artwork,
  Keyword,
  Theme,
  ExternalGame,
  GameVideo
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
   * Get covers by IDs
   */
  async getCoversByIds(
    ids: number[],
    fields: string[] = ['id', 'image_id', 'url', 'width', 'height', 'alpha_channel'],
    limit: number = 50
  ): Promise<Cover[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Cover>('covers', body);
  }

  /**
   * Get platforms by IDs
   */
  async getPlatformsByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'slug', 'abbreviation', 'category'],
    limit: number = 50
  ): Promise<Platform[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Platform>('platforms', body);
  }

  /**
   * Get genres by IDs
   */
  async getGenresByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'slug', 'url'],
    limit: number = 50
  ): Promise<Genre[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Genre>('genres', body);
  }

  /**
   * Get involved_companies by IDs and resolve company details
   */
  async getInvolvedCompaniesByIds(
    ids: number[],
    fields: string[] = ['id', 'company', 'game', 'developer', 'publisher', 'porting', 'supporting'],
    limit: number = 50
  ): Promise<InvolvedCompany[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    const results = await this.makeRequest<any>('involved_companies', body);
    
    // Extract unique company IDs
    const companyIds = new Set<number>();
    results.forEach(ic => {
      if (typeof ic.company === 'number') {
        companyIds.add(ic.company);
      }
    });

    // If company IDs are numbers, resolve them to full Company objects
    if (companyIds.size > 0) {
      const companies = await this.getCompaniesByIds(Array.from(companyIds));
      const companyMap = new Map(companies.map(c => [c.id, c]));

      // Enrich results with resolved company objects
      return results.map(ic => ({
        ...ic,
        company: companyMap.get(ic.company) || { id: ic.company, name: 'Unknown' }
      }));
    }

    return results;
  }

  /**
   * Get companies by IDs
   */
  async getCompaniesByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'slug', 'description', 'country', 'logo'],
    limit: number = 50
  ): Promise<Company[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Company>('companies', body);
  }

  /**
   * Get screenshots by IDs
   */
  async getScreenshotsByIds(
    ids: number[],
    fields: string[] = ['id', 'image_id', 'url', 'width', 'height'],
    limit: number = 50
  ): Promise<Screenshot[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Screenshot>('screenshots', body);
  }

  /**
   * Get release dates by IDs
   */
  async getReleaseDatesByIds(
    ids: number[],
    fields: string[] = ['id', 'date', 'human', 'platform', 'region'],
    limit: number = 50
  ): Promise<ReleaseDate[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<ReleaseDate>('release_dates', body);
  }

  /**
   * Get artworks by IDs
   */
  async getArtworksByIds(
    ids: number[],
    fields: string[] = ['id', 'image_id', 'url', 'width', 'height', 'alpha_channel', 'game'],
    limit: number = 50
  ): Promise<Artwork[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Artwork>('artworks', body);
  }

  /**
   * Get keywords by IDs
   */
  async getKeywordsByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'slug', 'url'],
    limit: number = 50
  ): Promise<Keyword[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Keyword>('keywords', body);
  }

  /**
   * Get themes by IDs
   */
  async getThemesByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'slug', 'url'],
    limit: number = 50
  ): Promise<Theme[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<Theme>('themes', body);
  }

  /**
   * Get external games by IDs
   */
  async getExternalGamesByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'url', 'category', 'external_id', 'game', 'platform'],
    limit: number = 50
  ): Promise<ExternalGame[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<ExternalGame>('external_games', body);
  }

  /**
   * Get game videos by IDs
   */
  async getVideosByIds(
    ids: number[],
    fields: string[] = ['id', 'name', 'video_id', 'game'],
    limit: number = 50
  ): Promise<GameVideo[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const safeLimit = Math.min(limit, 50);
    const idList = ids.slice(0, 50).join(', ');
    const fieldList = fields.join(', ');
    const body = `
      fields ${fieldList};
      where id = (${idList});
      limit ${safeLimit};
    `;

    return this.makeRequest<GameVideo>('game_videos', body);
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
