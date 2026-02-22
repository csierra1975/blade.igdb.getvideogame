/**
 * MCP Server Core - IGDB API Integration
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { IGDBService } from '../services/igdb';

export function createMCPServer(igdbService: IGDBService): Server {
  const server = new Server({
    name: 'igdb-mcp-server',
    version: '1.0.0',
  });

  // Register server capabilities so the SDK allows registering
  // handlers for tools/list and tools/call during initialization.
  // Use the public API `registerCapabilities` to ensure internal
  // _capabilities are set correctly before handler registration.
  try {
    // @ts-ignore
    server.registerCapabilities({ tools: { list: true, call: true } });
  } catch (e) {
    // If registration isn't supported by the installed SDK version,
    // fall back to setting the internal value (best-effort).
    (server as any)._capabilities = (server as any)._capabilities || {};
    (server as any)._capabilities.tools = { list: true, call: true };
  }

  // Define all tools
  const tools: any[] = [
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
          console.error('[search-games] Searching for:', (args as any).query);
          result = await igdbService.searchGames((args as any).query);
          break;
        }
        case 'game-details': {
          console.error('[game-details] Fetching details for game ID:', (args as any).gameId);
          result = await igdbService.getGameDetails((args as any).gameId);
          break;
        }
        case 'games-by-company': {
          console.error('[games-by-company] Fetching games for company ID:', (args as any).companyId);
          result = await igdbService.getGamesByCompany((args as any).companyId, (args as any).limit);
          break;
        }
        case 'games-upcoming': {
          console.error('[games-upcoming] Fetching upcoming games');
          const argsAny = args as any;

          const normalizeTs = (v: any): number | undefined => {
            if (v === undefined || v === null) return undefined;
            const n = typeof v === 'number' ? v : Number(v);
            if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
            // If value looks like milliseconds (>= 1e12), convert to seconds
            if (n > 1e12) return Math.floor(n / 1000);
            return Math.floor(n);
          };

          const dateFrom = normalizeTs(argsAny.date_from);
          const dateTo = normalizeTs(argsAny.date_to);
          const limit = typeof argsAny.limit === 'number' ? argsAny.limit : undefined;

          result = await igdbService.getGamesByReleaseDate(dateFrom, dateTo, undefined, limit);
          break;
        }
        case 'games-coming-soon': {
          console.error('[games-coming-soon] Fetching games coming soon');
          result = await igdbService.getComingSoonGames((args as any).limit);
          break;
        }
        case 'platforms': {
          console.error('[platforms] Fetching platforms');
          result = await igdbService.getPlatforms((args as any).limit);
          break;
        }
        case 'genres': {
          console.error('[genres] Fetching genres');
          result = await igdbService.getGenres((args as any).limit);
          break;
        }
        case 'franchises': {
          console.error('[franchises] Fetching franchises');
          result = await igdbService.getFranchises((args as any).limit);
          break;
        }
        case 'companies': {
          console.error('[companies] Fetching companies');
          result = await igdbService.getCompanies((args as any).limit);
          break;
        }
        case 'game-modes': {
          console.error('[game-modes] Fetching game modes');
          result = await igdbService.getGameModes((args as any).limit);
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
