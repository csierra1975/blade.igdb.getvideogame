/**
 * STDIO Transport Entry Point
 * For use with Claude Desktop and other MCP clients using STDIO
 */

import * as dotenv from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server/mcp.js';
import { IGDBService } from './services/igdb.js';
import { TwitchAuthService } from './services/auth.js';
import { RateLimiter } from './services/rateLimit.js';

// Load environment variables
dotenv.config();

async function main() {
  console.error('[STDIO] Starting IGDB MCP Server on STDIO transport...');

  // Validate required environment variables
  const requiredEnvVars = ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET', 'IGDB_API_URL'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error(
      `[STDIO] ERROR: Missing required environment variables: ${missingVars.join(', ')}`
    );
    console.error('[STDIO] Please set them in .env file');
    process.exit(1);
  }

  try {
    // Initialize services
    const authService = new TwitchAuthService(
      process.env.TWITCH_CLIENT_ID!,
      process.env.TWITCH_CLIENT_SECRET!
    );

    const rateLimiter = new RateLimiter({
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '4', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '1000', 10)
    });

    const igdbService = new IGDBService(
      process.env.IGDB_API_URL!,
      authService,
      rateLimiter
    );

    // Validate Twitch credentials
    console.error('[STDIO] Validating Twitch credentials...');
    const validation = await authService.validateToken();
    console.error(`[STDIO] Twitch credentials valid for user: ${validation.login}`);

    // Create MCP server
    const mcpServer = createMCPServer(igdbService);

    // Connect to STDIO transport
    const transport = new StdioServerTransport();
    console.error('[STDIO] Connecting to STDIO transport...');
    
    await mcpServer.connect(transport);
    console.error('[STDIO] MCP Server connected successfully on STDIO');

    // Handle graceful shutdown
    const handleShutdown = (signal: string) => {
      console.log(`\n[STDIO] Received ${signal}, shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('[STDIO] Fatal error:', error);
    process.exit(1);
  }
}

main();
