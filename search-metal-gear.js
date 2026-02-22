import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverProcess = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    IGDB_API_URL: 'https://api.igdb.com/v4'
  }
});

let initialized = false;
let buffer = '';

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  
  try {
    const lines = buffer.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line && line.startsWith('{')) {
        const response = JSON.parse(line);
        
        // Solo imprimir la respuesta del search, no la inicialización
        if (response.result && response.result.content) {
          const content = JSON.parse(response.result.content[0].text);
          console.log('📊 Respuesta de búsqueda Metal Gear:');
          console.log(JSON.stringify(content, null, 2));
          serverProcess.kill();
          process.exit(0);
        }
      }
    }
    buffer = lines[lines.length - 1];
  } catch (e) {
    // Ignore parsing errors
  }
});

serverProcess.stderr.on('data', (data) => {
  // Ignore stderr
});

setTimeout(() => {
  // Enviar initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' }
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Esperar y enviar search
  setTimeout(() => {
    const searchRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'search-games',
        arguments: {
          searchTerm: 'Metal Gear',
          fields: ['name', 'slug', 'first_release_date', 'platforms', 'genres', 'rating']
        }
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(searchRequest) + '\n');
  }, 1000);
}, 1000);

setTimeout(() => {
  console.error('❌ Timeout');
  serverProcess.kill();
  process.exit(1);
}, 15000);
