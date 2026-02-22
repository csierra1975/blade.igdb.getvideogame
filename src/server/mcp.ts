/**
 * MCP Server Core
 * Initializes and manages all MCP tools and resources
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { IGDBService } from '../services/igdb';
import { TwitchAuthService } from '../services/auth';
import { RateLimiter } from '../services/rateLimit';

export function createMCPServer(igdbService: IGDBService): Server {
  const server = new Server({
    name: 'igdb-mcp-server',
    version: '1.0.0'
  });

  console.log('[MCPServer] Initializing MCP Server with IGDB integration');

  /**
   * List available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log('[MCPServer] Listing available tools');

    const tools: Tool[] = [
      {
        name: 'search-games',
        description: 'Search games by name',
        inputSchema: {
          type: 'object' as const,
          properties: {
            searchTerm: {
              type: 'string',
              description: 'Game name to search for'
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, alternative_names, slug)',
              default: ['name', 'alternative_names', 'slug']
            }
          },
          required: ['searchTerm']
        }
      },
      {
        name: 'games-by-company',
        description:
          'Get games developed or published by a specific company',
        inputSchema: {
          type: 'object' as const,
          properties: {
            companyId: {
              type: 'number',
              description: 'IGDB Company ID'
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, involved_companies.company.name, involved_companies.developer)',
              default: [
                'name',
                'involved_companies.company.name',
                'involved_companies.developer'
              ]
            }
          },
          required: ['companyId']
        }
      },
      {
        name: 'games-upcoming',
        description:
          'Get games with releases between now and a future date',
        inputSchema: {
          type: 'object' as const,
          properties: {
            futureDate: {
              type: 'number',
              description: 'Unix timestamp for the future date (e.g., 1735689600 for Jan 1, 2025)'
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, first_release_date, platforms, status)',
              default: ['name', 'first_release_date', 'platforms', 'status']
            }
          },
          required: ['futureDate']
        }
      },
      {
        name: 'games-coming-soon',
        description: 'Get games with Coming Soon status',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, first_release_date, platforms, status)',
              default: ['name', 'first_release_date', 'platforms', 'status']
            }
          },
          required: []
        }
      },
      {
        name: 'platforms',
        description: 'Get list of gaming platforms (PlayStation, Xbox, PC, etc.)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, slug, abbreviation, category)',
              default: ['name', 'slug', 'abbreviation', 'category']
            }
          },
          required: []
        }
      },
      {
        name: 'genres',
        description: 'Get list of game genres for categorization',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to return (default: name, slug)',
              default: ['name', 'slug']
            }
          },
          required: []
        }
      },
      {
        name: 'franchises',
        description:
          'Get information about game franchises (e.g., Assassin\'s Creed, The Legend of Zelda)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to return (default: name, slug, url)',
              default: ['name', 'slug', 'url']
            }
          },
          required: []
        }
      },
      {
        name: 'companies',
        description: 'Get information about game companies (developers and publishers)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Fields to return (default: name, slug, description, country)',
              default: ['name', 'slug', 'description', 'country']
            }
          },
          required: []
        }
      },
      {
        name: 'game-modes',
        description: 'Get list of game modes (singleplayer, multiplayer, co-op, etc.)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to return (default: name, slug)',
              default: ['name', 'slug']
            }
          },
          required: []
        }
      }
    ];

    return { tools };
  });

  /**
   * Handle tool calls
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.log(`[MCPServer] Calling tool: ${name}`);

    try {
      let result;

      switch (name) {
        case 'search-games': {
          const { searchTerm, fields } = args as {
            searchTerm: string;
            fields?: string[];
          };
          const games = await igdbService.searchGames(
            searchTerm,
            fields
          );
          result = igdbService.formatResponse(games, `Found ${games.length} game(s)`);
          break;
        }

        case 'games-by-company': {
          const { companyId, fields } = args as {
            companyId: number;
            fields?: string[];
          };
          const games = await igdbService.getGamesByCompany(
            companyId,
            fields
          );
          result = igdbService.formatResponse(
            games,
            `Found ${games.length} game(s) by company`
          );
          break;
        }

        case 'games-upcoming': {
          const { futureDate, fields } = args as {
            futureDate: number;
            fields?: string[];
          };
          const games = await igdbService.getGamesByReleaseDate(
            futureDate,
            fields
          );
          result = igdbService.formatResponse(
            games,
            `Found ${games.length} upcoming game(s)`
          );
          break;
        }

        case 'games-coming-soon': {
          const { fields } = args as {
            fields?: string[];
          };
          const games = await igdbService.getComingSoonGames(fields);
          result = igdbService.formatResponse(
            games,
            `Found ${games.length} coming soon game(s)`
          );
          break;
        }

        case 'platforms': {
          const { fields } = args as {
            fields?: string[];
          };
          const platforms = await igdbService.getPlatforms(fields);
          result = igdbService.formatResponse(
            platforms,
            `Found ${platforms.length} platform(s)`
          );
          break;
        }

        case 'genres': {
          const { fields } = args as {
            fields?: string[];
          };
          const genres = await igdbService.getGenres(fields);
          result = igdbService.formatResponse(
            genres,
            `Found ${genres.length} genre(s)`
          );
          break;
        }

        case 'franchises': {
          const { fields } = args as {
            fields?: string[];
          };
          const franchises = await igdbService.getFranchises(fields);
          result = igdbService.formatResponse(
            franchises,
            `Found ${franchises.length} franchise(s)`
          );
          break;
        }

        case 'companies': {
          const { fields } = args as {
            fields?: string[];
          };
          const companies = await igdbService.getCompanies(fields);
          result = igdbService.formatResponse(
            companies,
            `Found ${companies.length} company/companies`
          );
          break;
        }

        case 'game-modes': {
          const { fields } = args as {
            fields?: string[];
          };
          const gameModes = await igdbService.getGameModes(fields);
          result = igdbService.formatResponse(
            gameModes,
            `Found ${gameModes.length} game mode(s)`
          );
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error(`[MCPServer] Error calling tool ${name}:`, error);

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

  console.log('[MCPServer] MCP Server initialized successfully');

  return server;
}

export { Server };
