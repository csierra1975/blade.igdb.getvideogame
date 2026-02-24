# Contributing to IGDB MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow all guidelines in this document

## Getting Started

### 1. Fork and Clone

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/igdb-mcp-server.git
cd igdb-mcp-server

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/igdb-mcp-server.git
```

### 2. Create Feature Branch

```bash
# Update local main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Setup Development Environment

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
# Optional: MCP_API_KEY (leave empty for local dev)
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

### Building

```bash
# Compile TypeScript
npm run build

# Check for compilation errors
npm run build
```

### Development Mode

```bash
# Run with hot reload (STDIO)
npm run dev

# Run with hot reload (Express)
npm run dev:express
```

### Linting & Formatting

```bash
# The project uses TypeScript strict mode
# Check for type errors
npm run build

# Format with Prettier (recommended)
npm install --save-dev prettier
npx prettier --write "src/**/*.ts" "tests/**/*.ts"
```

## Making Changes

### Code Style

- **TypeScript**: Use strict mode (already configured)
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/types
- **Comments**: Add JSDoc comments for public APIs
- **Error Handling**: Always handle Promise rejections

### Example Code Pattern

```typescript
/**
 * Brief description of what this does
 * @param param1 Description of parameter
 * @returns Description of return value
 */
export async function doSomething(param1: string): Promise<Result> {
  try {
    console.log(`[ServiceName] Starting operation with ${param1}`);
    // Implementation
    return result;
  } catch (error) {
    console.error(`[ServiceName] Error in doSomething:`, error);
    throw error;
  }
}
```

### Adding Tests

For any new feature, add tests in `tests/`:

```typescript
describe('MyNewService', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Logging

Use the existing console logging pattern:

```typescript
console.log('[ComponentName] Message'); // Info
console.error('[ComponentName] Error message'); // Error
```

## Committing Changes

### Commit Message Format

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Examples**:
```bash
git commit -m "feat(tools): add new search-games endpoint"
git commit -m "fix(auth): handle token expiration correctly"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(igdb): add tests for rate limiter"
git commit -m "refactor(services): extract common error handling"
```

### Pushing Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

## Submitting Pull Request

### Before Creating PR

- [ ] Tests pass: `npm test`
- [ ] Code compiles: `npm run build`
- [ ] No TypeScript errors
- [ ] Updated README if needed
- [ ] Added tests for new features
- [ ] Commits follow conventional format

### Creating PR

1. Go to GitHub repository
2. Click **Pull Requests** → **New Pull Request**
3. Select `base: main` and `compare: your-feature-branch`
4. Fill in PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Related Issues
Closes #123

## Testing
Describe how you tested this

## Checklist
- [ ] Tests pass
- [ ] Code builds
- [ ] Documentation updated
- [ ] No breaking changes
```

### PR Review Process

- At least one review required
- Address feedback and push new commits
- Rebase if needed: `git rebase upstream/main`
- Once approved, maintainers will merge

## Types of Contributions

### Bug Reports

Create an issue with:
- **Title**: Clear, descriptive
- **Description**: What happened vs expected
- **Steps to reproduce**: How to recreate
- **Environment**: Node version, OS, etc.

### Feature Requests

Create an issue with:
- **Title**: What feature
- **Use case**: Why needed
- **Proposed solution**: How it should work
- **Alternatives**: Other solutions considered

### Documentation

- Update README.md for usage changes
- Add comments for complex logic
- Update GITHUB_SETUP.md if repo structure changes
- Fix typos and clarify unclear sections

### Tests

- Add tests for bug fixes
- Increase test coverage
- Test edge cases and error conditions

## Project Structure

```
api/
└── index.ts              # Vercel serverless entry point

src/
├── index.ts              # STDIO entry point
├── server/
│   └── mcp.ts           # MCP core (tools registration)
├── services/
│   ├── auth.ts          # Twitch OAuth2
│   ├── igdb.ts          # IGDB API calls
│   └── rateLimit.ts     # Rate limiting
├── transports/
│   └── express.ts       # HTTP transport
└── types/
    └── igdb.ts          # TypeScript definitions

tests/
├── apiAuth.test.ts      # API key middleware tests
├── auth.test.ts
├── igdb.test.ts
└── rateLimit.test.ts
```

## Adding New Tools

To add a new MCP tool:

1. Add service method in `src/services/igdb.ts`
2. Add tool registration in `src/server/mcp.ts`
3. Add tests in `tests/igdb.test.ts`
4. Update README.md with tool documentation
5. Commit with message: `feat(tools): add new-tool-name`

## Performance Considerations

- Respect IGDB API rate limits
- Cache tokens appropriately
- Avoid unnecessary API calls
- Test with large result sets

## Security

- Never commit `.env` with real credentials
- Validate all inputs
- Use HTTPS for API calls (already done)
- Set `MCP_API_KEY` in Vercel environment variables to protect the remote `/mcp` endpoint
- Report security issues privately

## Questions?

- Create a GitHub Discussion
- Check existing issues
- Review project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
