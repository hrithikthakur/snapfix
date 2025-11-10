# How to Grant Accessibility Permissions on macOS

GrammrFix needs accessibility permissions to automatically replace text in your applications. Follow these steps to grant permissions:

## Steps to Grant Permissions:

1. **Open System Settings**
   - Click the Apple menu (🍎) in the top-left corner
   - Select "System Settings" (or "System Preferences" on older macOS)

2. **Navigate to Privacy & Security**
   - Click on "Privacy & Security" in the sidebar
   - Scroll down to find "Accessibility"

3. **Enable GrammrFix**
   - Click the lock icon (🔒) at the bottom to make changes (enter your password if prompted)
   - Find "GrammrFix" in the list
   - Toggle the switch to enable it (it should turn green/blue)

4. **Alternative: Quick Access**
   - Right-click the GrammrFix icon in your menu bar (top right)
   - Click "Grant Accessibility Permissions"
   - This will open System Settings directly to the Accessibility section

## What These Permissions Allow:

- **Copy selected text**: Automatically copies text you've selected when you press the shortcut
- **Paste corrected text**: Automatically pastes the corrected text to replace your selection
- **Work across all apps**: Allows GrammrFix to work in any application (browser, text editor, etc.)

## Troubleshooting:

- **Permissions not working?** Make sure you've quit and restarted the app after granting permissions
- **Can't find the app?** Make sure GrammrFix is running (check the menu bar icon)
- **Still having issues?** Try removing and re-adding the app in Accessibility settings

## Security Note:

These permissions only allow GrammrFix to simulate keyboard shortcuts (Copy/Paste). The app cannot:
- Read your screen
- Access your files
- Monitor your keystrokes (except when you press the shortcut)
- Send data to external servers (except the Gemini API for text correction)

Your text is processed securely through Google's Gemini API for grammar correction only.

