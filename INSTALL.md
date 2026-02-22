# Installation & Usage

Quick installation and usage guide for the IGDB MCP Server.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/csierra1975/blade.igdb.getvideogame.git
cd blade.igdb.getvideogame
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Twitch Developer credentials:

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

**Need Twitch credentials?** [Get them here](https://dev.twitch.tv/console/apps)

## Usage

### Development Mode (STDIO)

Perfect for local development and Claude Desktop:

```bash
npm run dev
```

Then configure Claude Desktop to use this server (see [CLAUDE_DESKTOP_CONFIG.md](CLAUDE_DESKTOP_CONFIG.md))

### Production Build

```bash
npm run build
npm start
```

### HTTP Server (Development)

For testing via HTTP requests:

```bash
npm run dev:express
```

Access at: `http://localhost:3000`

### HTTP Server (Production)

```bash
npm run build
npm start:express
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch
```

## Available Tools

Once running, you can use these tools:

| Tool | Description |
|------|-------------|
| `search-games` | Search for games by name |
| `games-by-company` | Get games by company (developer/publisher) |
| `games-upcoming` | Games releasing in a date range |
| `games-coming-soon` | Games with Coming Soon status |
| `platforms` | List gaming platforms |
| `genres` | List game genres |
| `franchises` | List game franchises |
| `companies` | List game companies |
| `game-modes` | List game modes |

## Example: Using with Claude Desktop

1. Build the project:
   ```bash
   npm run build
   ```

2. Update Claude configuration (see [CLAUDE_DESKTOP_CONFIG.md](CLAUDE_DESKTOP_CONFIG.md))

3. Restart Claude Desktop

4. Ask Claude:
   ```
   Search for "The Legend of Zelda" using the search-games tool
   ```

## Example: Using with HTTP

1. Start HTTP server:
   ```bash
   npm run dev:express
   ```

2. Make a request:
   ```bash
   curl -X GET http://localhost:3000/health
   ```

3. See [HTTP_EXAMPLES.md](HTTP_EXAMPLES.md) for more examples

## Configuration

Key environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `TWITCH_CLIENT_ID` | (required) | Twitch app Client ID |
| `TWITCH_CLIENT_SECRET` | (required) | Twitch app Client Secret |
| `IGDB_API_URL` | `https://api.igdb.com/v4` | IGDB API endpoint |
| `EXPRESS_PORT` | `3000` | HTTP server port |
| `RATE_LIMIT_MAX_REQUESTS` | `4` | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | `1000` | Rate limit window (ms) |

## Troubleshooting

### "Missing environment variables" error

- Ensure `.env` file exists
- Verify `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are set
- Restart the server

### Port already in use

Change `EXPRESS_PORT` in `.env`:
```env
EXPRESS_PORT=3001
```

### Rate limiting delays

Check rate limit status:
```bash
curl http://localhost:3000/health
```

### Token validation fails

- Verify credentials are correct
- Check Twitch Developer Console
- Ensure your Twitch account is active

## Documentation

- [README.md](README.md) - Complete documentation
- [QUICKSTART.md](QUICKSTART.md) - 5-minute quick start
- [CLAUDE_DESKTOP_CONFIG.md](CLAUDE_DESKTOP_CONFIG.md) - Claude Desktop setup
- [HTTP_EXAMPLES.md](HTTP_EXAMPLES.md) - HTTP request examples
- [DEPLOY.md](DEPLOY.md) - GitHub deployment guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## Resources

- [IGDB API Documentation](https://api-docs.igdb.com/)
- [Twitch Developer Console](https://dev.twitch.tv/console)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Repository](https://github.com/csierra1975/blade.igdb.getvideogame)

## Getting Help

1. Check existing [issues](https://github.com/csierra1975/blade.igdb.getvideogame/issues)
2. Review [troubleshooting section](README.md#troubleshooting)
3. Create a new [issue](https://github.com/csierra1975/blade.igdb.getvideogame/issues/new)
4. Start a [discussion](https://github.com/csierra1975/blade.igdb.getvideogame/discussions)

## License

MIT License - See [LICENSE](LICENSE) for details

---

Happy coding! 🎮
