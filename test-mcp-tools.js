/**
 * MCP Server Manual Testing Script
 * Tests all available tools by sending JSON-RPC requests
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let requestId = 0;
let serverProcess;
let testResults = [];

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function createJsonRpcRequest(method, params = {}) {
  return {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params
  };
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const distPath = path.join(__dirname, 'dist', 'index.js');
    
    log(colors.cyan, '\n🚀 Starting MCP Server...');
    
    serverProcess = spawn('node', [distPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
        TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
        IGDB_API_URL: 'https://api.igdb.com/v4'
      }
    });

    let stdoutBuffer = '';
    let initialized = false;

    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      
      try {
        const lines = stdoutBuffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            const response = JSON.parse(line);
            if (response.result && response.result.capabilities) {
              initialized = true;
            }
          }
        }
        stdoutBuffer = lines[lines.length - 1];
        
        if (initialized) {
          resolve();
        }
      } catch (e) {
        // Ignore parse errors - wait for valid JSON-RPC
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      log(colors.yellow, `[Server] ${output}`);
    });

    serverProcess.on('error', reject);

    // Start initialization after a short delay
    setTimeout(() => {
      sendInitializeRequest();
    }, 1000);

    // Timeout if server doesn't initialize
    setTimeout(() => {
      if (!initialized) {
        reject(new Error('Server initialization timeout'));
      }
    }, 5000);
  });
}

function sendInitializeRequest() {
  const initRequest = createJsonRpcRequest('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });
  
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
}

async function testTool(toolName, args = {}) {
  return new Promise((resolve) => {
    const callRequest = createJsonRpcRequest('tools/call', {
      name: toolName,
      arguments: args
    });

    log(colors.blue, `\n🧪 Testing: ${toolName}`);
    console.log(`   Input:`, JSON.stringify(args, null, 2).split('\n').join('\n          '));

    let output = '';
    const dataHandler = (data) => {
      output += data.toString();

      try {
        const lines = output.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line && line.startsWith('{')) {
            const response = JSON.parse(line);
            
            if (response.id === callRequest.id) {
              serverProcess.stdout.removeListener('data', dataHandler);
              
              if (response.error) {
                log(colors.red, `   ❌ Error: ${response.error.message}`);
                testResults.push({ tool: toolName, status: 'FAILED', error: response.error.message });
              } else {
                // Show response preview
                const content = response.result?.content?.[0]?.text || 'No content';
                const preview = content.substring(0, 200);
                log(colors.green, `   ✅ Success`);
                console.log(`   Output preview:`, preview.split('\n').join('\n              ') + (content.length > 200 ? '...' : ''));
                testResults.push({ tool: toolName, status: 'PASSED' });
              }
              
              resolve();
            }
          }
        }
        output = lines[lines.length - 1];
      } catch (e) {
        // Ignore parse errors
      }
    };

    serverProcess.stdout.on('data', dataHandler);
    serverProcess.stdin.write(JSON.stringify(callRequest) + '\n');

    // Timeout after 10 seconds
    setTimeout(() => {
      serverProcess.stdout.removeListener('data', dataHandler);
      log(colors.red, `   ❌ Timeout`);
      testResults.push({ tool: toolName, status: 'TIMEOUT' });
      resolve();
    }, 10000);
  });
}

async function runTests() {
  try {
    // Check environment variables
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      log(colors.red, '❌ Error: Missing environment variables');
      log(colors.yellow, 'Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET');
      process.exit(1);
    }

    log(colors.cyan, '═══════════════════════════════════════════');
    log(colors.cyan, '     IGDB MCP Server Manual Tests');
    log(colors.cyan, '═══════════════════════════════════════════');

    await startServer();
    log(colors.green, '✅ Server connected\n');

    // Test each tool
    log(colors.cyan, '📋 Testing Tools...');

    // 1. test-search-games
    await testTool('search-games', {
      searchTerm: 'The Legend of Zelda',
      fields: ['name', 'slug', 'first_release_date']
    });

    // 2. test-game-details (Metal Gear Acid 2)
    await testTool('game-details', {
      gameId: 9886,
      fields: ['name', 'summary', 'rating', 'aggregated_rating', 'platforms', 'genres', 'cover']
    });

    // 3. test-genres
    await testTool('genres', {
      fields: ['name', 'slug']
    });

    // 3. test-platforms
    await testTool('platforms', {
      fields: ['name', 'slug', 'abbreviation']
    });

    // 4. test-franchises
    await testTool('franchises', {
      fields: ['name', 'slug']
    });

    // 5. test-companies
    await testTool('companies', {
      fields: ['name', 'slug', 'description']
    });

    // 6. test-game-modes
    await testTool('game-modes', {
      fields: ['name', 'slug']
    });

    // 7. test-games-coming-soon
    await testTool('games-coming-soon', {
      fields: ['name', 'first_release_date', 'platforms']
    });

    // 8. test-games-upcoming (requires future timestamp)
    const futureDate = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days from now
    await testTool('games-upcoming', {
      futureDate,
      fields: ['name', 'first_release_date']
    });

    // 9. test-games-by-company (using Nintendo ID: 1)
    await testTool('games-by-company', {
      companyId: 1,
      fields: ['name', 'involved_companies']
    });

    // Results summary
    log(colors.cyan, '\n═══════════════════════════════════════════');
    log(colors.cyan, '     Test Results Summary');
    log(colors.cyan, '═══════════════════════════════════════════\n');

    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const timeout = testResults.filter(r => r.status === 'TIMEOUT').length;

    testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.tool.padEnd(25)} ${result.status.padEnd(10)} ${result.error || ''}`);
    });

    console.log('\n' + colors.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    log(colors.green, `✅ Passed: ${passed}/${testResults.length}`);
    if (failed > 0) log(colors.red, `❌ Failed: ${failed}/${testResults.length}`);
    if (timeout > 0) log(colors.yellow, `⏱️  Timeout: ${timeout}/${testResults.length}`);

    serverProcess.kill();
    process.exit(failed > 0 || timeout > 0 ? 1 : 0);
  } catch (error) {
    log(colors.red, `\n❌ Test Error: ${error.message}`);
    if (serverProcess) serverProcess.kill();
    process.exit(1);
  }
}

runTests();
