/**
 * Vercel Serverless Entry Point
 * Wraps the Express app for deployment on Vercel.
 * Use POST /mcp as the MCP server URL in Claude.ai or Copilot.
 */

import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMCPServer } from '../src/server/mcp.js';
import { IGDBService } from '../src/services/igdb.js';
import { TwitchAuthService } from '../src/services/auth.js';
import { RateLimiter } from '../src/services/rateLimit.js';

dotenv.config();

// Module-level service cache — reused across warm lambda invocations
let authService: TwitchAuthService | null = null;
let igdbService: IGDBService | null = null;
let rateLimiter: RateLimiter | null = null;

function getServices() {
  if (!authService || !igdbService || !rateLimiter) {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const apiUrl = process.env.IGDB_API_URL ?? 'https://api.igdb.com/v4';

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing required environment variables: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET'
      );
    }

    authService = new TwitchAuthService(clientId, clientSecret);
    rateLimiter = new RateLimiter({
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '4', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '1000', 10),
    });
    igdbService = new IGDBService(apiUrl, authService, rateLimiter, clientId);
  }
  return {
    authService: authService!,
    igdbService: igdbService!,
    rateLimiter: rateLimiter!,
  };
}

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '1mb' }));

// MCP endpoint — handles POST (requests), GET (SSE stream), DELETE (session end)
// The SDK's StreamableHTTPServerTransport routes internally by req.method
app.all('/mcp', async (req: Request, res: Response) => {
  try {
    const { igdbService } = getServices();
    // Stateless: a fresh transport must be created per request
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const mcpServer = createMCPServer(igdbService);

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on('close', () => {
      transport.close();
      mcpServer.close();
    });
  } catch (error) {
    console.error('[Vercel] Error processing MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  try {
    const { rateLimiter } = getServices();
    res.json({
      status: 'healthy',
      service: 'igdb-mcp-server',
      rateLimit: rateLimiter.getStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Service not initialized' });
  }
});

// Root info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'IGDB MCP Server',
    version: '1.0.0',
    description: 'MCP Server for IGDB API integration',
    endpoints: {
      mcp: 'POST /mcp',
      health: 'GET /health',
    },
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
