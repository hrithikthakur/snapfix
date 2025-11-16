/**
 * Example: How to integrate analytics into main.js
 * 
 * This file shows code snippets that should be added to main.js
 * to track user behavior and app performance.
 */

// ============================================
// 1. REQUIRE ANALYTICS MODULE (at top of main.js)
// ============================================
const analytics = require('./analytics');

// ============================================
// 2. TRACK APP LAUNCH (in app.whenReady())
// ============================================
app.whenReady().then(async () => {
  // Track app launch
  analytics.track('app_launched', {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
  });

  // Identify user (optional, for user properties)
  analytics.identify({
    os_version: os.release(),
    app_version: app.getVersion(),
  });

  // ... rest of initialization
});

// ============================================
// 3. TRACK GRAMMAR FIX ATTEMPTS (in handleGlobalFix)
// ============================================
async function handleGlobalFix() {
  const startTime = Date.now();
  
  try {
    // Track attempt
    analytics.track('grammar_fix_attempted', {
      method: textBridge ? 'native' : 'clipboard',
    });

    // Check permissions
    let hasPermissions = false;
    if (textBridge) {
      try {
        hasPermissions = await textBridge.hasAccessibilityPermissions();
        
        // Track permission status
        if (hasPermissions) {
          analytics.track('permission_granted', {
            platform: process.platform,
          });
        } else {
          analytics.track('permission_denied', {
            platform: process.platform,
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    }

    // Get selected text
    let textToFix = '';
    if (textBridge) {
      try {
        textToFix = await textBridge.getSelectedText();
      } catch (error) {
        console.error('Error getting selected text:', error);
        textToFix = '';
      }
    }

    // Fallback to clipboard
    if (!textToFix || textToFix.trim().length === 0) {
      const originalClipboard = clipboard.readText();
      if (originalClipboard && originalClipboard.trim().length > 0) {
        textToFix = originalClipboard;
      } else {
        analytics.track('grammar_fix_failed', {
          error_type: 'no_text_selected',
          error_message: 'No text found in selection or clipboard',
        });
        return;
      }
    }

    // Track text length
    const textLength = textToFix.length;

    // Show processing status
    showStatusOverlay('processing', 'Fixing typos...');

    // Process text
    try {
      const correctedText = await processTextInBackground(textToFix);
      const responseTime = Date.now() - startTime;

      if (correctedText && correctedText.trim()) {
        if (correctedText !== textToFix) {
          // Text was corrected - track success
          analytics.track('grammar_fix_succeeded', {
            text_length: textLength,
            response_time: responseTime,
            method: textBridge ? 'native' : 'clipboard',
            changes_made: true,
          });

          // Replace text
          let replaceSuccess = false;
          if (textBridge) {
            try {
              replaceSuccess = await textBridge.replaceSelectedText(correctedText);
            } catch (error) {
              console.error('Error replacing selected text:', error);
            }
          }

          // Fallback to clipboard
          if (!replaceSuccess) {
            clipboard.writeText(correctedText);
            // ... rest of clipboard fallback
          }

          // Save to undo stack
          undoStack.push({
            original: textToFix,
            corrected: correctedText,
            timestamp: Date.now(),
          });

          showStatusOverlay('success', 'Fixed!');
          setTimeout(() => hideStatusOverlay(), 1500);
        } else {
          // No changes needed
          analytics.track('grammar_fix_succeeded', {
            text_length: textLength,
            response_time: responseTime,
            method: textBridge ? 'native' : 'clipboard',
            changes_made: false,
          });

          showStatusOverlay('success', 'No changes needed');
          setTimeout(() => hideStatusOverlay(), 1500);
        }
      }
    } catch (error) {
      // Track API error
      analytics.track('grammar_fix_failed', {
        error_type: error.name || 'api_error',
        error_message: error.message,
        text_length: textLength,
        method: textBridge ? 'native' : 'clipboard',
      });

      analytics.track('api_error', {
        error_code: error.code,
        error_message: error.message,
        retry_count: 0, // Add retry logic if implemented
      });

      showStatusOverlay('error', 'Fix failed');
      setTimeout(() => hideStatusOverlay(), 2000);
    }
  } catch (error) {
    analytics.track('grammar_fix_failed', {
      error_type: error.name || 'unknown_error',
      error_message: error.message,
    });
  }
}

// ============================================
// 4. TRACK UNDO ACTIONS
// ============================================
function handleUndo() {
  if (undoStack.length === 0) {
    return;
  }

  const lastCorrection = undoStack.pop();
  
  // Track undo
  analytics.track('undo_triggered', {
    corrections_count: undoStack.length,
  });

  // ... rest of undo logic
}

// ============================================
// 5. TRACK SHORTCUT REGISTRATION
// ============================================
app.whenReady().then(() => {
  const shortcut = 'Alt+Space';
  const ret = globalShortcut.register(shortcut, () => {
    handleGlobalFix();
  });

  if (ret) {
    analytics.track('shortcut_registered', {
      shortcut_key: shortcut,
    });
    console.log('Global shortcut registered: Alt+Space');
  } else {
    analytics.track('shortcut_failed', {
      shortcut_key: shortcut,
    });
    console.log('Global shortcut registration failed');
  }
});

// ============================================
// 6. TRACK APP CLOSE
// ============================================
let sessionStartTime = Date.now();

app.on('before-quit', () => {
  const sessionDuration = Date.now() - sessionStartTime;
  
  analytics.track('app_closed', {
    session_duration: sessionDuration,
  });
});

// ============================================
// 7. TRACK SETTINGS WINDOW OPEN
// ============================================
function openSettings() {
  analytics.track('settings_opened');
  
  // ... open settings window
}

// ============================================
// 8. TRACK PERMISSION REQUESTS
// ============================================
function openAccessibilitySettings() {
  analytics.track('permission_requested', {
    platform: process.platform,
  });
  
  // ... open settings
}

// ============================================
// 9. TRACK API USAGE (in processTextInBackground)
// ============================================
async function processTextInBackground(text) {
  const startTime = Date.now();
  
  try {
    // ... API call logic
    
    const responseTime = Date.now() - startTime;
    
    // Track successful API call
    analytics.track('api_call_succeeded', {
      response_time: responseTime,
      text_length: text.length,
    });
    
    return correctedText;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Track failed API call
    analytics.track('api_call_failed', {
      error_type: error.name,
      error_message: error.message,
      response_time: responseTime,
      text_length: text.length,
    });
    
    throw error;
  }
}

// ============================================
// 10. TRACK FEATURE USAGE (example: tray menu clicks)
// ============================================
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Show Window',
    click: () => {
      analytics.track('tray_menu_clicked', {
        menu_item: 'show_window',
      });
      // ... show window
    }
  },
  {
    label: 'Fix Grammar (Global)',
    click: () => {
      analytics.track('tray_menu_clicked', {
        menu_item: 'fix_grammar',
      });
      handleGlobalFix();
    }
  },
  // ... other menu items
]);

// ============================================
// 11. TRACK ERRORS (global error handler)
// ============================================
process.on('uncaughtException', (error) => {
  analytics.track('uncaught_exception', {
    error_type: error.name,
    error_message: error.message,
    stack: error.stack,
  });
  
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  analytics.track('unhandled_rejection', {
    reason: reason?.toString(),
  });
  
  console.error('Unhandled rejection:', reason);
});

// ============================================
// 12. OPTIONAL: USER PROPERTIES UPDATES
// ============================================
// Update user properties when they change
function updateUserProperties() {
  analytics.setUserProperties({
    total_corrections: totalCorrectionsCount,
    preferred_method: textBridge ? 'native' : 'clipboard',
    last_active: new Date().toISOString(),
  });
}

