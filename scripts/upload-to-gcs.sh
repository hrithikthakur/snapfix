#!/bin/bash
# Upload FlickFix DMG files to Google Cloud Storage

set -e

VERSION="0.1.1"
BUCKET="gs://flickfix-downloads"

echo "🚀 Uploading FlickFix v${VERSION} to Google Cloud Storage..."

# Check if files exist
ARM64_DMG="dist/FlickFix-${VERSION}-arm64.dmg"
X64_DMG="dist/FlickFix-${VERSION}-x64.dmg"

if [ ! -f "$ARM64_DMG" ]; then
    echo "❌ ARM64 DMG not found: $ARM64_DMG"
    exit 1
fi

if [ ! -f "$X64_DMG" ]; then
    echo "❌ x64 DMG not found: $X64_DMG"
    exit 1
fi

echo ""
echo "📦 Files to upload:"
ls -lh "$ARM64_DMG" "$X64_DMG"

echo ""
echo "☁️  Uploading to ${BUCKET}..."

# Upload ARM64 version
echo "Uploading ARM64 version..."
gsutil cp "$ARM64_DMG" "${BUCKET}/"
echo "✅ ARM64 uploaded"

# Upload x64 version
echo "Uploading x64 version..."
gsutil cp "$X64_DMG" "${BUCKET}/"
echo "✅ x64 uploaded"

# Make files publicly accessible
echo ""
echo "🔓 Making files publicly accessible..."
gsutil iam ch allUsers:objectViewer "${BUCKET}"

echo ""
echo "✅ Upload complete!"
echo ""
echo "📥 Download URLs:"
echo "ARM64: https://storage.googleapis.com/flickfix-downloads/FlickFix-${VERSION}-arm64.dmg"
echo "x64:   https://storage.googleapis.com/flickfix-downloads/FlickFix-${VERSION}-x64.dmg"
echo ""
echo "✨ Done!"

