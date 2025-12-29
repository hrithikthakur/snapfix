#!/bin/bash

# FlickFix Landing Page Deployment Script
# Make sure you're logged in with: firebase login

echo "🚀 Deploying FlickFix landing page..."

# Navigate to landing directory
cd "$(dirname "$0")"

# Check if logged in
if ! firebase login:list | grep -q "@"; then
    echo "❌ Please login first: firebase login"
    echo "   Make sure to use: northernlights271@gmail.com"
    exit 1
fi

# Create project (if it doesn't exist)
echo "📦 Creating Firebase project..."
firebase projects:create flickfix --display-name "FlickFix" 2>/dev/null || echo "Project may already exist, continuing..."

# Use the project
echo "🔧 Setting up project..."
firebase use flickfix

# Initialize hosting if needed
if [ ! -f "firebase.json" ]; then
    echo "⚙️  Initializing hosting..."
    firebase init hosting --project flickfix <<EOF
.
n
EOF
fi

# Deploy
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌍 Your site should be live at: https://flickfix.web.app"

