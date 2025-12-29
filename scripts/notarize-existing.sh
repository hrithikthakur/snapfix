#!/bin/bash

# Script to manually notarize existing builds
# Usage: ./scripts/notarize-existing.sh [arch]
# arch can be: arm64, x64, or both (default)

set -e

ARCH="${1:-both}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Check for credentials
if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
    echo "❌ Error: Credentials not set!"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export APPLE_ID=\"hrithikthakur17@gmail.com\""
    echo "  export APPLE_APP_SPECIFIC_PASSWORD=\"nhqi-axvq-ljxt-woym\""
    echo "  export APPLE_TEAM_ID=\"68G57WN635\"  # Optional"
    echo ""
    exit 1
fi

APPLE_TEAM_ID="${APPLE_TEAM_ID:-68G57WN635}"
APP_NAME="FlickFix.app"

notarize_app() {
    local app_path="$1"
    local arch="$2"
    
    if [ ! -d "$app_path" ]; then
        echo "⚠️  App not found: $app_path"
        return 1
    fi
    
    echo ""
    echo "📦 Notarizing $arch build..."
    echo "   App: $app_path"
    
    # Check if already notarized
    if xcrun stapler validate "$app_path" >/dev/null 2>&1; then
        echo "✅ App is already notarized and stapled!"
        return 0
    fi
    
    # Create zip for notarization
    local zip_path="${app_path%.app}.zip"
    local app_dir="$(dirname "$app_path")"
    local app_name="$(basename "$app_path")"
    
    echo "   Creating zip file..."
    cd "$app_dir"
    zip -r "$(basename "$zip_path")" "$app_name" >/dev/null
    cd "$PROJECT_DIR"
    
    echo "   Submitting to Apple for notarization..."
    echo "   (This may take 5-30 minutes...)"
    
    # Submit for notarization
    local submission_id
    submission_id=$(xcrun notarytool submit "$zip_path" \
        --apple-id "$APPLE_ID" \
        --password "$APPLE_APP_SPECIFIC_PASSWORD" \
        --team-id "$APPLE_TEAM_ID" \
        --wait \
        2>&1 | grep -i "id:" | head -1 | awk '{print $NF}' || echo "")
    
    if [ -z "$submission_id" ]; then
        echo "   Checking notarization status..."
        xcrun notarytool log "$zip_path" \
            --apple-id "$APPLE_ID" \
            --password "$APPLE_APP_SPECIFIC_PASSWORD" \
            --team-id "$APPLE_TEAM_ID" || true
    fi
    
    # Staple the notarization ticket
    echo "   Stapling notarization ticket..."
    xcrun stapler staple "$app_path"
    
    # Verify stapling
    if xcrun stapler validate "$app_path" >/dev/null 2>&1; then
        echo "✅ Successfully notarized and stapled $arch build!"
    else
        echo "⚠️  Stapling completed but validation failed. Check manually:"
        echo "   xcrun stapler validate \"$app_path\""
    fi
    
    # Clean up zip
    rm -f "$zip_path"
}

notarize_dmg() {
    local dmg_path="$1"
    local arch="$2"
    
    if [ ! -f "$dmg_path" ]; then
        echo "⚠️  DMG not found: $dmg_path"
        return 1
    fi
    
    echo ""
    echo "📦 Notarizing DMG for $arch..."
    echo "   DMG: $dmg_path"
    
    # Check if already notarized
    if spctl --assess --verbose --type install "$dmg_path" 2>&1 | grep -q "accepted"; then
        echo "✅ DMG is already notarized!"
        return 0
    fi
    
    echo "   Submitting DMG to Apple for notarization..."
    echo "   (This may take 5-30 minutes...)"
    
    # Submit DMG for notarization
    xcrun notarytool submit "$dmg_path" \
        --apple-id "$APPLE_ID" \
        --password "$APPLE_APP_SPECIFIC_PASSWORD" \
        --team-id "$APPLE_TEAM_ID" \
        --wait
    
    # Staple the notarization ticket to DMG
    echo "   Stapling notarization ticket to DMG..."
    xcrun stapler staple "$dmg_path"
    
    # Verify
    if spctl --assess --verbose --type install "$dmg_path" 2>&1 | grep -q "accepted"; then
        echo "✅ Successfully notarized DMG for $arch!"
    else
        echo "⚠️  Notarization completed but verification failed. Check manually:"
        echo "   spctl --assess --verbose --type install \"$dmg_path\""
    fi
}

# Notarize apps
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "both" ]; then
    notarize_app "dist/mac-arm64/$APP_NAME" "arm64"
fi

if [ "$ARCH" = "x64" ] || [ "$ARCH" = "both" ]; then
    notarize_app "dist/mac/$APP_NAME" "x64"
fi

# Notarize DMGs
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "both" ]; then
    notarize_dmg "dist/FlickFix-0.1.1-arm64.dmg" "arm64"
fi

if [ "$ARCH" = "x64" ] || [ "$ARCH" = "both" ]; then
    notarize_dmg "dist/FlickFix-0.1.1-x64.dmg" "x64"
fi

echo ""
echo "✅ Notarization complete!"
echo ""
echo "To verify:"
echo "  spctl --assess --verbose --type install dist/FlickFix-0.1.1-*.dmg"
echo "  xcrun stapler validate dist/mac*/\"$APP_NAME\""

