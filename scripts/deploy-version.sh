#!/bin/bash
# Complete deployment script: Upload DMG files to GCS and verify landing page links
# Usage: ./scripts/deploy-version.sh [version]
# version defaults to 0.1.1

set -e

VERSION="${1:-0.1.1}"
BUCKET="gs://flickfix-downloads"
BASE_URL="https://storage.googleapis.com/flickfix-downloads"

echo "🚀 Deploying FlickFix v${VERSION} to Google Cloud Storage..."
echo ""

# Check if files exist
ARM64_DMG="dist/FlickFix-${VERSION}-arm64.dmg"
X64_DMG="dist/FlickFix-${VERSION}-x64.dmg"

if [ ! -f "$ARM64_DMG" ]; then
    echo "❌ ARM64 DMG not found: $ARM64_DMG"
    echo ""
    echo "Available DMG files:"
    ls -lh dist/*.dmg 2>/dev/null | head -5
    exit 1
fi

if [ ! -f "$X64_DMG" ]; then
    echo "❌ x64 DMG not found: $X64_DMG"
    echo ""
    echo "Available DMG files:"
    ls -lh dist/*.dmg 2>/dev/null | head -5
    exit 1
fi

echo "📦 Files to upload:"
ls -lh "$ARM64_DMG" "$X64_DMG"
echo ""

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil not found. Please install Google Cloud SDK:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gsutil ls "${BUCKET}" &> /dev/null; then
    echo "❌ Cannot access bucket ${BUCKET}"
    echo "   Please authenticate: gcloud auth login"
    exit 1
fi

echo "☁️  Uploading to ${BUCKET}..."
echo ""

# Upload ARM64 version
echo "📤 Uploading ARM64 version..."
gsutil cp "$ARM64_DMG" "${BUCKET}/FlickFix-${VERSION}-arm64.dmg"
echo "✅ ARM64 uploaded"
echo ""

# Upload x64 version
echo "📤 Uploading x64 version..."
gsutil cp "$X64_DMG" "${BUCKET}/FlickFix-${VERSION}-x64.dmg"
echo "✅ x64 uploaded"
echo ""

# Make files publicly accessible
echo "🔓 Making files publicly accessible..."
gsutil iam ch allUsers:objectViewer "${BUCKET}" 2>/dev/null || echo "⚠️  Note: Bucket permissions may already be set"
echo ""

# Verify files are accessible
echo "🔍 Verifying uploads..."
ARM64_URL="${BASE_URL}/FlickFix-${VERSION}-arm64.dmg"
X64_URL="${BASE_URL}/FlickFix-${VERSION}-x64.dmg"

if curl -s --head --fail "${ARM64_URL}" > /dev/null 2>&1; then
    echo "✅ ARM64 file is accessible"
else
    echo "⚠️  ARM64 file may not be publicly accessible yet (may take a few seconds)"
fi

if curl -s --head --fail "${X64_URL}" > /dev/null 2>&1; then
    echo "✅ x64 file is accessible"
else
    echo "⚠️  x64 file may not be publicly accessible yet (may take a few seconds)"
fi

echo ""
echo "✅ Upload complete!"
echo ""
echo "📥 Download URLs:"
echo "ARM64: ${ARM64_URL}"
echo "x64:   ${X64_URL}"
echo ""

# Check landing page
LANDING_HTML="landing/index.html"
if [ -f "$LANDING_HTML" ]; then
    echo "🔍 Checking landing page configuration..."
    
    # Check if landing page has correct version
    if grep -q "FlickFix-${VERSION}" "$LANDING_HTML"; then
        echo "✅ Landing page already configured for v${VERSION}"
    else
        echo "⚠️  Landing page may need to be updated for v${VERSION}"
        echo "   Current version in landing page:"
        grep -o "FlickFix-[0-9.]*" "$LANDING_HTML" | head -1 || echo "   (not found)"
    fi
else
    echo "⚠️  Landing page not found at $LANDING_HTML"
fi

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify downloads work: ${ARM64_URL}"
echo "2. Deploy landing page: cd landing && firebase deploy"
echo "3. Test the download links on the live site"

