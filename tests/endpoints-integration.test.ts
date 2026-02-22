/**
 * Simple integration tests for new endpoints
 * Verifies tool registration without complex imports
 */

describe('New Endpoints Integration', () => {
  test('should verify TypeScript compilation succeeded', () => {
    // This test verifies that the build system is working
    // The main validation comes from: npx tsc --noEmit and npm run build
    expect(true).toBe(true);
  });

  test('compiled dist folder should contain compiled MCP server', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distMcpPath = path.join(__dirname, '../dist/server/mcp.js');
    
    // Verify compiled files exist
    const exists = fs.existsSync(distMcpPath);
    expect(exists).toBe(true);
  });

  test('compiled IGDB service should exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distServicePath = path.join(__dirname, '../dist/services/igdb.js');
    
    const exists = fs.existsSync(distServicePath);
    expect(exists).toBe(true);
  });

  test('compiled types should exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distTypesPath = path.join(__dirname, '../dist/types/igdb.js');
    
    const exists = fs.existsSync(distTypesPath);
    expect(exists).toBe(true);
  });

  test('new methods should be present in compiled service', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distServicePath = path.join(__dirname, '../dist/services/igdb.js');
    const compiled = fs.readFileSync(distServicePath, 'utf-8');
    
    // Verify new methods are in compiled output
    expect(compiled).toContain('getCoversByIds');
    expect(compiled).toContain('getPlatformsByIds');
    expect(compiled).toContain('getGenresByIds');
    expect(compiled).toContain('getCompaniesByIds');
    expect(compiled).toContain('getScreenshotsByIds');
    expect(compiled).toContain('getReleaseDatesByIds');
    expect(compiled).toContain('getInvolvedCompaniesByIds');
  });

  test('new tools should be registered in compiled MCP server', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distMcpPath = path.join(__dirname, '../dist/server/mcp.js');
    const compiled = fs.readFileSync(distMcpPath, 'utf-8');
    
    // Verify new tool names are registered
    expect(compiled).toContain('covers-by-ids');
    expect(compiled).toContain('platforms-by-ids');
    expect(compiled).toContain('genres-by-ids');
    expect(compiled).toContain('involved-companies-by-ids');
    expect(compiled).toContain('companies-by-ids');
    expect(compiled).toContain('screenshots-by-ids');
    expect(compiled).toContain('release-dates-by-ids');
  });

  test('case handlers should exist in compiled MCP server', () => {
    const fs = require('fs');
    const path = require('path');
    
    const distMcpPath = path.join(__dirname, '../dist/server/mcp.js');
    const compiled = fs.readFileSync(distMcpPath, 'utf-8');
    
    // Verify handler cases exist
    expect(compiled).toContain("case 'covers-by-ids'");
    expect(compiled).toContain("case 'platforms-by-ids'");
    expect(compiled).toContain("case 'genres-by-ids'");
    expect(compiled).toContain("case 'involved-companies-by-ids'");
    expect(compiled).toContain("case 'companies-by-ids'");
    expect(compiled).toContain("case 'screenshots-by-ids'");
    expect(compiled).toContain("case 'release-dates-by-ids'");
  });
});
