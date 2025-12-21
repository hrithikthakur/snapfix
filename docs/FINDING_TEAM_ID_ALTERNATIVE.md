# Alternative Ways to Find Your Team ID

If you can't find your Team ID on the Apple Developer website, try these methods:

## Method 1: Check if You Have an Active Developer Account

**Important:** You need an **active** Apple Developer Program membership ($99/year) to have a Team ID.

1. Go to https://developer.apple.com/account
2. Check if you see:
   - **"Membership"** in the left sidebar
   - Your membership status (Active/Expired)
   - If it says "Expired" or you don't see Membership, you need to renew/join

**If you don't have an active membership:**
- You'll need to enroll in the Apple Developer Program first
- Go to https://developer.apple.com/programs/
- The Team ID is created when you enroll

## Method 2: Check Your Email

When you enrolled in the Apple Developer Program, Apple sent you a confirmation email that includes your Team ID.

Search your email for:
- "Apple Developer Program"
- "Welcome to the Apple Developer Program"
- Your Team ID should be in the email

## Method 3: Check App Store Connect

If you've published apps before:

1. Go to https://appstoreconnect.apple.com
2. Sign in
3. Click on **Users and Access** → **Keys**
4. Your Team ID is shown at the top of the page

## Method 4: Check Existing Certificates/Apps

If you've created certificates or apps before, the Team ID is embedded in them:

### From Keychain (if you have certificates installed):

```bash
# List all certificates
security find-certificate -a -c "Developer ID" -p | openssl x509 -text | grep -A 5 "Subject:"

# Or check code signing identities
security find-identity -v -p codesigning | grep -o "(.*)" | head -1
```

### From Xcode Projects:

If you have any Xcode projects:
1. Open the project
2. Select your project in the navigator
3. Go to **Signing & Capabilities** tab
4. Your Team ID is shown in the Team dropdown

## Method 5: Check Your Apple ID Account Page

Sometimes the Team ID is visible in different places:

1. Go to https://appleid.apple.com
2. Sign in
3. Look for any Developer Program information
4. Check **Subscriptions** or **Services** section

## Method 6: Contact Apple Developer Support

If none of the above work:

1. Go to https://developer.apple.com/contact/
2. Select **Membership and Account** → **Account Access**
3. Ask them for your Team ID

## Method 7: Check Your Invoices/Receipts

If you've paid for the Developer Program:
- Check your Apple Developer Program invoices/receipts
- The Team ID might be listed there

## What If You Don't Have a Team ID?

If you don't have an active Apple Developer Program membership:

1. **You need to enroll first:**
   - Go to https://developer.apple.com/programs/
   - Click "Enroll"
   - Pay the $99/year fee
   - Complete enrollment

2. **After enrollment:**
   - You'll receive an email with your Team ID
   - It will appear on your developer account page

## Temporary Workaround

If you're just testing locally and don't need to distribute yet:

- You can skip setting `APPLE_TEAM_ID` for now
- The notarization script will try to auto-detect it
- However, you'll need it for actual distribution

## Verify You Have the Right Account

Make sure you're signed into the correct Apple ID:
- The one you used to enroll in the Developer Program
- Not a personal Apple ID that hasn't enrolled

