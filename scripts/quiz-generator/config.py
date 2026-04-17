"""Path constants derived from project root."""

from pathlib import Path

# Project root is 3 levels up from this file:
# scripts/quiz-generator/config.py -> scripts/ -> project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CHAPTERS_DIR = PROJECT_ROOT / "chapters"
ASSETS_DIR = PROJECT_ROOT / "assets"
BUILD_DIR = PROJECT_ROOT / "build"
OUTPUT_DIR = PROJECT_ROOT / "build" / "generated-questions"