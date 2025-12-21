# Fix Google Cloud Storage Billing Issue

## Error
"403 The billing account for the owning project is disabled"

## Solution

Google Cloud Storage requires billing to be enabled, even for free tier usage. You won't be charged for small amounts of storage.

### Option 1: Enable Billing (Recommended)

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/billing

2. **Link a billing account:**
   - Click "Link a billing account"
   - Add a payment method (credit card)
   - **Note:** You won't be charged for free tier usage (5GB storage, 1GB egress/month)

3. **Set billing for your project:**
   - Go to https://console.cloud.google.com/billing/projects
   - Select your project
   - Link it to your billing account

4. **Try creating bucket again:**
   ```bash
   gsutil mb gs://snapfix-downloads
   ```

### Option 2: Use Alternative Hosting (No Billing Required)

Since you're hitting multiple issues with Google services, consider these alternatives:

#### Netlify (Easiest - No Billing)
1. Go to https://app.netlify.com/
2. Drag and drop your `landing` folder
3. DMG files work fine on Netlify
4. Free, no billing needed

#### Vercel
```bash
npm install -g vercel
cd landing
vercel
```

#### GitHub Pages
1. Push `landing` folder to GitHub
2. Enable GitHub Pages in repo settings
3. Free hosting

### Option 3: Use Existing Bucket

If you already have a Google Cloud Storage bucket from before:

```bash
# List your buckets
gsutil ls

# Use an existing bucket
gsutil cp landing/downloads/SnapFix-0.1.0-arm64.dmg gs://your-existing-bucket/
```

## Google Cloud Free Tier

- **5GB storage** free per month
- **1GB egress** (downloads) free per month
- Your DMG is ~100MB, so you're well within free tier
- You won't be charged unless you exceed limits

## Quick Fix Steps

1. **Enable billing:**
   - Go to https://console.cloud.google.com/billing
   - Add payment method
   - Link to your project

2. **Create bucket:**
   ```bash
   gsutil mb gs://snapfix-downloads
   ```

3. **Upload:**
   ```bash
   gsutil cp landing/downloads/SnapFix-0.1.0-arm64.dmg gs://snapfix-downloads/
   ```

4. **Make public:**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://snapfix-downloads
   ```

## Recommendation

Given the issues with Firebase and Google Cloud, **Netlify is the easiest solution**:
- No billing required
- No project limits
- DMG files work fine
- Just drag and drop your folder



