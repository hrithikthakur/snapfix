# Installing gsutil (Google Cloud SDK)

## Method 1: Using Homebrew (Easiest)

```bash
# Install Google Cloud SDK
brew install --cask google-cloud-sdk

# Initialize gcloud
gcloud init

# Or just authenticate
gcloud auth login
```

## Method 2: Using the Official Installer

1. **Download the installer:**
   ```bash
   curl https://sdk.cloud.google.com | bash
   ```

2. **Restart your shell or run:**
   ```bash
   exec -l $SHELL
   ```

3. **Initialize:**
   ```bash
   gcloud init
   ```

## Method 3: Using pip (if you have Python)

```bash
pip install gsutil
```

## After Installation

### Authenticate:
```bash
gcloud auth login
```

### Set up a project (optional):
```bash
gcloud config set project YOUR_PROJECT_ID
```

### Verify installation:
```bash
gsutil --version
```

## Quick Setup for flickfix

Once installed, you can upload your DMG:

```bash
# Create bucket (if it doesn't exist)
gsutil mb gs://flickfix-downloads

# Upload DMG
gsutil cp landing/downloads/flickfix-0.1.0-arm64.dmg gs://flickfix-downloads/

# Make it publicly accessible
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

## Troubleshooting

### "Command not found"
- Make sure you restarted your terminal after installation
- Or run: `exec -l $SHELL`

### "Permission denied"
- Run: `gcloud auth login`
- Make sure you have access to the Google Cloud project

### "Bucket doesn't exist"
- Create it first: `gsutil mb gs://flickfix-downloads`
- Or use an existing bucket



