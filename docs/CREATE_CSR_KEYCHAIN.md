# Create CSR Using Keychain Access

## Step-by-Step Instructions

### Step 1: Open Keychain Access

1. **Open Finder**
2. **Go to Applications → Utilities**
3. **Double-click "Keychain Access"**

### Step 2: Create Certificate Signing Request

1. **In Keychain Access menu bar:**
   - Click **"Keychain Access"** (top menu)
   - Go to **"Certificate Assistant"**
   - Select **"Request a Certificate from a Certificate Authority..."**

2. **Fill in the form:**
   - **User Email Address:** Your email (e.g., `hrithikthakur17@gmail.com`)
   - **Common Name:** Your name (e.g., `Hrithik Thakur`)
   - **CA Email Address:** Leave this **blank**
   - **Request is:** Select **"Saved to disk"** (important!)

3. **Click "Continue"**

4. **Save the file:**
   - Name it: `CertificateSigningRequest.certSigningRequest`
   - Save it somewhere easy to find (like Desktop or Documents)
   - Click "Save"

### Step 3: Upload to Apple Developer

1. **Go to:**
   - https://developer.apple.com/account/resources/certificates/list

2. **Create certificate:**
   - Click the **"+"** button (top left)
   - Under **"Software"** section
   - Select **"Mac App Distribution"**
   - Click **"Continue"**

3. **Upload CSR:**
   - Click **"Choose File"**
   - Select the `CertificateSigningRequest.certSigningRequest` file you just saved
   - Click **"Continue"**

4. **Download certificate:**
   - Click **"Download"** to get the `.cer` file
   - Save it to your Downloads folder

### Step 4: Install Certificate

1. **Double-click the downloaded `.cer` file**
   - It should open in Keychain Access automatically
   - Or drag it into Keychain Access

2. **Verify it's installed:**
   - In Keychain Access, look in **"login"** keychain
   - Look for **"Mac App Distribution"** certificate
   - It should show your name and team ID

### Step 5: Verify in Terminal

```bash
security find-identity -v -p codesigning | grep "Mac App Distribution"
```

You should see:
```
"Mac App Distribution: Hrithik Thakur (68G57WN635)"
```

## Troubleshooting

### "Certificate Assistant" not visible?
- Make sure Keychain Access is the active app
- Check the menu bar at the top of your screen
- It's under "Keychain Access" → "Certificate Assistant"

### Can't find the CSR file?
- Check your Desktop or Documents folder
- Look for `CertificateSigningRequest.certSigningRequest`
- Or search for `.certSigningRequest` files

### Certificate not showing in Keychain?
- Make sure you double-clicked the `.cer` file
- Check "login" keychain (not "System")
- Look for "Mac App Distribution" (not "Developer ID")

## Visual Guide

```
Keychain Access (menu bar)
  → Certificate Assistant
    → Request a Certificate from a Certificate Authority...
      → Fill form
        → Save to disk
          → Upload to Apple Developer
            → Download .cer
              → Double-click to install
```

