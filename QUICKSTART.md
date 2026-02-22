# Quick Start Guide

Get the IGDB MCP Server running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Credentials

```bash
cp .env.example .env
```

Edit `.env` and add your Twitch Developer credentials:

```env
TWITCH_CLIENT_ID=your_id_here
TWITCH_CLIENT_SECRET=your_secret_here
```

**Don't have Twitch credentials?** Follow [this guide](https://dev.twitch.tv/console/apps).

## 3. Build

```bash
npm run build
```

## 4. Run (Choose One)

### Option A: STDIO (for Claude Desktop)

```bash
npm start
```

Then configure Claude Desktop to use this server.

### Option B: Development Mode (with hot reload)

```bash
npm run dev
```

### Option C: HTTP Server

```bash
npm start:express
```

Visit `http://localhost:3000` in browser.

## 5. Test It!

### Via Claude Desktop

If configured with Claude Desktop, use this in a prompt:

```
Use the search-games tool to find "Elden Ring"
```

### Via HTTP

```bash
curl -X GET http://localhost:3000/health
```

```bash
curl -X GET http://localhost:3000
```

## Available Tools

Once running, you have access to:

- `search-games` - Search for games by name
- `games-by-company` - Get games by developer/publisher
- `games-upcoming` - Games releasing in date range
- `games-coming-soon` - Games with Coming Soon status
- `platforms` - List gaming platforms
- `genres` - List game genres
- `franchises` - List game franchises
- `companies` - List game companies
- `game-modes` - List game modes

## Troubleshooting

### "Missing environment variables" error

```bash
# Make sure .env exists with credentials
cat .env
```

### Port 3000 already in use (HTTP mode)

```bash
# Change port in .env
EXPRESS_PORT=3001

# Then restart
npm start:express
```

### Twitch token validation fails

- Check your Client ID and Secret are correct
- Verify Twitch account is active
- Try clearing token cache and restarting

### Rate limiting delays

Check status:
```bash
curl http://localhost:3000/health
```

This shows current request queue and timing.

## Next Steps

- Read the [full README](README.md) for detailed documentation
- Check [GITHUB_SETUP.md](GITHUB_SETUP.md) to push to GitHub
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Environment Variables Reference

| Var | Description | Default |
|-----|-------------|---------|
| `TWITCH_CLIENT_ID` | Twitch app ID | (required) |
| `TWITCH_CLIENT_SECRET` | Twitch app secret | (required) |
| `IGDB_API_URL` | IGDB API endpoint | `https://api.igdb.com/v4` |
| `EXPRESS_PORT` | HTTP server port | `3000` |
| `RATE_LIMIT_MAX_REQUESTS` | Requests per window | `4` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `1000` |

## Getting Help

1. Check [README.md](README.md) troubleshooting section
2. Review [IGDB API docs](https://api-docs.igdb.com/)
3. Check GitHub Issues
4. Create a new Issue with details

---

Happy gaming! 🎮
