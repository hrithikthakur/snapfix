#!/bin/bash

# Build script that automatically loads .env and builds with notarization
# Usage: ./scripts/build-with-notarization.sh [arch]
# arch can be: arm64, x64, or both (default)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Load .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "📋 Loading credentials from .env file..."
    set -a  # automatically export all variables
    source "$PROJECT_DIR/.env"
    set +a
    echo "✅ Credentials loaded"
else
    echo "⚠️  Warning: .env file not found!"
    echo "   Create .env file with:"
    echo "   APPLE_ID=your@email.com"
    echo "   APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx"
    echo "   APPLE_TEAM_ID=68G57WN635"
    echo ""
    echo "   Continuing build anyway (notarization will be skipped if credentials missing)..."
fi

# Check if credentials are set
if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
    echo "⚠️  Warning: APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD not set!"
    echo "   Notarization will be skipped during build."
    echo "   Set these in .env file or export them before running this script."
    echo ""
fi

ARCH="${1:-both}"

echo ""
echo "🔨 Building FlickFix..."
echo "   Architecture: $ARCH"
echo ""

# Build based on architecture
if [ "$ARCH" = "arm64" ]; then
    electron-builder --mac --arm64
elif [ "$ARCH" = "x64" ]; then
    electron-builder --mac --x64
else
    npm run build:direct
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "Build outputs:"
echo "  - dist/FlickFix-*.dmg"
echo "  - dist/mac*/FlickFix.app"
echo ""
echo "To verify notarization:"
echo "  spctl --assess --verbose --type install dist/FlickFix-*.dmg"

