# Environment Variables

<!-- AUTO-GENERATED: This file is generated from .env.example. Do not edit manually. -->

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATA_VERSION` | No | Data version - auto-generated from git commit if not set | `20260513` |
| `WEB_BASE_URL` | No | Web app base URL (for local dev vs production) | `http://localhost:5173` |
| `MOBILE_ASSET_PATH` | No | Mobile asset path (where Flutter app expects data.json) | `mobile/assets/data/` |
| `OUTPUT_DIR` | No | Build output directory | `docs` |
| `PROJECT_ROOT` | No | Project root (for core package builds) | `.` |

## Usage

These environment variables are used by build scripts and can be set in your shell or in a `.env` file at the project root.

```bash
# Example .env file
DATA_VERSION=20260610
WEB_BASE_URL=https://yourusername.github.io/nypd-sergeant-study-guide
MOBILE_ASSET_PATH=mobile/assets/data/
OUTPUT_DIR=docs
PROJECT_ROOT=.
```

## Notes

- `DATA_VERSION` is automatically set to the current git commit hash during builds if not explicitly provided
- `WEB_BASE_URL` should match your GitHub Pages URL for production deployments
- `MOBILE_ASSET_PATH` is used by the Flutter mobile app build process
- `OUTPUT_DIR` controls where the GitHub Pages deployment files are written (default: `docs/`)