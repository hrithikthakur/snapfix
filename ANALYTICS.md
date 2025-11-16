# Analytics Implementation Guide for SnapFix

This document explains how to instrument SnapFix with analytics to track user behavior, app performance, and feature usage.

## Overview

The analytics system supports three modes:
1. **PostHog** - Full-featured product analytics platform
2. **Mixpanel** - Event tracking and user analytics
3. **File Logging** - Simple local file-based logging (default, no setup required)

## Quick Start

### 1. Basic Setup (File Logging - No Configuration)

File logging works out of the box with no configuration:

```javascript
const analytics = require('./analytics');

// Track events
analytics.track('grammar_fix_attempted', {
  text_length: 50,
  method: 'native'
});
```

Logs are saved to: `~/Library/Application Support/GrammrFix/analytics/analytics-YYYY-MM-DD.log`

### 2. PostHog Setup

1. **Get PostHog API Key:**
   - Sign up at [PostHog](https://posthog.com)
   - Go to Project Settings → API Keys
   - Copy your Project API Key

2. **Configure in `.env` file:**
   ```env
   ANALYTICS_PROVIDER=posthog
   POSTHOG_API_KEY=your_api_key_here
   POSTHOG_HOST=https://app.posthog.com  # or your self-hosted instance
   ```

3. **Events will automatically be sent to PostHog**

### 3. Mixpanel Setup

1. **Get Mixpanel Token:**
   - Sign up at [Mixpanel](https://mixpanel.com)
   - Go to Project Settings → Project Info
   - Copy your Project Token

2. **Configure in `.env` file:**
   ```env
   ANALYTICS_PROVIDER=mixpanel
   MIXPANEL_TOKEN=your_token_here
   ```

3. **Events will automatically be sent to Mixpanel**

## Tracked Events

### Core Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `app_launched` | App started | `version`, `platform`, `arch` |
| `app_closed` | App quit | `session_duration` |
| `grammar_fix_attempted` | User triggered grammar fix | `text_length`, `method`, `source_app` |
| `grammar_fix_succeeded` | Grammar fix completed successfully | `text_length`, `response_time`, `method` |
| `grammar_fix_failed` | Grammar fix failed | `error_type`, `error_message`, `method` |
| `api_error` | Gemini API error | `error_code`, `error_message`, `retry_count` |
| `permission_requested` | Accessibility permission requested | `platform` |
| `permission_granted` | Accessibility permission granted | `platform` |
| `permission_denied` | Accessibility permission denied | `platform` |
| `undo_triggered` | User undid last correction | `corrections_count` |
| `settings_opened` | Settings window opened | - |
| `shortcut_registered` | Global shortcut registered | `shortcut_key` |
| `shortcut_failed` | Global shortcut registration failed | `shortcut_key` |

### User Properties

Track user characteristics:
- `os_version` - Operating system version
- `app_version` - App version
- `first_seen` - First app launch date
- `total_corrections` - Total grammar fixes performed
- `preferred_method` - Preferred text replacement method

## Implementation Examples

### 1. Track Grammar Fix Attempts

```javascript
// In main.js - handleGlobalFix()
analytics.track('grammar_fix_attempted', {
  text_length: selectedText.length,
  method: textBridge ? 'native' : 'clipboard',
  source_app: getActiveApplicationName(),
});
```

### 2. Track API Success/Failure

```javascript
// After successful API call
analytics.track('grammar_fix_succeeded', {
  text_length: originalText.length,
  response_time: Date.now() - startTime,
  method: 'native',
});

// On API error
analytics.track('grammar_fix_failed', {
  error_type: error.name,
  error_message: error.message,
  method: 'native',
});
```

### 3. Track Permission Events

```javascript
// When checking permissions
if (hasPermissions) {
  analytics.track('permission_granted', {
    platform: process.platform,
  });
} else {
  analytics.track('permission_denied', {
    platform: process.platform,
  });
}
```

### 4. Identify Users

```javascript
// On first launch or when user properties change
analytics.identify({
  os_version: os.release(),
  app_version: app.getVersion(),
  first_seen: new Date().toISOString(),
});
```

### 5. Track Feature Usage

```javascript
// When user opens settings
analytics.track('settings_opened');

// When user uses undo
analytics.track('undo_triggered', {
  corrections_count: undoStack.length,
});
```

## Integration Points in main.js

### 1. App Launch
```javascript
app.whenReady().then(() => {
  analytics.track('app_launched', {
    version: app.getVersion(),
    platform: process.platform,
  });
  // ... rest of initialization
});
```

### 2. Grammar Fix Handler
```javascript
async function handleGlobalFix() {
  const startTime = Date.now();
  
  analytics.track('grammar_fix_attempted', {
    method: textBridge ? 'native' : 'clipboard',
  });
  
  try {
    // ... fix logic
    analytics.track('grammar_fix_succeeded', {
      response_time: Date.now() - startTime,
    });
  } catch (error) {
    analytics.track('grammar_fix_failed', {
      error_type: error.name,
    });
  }
}
```

### 3. Permission Checks
```javascript
async function checkAccessibilityPermissions() {
  const hasPermissions = await textBridge.hasAccessibilityPermissions();
  
  analytics.track(hasPermissions ? 'permission_granted' : 'permission_denied', {
    platform: process.platform,
  });
  
  return hasPermissions;
}
```

### 4. App Close
```javascript
app.on('before-quit', () => {
  analytics.track('app_closed', {
    session_duration: Date.now() - sessionStartTime,
  });
});
```

## Privacy Considerations

### Data Collected
- **Event data**: What actions users take (grammar fixes, settings changes)
- **Technical data**: Platform, OS version, app version
- **Performance data**: Response times, error rates
- **User ID**: Anonymous unique identifier (stored locally)

### Data NOT Collected
- ❌ Actual text content being corrected
- ❌ Personal information
- ❌ File names or paths
- ❌ Application names (unless anonymized)

### User Control
- Analytics can be disabled via settings
- File logging can be disabled
- User ID is stored locally and can be reset

## Viewing Analytics

### File Logs
View logs in: `~/Library/Application Support/GrammrFix/analytics/`

Each log file contains JSON lines:
```json
{"timestamp":"2024-01-15T10:30:00.000Z","event":"grammar_fix_attempted","properties":{"text_length":50,"method":"native"}}
```

### PostHog Dashboard
1. Go to your PostHog project
2. View events in "Events" section
3. Create insights and dashboards
4. Set up funnels and retention analysis

### Mixpanel Dashboard
1. Go to your Mixpanel project
2. View events in "Events" section
3. Create reports and cohorts
4. Analyze user flows

## Advanced Usage

### Custom Events
Track custom events for your specific use cases:

```javascript
analytics.track('custom_feature_used', {
  feature_name: 'batch_correction',
  items_count: 5,
});
```

### User Segmentation
Identify users for segmentation:

```javascript
analytics.identify({
  user_type: 'power_user',
  subscription_tier: 'pro',
});
```

### A/B Testing
Track A/B test variants:

```javascript
analytics.track('feature_experiment', {
  experiment_name: 'new_ui',
  variant: 'variant_b',
});
```

## Troubleshooting

### Events Not Appearing
1. Check `.env` file has correct provider and keys
2. Check console for error messages
3. Verify file logging is working (check log directory)
4. For PostHog/Mixpanel: Check network tab for API calls

### File Logs Not Created
1. Check app has write permissions
2. Verify `ANALYTICS_LOG_TO_FILE` is not set to `false`
3. Check console for permission errors

### PostHog/Mixpanel Not Working
1. Verify API keys are correct
2. Check network connectivity
3. Review console for API errors
4. Fallback to file logging should work automatically

## Best Practices

1. **Don't track sensitive data** - Never log actual text content
2. **Use consistent event names** - Follow naming conventions
3. **Include context** - Add relevant properties to events
4. **Test locally** - Use file logging during development
5. **Respect privacy** - Make analytics opt-in if required by regulations
6. **Monitor performance** - Don't let analytics slow down the app

## Example .env Configuration

```env
# Analytics Configuration
ANALYTICS_PROVIDER=posthog
POSTHOG_API_KEY=phc_your_key_here
POSTHOG_HOST=https://app.posthog.com

# Or for Mixpanel:
# ANALYTICS_PROVIDER=mixpanel
# MIXPANEL_TOKEN=your_token_here

# File logging (always enabled as fallback)
ANALYTICS_LOG_TO_FILE=true
```

## Next Steps

1. **Integrate analytics.js into main.js** - Add tracking calls at key points
2. **Choose your provider** - PostHog, Mixpanel, or file logging
3. **Configure .env** - Add API keys if using PostHog/Mixpanel
4. **Test locally** - Verify events are being tracked
5. **Deploy** - Analytics will start collecting data automatically

