# Fix gsutil Python Issue

## Problem
Google Cloud SDK installation failed because it can't find Python 3.13.

## Solution

### Option 1: Install Python 3.13 (Recommended)

```bash
brew install python@3.13
```

Then try installing Google Cloud SDK again:
```bash
brew install --cask google-cloud-sdk
```

### Option 2: Use Existing Python

If you have Python 3.10 or 3.11 installed, you can tell gcloud to use it:

```bash
# Find your Python
which python3
python3 --version

# Set it for gcloud
export CLOUDSDK_PYTHON=$(which python3)

# Then install
brew install --cask google-cloud-sdk
```

### Option 3: Install Python 3.12 (Stable)

```bash
brew install python@3.12
export CLOUDSDK_PYTHON=/opt/homebrew/opt/python@3.12/bin/python3
brew install --cask google-cloud-sdk
```

### Option 4: Manual Installation (Bypass Homebrew)

If Homebrew keeps failing, install directly:

```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart shell
exec -l $SHELL

# Initialize
gcloud init
```

## After Installation

1. **Restart terminal** or run:
   ```bash
   exec -l $SHELL
   ```

2. **Authenticate:**
   ```bash
   gcloud auth login
   ```

3. **Verify:**
   ```bash
   gsutil --version
   ```

## Quick Fix

Try this first:
```bash
brew install python@3.13
brew install --cask google-cloud-sdk
```



