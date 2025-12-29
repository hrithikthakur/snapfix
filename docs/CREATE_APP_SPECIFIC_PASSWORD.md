# How to Create an App-Specific Password

An app-specific password is required for notarization. It's different from your regular Apple ID password and is used specifically for automated processes like notarization.

## Step-by-Step Guide

### Step 1: Go to Apple ID Account Page

1. Open your web browser
2. Go to **https://appleid.apple.com**
3. Sign in with your Apple ID (the same one used for your Developer account)

### Step 2: Navigate to App-Specific Passwords

1. Once signed in, look for **"Sign-In and Security"** section
2. Click on **"App-Specific Passwords"** (or "App Passwords" in some versions)
3. You may need to verify your identity with 2FA if prompted

### Step 3: Create a New Password

1. Click the **"Generate an app-specific password"** button (or "+" button)
2. You'll be prompted to enter a label/name for this password
3. Enter a descriptive name like:
   - `flickfix Notarization`
   - `macOS App Notarization`
   - `Developer Notarization`
4. Click **"Create"** or **"Generate"**

### Step 4: Copy the Password

1. Apple will display a **16-character password** like: `abcd-efgh-ijkl-mnop`
2. **Copy this password immediately** - you won't be able to see it again!
3. Store it securely (password manager, or add to your `.env` file)

### Step 5: Use the Password

Add it to your `.env` file or export as environment variable:

```bash
export APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop"
```

**Important:** 
- Don't include spaces or dashes when using it
- The format shown (with dashes) is just for readability
- You can use it with or without dashes

## Requirements

### Two-Factor Authentication Must Be Enabled

If you don't see "App-Specific Passwords" option:
- You need to enable **Two-Factor Authentication** first
- Go to **Sign-In and Security** → **Two-Factor Authentication**
- Follow the setup process

### Use the Same Apple ID

- Use the **same Apple ID** that's associated with your Developer account
- This is usually the email you used to enroll in the Developer Program

## Visual Guide

The page should look something like this:

```
Apple ID Account
├── Sign-In and Security
    ├── Two-Factor Authentication: [Enabled]
    ├── App-Specific Passwords: [Click here]
        └── Generate an app-specific password...
```

## Managing App-Specific Passwords

### View All Passwords

- You can see a list of all your app-specific passwords
- Each one has a label/name you gave it
- You can see when it was created

### Revoke a Password

- If you need to revoke one, click the "X" or "Revoke" button next to it
- You'll need to create a new one if you revoke the one used for notarization

### Best Practices

1. **Create one specifically for notarization** - Don't reuse passwords
2. **Use descriptive labels** - So you know what each password is for
3. **Store securely** - Add to `.env` file (which is gitignored)
4. **Don't share** - Keep it private, like your regular password

## Troubleshooting

### "App-Specific Passwords" Option Not Visible

**Solution:** Enable Two-Factor Authentication first
1. Go to Sign-In and Security
2. Enable Two-Factor Authentication
3. Then App-Specific Passwords will appear

### "Invalid Credentials" Error During Notarization

**Possible causes:**
- Password copied incorrectly (check for extra spaces)
- Password was revoked
- Using wrong Apple ID

**Solution:**
- Create a new app-specific password
- Double-check you're using the correct Apple ID
- Verify the password is set correctly in environment variables

### Password Not Working

**Check:**
- Is 2FA enabled? (Required)
- Are you using the correct Apple ID?
- Did you copy the password correctly?
- Has the password been revoked?

**Solution:**
- Create a new app-specific password
- Make sure 2FA is enabled
- Verify the Apple ID matches your Developer account

## Quick Reference

**URL:** https://appleid.apple.com  
**Path:** Sign-In and Security → App-Specific Passwords  
**Format:** `xxxx-xxxx-xxxx-xxxx` (16 characters, can use with or without dashes)  
**Required:** Two-Factor Authentication must be enabled

## After Creating

Once you have your app-specific password:

1. Add it to your `.env` file:
   ```bash
   export APPLE_APP_SPECIFIC_PASSWORD="your-password-here"
   ```

2. Or export it in your shell:
   ```bash
   export APPLE_APP_SPECIFIC_PASSWORD="your-password-here"
   ```

3. Test it by running a build:
   ```bash
   npm run build:direct
   ```

The notarization script will use this password automatically during the build process.

