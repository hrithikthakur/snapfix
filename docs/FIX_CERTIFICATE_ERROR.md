# Fix Certificate Import Error -25294

## Problem
Error -25294 when importing "3rd Party Mac Developer Application" certificate.

## Common Causes

1. **Missing private key** - Certificate needs the private key from CSR
2. **Keychain access issue** - Permission problem
3. **Certificate not trusted** - Needs to be trusted

## Solutions

### Solution 1: Import with Private Key

The certificate needs the private key that was created with the CSR.

1. **Check if you have the private key:**
   - Look for `private_key.pem` or similar file
   - Or check Keychain Access for the private key

2. **If you used Keychain Access to create CSR:**
   - The private key should be in your Keychain
   - Look in "login" keychain → "Keys" category
   - Should be named something like "Hrithik Thakur"

3. **Import certificate:**
   - Make sure the private key is in Keychain first
   - Then double-click the `.cer` file
   - It should match with the private key automatically

### Solution 2: Re-download Certificate

Sometimes the certificate file is corrupted:

1. **Go back to Apple Developer:**
   - https://developer.apple.com/account/resources/certificates/list
   - Find "3rd Party Mac Developer Application" certificate
   - Click download icon again
   - Save with a new name

2. **Try importing again:**
   - Double-click the new `.cer` file
   - Or drag into Keychain Access

### Solution 3: Use Xcode to Manage Certificates

Xcode can automatically manage certificates:

1. **Open Xcode**
2. **Xcode → Settings → Accounts**
3. **Select your Apple ID**
4. **Click "Manage Certificates"**
5. **Click "+" → "Mac App Distribution"**
6. Xcode will create and install it automatically

### Solution 4: Delete and Recreate

If nothing works:

1. **Delete the certificate from Apple Developer:**
   - Go to certificates list
   - Find the problematic certificate
   - Click "Revoke"

2. **Create a new CSR:**
   - Use Keychain Access → Certificate Assistant
   - Create new CSR

3. **Create new certificate:**
   - Upload new CSR
   - Download new `.cer` file
   - Install it

## Quick Fix: Use Xcode (Easiest)

**Recommended approach:**

1. **Open Xcode**
2. **Xcode → Settings (or Preferences)**
3. **Accounts tab**
4. **Select your Apple ID**
5. **Click "Manage Certificates"**
6. **Click "+" button**
7. **Select "Mac App Distribution"**
8. Xcode will automatically:
   - Create the certificate
   - Install it in Keychain
   - Set it up correctly

This is the easiest way and avoids manual certificate management!

## Verify After Fix

```bash
security find-identity -v -p codesigning | grep -i "mac app distribution"
```

You should see the certificate listed.

