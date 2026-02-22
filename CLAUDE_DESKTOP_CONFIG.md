# Claude Desktop Configuration for IGDB MCP Server

This document explains how to configure and use the IGDB MCP Server with Claude Desktop.

## Overview

The IGDB MCP Server is a **Model Context Protocol (MCP)** server that enables Claude Desktop to access video game data from the IGDB (Internet Game Database) API. It communicates via **STDIO** (Standard Input/Output), which is the protocol Claude Desktop uses to interact with MCP servers.

## Prerequisites

1. **Twitch Developer Account**: Required for IGDB API authentication
   - Register at: https://dev.twitch.tv/console/apps
   - Get your Client ID and Client Secret

2. **Project Built**: Ensure the project is compiled
   ```bash
   npm install
   npm run build
   ```

## Location of claude_desktop_config.json

The configuration file is located at:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- Example: `C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json`

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

## Configuration for IGDB MCP Server

Add the following to your `mcpServers` section in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["/absolute/path/to/igdb-mcp-server/dist/index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "your_twitch_client_id_here",
        "TWITCH_CLIENT_SECRET": "your_twitch_client_secret_here",
        "IGDB_API_URL": "https://api.igdb.com/v4"
      }
    }
  }
}
```

### Configuration Fields Explained

- **command**: `"node"` - Executes the compiled JavaScript server
- **args**: Array containing the **absolute path** to the compiled server file
- **env**: Environment variables required by the server:
  - `TWITCH_CLIENT_ID`: Your Twitch developer Client ID
  - `TWITCH_CLIENT_SECRET`: Your Twitch developer Client Secret  
  - `IGDB_API_URL`: The IGDB API endpoint (fixed URL, do not change)

## Step-by-Step Setup

### 1. Get Twitch Credentials

1. Go to https://dev.twitch.tv/console/apps
2. Create a new Application
3. Copy your **Client ID**
4. Go to Settings and copy your **Client Secret**

### 2. Build the Project

```bash
cd /path/to/igdb-mcp-server
npm install
npm run build
```

This creates the compiled files in the `dist/` directory.

### 3. Find Your Absolute Path

Windows:
```powershell
cd "D:\DESARROLLO\APLICACIONES AI\IGDB Videojuegos"
pwd  # PowerShell command to get absolute path
# Result example: D:\DESARROLLO\APLICACIONES AI\IGDB Videojuegos
```

Then use forward slashes or double backslashes:
```
D:/DESARROLLO/APLICACIONES AI/IGDB Videojuegos/dist/index.js
```

### 4. Open Claude Desktop Config

Edit the file at your OS-specific location (see above).

### 5. Add the Configuration

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["D:/DESARROLLO/APLICACIONES AI/IGDB Videojuegos/dist/index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "abc123def456",
        "TWITCH_CLIENT_SECRET": "xyz789uvw012",
        "IGDB_API_URL": "https://api.igdb.com/v4"
      }
    }
  }
}
```

### 6. Restart Claude Desktop

Close Claude Desktop completely and reopen it. The server will start automatically.

## Important Notes

### Why Environment Variables in Config?

When Claude Desktop launches the server, it doesn't execute it from the project directory. Therefore:
- ❌ The `.env` file won't be found
- ✅ Environment variables in `claude_desktop_config.json` are required

### STDIO Protocol

The server communicates with Claude Desktop exclusively through:
- **stdout**: JSON-RPC protocol messages (DO NOT LOG HERE)
- **stderr**: Debug logs and error messages (safe to log)

The codebase uses `console.error()` for all logging to keep stdout clean for protocol communication.

### Path Format

- Use **absolute paths** (not relative)
- On Windows: Use forward slashes `/` OR double backslashes `\\`
- On macOS/Linux: Use forward slashes `/`

## Available Tools

Once connected, Claude Desktop will have access to these 9 tools:

1. **search-games** - Search games by name
2. **games-by-company** - Get games by developer/publisher (requires Company ID)
3. **games-upcoming** - Get games releasing within a date range (requires Unix timestamp)
4. **games-coming-soon** - Get games with "Coming Soon" status
5. **platforms** - List all gaming platforms (PlayStation, Xbox, PC, etc.)
6. **genres** - List game genres for categorization
7. **franchises** - List game franchises (Assassin's Creed, The Legend of Zelda, etc.)
8. **companies** - List game companies (developers and publishers)
9. **game-modes** - List game modes (singleplayer, multiplayer, co-op, etc.)

### Example Usage in Claude

**User**: "Search for games named 'Elden Ring'"

Claude will use the `search-games` tool to fetch data from IGDB.

## Complete Configuration Example

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["/Users/username/projects/igdb-mcp-server/dist/index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "your_client_id",
        "TWITCH_CLIENT_SECRET": "your_client_secret",
        "IGDB_API_URL": "https://api.igdb.com/v4"
      }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@suekou/mcp-notion-server"],
      "env": {
        "NOTION_API_TOKEN": "your_notion_token"
      }
    }
  },
  "preferences": {
    "sidebarMode": "chat"
  }
}
```

## Troubleshooting

### Server Won't Connect

1. **Check logs**: Claude Desktop logs appear in the Help menu
2. **Verify path**: Ensure absolute path exists and is correct
3. **Restart Claude**: Close completely, wait 5 seconds, reopen
4. **Check credentials**: Verify TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are correct

### "Missing required environment variables"

The environment variables aren't being passed correctly. Check:
- Variable names are exactly: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `IGDB_API_URL`
- Values are properly quoted in JSON
- No typos in the configuration

### Tools Don't Appear

- Restart Claude Desktop
- Check that the server connects (you should see connection log)
- Verify the path to `dist/index.js` is correct

## Development Notes

### Rebuilding After Changes

If you modify the source code:

```bash
npm run build
```

Then restart Claude Desktop to load the updated server.

### Local Testing

To test the server locally without Claude Desktop:

```bash
# Run in development mode (uses tsx for on-the-fly compilation)
npm run dev

# Or run the compiled version
node dist/index.js
```

This helps debug issues before testing with Claude Desktop.

## Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop Configuration](https://claude.ai/help/desktop)
- [IGDB API Documentation](https://api-docs.igdb.com/)
- [Twitch Developer Console](https://dev.twitch.tv/console/apps)

## Troubleshooting

### Server Not Appearing in Claude

- ✓ Verify file is at correct path
- ✓ Check JSON syntax is valid
- ✓ Ensure Node.js path is correct (try `node --version`)
- ✓ Verify environment variables are correct
- ✓ Check Claude Desktop logs (Help → Show Logs)

### JSON Syntax Error

- Use JSON validator: https://jsonlint.com/
- Ensure proper quotes and commas
- No trailing commas allowed in JSON

### Path Issues

**Windows**: Use double backslashes or forward slashes
```json
"args": ["C:\\path\\to\\project\\dist\\index.js"]
// OR
"args": ["C:/path/to/project/dist/index.js"]
```

**macOS/Linux**: Use standard paths
```json
"args": ["/home/user/projects/igdb-mcp-server/dist/index.js"]
```

### Credentials Not Working

1. Verify credentials in Twitch Developer Console
2. Check credentials are correctly copied
3. Ensure quotes are properly escaped in JSON
4. Try clearing token cache by restarting server

### Port Already in Use (if running HTTP mode)

If running Express transport simultaneously:
- Change EXPRESS_PORT in configuration
- Default: 3000, try: 3001, 3002, etc.

## Alternative: Using Environment File

Instead of inlining credentials, you can use a `.env` file:

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["/path/to/igdb-mcp-server/dist/index.js"],
      "env": {
        "DOTENV_PATH": "/path/to/.env"
      }
    }
  }
}
```

Then create `.env` in that directory with credentials.

**Security Note**: Don't commit `.env` with real credentials to GitHub.

## Using Multiple Instances

You can run multiple instances with different configurations:

```json
{
  "mcpServers": {
    "igdb-primary": {
      "command": "node",
      "args": ["/path/to/primary/dist/index.js"],
      "env": { "TWITCH_CLIENT_ID": "id1", "TWITCH_CLIENT_SECRET": "secret1" }
    },
    "igdb-secondary": {
      "command": "node",
      "args": ["/path/to/secondary/dist/index.js"],
      "env": { "TWITCH_CLIENT_ID": "id2", "TWITCH_CLIENT_SECRET": "secret2" }
    }
  }
}
```

## Additional Resources

- [Claude Desktop Documentation](https://claude.ai)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Twitch Developer Console](https://dev.twitch.tv/console)

---

Once configured, you can interact with IGDB data directly in Claude conversations!
