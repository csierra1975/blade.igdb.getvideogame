/**
 * MCP Server Core - IGDB API Integration
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { IGDBService } from '../services/igdb';

// Typed argument interfaces for each tool
interface SearchGamesArgs { query: string; }
interface GameDetailsArgs { gameId: number; }
interface GamesByCompanyArgs { companyId: number; limit?: number; }
interface GamesUpcomingArgs { limit?: number; date_from?: number; date_to?: number; }
interface LimitOnlyArgs { limit?: number; }
interface IdListArgs { ids: number[]; limit?: number; }

function safeLimit(val: unknown, defaultVal: number, max = 50): number {
  if (val === undefined || val === null) return defaultVal;
  const n = Number(val);
  if (!Number.isInteger(n) || n < 1) return defaultVal;
  return Math.min(n, max);
}

export function createMCPServer(igdbService: IGDBService): Server {
  const server = new Server(
    { name: 'igdb-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Define all tools
  const tools = [
    {
      name: 'search-games',
      description: 'Search for video games by name',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Game name to search for',
          },
        },
        required: ['query'],
      },
    },

    {
      name: 'game-details',
      description: 'Get detailed information about a specific game',
      inputSchema: {
        type: 'object',
        properties: {
          gameId: {
            type: 'number',
            description: 'The IGDB game ID',
          },
        },
        required: ['gameId'],
      },
    },
    {
      name: 'games-by-company',
      description: 'Get games developed or published by a specific company',
      inputSchema: {
        type: 'object',
        properties: {
          companyId: {
            type: 'number',
            description: 'The IGDB company ID',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of games to return',
          },
        },
        required: ['companyId'],
      },
    },
    {
      name: 'games-upcoming',
      description: 'Get upcoming games',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of games to return',
          },
          date_from: {
            type: 'number',
            description: 'Unix timestamp (seconds) for start of release date filter (optional)'
          },
          date_to: {
            type: 'number',
            description: 'Unix timestamp (seconds) for end of release date filter (optional)'
          },
        },
        required: [],
      },
    },
    {
      name: 'games-coming-soon',
      description: 'Get games coming soon',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of games to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'platforms',
      description: 'Get all gaming platforms',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of platforms to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'genres',
      description: 'Get all game genres',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of genres to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'franchises',
      description: 'Get all game franchises',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of franchises to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'companies',
      description: 'Get all gaming companies',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of companies to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'game-modes',
      description: 'Get all game modes',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of game modes to return',
          },
        },
        required: [],
      },
    },
    {
      name: 'covers-by-ids',
      description: 'Get cover images by cover IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of cover IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of covers to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'platforms-by-ids',
      description: 'Get platform details by platform IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of platform IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of platforms to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'genres-by-ids',
      description: 'Get genre details by genre IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of genre IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of genres to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'involved-companies-by-ids',
      description: 'Get involved companies by involved company IDs (resolves company details automatically)',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of involved_company IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of involved companies to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'companies-by-ids',
      description: 'Get company details by company IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of company IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of companies to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'screenshots-by-ids',
      description: 'Get screenshots by screenshot IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of screenshot IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of screenshots to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'release-dates-by-ids',
      description: 'Get release date details by release date IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of release_date IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of release dates to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'artworks-by-ids',
      description: 'Get artworks by artwork IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of artwork IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of artworks to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'keywords-by-ids',
      description: 'Get keywords by keyword IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of keyword IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of keywords to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'themes-by-ids',
      description: 'Get themes by theme IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of theme IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of themes to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'external-games-by-ids',
      description: 'Get external games by external game IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of external_game IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of external games to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'videos-by-ids',
      description: 'Get game videos by video IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of video IDs (max 50)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of videos to return (default 50, max 50)',
          },
        },
        required: ['ids'],
      },
    },
  ];

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case 'search-games': {
          const { query } = args as unknown as SearchGamesArgs;
          console.error('[search-games] Searching for:', query);
          result = await igdbService.searchGames(query);
          break;
        }
        case 'game-details': {
          const { gameId } = args as unknown as GameDetailsArgs;
          console.error('[game-details] Fetching details for game ID:', gameId);
          result = await igdbService.getGameDetails(gameId);
          break;
        }
        case 'games-by-company': {
          const { companyId, limit: rawLimit } = args as unknown as GamesByCompanyArgs;
          console.error('[games-by-company] Fetching games for company ID:', companyId);
          result = await igdbService.getGamesByCompany(companyId, undefined, safeLimit(rawLimit, 10));
          break;
        }
        case 'games-upcoming': {
          console.error('[games-upcoming] Fetching upcoming games');
          const { limit: rawLimit, date_from, date_to } = args as unknown as GamesUpcomingArgs;

          const normalizeTs = (v: number | undefined): number | undefined => {
            if (v === undefined || v === null) return undefined;
            const n = Number(v);
            if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
            // If value looks like milliseconds (>= 1e12), convert to seconds
            if (n > 1e12) return Math.floor(n / 1000);
            return Math.floor(n);
          };

          result = await igdbService.getGamesByReleaseDate(
            normalizeTs(date_from),
            normalizeTs(date_to),
            undefined,
            safeLimit(rawLimit, 10)
          );
          break;
        }
        case 'games-coming-soon': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[games-coming-soon] Fetching games coming soon');
          result = await igdbService.getComingSoonGames(undefined, safeLimit(rawLimit, 10));
          break;
        }
        case 'platforms': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[platforms] Fetching platforms');
          result = await igdbService.getPlatforms(undefined, safeLimit(rawLimit, 50, 500));
          break;
        }
        case 'genres': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[genres] Fetching genres');
          result = await igdbService.getGenres(undefined, safeLimit(rawLimit, 50, 500));
          break;
        }
        case 'franchises': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[franchises] Fetching franchises');
          result = await igdbService.getFranchises(undefined, safeLimit(rawLimit, 50, 500));
          break;
        }
        case 'companies': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[companies] Fetching companies');
          result = await igdbService.getCompanies(undefined, safeLimit(rawLimit, 50, 500));
          break;
        }
        case 'game-modes': {
          const { limit: rawLimit } = args as unknown as LimitOnlyArgs;
          console.error('[game-modes] Fetching game modes');
          result = await igdbService.getGameModes(undefined, safeLimit(rawLimit, 50, 500));
          break;
        }
        case 'covers-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[covers-by-ids] Fetching covers');
          result = await igdbService.getCoversByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'platforms-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[platforms-by-ids] Fetching platforms');
          result = await igdbService.getPlatformsByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'genres-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[genres-by-ids] Fetching genres');
          result = await igdbService.getGenresByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'involved-companies-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[involved-companies-by-ids] Fetching involved companies');
          result = await igdbService.getInvolvedCompaniesByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'companies-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[companies-by-ids] Fetching companies');
          result = await igdbService.getCompaniesByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'screenshots-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[screenshots-by-ids] Fetching screenshots');
          result = await igdbService.getScreenshotsByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'release-dates-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[release-dates-by-ids] Fetching release dates');
          result = await igdbService.getReleaseDatesByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'artworks-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[artworks-by-ids] Fetching artworks');
          result = await igdbService.getArtworksByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'keywords-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[keywords-by-ids] Fetching keywords');
          result = await igdbService.getKeywordsByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'themes-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[themes-by-ids] Fetching themes');
          result = await igdbService.getThemesByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'external-games-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[external-games-by-ids] Fetching external games');
          result = await igdbService.getExternalGamesByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        case 'videos-by-ids': {
          const { ids = [], limit: rawLimit } = args as unknown as IdListArgs;
          console.error('[videos-by-ids] Fetching game videos');
          result = await igdbService.getVideosByIds(ids, undefined, safeLimit(rawLimit, 50));
          break;
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      console.error(`[MCP] Error in tool ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: String(error) }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
