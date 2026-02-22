/**
 * MCP Server Core
 * Initializes and manages all MCP tools and resources
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { IGDBService } from '../services/igdb';

export function createMCPServer(igdbService: IGDBService): McpServer {
  const server = new McpServer({
    name: 'igdb-mcp-server',
    version: '1.0.0'
  });

  console.error('[MCPServer] Initializing MCP Server with IGDB integration');

  // Register search-games tool
  server.registerTool('search-games', {
    description: 'Search games by name',
    inputSchema: {
      searchTerm: z.string().describe('Game name to search for'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, alternative_names, slug)')
    }
  }, async (args) => {
    const { searchTerm, fields } = args;
    console.log('[MCPServer] Calling search-games with term:', searchTerm);
    try {
      const games = await igdbService.searchGames(searchTerm, fields);
      const result = igdbService.formatResponse(
        games,
        `Found ${games.length} game(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in search-games:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register games-by-company tool
  server.registerTool('games-by-company', {
    description: 'Get games developed or published by a specific company',
    inputSchema: {
      companyId: z.number().describe('IGDB Company ID'),
      fields: z
        .array(z.string())
        .optional()
        .describe(
          'Fields to return (default: name, involved_companies.company.name, involved_companies.developer)'
        )
    }
  }, async (args) => {
    const { companyId, fields } = args;
    console.log('[MCPServer] Calling games-by-company with ID:', companyId);
    try {
      const games = await igdbService.getGamesByCompany(companyId, fields);
      const result = igdbService.formatResponse(
        games,
        `Found ${games.length} game(s) by company`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in games-by-company:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register games-upcoming tool
  server.registerTool('games-upcoming', {
    description: 'Get games with releases between now and a future date',
    inputSchema: {
      futureDate: z.number().describe('Unix timestamp for the future date'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, first_release_date, platforms, status)')
    }
  }, async (args) => {
    const { futureDate, fields } = args;
    console.log('[MCPServer] Calling games-upcoming with date:', futureDate);
    try {
      const games = await igdbService.getGamesByReleaseDate(futureDate, fields);
      const result = igdbService.formatResponse(
        games,
        `Found ${games.length} upcoming game(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in games-upcoming:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register games-coming-soon tool
  server.registerTool('games-coming-soon', {
    description: 'Get games with Coming Soon status',
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, first_release_date, platforms, status)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling games-coming-soon');
    try {
      const games = await igdbService.getComingSoonGames(fields);
      const result = igdbService.formatResponse(
        games,
        `Found ${games.length} coming soon game(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in games-coming-soon:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register platforms tool
  server.registerTool('platforms', {
    description: 'Get list of gaming platforms (PlayStation, Xbox, PC, etc.)',
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, slug, abbreviation, category)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling platforms');
    try {
      const platforms = await igdbService.getPlatforms(fields);
      const result = igdbService.formatResponse(
        platforms,
        `Found ${platforms.length} platform(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in platforms:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register genres tool
  server.registerTool('genres', {
    description: 'Get list of game genres for categorization',
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, slug)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling genres');
    try {
      const genres = await igdbService.getGenres(fields);
      const result = igdbService.formatResponse(
        genres,
        `Found ${genres.length} genre(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in genres:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register franchises tool
  server.registerTool('franchises', {
    description:
      "Get information about game franchises (e.g., Assassin's Creed, The Legend of Zelda)",
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, slug, url)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling franchises');
    try {
      const franchises = await igdbService.getFranchises(fields);
      const result = igdbService.formatResponse(
        franchises,
        `Found ${franchises.length} franchise(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in franchises:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register companies tool
  server.registerTool('companies', {
    description: 'Get information about game companies (developers and publishers)',
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, slug, description, country)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling companies');
    try {
      const companies = await igdbService.getCompanies(fields);
      const result = igdbService.formatResponse(
        companies,
        `Found ${companies.length} company/companies`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in companies:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Register game-modes tool
  server.registerTool('game-modes', {
    description: 'Get list of game modes (singleplayer, multiplayer, co-op, etc.)',
    inputSchema: {
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: name, slug)')
    }
  }, async (args) => {
    const { fields } = args;
    console.log('[MCPServer] Calling game-modes');
    try {
      const gameModes = await igdbService.getGameModes(fields);
      const result = igdbService.formatResponse(
        gameModes,
        `Found ${gameModes.length} game mode(s)`
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('[MCPServer] Error in game-modes:', error);
      const errorResult = igdbService.formatError(
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(errorResult, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  console.error('[MCPServer] MCP Server initialized successfully');

  return server;
}

export { McpServer };
