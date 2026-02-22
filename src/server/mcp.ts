// @ts-nocheck
/**
 * MCP Server Core - IGDB API Integration
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { IGDBService } from '../services/igdb';

export function createMCPServer(igdbService: IGDBService): McpServer {
  // @ts-ignore
  const server = new McpServer({
    name: 'igdb-mcp-server',
    version: '1.0.0',
  });

  // Tool: search-games
  server.tool('search-games', {
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
    // @ts-ignore
    handler: async (args: { query: string }) => {
      try {
        console.error('[search-games] Searching for:', args.query);
        const result = await igdbService.searchGames(args.query);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[search-games] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: game-details
  server.tool('game-details', {
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
    // @ts-ignore
    handler: async (args: { gameId: number }) => {
      try {
        console.error('[game-details] Fetching details for game ID:', args.gameId);
        const result = await igdbService.getGameDetails(args.gameId);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[game-details] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: games-by-company
  server.tool('games-by-company', {
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
    // @ts-ignore
    handler: async (args: { companyId: number; limit?: number }) => {
      try {
        console.error('[games-by-company] Fetching games for company ID:', args.companyId);
        const result = await igdbService.getGamesByCompany(args.companyId, args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[games-by-company] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: games-upcoming
  server.tool('games-upcoming', {
    description: 'Get upcoming games',
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[games-upcoming] Fetching upcoming games');
        const result = await igdbService.getUpcomingGames(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[games-upcoming] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: games-coming-soon
  server.tool('games-coming-soon', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[games-coming-soon] Fetching games coming soon');
        const result = await igdbService.getComingSoonGames(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[games-coming-soon] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: platforms
  server.tool('platforms', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[platforms] Fetching platforms');
        const result = await igdbService.getPlatforms(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[platforms] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: genres
  server.tool('genres', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[genres] Fetching genres');
        const result = await igdbService.getGenres(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[genres] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: franchises
  server.tool('franchises', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[franchises] Fetching franchises');
        const result = await igdbService.getFranchises(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[franchises] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: companies
  server.tool('companies', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[companies] Fetching companies');
        const result = await igdbService.getCompanies(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[companies] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  // Tool: game-modes
  server.tool('game-modes', {
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
    // @ts-ignore
    handler: async (args: { limit?: number }) => {
      try {
        console.error('[game-modes] Fetching game modes');
        const result = await igdbService.getGameModes(args.limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        console.error('[game-modes] Error:', error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
        };
      }
    },
  });

  return server;
}
