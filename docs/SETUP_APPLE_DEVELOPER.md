# Setting Up Your Apple Developer Account

If you can't find your Team ID, you may need to set up or verify your Apple Developer account first.

## Step 1: Verify You Have an Active Developer Account

### Check Your Membership Status

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Look for:
   - **Membership** section in the left sidebar
   - Your membership status (should say "Active")
   - Expiration date

### If You Don't See "Membership"

**You may not be enrolled yet.** Here's what to do:

1. **Check if you need to enroll:**
   - Go to https://developer.apple.com/programs/
   - Click "Enroll"
   - You'll need to pay $99/year

2. **If you think you're enrolled:**
   - Make sure you're signed in with the correct Apple ID
   - Check if your membership expired
   - Try a different browser or clear cookies

## Step 2: Enroll in Apple Developer Program (If Needed)

### Requirements:
- Apple ID
- Credit card ($99/year)
- Legal entity (individual or company)

### Steps:

1. **Go to enrollment page:**
   - https://developer.apple.com/programs/enroll/

2. **Choose account type:**
   - **Individual**: Use your personal Apple ID
   - **Organization**: Use a business Apple ID

3. **Complete enrollment:**
   - Fill in your information
   - Pay the $99 annual fee
   - Wait for approval (usually instant, can take up to 48 hours)

4. **After approval:**
   - You'll receive a confirmation email
   - Your Team ID will be in the email
   - It will also appear on your developer account page

## Step 3: Find Your Team ID After Enrollment

Once enrolled, your Team ID will be available:

1. **On the developer account page:**
   - https://developer.apple.com/account
   - Top right corner, next to your name

2. **In the Membership section:**
   - Click "Membership" in left sidebar
   - Team ID is displayed prominently

3. **In the confirmation email:**
   - Check your email for "Welcome to Apple Developer Program"
   - Team ID is included in the email

## Step 4: Download Certificates

After you have your Team ID, you need to create certificates:

1. **Go to Certificates page:**
   - https://developer.apple.com/account/resources/certificates/list

2. **Create certificates:**
   - Click the "+" button
   - For **Direct Distribution**: Create "Developer ID Application"
   - For **App Store**: Create "Mac App Distribution"

3. **Download and install:**
   - Download the `.cer` files
   - Double-click to install in Keychain

## Step 5: Verify Setup

After setting everything up, verify:

```bash
# Check certificates are installed
security find-identity -v -p codesigning

# You should see something like:
# 1) ABC123DEF4 "Developer ID Application: Your Name (TEAM_ID)"
```

## Common Issues

### "I can't see Membership section"
- You may not be enrolled yet
- Your membership may have expired
- Try signing out and back in

### "I'm enrolled but can't find Team ID"
- Check your email for the confirmation
- Look at the top right of developer.apple.com/account
- Check App Store Connect (if you've published apps)

### "I don't want to pay $99 yet"
- You can't distribute to App Store or notarize without it
- You can still build locally for testing
- Set `APPLE_TEAM_ID` to empty for now (notarization will skip)

## Quick Check: Do You Need a Developer Account?

**You need an active Developer account for:**
- ✅ Distributing on Mac App Store
- ✅ Notarizing apps for direct download
- ✅ Code signing for distribution

**You DON'T need it for:**
- ❌ Building the app locally
- ❌ Testing the app
- ❌ Development

## Next Steps

1. **If you have an account:** Follow the steps above to find your Team ID
2. **If you don't have an account:** Enroll at https://developer.apple.com/programs/
3. **If you're unsure:** Check your email for Apple Developer Program emails

Once you have your Team ID, add it to your `.env` file:
```
APPLE_TEAM_ID=YOUR_TEAM_ID_HERE
```

