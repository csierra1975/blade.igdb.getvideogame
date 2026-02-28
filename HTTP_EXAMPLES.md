# HTTP Request Examples

Example requests to test the IGDB MCP Server HTTP transport.

## Starting the HTTP Server

```bash
npm run dev:express
```

Server runs on: `http://localhost:3000`

## Health Check

### Request
```bash
curl -X GET http://localhost:3000/health
```

### Response
```json
{
  "status": "healthy",
  "service": "igdb-mcp-server",
  "rateLimit": {
    "requestsInWindow": 0,
    "maxRequests": 4,
    "availableSlots": 4,
    "nextAvailableAt": 0
  },
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

## Server Info

### Request
```bash
curl -X GET http://localhost:3000
```

### Response
```json
{
  "name": "IGDB MCP Server",
  "version": "1.0.0",
  "description": "MCP Server for IGDB API integration",
  "endpoints": {
    "mcp": "POST /mcp",
    "health": "GET /health"
  }
}
```

## MCP Protocol Requests

The `/mcp` endpoint accepts MCP protocol requests. These examples show the JSON-RPC 2.0 format.

### Search Games

#### Request Body
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search-games",
    "arguments": {
      "searchTerm": "Elden Ring",
      "fields": ["name", "alternative_names", "slug"]
    }
  }
}
```

#### Using curl
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search-games",
      "arguments": {
        "searchTerm": "Elden Ring"
      }
    }
  }'
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"data\":[{\"id\":119171,\"name\":\"Elden Ring\",\"slug\":\"elden-ring\",\"alternative_names\":[...]}],\"message\":\"Found 1 result(s)\"}"
      }
    ]
  }
}
```

### Game Details

Get comprehensive information about a game by ID (ratings, descriptions, platforms, companies, media assets).

#### Request Body
```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "tools/call",
  "params": {
    "name": "game-details",
    "arguments": {
      "gameId": 9886,
      "fields": ["name", "summary", "rating", "aggregated_rating", "platforms", "genres", "cover"]
    }
  }
}
```

#### Using curl
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 15,
    "method": "tools/call",
    "params": {
      "name": "game-details",
      "arguments": {
        "gameId": 9886,
        "fields": ["name", "summary", "rating", "platforms", "genres"]
      }
    }
  }'
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"data\":[{\"id\":9886,\"name\":\"Metal Gear Acid 2\",\"summary\":\"An All New Acid Trip! Metal Gear Acid 2 enhances the card based tactical gameplay...\",\"rating\":79.26,\"aggregated_rating\":84.5,\"platforms\":[38],\"genres\":[12,16,24,35],\"cover\":257530}],\"message\":\"Found game details for ID 9886\"}"
      }
    ]
  }
}
```

### Games by Company

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "games-by-company",
      "arguments": {
        "companyId": 5
      }
    }
  }'
```

### Games Upcoming

#### Request (examples)

By timestamp range (seconds):
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "games-upcoming",
      "arguments": {
        "date_from": 1735689600,
        "date_to": 1738291200,
        "limit": 20
      }
    }
  }'
```

Using millisecond timestamps (the server will normalize to seconds):
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "games-upcoming",
      "arguments": {
        "date_from": 1735689600000,
        "date_to": 1738291200000
      }
    }
  }'
```

### Games Coming Soon

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "games-coming-soon",
      "arguments": {}
    }
  }'
```

### Platforms

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "platforms",
      "arguments": {}
    }
  }'
```

### Genres

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "genres",
      "arguments": {}
    }
  }'
```

### Franchises

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "franchises",
      "arguments": {}
    }
  }'
```

### Companies

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 8,
    "method": "tools/call",
    "params": {
      "name": "companies",
      "arguments": {}
    }
  }'
```

### Game Modes

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "tools/call",
    "params": {
      "name": "game-modes",
      "arguments": {}
    }
  }'
```

## Entity Resolution Requests

### Covers by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 10,
    "method": "tools/call",
    "params": {
      "name": "covers-by-ids",
      "arguments": {
        "ids": [172391, 257530],
        "limit": 50
      }
    }
  }'
```

### Platforms by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 11,
    "method": "tools/call",
    "params": {
      "name": "platforms-by-ids",
      "arguments": {
        "ids": [6, 48, 49]
      }
    }
  }'
```

### Genres by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 12,
    "method": "tools/call",
    "params": {
      "name": "genres-by-ids",
      "arguments": {
        "ids": [12, 16, 24]
      }
    }
  }'
```

### Involved Companies by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 13,
    "method": "tools/call",
    "params": {
      "name": "involved-companies-by-ids",
      "arguments": {
        "ids": [106687, 225257],
        "limit": 50
      }
    }
  }'
```

Note: Company details are automatically resolved and included in the response.

### Companies by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 14,
    "method": "tools/call",
    "params": {
      "name": "companies-by-ids",
      "arguments": {
        "ids": [5, 10, 26]
      }
    }
  }'
```

### Screenshots by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 15,
    "method": "tools/call",
    "params": {
      "name": "screenshots-by-ids",
      "arguments": {
        "ids": [384132, 445566]
      }
    }
  }'
```

### Release Dates by IDs

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 16,
    "method": "tools/call",
    "params": {
      "name": "release-dates-by-ids",
      "arguments": {
        "ids": [612584, 612586]
      }
    }
  }'
```

## Testing with Postman

1. Import these requests into Postman
2. Set up collection variable: `base_url = http://localhost:3000`
3. Use `{{base_url}}/mcp` as endpoint
4. Set Content-Type to `application/json`
5. Copy JSON body from examples above

## Testing with VS Code REST Client

Create `.vscode/settings.json`:
```json
{
  "rest-client.defaultHeaders": {
    "Content-Type": "application/json"
  }
}
```

Create `test-requests.http`:
```http
@base_url = http://localhost:3000

### Health Check
GET {{base_url}}/health

### Server Info
GET {{base_url}}

### Search Games
POST {{base_url}}/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search-games",
    "arguments": {
      "searchTerm": "Zelda"
    }
  }
}
```

## Expected Response Format

All MCP responses follow this format:

```json
{
  "jsonrpc": "2.0",
  "id": <request_id>,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "<JSON_STRINGIFIED_RESPONSE>"
      }
    ]
  }
}
```

Or on error:

```json
{
  "jsonrpc": "2.0",
  "id": <request_id>,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":false,\"data\":null,\"error\":\"Error message\"}"
      }
    ],
    "isError": true
  }
}
```

## Common Response Examples

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Game Name",
      "slug": "game-name"
    }
  ],
  "message": "Found 1 result(s)"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": "IGDB API Error: Invalid query"
}
```

## Debugging

### View Server Logs

Check console where server is running for logs like:
```
[IGDBService] Making request to games with query: search "Elden Ring"...
[RateLimiter] Allowing request (1/4)
[IGDBService] Request to games successful, received 5 results
```

### Common Issues

1. **Connection Refused**
   - Ensure server is running: `npm run dev:express`
   - Verify port 3000 is available

2. **Invalid JSON Response**
   - Check server logs for errors
   - Verify request JSON syntax

3. **Authentication Errors**
   - Verify `.env` has correct credentials
   - Check Twitch Developer Console

4. **Rate Limiting**
   - Wait before making many requests
   - Check `/health` endpoint for available slots

## Performance Testing

### Simple Load Test

```bash
# Run 10 requests sequentially
for i in {1..10}; do
  curl -X GET http://localhost:3000/health
  echo "Request $i completed"
  sleep 0.5
done
```

### Monitor Rate Limiting

```bash
# Check status before and after requests
curl http://localhost:3000/health | jq '.rateLimit'
```

### Games by IDs

Fetch multiple games in a single request by passing an array of game IDs.

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 17,
    "method": "tools/call",
    "params": {
      "name": "games-by-ids",
      "arguments": {
        "ids": [119171, 1942, 9886],
        "limit": 50
      }
    }
  }'
```

### Franchises by IDs

Fetch multiple franchises in a single request by passing an array of franchise IDs.

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 18,
    "method": "tools/call",
    "params": {
      "name": "franchises-by-ids",
      "arguments": {
        "ids": [532, 13, 756],
        "limit": 50
      }
    }
  }'
```

### Search Games by Names

Search multiple games by name and get full details in a single call. Each name is resolved in parallel to its top result ID, then all details are fetched in one batch request.

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 19,
    "method": "tools/call",
    "params": {
      "name": "search-games-by-names",
      "arguments": {
        "names": ["Ico", "Sekiro: Shadows Die Twice", "Devil May Cry"]
      }
    }
  }'
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 19,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"id\":7170,\"name\":\"Ico\",\"rating\":85.2,...},{\"id\":76882,\"name\":\"Sekiro: Shadows Die Twice\",\"rating\":91.0,...},{\"id\":134,\"name\":\"Devil May Cry\",\"rating\":81.2,...}]"
      }
    ]
  }
}
```

> **Note**: Names that return no search results are silently skipped. The response will contain only the games that were successfully resolved.

---

### Player Perspectives by IDs

Resolve player perspective IDs to readable names (e.g. First person, Third person, Isometric, Side view, VR).

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 20,
    "method": "tools/call",
    "params": {
      "name": "player-perspectives-by-ids",
      "arguments": {
        "ids": [1, 2, 3, 4, 5]
      }
    }
  }'
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 20,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"id\":1,\"name\":\"First person\",\"slug\":\"first-person\"},{\"id\":2,\"name\":\"Third person\",\"slug\":\"third-person\"},{\"id\":3,\"name\":\"Bird view/Isometric\",\"slug\":\"bird-view-isometric\"}]"
      }
    ]
  }
}
```

---

### Multiplayer Modes by IDs

Get detailed multiplayer mode data including co-op, split-screen, online, LAN flags and max player counts.

#### Request
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 21,
    "method": "tools/call",
    "params": {
      "name": "multiplayer-modes-by-ids",
      "arguments": {
        "ids": [1001, 1002]
      }
    }
  }'
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 21,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"id\":1001,\"game\":19560,\"platform\":48,\"campaigncoop\":false,\"onlinecoop\":false,\"splitscreen\":false,\"massivemultiplayer\":false,\"onlinemax\":1,\"offlinemax\":1}]"
      }
    ]
  }
}
```

---

These examples cover all available endpoints and request formats!
