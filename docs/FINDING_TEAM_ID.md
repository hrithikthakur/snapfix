# How to Find Your Apple Developer Team ID

Your Team ID is a 10-character alphanumeric string (e.g., `ABC123DEF4`) that identifies your Apple Developer account or organization.

## Method 1: Apple Developer Website (Easiest)

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Look at the top right corner of the page
4. You'll see your **Team ID** displayed next to your name/team name
5. It's a 10-character string like `ABC123DEF4`

## Method 2: Membership Page

1. Go to https://developer.apple.com/account
2. Click on **Membership** in the left sidebar
3. Your **Team ID** is displayed prominently on this page
4. It's listed as "Team ID" or "Identifier"

## Method 3: Using Xcode

1. Open **Xcode**
2. Go to **Xcode** → **Settings** (or **Preferences**)
3. Click on the **Accounts** tab
4. Select your Apple ID
5. Your Team ID is shown next to your team name

## Method 4: Using Command Line

If you have certificates already installed:

```bash
# List all code signing identities
security find-identity -v -p codesigning

# Look for your team ID in the output
# It appears in parentheses like: (TEAM_ID)
```

Example output:
```
1) ABC123DEF4 "Developer ID Application: Your Name (TEAM_ID)"
2) ABC123DEF4 "Mac App Distribution: Your Name (TEAM_ID)"
```

The part in parentheses `(TEAM_ID)` is your Team ID.

## Method 5: From Existing Certificate

If you've already downloaded a certificate:

1. Double-click the `.cer` file to open it in Keychain Access
2. Select the certificate
3. Expand the details
4. Look for **Organizational Unit** - this is your Team ID

## What It Looks Like

Your Team ID is a **10-character alphanumeric string**:
- Format: `ABC123DEF4` or `1234567890`
- Always exactly 10 characters
- Mix of letters and numbers

## Using Your Team ID

Once you have it, set it as an environment variable:

```bash
export APPLE_TEAM_ID="ABC123DEF4"
```

Or add it to your `.env.dist` file:
```
APPLE_TEAM_ID=ABC123DEF4
```

## Quick Check

To verify you have the right Team ID, you can also check it matches what's in your certificates:

```bash
security find-identity -v -p codesigning | grep "TEAM_ID"
```

Replace `TEAM_ID` with your actual Team ID to verify it matches.

