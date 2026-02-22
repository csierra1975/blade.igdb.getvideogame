# IGDB MCP Server

A robust Model Context Protocol (MCP) server for Node.js that provides seamless integration with the IGDB (Internet Game Database) API. Exposes comprehensive video game data through typed tools with support for both STDIO (Claude Desktop) and HTTP transports.

## Features

- 🎮 **17 MCP Tools** for querying games, platforms, genres, franchises, companies, covers, screenshots, release dates, and involved companies
- 🔐 **OAuth2 Authentication** with Twitch Developer credentials
- ⚡ **Rate Limiting** with local throttling to respect IGDB API limits
- 📝 **Full TypeScript** with strict type checking and Zod validation
- 🚀 **Dual Transport Support**: STDIO (Claude Desktop) + Express HTTP
- 🧪 **Unit Tests** with Jest for core services
 - 📊 **Comprehensive Logging** to stderr for debugging (stdout is reserved for MCP JSON-RPC)
- 🔌 **Streaming HTTP Support** for production use

## Available Tools

### Games Query Tools

#### 1. `search-games`
Search for games by name with customizable fields.

**Input:**
```json
{
  "query": "Elden Ring",
  "fields": ["name", "alternative_names", "slug"]
}
```

#### 2. `game-details`
Get comprehensive game information including ratings, descriptions, platforms, companies, and media assets.

**Input:**
```json
{
  "gameId": 9886,
  "fields": ["name", "summary", "rating", "aggregated_rating", "platforms", "genres", "cover"]
}
```

**Example Output:**
```json
{
  "success": true,
  "data": [{
    "id": 9886,
    "name": "Metal Gear Acid 2",
    "summary": "An All New Acid Trip! Metal Gear Acid 2 enhances the card based tactical gameplay...",
    "rating": 79.26,
    "aggregated_rating": 84.5,
    "platforms": [38],
    "genres": [12, 16, 24, 35],
    "cover": 257530
  }]
}
```

#### 3. `games-by-company`
Get all games developed or published by a specific company.

**Input:**
```json
{
  "companyId": 1,
  "fields": ["name", "involved_companies.company.name", "involved_companies.developer"]
}
```

#### 4. `games-upcoming`
Get games releasing soon. By default the server returns games scheduled in the next 90 days.

**Input (optional):**
```json
{
  "limit": 10,
  "date_from": 1700000000,
  "date_to": 1702592000
}
```

Notes:
- `date_from` and `date_to` are optional Unix timestamps in seconds. If omitted, `date_from` defaults to now and `date_to` defaults to 90 days after `date_from`.
- The server will automatically normalize millisecond timestamps (e.g. JS `Date.now()`) to seconds when values look like milliseconds.

#### 5. `games-coming-soon`
Get all games with "Coming Soon" status.

**Input:**
```json
{
  "fields": ["name", "first_release_date", "platforms", "status"]
}
```

### Reference Data Tools

#### 6. `platforms`
Get information about gaming platforms (PlayStation, Xbox, PC, Nintendo, etc.).

**Input:**
```json
{
  "fields": ["name", "slug", "abbreviation", "category"]
}
```

#### 7. `genres`
Get list of game genres for categorization.

**Input:**
```json
{
  "fields": ["name", "slug"]
}
```

#### 8. `franchises`
Get information about game franchises (Assassin's Creed, The Legend of Zelda, etc.).

**Input:**
```json
{
  "fields": ["name", "slug", "url"]
}
```

#### 9. `companies`
Get details about game companies (developers and publishers).

**Input:**
```json
{
  "fields": ["name", "slug", "description", "country"]
}
```

#### 10. `game-modes`
Get list of game modes (singleplayer, multiplayer, co-op, etc.).

**Input:**
```json
{
  "fields": ["name", "slug"]
}
```

### Entity Resolution Tools

#### 11. `covers-by-ids`
Get cover images by cover IDs (resolves cover image URLs and metadata).

**Input:**
```json
{
  "ids": [172391, 257530],
  "limit": 50
}
```

**Example Output:**
```json
{
  "id": 172391,
  "image_id": "co5glk",
  "url": "https://images.igdb.com/igdb/image/upload/t_thumb/co5glk.jpg",
  "width": 264,
  "height": 352
}
```

#### 12. `platforms-by-ids`
Get platform details by platform IDs.

**Input:**
```json
{
  "ids": [6, 48, 49],
  "limit": 50
}
```

#### 13. `genres-by-ids`
Get genre details by genre IDs.

**Input:**
```json
{
  "ids": [12, 16, 24],
  "limit": 50
}
```

#### 14. `involved-companies-by-ids`
Get involved companies by IDs (automatically resolves company details including name, description, and logo).

**Input:**
```json
{
  "ids": [106687, 225257],
  "limit": 50
}
```

**Returns company details automatically resolved for convenience.**

#### 15. `companies-by-ids`
Get company details by company IDs.

**Input:**
```json
{
  "ids": [5, 10, 26],
  "limit": 50
}
```

#### 16. `screenshots-by-ids`
Get screenshot details by screenshot IDs (resolves screenshot image URLs and metadata).

**Input:**
```json
{
  "ids": [384132, 445566],
  "limit": 50
}
```

#### 17. `release-dates-by-ids`
Get release date details by release date IDs (includes human-readable date formats and region/platform info).

**Input:**
```json
{
  "ids": [612584, 612586],
  "limit": 50
}
```

## Prerequisites

- Node.js 18+ and npm/yarn
- Twitch Developer account with credentials:
  - `TWITCH_CLIENT_ID`
  - `TWITCH_CLIENT_SECRET`
- (Optional) For HTTP transport: Running port available (default: 3000)

## Installation

1. **Clone the repository** (or extract the archive):
```bash
git clone <your-github-repo-url>
cd igdb-mcp-server
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your Twitch Developer credentials:
```env
TWITCH_CLIENT_ID=your_twitch_client_id_here
TWITCH_CLIENT_SECRET=your_twitch_client_secret_here
IGDB_API_URL=https://api.igdb.com/v4
EXPRESS_PORT=3000
RATE_LIMIT_MAX_REQUESTS=4
RATE_LIMIT_WINDOW_MS=1000
```

## Getting Twitch Developer Credentials

1. Go to [Twitch Developers](https://dev.twitch.tv/console)
2. Sign in or create an account
3. Go to **Applications** → **Register Your Application**
4. Fill in application name and accept terms
5. Choose **Application Type**: Select appropriate category (or "Other")
6. Copy your **Client ID**
7. Go to **Manage** → **OAuth Redirect URLs** (add `http://localhost`)
8. Generate a **Client Secret**
9. Copy both values to your `.env` file

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

This generates compiled code in the `dist/` directory.

## Usage

### STDIO Transport (Claude Desktop)

For local development and Claude Desktop integration:

```bash
npm run dev
```

Or after building:

```bash
npm start
```

This runs the server on STDIO, connecting to Claude Desktop or any MCP client using stdin/stdout.

#### Configure for Claude Desktop

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["/absolute/path/to/igdb-mcp-server/dist/index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "your_id",
        "TWITCH_CLIENT_SECRET": "your_secret",
        "IGDB_API_URL": "https://api.igdb.com/v4"
      }
    }
  }
}
```

### HTTP Transport (Express)

For HTTP/streaming HTTP protocol:

```bash
npm run dev:express
```

Or after building:

```bash
npm start:express
```

The server runs on `http://localhost:3000` with these endpoints:

- **POST `/mcp`** - Main MCP protocol endpoint (Streamable HTTP)
- **GET `/health`** - Health check and rate limit status
- **GET `/`** - Server info and endpoint documentation

## Development

### Run in Watch Mode (STDIO)
```bash
npm run dev
```

### Run in Watch Mode (Express)
```bash
npm run dev:express
```

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Project Structure

```
igdb-mcp-server/
├── src/
│   ├── index.ts                    # STDIO entry point
│   ├── server/
│   │   └── mcp.ts                 # MCP server core with tools
│   ├── services/
│   │   ├── auth.ts                # Twitch OAuth2 authentication
│   │   ├── igdb.ts                # IGDB API service
│   │   └── rateLimit.ts           # Rate limiting service
│   ├── transports/
│   │   └── express.ts             # Express HTTP transport
│   └── types/
│       └── igdb.ts                # TypeScript type definitions
├── tests/
│   ├── auth.test.ts               # Auth service tests
│   ├── igdb.test.ts               # IGDB service tests
│   └── rateLimit.test.ts          # Rate limiter tests
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TWITCH_CLIENT_ID` | Twitch Developer Client ID | (required) |
| `TWITCH_CLIENT_SECRET` | Twitch Developer Client Secret | (required) |
| `IGDB_API_URL` | IGDB API base URL | `https://api.igdb.com/v4` |
| `EXPRESS_PORT` | HTTP server port | `3000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `4` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `1000` |
| `LOG_LEVEL` | Logging level | `debug` |

## Rate Limiting

The server implements local rate limiting to respect IGDB API limits:
- **Default**: 4 requests per 1000ms
- **Configurable** via environment variables
- **Automatic queuing** of requests when limit is reached
- **Console logging** of rate limit status

## Error Handling

All tools return consistent error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error description"
}
```

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- ✅ Authentication service initialization
- ✅ Rate limiter behavior and state management
- ✅ IGDB service response formatting
- ✅ Error handling and validation

## API Response Format

All tools return responses in this format:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Game Name",
      "slug": "game-name",
      ...
    }
  ],
  "message": "Found X result(s)"
}
```

## Troubleshooting

### "Missing environment variables" error
- Ensure `.env` file exists in project root
- Verify `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are set
- Restart the server after updating `.env`

### Rate limiting delays
- Check `/health` endpoint to see current rate limit status
- Increase `RATE_LIMIT_MAX_REQUESTS` if you have a higher tier on IGDB
- Note: IGDB has strict API rate limits

### Token validation fails
- Verify Twitch credentials are correct
- Ensure credentials have proper OAuth2 scopes
- Check Twitch Developer Console for account status

### No results from queries
- Verify search terms and parameters are valid
- Check rate limiter status
- Ensure IGDB API is accessible

## License

MIT License - See LICENSE file for details

## Repository

**Public Repository**: https://github.com/csierra1975/blade.igdb.getvideogame

This is an open-source project and contributions are welcome!

## Support

For issues, questions, or contributions:

1. Visit the [GitHub repository](https://github.com/csierra1975/blade.igdb.getvideogame)
2. Check existing [issues](https://github.com/csierra1975/blade.igdb.getvideogame/issues)
3. Create a new [issue](https://github.com/csierra1975/blade.igdb.getvideogame/issues/new) if you find a bug
4. Review [IGDB API documentation](https://api-docs.igdb.com/)
5. Consult [Twitch Developer documentation](https://dev.twitch.tv/docs)

## Additional Resources

- [IGDB API Documentation](https://api-docs.igdb.com/)
- [Twitch Developer Documentation](https://dev.twitch.tv/docs)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Version**: 1.0.0  
**Last Updated**: February 22, 2026  
**Maintained by**: Your Name
