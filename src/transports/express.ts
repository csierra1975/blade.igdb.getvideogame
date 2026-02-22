/**
 * Express HTTP Transport
 * For use with HTTP clients that support MCP protocol
 */

import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/node-streaming.js';
import { createMCPServer } from '../server/mcp.js';
import { IGDBService } from '../services/igdb.js';
import { TwitchAuthService } from '../services/auth.js';
import { RateLimiter } from '../services/rateLimit.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.EXPRESS_PORT || '3000', 10);

async function main() {
  console.log('[Express] Starting IGDB MCP Server on HTTP transport...');

  // Validate required environment variables
  const requiredEnvVars = ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET', 'IGDB_API_URL'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error(
      `[Express] ERROR: Missing required environment variables: ${missingVars.join(', ')}`
    );
    console.error('[Express] Please set them in .env file');
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
    console.log('[Express] Validating Twitch credentials...');
    const validation = await authService.validateToken();
    console.log(`[Express] Twitch credentials valid for user: ${validation.login}`);

    // Create Express app
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.raw({ type: 'application/octet-stream' }));

    // MCP endpoint handler
    app.post('/mcp', async (req: Request, res: Response) => {
      console.log(`[Express] Received MCP request from ${req.ip}`);

      const transport = new NodeStreamableHTTPServerTransport(req, res);
      const mcpServer = createMCPServer(igdbService);

      try {
        await mcpServer.connect(transport);
        console.log('[Express] MCP request processed successfully');
      } catch (error) {
        console.error('[Express] Error processing MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
      const status = rateLimiter.getStatus();
      res.json({
        status: 'healthy',
        service: 'igdb-mcp-server',
        rateLimit: status,
        timestamp: new Date().toISOString()
      });
    });

    // Root endpoint
    app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'IGDB MCP Server',
        version: '1.0.0',
        description: 'MCP Server for IGDB API integration',
        endpoints: {
          mcp: 'POST /mcp',
          health: 'GET /health'
        }
      });
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`[Express] MCP Server running on http://localhost:${PORT}`);
      console.log(`[Express] MCP endpoint: POST http://localhost:${PORT}/mcp`);
      console.log(`[Express] Health check: GET http://localhost:${PORT}/health`);
    });

    // Handle graceful shutdown
    const handleShutdown = (signal: string) => {
      console.log(`\n[Express] Received ${signal}, shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('[Express] Fatal error:', error);
    process.exit(1);
  }
}

main();
