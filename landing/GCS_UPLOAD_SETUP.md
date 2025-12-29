# Google Cloud Storage Upload Setup

## Error
"Anonymous caller does not have storage.objects.create access"

This means you need to authenticate with Google Cloud.

## Solution

### Step 1: Authenticate
```bash
gcloud auth login
```

This will open a browser for you to sign in with your Google account.

### Step 2: Set Project (if needed)
```bash
# List your projects
gcloud projects list

# Set the project (if you have one)
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Create Bucket (if it doesn't exist)
```bash
# Create bucket
gsutil mb gs://flickfix-downloads

# Or if bucket exists, just verify
gsutil ls gs://flickfix-downloads
```

### Step 4: Upload DMG
```bash
gsutil cp landing/downloads/flickfix-0.1.0-arm64.dmg gs://flickfix-downloads/
```

### Step 5: Make Public
```bash
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

## Quick Commands

```bash
# 1. Authenticate
gcloud auth login

# 2. Create bucket (if needed)
gsutil mb gs://flickfix-downloads

# 3. Upload
gsutil cp landing/downloads/flickfix-0.1.0-arm64.dmg gs://flickfix-downloads/

# 4. Make public
gsutil iam ch allUsers:objectViewer gs://flickfix-downloads
```

## Troubleshooting

### "Project not found"
- Create a project in Google Cloud Console
- Or use an existing project: `gcloud config set project PROJECT_ID`

### "Bucket doesn't exist"
- Create it: `gsutil mb gs://flickfix-downloads`
- Bucket names must be globally unique

### "Permission denied"
- Make sure you're authenticated: `gcloud auth login`
- Check you have access to the project/bucket



