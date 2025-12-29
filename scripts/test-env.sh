#!/bin/bash

# Simple test to check if .env variables are accessible
# Usage: source .env && ./scripts/test-env.sh

echo "Testing environment variables..."
echo ""

if [ -z "$APPLE_ID" ]; then
    echo "❌ APPLE_ID is NOT set"
else
    echo "✅ APPLE_ID is set: $APPLE_ID"
fi

if [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
    echo "❌ APPLE_APP_SPECIFIC_PASSWORD is NOT set"
else
    echo "✅ APPLE_APP_SPECIFIC_PASSWORD is set (length: ${#APPLE_APP_SPECIFIC_PASSWORD})"
fi

if [ -z "$APPLE_TEAM_ID" ]; then
    echo "⚠️  APPLE_TEAM_ID is NOT set (will use default)"
else
    echo "✅ APPLE_TEAM_ID is set: $APPLE_TEAM_ID"
fi

echo ""
echo "To load .env file, run:"
echo "  source .env"
echo ""
echo "Then check again with:"
echo "  ./scripts/test-env.sh"

