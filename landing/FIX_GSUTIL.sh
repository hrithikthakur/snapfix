#!/bin/bash

# Fix Google Cloud SDK Python path issue

echo "Setting Python path for Google Cloud SDK..."

# Set the correct Python path
export CLOUDSDK_PYTHON=$(which python3)

echo "Using Python: $CLOUDSDK_PYTHON"
echo "Python version: $(python3 --version)"

# Try installing again
echo ""
echo "Now try installing again:"
echo "brew install --cask google-cloud-sdk"



