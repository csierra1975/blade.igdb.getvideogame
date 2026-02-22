# Claude Desktop Configuration Example

This file shows how to configure the IGDB MCP Server for use with Claude Desktop.

## Location of claude_desktop_config.json

The configuration file is located at:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

## Configuration Example

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["D:\\DESARROLLO\\APLICACIONES AI\\IGDB Videojuegos\\dist\\index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "your_twitch_client_id",
        "TWITCH_CLIENT_SECRET": "your_twitch_client_secret",
        "IGDB_API_URL": "https://api.igdb.com/v4",
        "RATE_LIMIT_MAX_REQUESTS": "4",
        "RATE_LIMIT_WINDOW_MS": "1000"
      }
    }
  }
}
```

## Step-by-Step Setup for Claude Desktop

### 1. Build the Project

```bash
npm run build
```

This generates compiled JavaScript in `dist/` directory.

### 2. Locate Configuration File

Find and open `claude_desktop_config.json` as shown above.

### 3. Update Paths

Replace:
- `D:\\DESARROLLO\\APLICACIONES AI\\IGDB Videojuegos` with your actual project path

**Important**: Use absolute paths and double backslashes on Windows.

### 4. Add Environment Variables

Edit the `env` section with your Twitch credentials:
- `TWITCH_CLIENT_ID`: Your Client ID from Twitch Developer Console
- `TWITCH_CLIENT_SECRET`: Your Client Secret from Twitch Developer Console

### 5. Restart Claude Desktop

Close and reopen Claude Desktop completely to load the new configuration.

## Complete Configuration Example

```json
{
  "mcpServers": {
    "igdb": {
      "command": "node",
      "args": ["/absolute/path/to/igdb-mcp-server/dist/index.js"],
      "env": {
        "TWITCH_CLIENT_ID": "abc123def456ghi789",
        "TWITCH_CLIENT_SECRET": "xyz789uvw012tsr345qpo",
        "IGDB_API_URL": "https://api.igdb.com/v4",
        "RATE_LIMIT_MAX_REQUESTS": "4",
        "RATE_LIMIT_WINDOW_MS": "1000",
        "LOG_LEVEL": "debug"
      }
    },
    "other-server": {
      "command": "node",
      "args": ["/path/to/other/server"]
    }
  }
}
```

## Verification

After restarting Claude Desktop:

1. Look for connection messages in Claude
2. You should see the IGDB server tools available
3. Try using a tool like: "Search for 'The Legend of Zelda' using search-games"

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
