# IGDB MCP Server - GitHub Setup Guide

## Creating Your GitHub Repository

This guide helps you create a private GitHub repository for this project and push the code.

### Prerequisites

- GitHub account (free or paid)
- Git installed locally
- SSH key configured with GitHub (recommended) or GitHub CLI token

### Step 1: Create a Public Repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click **+** (top right) → **New repository**
3. Enter repository name: `blade.igdb.getvideogame`
4. Add description: `MCP Server for IGDB API integration with Node.js and TypeScript`
5. Select **Public** visibility
6. **DO NOT** initialize with README (we already have one)
7. Click **Create repository**

### Step 2: Add Remote Origin

Copy the HTTPS or SSH URL from your GitHub repo, then run:

```bash
cd "d:\DESARROLLO\APLICACIONES AI\IGDB Videojuegos"

# Using HTTPS (recommended for simplicity)
git remote add origin https://github.com/csierra1975/blade.igdb.getvideogame.git
# OR if using SSH:
# git remote add origin git@github.com:csierra1975/blade.igdb.getvideogame.git
```

### Step 3: Rename Branch (if needed)

If your default branch is `main` instead of `master`:

```bash
git branch -M main
```

### Step 4: Push to GitHub

```bash
git push -u origin master
# OR if renamed:
# git push -u origin main
```

### Step 5: Configure GitHub Repository Settings

1. Go to **Settings** → **Collaborators** (add team members if needed)
2. Go to **Settings** → **Secrets and variables** → **Actions** (if using CI/CD later)
3. Go to **Settings** → **Branches** (optionally set branch protection rules)

## Next Steps

### Development Workflow

1. Create feature branches for new features:
```bash
git checkout -b feature/new-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: Add new feature"
```

3. Push to GitHub:
```bash
git push origin feature/new-feature
```

4. Create a Pull Request on GitHub

### Adding Collaborators

1. Go to repository **Settings** → **Collaborators and teams**
2. Click **Add people**
3. Enter GitHub username
4. Select permission level (Maintain for trusted collaborators)

### Setting Up .env for Team

**IMPORTANT**: Never commit `.env` file with real credentials!

Each team member should:

1. Copy `.env.example` to `.env`
2. Fill in their own Twitch credentials
3. Keep `.env` in `.gitignore` (already configured)

## Troubleshooting

### "Permission denied (publickey)" Error

If using SSH and getting permission denied:

```bash
# Test SSH connection
ssh -T git@github.com

# If fails, generate new SSH key (follow GitHub guide)
# Then add it to GitHub Settings → SSH and GPG keys
```

### Repository Already Exists Error

If you get "Repository exists" error:

```bash
# Remove the remote
git remote remove origin

# Add the correct URL
git remote add origin <correct-url>

# Then push
git push -u origin master
```

### Large Files Warning

If npm packages are very large, consider:

```bash
# Check file sizes
git ls-files -s | sort -k4 -n -r | head -20

# If needed, add to .gitignore and commit:
# node_modules/
# dist/
```

These are already in `.gitignore`.

## GitHub Features to Use

### Issues
- Track bugs, features, and tasks
- Use labels: `bug`, `feature`, `documentation`, `help-wanted`

### Discussions
- For questions about the project
- Share ideas and get feedback

### Wiki
- Document setup and usage for your team
- Add troubleshooting guides

### Actions (CI/CD - Optional)

Create `.github/workflows/test.yml` for automated testing:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
```

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` with real credentials
   - Use GitHub Secrets for CI/CD
   - Rotate Twitch credentials if leaked

2. **Branch Protection**
   - Require pull request reviews
   - Require status checks to pass
   - Dismiss stale reviews

3. **Dependabot**
   - Enable security updates in Settings
   - Automatically update vulnerable dependencies

## Support

If you need help with GitHub:
- [GitHub Help Documentation](https://docs.github.com)
- [GitHub Getting Started](https://docs.github.com/en/get-started)
- [GitHub CLI](https://cli.github.com/)

---

Your repository is now set up and ready for development! 🚀
