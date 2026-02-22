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

#### Request
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
        "futureDate": 1735689600
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

---

These examples cover all available endpoints and request formats!
