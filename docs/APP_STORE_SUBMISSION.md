# App Store Submission Guide

## Step-by-Step Process

### Step 1: Build for App Store

```bash
cd /Users/hrithikthakur/Code/snapfix

# Load your credentials
source .env

# Build for Mac App Store
npm run build:mas
```

This creates: `dist/mac/SnapFix-0.1.0.pkg`

**Note:** You'll need a "Mac App Distribution" certificate (not just "Developer ID Application").

### Step 2: Create App Store Connect Listing

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com
   - Sign in with your Apple ID

2. **Create New App:**
   - Click "+" → "New App"
   - Platform: macOS
   - Name: SnapFix
   - Primary Language: English
   - Bundle ID: `com.snapfix.app`
   - SKU: `snapfix-001` (or any unique identifier)

3. **Fill in App Information:**
   - Category: Productivity
   - Privacy Policy URL (required)
   - Support URL
   - Marketing URL (optional)

### Step 3: Upload Build

**Option A: Using Transporter (Recommended)**

1. **Download Transporter:**
   - From Mac App Store: https://apps.apple.com/app/transporter/id1450874784

2. **Upload:**
   ```bash
   # Your build is at:
   dist/mac/SnapFix-0.1.0.pkg
   ```
   - Open Transporter
   - Drag the `.pkg` file into Transporter
   - Click "Deliver"
   - Wait for upload to complete

**Option B: Using Xcode**

1. Open Xcode
2. Window → Organizer
3. Click "+" → "Distribute App"
4. Select "App Store Connect"
5. Follow the wizard

### Step 4: Complete App Store Listing

1. **App Information:**
   - Name: SnapFix
   - Subtitle (optional): Fix typos instantly
   - Description: Write your app description (up to 4000 characters)
   - Keywords: grammar, spelling, typos, fix (up to 100 characters)
   - Support URL: Your support/help page
   - Marketing URL (optional): Your website

2. **Pricing and Availability:**
   - Price: Free (or set a price)
   - Availability: Select countries

3. **App Privacy:**
   - Answer privacy questions
   - Data types used: User Content (text sent to API)
   - Purpose: App Functionality
   - Linked to User: No
   - Used for Tracking: No

4. **Screenshots:**
   - Required sizes:
     - 6.5" display: 1290 x 2796
     - 6.7" display: 1284 x 2778
     - 5.5" display: 1242 x 2208
   - Take screenshots of your app
   - Upload to App Store Connect

5. **App Icon:**
   - 1024 x 1024 PNG
   - No transparency
   - Use: `assets/icons/snapfix_logo.png` (resize to 1024x1024)

### Step 5: Submit for Review

1. **Select Build:**
   - Go to "TestFlight" or "App Store" tab
   - Select your uploaded build

2. **Answer Export Compliance:**
   - Does your app use encryption? **Yes** (for API calls)
   - Select "Uses standard encryption"

3. **Review Information:**
   - Contact information
   - Demo account (if needed)
   - Notes for reviewer:
     ```
     This app requires users to provide their own Gemini API key.
     The app uses clipboard-only workflow in App Store version
     (accessibility APIs not available due to sandbox restrictions).
     ```

4. **Submit:**
   - Click "Submit for Review"
   - Wait for review (usually 1-3 days)

## Important Notes

### App Store Limitations

⚠️ **The App Store version has reduced functionality:**
- ❌ No accessibility APIs (sandbox restriction)
- ❌ No automatic text replacement
- ✅ Clipboard-only workflow
- Users must manually copy/paste text

**Make this clear in your app description!**

### Required Certificates

You need:
- ✅ **Mac App Distribution** certificate (for App Store)
- ❌ Not "Developer ID Application" (that's for direct distribution)

Create it at: https://developer.apple.com/account/resources/certificates/list

### Common Issues

1. **"Missing Mac App Distribution certificate"**
   - Create it in Apple Developer portal
   - Download and install in Keychain

2. **"Build rejected - missing functionality"**
   - Clearly explain app requires API key
   - Provide test instructions

3. **"Privacy policy required"**
   - Must have privacy policy URL
   - Can host on your website or GitHub Pages

## Quick Checklist

- [ ] Build MAS package: `npm run build:mas`
- [ ] Create App Store Connect listing
- [ ] Upload via Transporter
- [ ] Complete app information
- [ ] Add screenshots
- [ ] Set pricing
- [ ] Answer privacy questions
- [ ] Submit for review

## Timeline

- **Upload:** 5-15 minutes
- **Processing:** 30 minutes - 2 hours
- **Review:** 1-3 days
- **Total:** ~2-4 days from submission to live

## Resources

- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Transporter App](https://apps.apple.com/app/transporter/id1450874784)

Good luck with your submission! 🚀

