#!/bin/bash

# Script to check if .env file is working correctly
# Usage: ./scripts/check-env.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "🔍 Checking .env file setup..."
echo ""

# Check if .env file exists
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "✅ .env file exists: $PROJECT_DIR/.env"
    echo ""
    echo "📄 Contents (masked):"
    while IFS= read -r line; do
        if [[ "$line" =~ ^[[:space:]]*# ]] || [ -z "$line" ]; then
            echo "   $line"
        elif [[ "$line" =~ APPLE_APP_SPECIFIC_PASSWORD= ]]; then
            # Mask the password
            echo "   APPLE_APP_SPECIFIC_PASSWORD=****-****-****-****"
        else
            echo "   $line"
        fi
    done < "$PROJECT_DIR/.env"
    echo ""
else
    echo "❌ .env file NOT found at: $PROJECT_DIR/.env"
    echo ""
    echo "Create it with:"
    echo "  APPLE_ID=your@email.com"
    echo "  APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx"
    echo "  APPLE_TEAM_ID=68G57WN635"
    exit 1
fi

# Load .env file
echo "📋 Loading .env file..."
set -a  # automatically export all variables
source "$PROJECT_DIR/.env"
set +a
echo "✅ .env file loaded"
echo ""

# Check each variable
echo "🔍 Checking environment variables:"
echo ""

MISSING_VARS=0

if [ -z "$APPLE_ID" ]; then
    echo "❌ APPLE_ID: NOT SET"
    MISSING_VARS=1
else
    echo "✅ APPLE_ID: $APPLE_ID"
fi

if [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
    echo "❌ APPLE_APP_SPECIFIC_PASSWORD: NOT SET"
    MISSING_VARS=1
else
    # Show masked password
    PASSWORD_LENGTH=${#APPLE_APP_SPECIFIC_PASSWORD}
    MASKED_PASSWORD=""
    for ((i=0; i<PASSWORD_LENGTH; i++)); do
        if [[ ${APPLE_APP_SPECIFIC_PASSWORD:$i:1} == "-" ]]; then
            MASKED_PASSWORD+="-"
        else
            MASKED_PASSWORD+="*"
        fi
    done
    echo "✅ APPLE_APP_SPECIFIC_PASSWORD: $MASKED_PASSWORD (length: $PASSWORD_LENGTH)"
fi

if [ -z "$APPLE_TEAM_ID" ]; then
    echo "⚠️  APPLE_TEAM_ID: NOT SET (will use default: 68G57WN635)"
else
    echo "✅ APPLE_TEAM_ID: $APPLE_TEAM_ID"
fi

echo ""

# Summary
if [ $MISSING_VARS -eq 0 ]; then
    echo "✅ All required credentials are set!"
    echo ""
    echo "You can now build with notarization:"
    echo "  ./scripts/build-with-notarization.sh"
    echo "  or"
    echo "  npm run build:notarized"
    exit 0
else
    echo "❌ Some required credentials are missing!"
    echo ""
    echo "Please update your .env file with the missing variables."
    exit 1
fi

