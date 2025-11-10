// Native text bridge module for Electron
// This module provides platform-specific implementations for getting and replacing selected text

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const os = require('os');
const execAsync = promisify(exec);

let nativeModule = null;
let windowsHelperPath = null;

// Try to load native module (macOS)
function loadNativeModule() {
  if (process.platform !== 'darwin') {
    return null;
  }

  try {
    // Try to load the native addon
    const addonPath = path.join(__dirname, 'macOS', 'build', 'Release', 'textBridge.node');
    nativeModule = require(addonPath);
    console.log('Native module loaded successfully');
    return nativeModule;
  } catch (error) {
    // Native module not available - this is fine, we'll use fallback methods
    console.log('Native module not available, using fallback methods (clipboard + keyboard simulation)');
    console.log('Note: To build native module, see native/macOS/README_BUILD.md');
    return null;
  }
}

// Initialize Windows helper path
function initWindowsHelper() {
  if (process.platform === 'win32') {
    // Path to the compiled Windows helper executable
    windowsHelperPath = path.join(__dirname, 'Windows', 'bin', 'Release', 'net6.0', 'win-x64', 'TextBridge.exe');
  }
}

// Initialize on module load
if (process.platform === 'darwin') {
  nativeModule = loadNativeModule();
} else if (process.platform === 'win32') {
  initWindowsHelper();
}

/**
 * Check if accessibility permissions are available
 * @returns {Promise<boolean>}
 */
async function hasAccessibilityPermissions() {
  if (process.platform === 'darwin') {
    if (nativeModule) {
      try {
        return nativeModule.hasAccessibilityPermissions();
      } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
      }
    }
    // Fallback: Try to check using AppleScript
    try {
      await execAsync('osascript -e \'tell application "System Events" to get name of every process\'');
      return true;
    } catch {
      return false;
    }
  } else if (process.platform === 'win32') {
    if (windowsHelperPath) {
      try {
        const { stdout } = await execAsync(`"${windowsHelperPath}" hasPermissions`);
        return stdout.trim() === 'true';
      } catch {
        return false;
      }
    }
    // Windows UI Automation should work by default
    return true;
  }
  // Linux: Not implemented yet
  return false;
}

/**
 * Get the currently selected text from the focused application
 * @returns {Promise<string>}
 */
async function getSelectedText() {
  if (process.platform === 'darwin') {
    if (nativeModule) {
      try {
        return nativeModule.getSelectedText();
      } catch (error) {
        console.error('Error getting selected text from native module:', error);
        // Fallback to clipboard method
        return getSelectedTextFallback();
      }
    }
    // Fallback: Use clipboard method
    return getSelectedTextFallback();
  } else if (process.platform === 'win32') {
    if (windowsHelperPath) {
      try {
        const { stdout } = await execAsync(`"${windowsHelperPath}" getSelectedText`);
        return stdout.trim();
      } catch (error) {
        console.error('Error getting selected text from Windows helper:', error);
        return getSelectedTextFallback();
      }
    }
    // Fallback: Use clipboard method
    return getSelectedTextFallback();
  }
  
  // Linux: Not implemented yet
  return getSelectedTextFallback();
}

/**
 * Fallback method: Get selected text using clipboard simulation
 * @returns {Promise<string>}
 */
async function getSelectedTextFallback() {
  const { clipboard } = require('electron');
  const originalClipboard = clipboard.readText();
  
  try {
    // Try to copy selected text
    if (process.platform === 'darwin') {
      await execAsync('osascript -e \'tell application "System Events" to keystroke "c" using command down\'');
    } else if (process.platform === 'win32') {
      await execAsync('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^c\')"');
    }
    
    // Wait for clipboard to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const selectedText = clipboard.readText();
    return selectedText || '';
  } catch (error) {
    console.error('Error in fallback getSelectedText:', error);
    return '';
  }
}

/**
 * Replace the selected text with new text
 * @param {string} newText - The text to replace the selection with
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function replaceSelectedText(newText) {
  if (process.platform === 'darwin') {
    if (nativeModule) {
      try {
        const success = nativeModule.replaceSelectedText(newText);
        if (success) {
          return true;
        }
        // If native method fails, fall back to clipboard method
        return replaceSelectedTextFallback(newText);
      } catch (error) {
        console.error('Error replacing selected text with native module:', error);
        return replaceSelectedTextFallback(newText);
      }
    }
    // Fallback: Use clipboard method
    return replaceSelectedTextFallback(newText);
  } else if (process.platform === 'win32') {
    if (windowsHelperPath) {
      try {
        // Escape the text for command line
        const escapedText = newText.replace(/"/g, '\\"');
        const { stdout, stderr } = await execAsync(`"${windowsHelperPath}" replaceSelectedText "${escapedText}"`);
        if (stdout.trim() === '0' || !stderr) {
          return true;
        }
        // If Windows helper fails, fall back to clipboard method
        return replaceSelectedTextFallback(newText);
      } catch (error) {
        console.error('Error replacing selected text with Windows helper:', error);
        return replaceSelectedTextFallback(newText);
      }
    }
    // Fallback: Use clipboard method
    return replaceSelectedTextFallback(newText);
  }
  
  // Linux: Not implemented yet
  return replaceSelectedTextFallback(newText);
}

/**
 * Fallback method: Replace selected text using clipboard and keyboard simulation
 * @param {string} newText - The text to replace the selection with
 * @returns {Promise<boolean>}
 */
async function replaceSelectedTextFallback(newText) {
  const { clipboard } = require('electron');
  
  try {
    // Save original clipboard
    const originalClipboard = clipboard.readText();
    
    // Set new text to clipboard
    clipboard.writeText(newText);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Paste the text
    if (process.platform === 'darwin') {
      await execAsync('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
    } else if (process.platform === 'win32') {
      await execAsync('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"');
    }
    
    return true;
  } catch (error) {
    console.error('Error in fallback replaceSelectedText:', error);
    return false;
  }
}

module.exports = {
  hasAccessibilityPermissions,
  getSelectedText,
  replaceSelectedText
};

