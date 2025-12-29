#!/bin/bash

# Quick Firebase Setup Script

echo "🔧 Firebase Setup Helper"
echo ""

# Check if logged in
echo "1. Checking Firebase login status..."
firebase login:list

echo ""
echo "2. If not logged in, run: firebase login"
echo ""

# List projects
echo "3. Listing your Firebase projects..."
firebase projects:list

echo ""
echo "4. To use an existing project, run:"
echo "   firebase use <project-id>"
echo ""
echo "5. To create a new project, run:"
echo "   firebase projects:create flickfix-app"
echo "   firebase use flickfix-app"
echo ""
echo "6. Then deploy with:"
echo "   firebase deploy --only hosting"

