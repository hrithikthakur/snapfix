# Install .cer Certificate File

## Problem
You downloaded the `.cer` file from Apple Developer but can't see it in Keychain Access.

## Solution: Install the Certificate

### Method 1: Double-Click (Easiest)

1. **Find the downloaded file:**
   - Usually in `~/Downloads/`
   - Look for a file named something like `mac_app_distribution.cer` or `certificate.cer`

2. **Double-click the `.cer` file**
   - It should automatically open in Keychain Access
   - You may be prompted for your password

3. **Verify installation:**
   - Open Keychain Access
   - Select **"login"** keychain (left sidebar)
   - Select **"My Certificates"** category
   - Look for **"Mac App Distribution"** certificate

### Method 2: Drag and Drop

1. **Open Keychain Access**
2. **Select "login" keychain** (left sidebar)
3. **Drag the `.cer` file** into Keychain Access window
4. **Enter your password** if prompted

### Method 3: Import via Menu

1. **Open Keychain Access**
2. **Select "login" keychain**
3. **File → Import Items...**
4. **Select your `.cer` file**
5. **Click "Open"**
6. **Enter password** if prompted

### Method 4: Command Line

```bash
# Install certificate
security add-certificates /path/to/your/certificate.cer

# Or if it's in Downloads
security add-certificates ~/Downloads/*.cer
```

## Verify It's Installed

```bash
# Check for Mac App Distribution certificate
security find-identity -v -p codesigning | grep -i "mac app distribution"
```

You should see:
```
"Mac App Distribution: Your Name (TEAM_ID)"
```

## If You Can't Find the .cer File

1. **Check Downloads folder:**
   ```bash
   ls -lh ~/Downloads/*.cer
   ```

2. **Check if it was downloaded:**
   - Go back to https://developer.apple.com/account/resources/certificates/list
   - Find "Mac App Distribution" certificate
   - Click the download icon
   - Save it again

3. **Check browser downloads:**
   - Open your browser's download history
   - Look for `.cer` file
   - Re-download if needed

## Troubleshooting

### Certificate not showing in Keychain?
- Make sure you're looking in **"login"** keychain (not "System")
- Check **"My Certificates"** category
- Try refreshing: View → Refresh (Cmd+R)

### "Certificate is not valid"?
- Make sure you downloaded the correct certificate type
- Should be "Mac App Distribution" (not "Developer ID Application")
- Try downloading again from Apple Developer portal

### Still can't see it?
- Try the command line method
- Or check if certificate needs to be trusted:
  ```bash
  security find-certificate -c "Mac App Distribution" -p | openssl x509 -text
  ```

