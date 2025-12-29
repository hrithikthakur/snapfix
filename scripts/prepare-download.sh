#!/bin/bash
# Script to build and prepare DMG files for website download

set -e

VERSION="0.1.1"
BUCKET="gs://flickfix-downloads"

echo "🚀 Preparing FlickFix v${VERSION} for download..."

# Step 1: Build DMG files
echo ""
echo "📦 Building DMG files..."
npm run build:direct

# Check if files were created
ARM64_DMG="dist/flickfix-${VERSION}-arm64.dmg"
X64_DMG="dist/flickfix-${VERSION}-x64.dmg"

if [ ! -f "$ARM64_DMG" ]; then
    echo "⚠️  ARM64 DMG not found. Trying alternative name..."
    ARM64_DMG="dist/flickfix-${VERSION}-arm64.dmg"
    # Check if old naming convention exists
    if [ ! -f "$ARM64_DMG" ]; then
        ARM64_DMG="dist/mac-arm64/flickfix-${VERSION}-arm64.dmg"
    fi
fi

if [ ! -f "$X64_DMG" ]; then
    echo "⚠️  x64 DMG not found. Checking for Intel version..."
    X64_DMG="dist/flickfix-${VERSION}.dmg"
    if [ ! -f "$X64_DMG" ]; then
        echo "⚠️  Intel version not built (this is OK if building on Apple Silicon)"
    fi
fi

echo ""
echo "✅ Build complete!"
echo ""

# Step 2: List created files
echo "📋 Created files:"
ls -lh dist/*.dmg 2>/dev/null || echo "No DMG files found in dist/"

echo ""
read -p "Upload to Google Cloud Storage? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "☁️  Uploading to Google Cloud Storage..."
    
    # Upload ARM64 version
    if [ -f "$ARM64_DMG" ]; then
        echo "Uploading ARM64 version..."
        gsutil cp "$ARM64_DMG" "${BUCKET}/"
        echo "✅ ARM64 uploaded"
    else
        echo "⚠️  ARM64 DMG not found, skipping..."
    fi
    
    # Upload x64 version
    if [ -f "$X64_DMG" ]; then
        echo "Uploading x64 version..."
        gsutil cp "$X64_DMG" "${BUCKET}/"
        echo "✅ x64 uploaded"
    else
        echo "⚠️  x64 DMG not found, skipping..."
    fi
    
    # Make files publicly accessible
    echo ""
    echo "🔓 Making files publicly accessible..."
    gsutil iam ch allUsers:objectViewer "${BUCKET}"
    
    echo ""
    echo "✅ Upload complete!"
    echo ""
    echo "📥 Download URLs:"
    if [ -f "$ARM64_DMG" ]; then
        echo "ARM64: https://storage.googleapis.com/flickfix-downloads/flickfix-${VERSION}-arm64.dmg"
    fi
    if [ -f "$X64_DMG" ]; then
        echo "x64:   https://storage.googleapis.com/flickfix-downloads/flickfix-${VERSION}-x64.dmg"
    fi
else
    echo "⏭️  Skipping upload. Files are ready in dist/ folder."
    echo ""
    echo "To upload manually:"
    echo "  gsutil cp dist/flickfix-${VERSION}-*.dmg ${BUCKET}/"
    echo "  gsutil iam ch allUsers:objectViewer ${BUCKET}"
fi

echo ""
echo "✨ Done!"




