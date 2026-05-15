# GitHub Pages Deployment

## Setup Instructions

1. Go to **Settings** → **Pages** in your GitHub repository
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. The workflow will automatically deploy on every push to `main`

## Manual Deployment

To trigger a manual deployment:
1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## Deployment URL

After successful deployment, your site will be available at:
```
https://<github-username>.github.io/nypd-sergeant-study-guide/
```

## Troubleshooting

### 404 Error
- Ensure GitHub Pages is enabled in Settings → Pages
- Check that the workflow completed successfully
- Wait 1-2 minutes for CDN propagation

### Build Failures
- Check the Actions tab for error details
- Run `pnpm run build` locally to reproduce
- Verify all dependencies are installed

### Asset Loading Issues
- The app uses relative paths, so it should work in any subdirectory
- Clear browser cache if old assets are cached
