# Runbook

<!-- AUTO-GENERATED: This file is generated from project configuration. Manual sections preserved below. -->

## Deployment Procedures

### GitHub Pages Deployment (Production)

The study guide is deployed to GitHub Pages from the `docs/` directory.

**Standard Deployment:**
```bash
# 1. Ensure all changes are committed
git status

# 2. Run full build and deployment preparation
pnpm run deploy

# 3. Commit the deployment artifacts
git add docs/
git commit -am "Deploy update"

# 4. Push to trigger GitHub Pages deployment
git push origin main
```

**What `pnpm run deploy` does:**
1. Builds web app for production
2. Copies assets to `docs/assets/`
3. Copies `data.js`, `index.html`, `manifest.json`, `sw.js` to `docs/`
4. Copies practice exam and cheat sheet HTML to `docs/`
5. Outputs commit command for manual execution

### Local Development Deployment

**Web App Dev Server:**
```bash
pnpm run build:web:dev
# Opens at http://localhost:5173 (or WEB_BASE_URL from .env)
```

**PDF Generation:**
```bash
pnpm run build:pdf
# Output: build/study-guide.pdf
```

**Mobile App Data Sync:**
```bash
pnpm run sync:mobile
# Copies data to mobile/assets/data/
```

## Health Check Endpoints

### Web App Health Checks

| Check | URL | Expected Response |
|-------|-----|-------------------|
| Main Page | `https://yourusername.github.io/nypd-sergeant-study-guide/` | HTTP 200, loads study guide |
| Service Worker | `https://yourusername.github.io/nypd-sergeant-study-guide/sw.js` | HTTP 200, valid JS |
| Manifest | `https://yourusername.github.io/nypd-sergeant-study-guide/manifest.json` | HTTP 200, valid JSON |
| Data File | `https://yourusername.github.io/nypd-sergeant-study-guide/data.js` | HTTP 200, valid JS module |
| Offline Support | Visit page, disconnect network, refresh | App loads from cache |

### Build Health Checks

```bash
# Verify build output exists
ls -la docs/

# Check key files
ls -la docs/data.js docs/index.html docs/sw.js docs/manifest.json
ls -la docs/assets/
ls -la docs/master-practice-exam.html docs/quick-reference-cheat-sheet.html

# Validate data.js structure
node -e "const data = require('./docs/data.mjs'); console.log('Chapters:', Object.keys(data.chapters).length);"
```

## Monitoring

### GitHub Pages Status
- Check [GitHub Pages settings](https://github.com/yourusername/nypd-sergeant-study-guide/settings/pages) for deployment status
- Monitor Actions tab for build workflow runs

### Content Validation
Run periodically to ensure data integrity:
```bash
pnpm run test
pnpm run test:coverage
```

## Common Issues and Fixes

### Issue: Build Fails with TypeScript Errors

**Symptoms:** `pnpm run build` or `pnpm run typecheck` fails with type errors

**Fix:**
```bash
# Check specific errors
pnpm run typecheck

# Fix type errors in source files
# Common issues: missing imports, type mismatches, null checks
```

### Issue: PDF Generation Fails

**Symptoms:** `pnpm run build:pdf` fails

**Fix:**
```bash
# Ensure Pandoc is installed
pandoc --version

# Ensure LaTeX is available (for PDF)
# macOS: brew install --cask mactex
# Linux: apt-get install texlive-full

# Check for markdown syntax errors in chapters
pnpm run test
```

### Issue: Web App Shows Stale Data

**Symptoms:** Deployed app shows old content

**Fix:**
```bash
# Clear browser cache and service worker
# In DevTools: Application > Storage > Clear site data

# Or force fresh deploy
pnpm run clean
pnpm run deploy
git add docs/
git commit -am "Force redeploy"
git push
```

### Issue: Mobile App Data Out of Sync

**Symptoms:** Flutter app shows old study data

**Fix:**
```bash
pnpm run sync:mobile
# Verify mobile/assets/data/study_data.json is updated
```

### Issue: Tests Fail on CI but Pass Locally

**Symptoms:** GitHub Actions fail, local tests pass

**Fix:**
```bash
# Ensure Node version matches CI (check .github/workflows/)
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check for OS-specific path issues in tests
```

### Issue: Service Worker Not Updating

**Symptoms:** Users see old version despite new deployment

**Fix:**
```bash
# Version bump in sw.js (manual or via build script)
# Check sw.js has updated cache version
# Users may need to hard refresh (Cmd+Shift+R)
```

## Rollback Procedures

### Quick Rollback (Last Known Good Deploy)

```bash
# 1. Find last good commit
git log --oneline -10

# 2. Revert to that commit
git revert <bad-commit-hash>

# 3. Rebuild and deploy
pnpm run deploy
git add docs/
git commit -am "Rollback to <good-commit>"
git push
```

### Full Rollback (Reset to Previous Deploy)

```bash
# 1. Find the deploy commit before the bad one
git log --oneline --grep="Deploy" -5

# 2. Reset docs/ to that commit
git checkout <good-deploy-commit> -- docs/

# 3. Commit and push
git add docs/
git commit -am "Rollback docs to <good-deploy-commit>"
git push
```

### Emergency: Disable GitHub Pages

If a bad deploy breaks the site entirely:
1. Go to Repository Settings > Pages
2. Change source to "None" (disables Pages)
3. Fix the issue locally
4. Re-enable Pages with correct branch/folder

## Alerting and Escalation

### Automated Checks

| Check | Frequency | Alert On |
|-------|-----------|----------|
| GitHub Pages deployment | On push | Failure |
| Build workflow | On push | Failure |
| Content validation | Manual | Errors |

### Manual Verification Schedule

- **After each deploy**: Verify live site loads, check 3-4 chapters
- **Weekly**: Run full test suite (`pnpm run test:all`)
- **Monthly**: Run coverage audit (`pnpm run test:coverage`)
- **Before exam season**: Full content review against source PDFs

### Escalation Contacts

- **Primary**: Project maintainer (GitHub issues)
- **Content issues**: Reference source PDFs in `~/Documents/NYPD PG/`
- **Technical issues**: Check GitHub Actions logs, browser console

## Maintenance Tasks

### Update Source Material

When new Patrol Guide versions are released:
1. Place new PDFs in `~/Documents/NYPD PG/`
2. Update CLAUDE.md source material table
3. Re-ingest affected chapters
4. Run full build and test cycle
5. Deploy updated guide

### Dependency Updates

```bash
# Check for updates
pnpm outdated

# Update dependencies (test thoroughly!)
pnpm update

# Run full test suite after updates
pnpm run test:all
```

### Cleanup

```bash
# Remove build artifacts
pnpm run clean

# Remove node_modules and reinstall (nuclear option)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Quick Reference

| Task | Command |
|------|---------|
| Full production deploy | `pnpm run deploy && git add docs/ && git commit -am "Deploy" && git push` |
| Dev server | `pnpm run build:web:dev` |
| PDF build | `pnpm run build:pdf` |
| Run all tests | `pnpm run test:all` |
| Lint & format | `pnpm run lint` |
| Type check | `pnpm run typecheck` |
| Sync mobile data | `pnpm run sync:mobile` |
| Emergency rollback | `git checkout <good-commit> -- docs/ && git add docs/ && git commit -am "Rollback" && git push` |