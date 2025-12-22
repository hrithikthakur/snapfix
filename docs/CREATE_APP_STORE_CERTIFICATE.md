# Create Mac App Distribution Certificate

## Problem
You have "Developer ID Application" but need "Mac App Distribution" for App Store builds.

## Solution: Create App Store Certificate

### Step 1: Go to Apple Developer Certificates

1. **Go to:**
   - https://developer.apple.com/account/resources/certificates/list

2. **Click the "+" button** to create a new certificate

3. **Select Certificate Type:**
   - Under "Software" section
   - Select **"Mac App Distribution"**
   - Click "Continue"

4. **Upload CSR (Certificate Signing Request):**
   - If you don't have one, create it:
   
   ```bash
   # Create CSR file
   openssl genrsa -out private_key.pem 2048
   openssl req -new -key private_key.pem -out CertificateSigningRequest.certSigningRequest -subj "/emailAddress=your@email.com/CN=Your Name/C=US"
   ```
   
   Or use Keychain Access:
   - Open Keychain Access
   - Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   - Enter your email and name
   - Save to disk

5. **Upload the CSR:**
   - Upload the `.certSigningRequest` file
   - Click "Continue"

6. **Download Certificate:**
   - Download the `.cer` file
   - Double-click to install in Keychain

### Step 2: Verify Installation

```bash
# Check certificates
security find-identity -v -p codesigning | grep "Mac App Distribution"
```

You should see:
```
"Mac App Distribution: Your Name (TEAM_ID)"
```

### Step 3: Build Again

```bash
npm run build:mas
```

## Alternative: Use Keychain Access

1. **Open Keychain Access**
2. **Request Certificate:**
   - Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   - Enter your email and name
   - Save CSR to disk

3. **Upload to Apple:**
   - Go to https://developer.apple.com/account/resources/certificates/list
   - Click "+" → "Mac App Distribution"
   - Upload your CSR
   - Download and install the certificate

## Quick Reference

**For Direct Distribution:**
- Certificate: "Developer ID Application" ✅ (you have this)

**For App Store:**
- Certificate: "Mac App Distribution" ❌ (you need this)

Both are different and serve different purposes!

