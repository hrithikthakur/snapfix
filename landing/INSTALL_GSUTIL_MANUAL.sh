#!/bin/bash

# Manual installation of Google Cloud SDK (bypasses Homebrew Python issue)

echo "Installing Google Cloud SDK manually..."

# Download and install
curl https://sdk.cloud.google.com | bash

# Add to PATH (for current session)
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Initialize
echo ""
echo "Initializing Google Cloud SDK..."
gcloud init

echo ""
echo "Installation complete!"
echo ""
echo "To use gsutil, run:"
echo "  source ~/google-cloud-sdk/path.bash.inc  # for bash"
echo "  source ~/google-cloud-sdk/path.zsh.inc   # for zsh"
echo ""
echo "Or add to your ~/.zshrc:"
echo "  source ~/google-cloud-sdk/path.zsh.inc"



