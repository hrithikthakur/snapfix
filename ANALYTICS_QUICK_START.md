# Analytics Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add Analytics Module to main.js

At the top of `main.js`, add:
```javascript
const analytics = require('./analytics');
```

### Step 2: Track Key Events

Add these tracking calls to your existing code:

**App Launch** (in `app.whenReady()`):
```javascript
analytics.track('app_launched', {
  version: app.getVersion(),
  platform: process.platform,
});
```

**Grammar Fix Attempt** (in `handleGlobalFix()`):
```javascript
const startTime = Date.now();
analytics.track('grammar_fix_attempted', {
  method: textBridge ? 'native' : 'clipboard',
});

// After successful fix:
analytics.track('grammar_fix_succeeded', {
  response_time: Date.now() - startTime,
});

// On error:
analytics.track('grammar_fix_failed', {
  error_type: error.name,
});
```

**Undo Action** (in `handleUndo()`):
```javascript
analytics.track('undo_triggered', {
  corrections_count: undoStack.length,
});
```

### Step 3: Choose Your Provider (Optional)

**Option A: File Logging (Default - No Setup)**
- Works immediately, no configuration needed
- Logs saved to: `~/Library/Application Support/GrammrFix/analytics/`

**Option B: PostHog**
Add to `.env`:
```env
ANALYTICS_PROVIDER=posthog
POSTHOG_API_KEY=your_key_here
```

**Option C: Mixpanel**
Add to `.env`:
```env
ANALYTICS_PROVIDER=mixpanel
MIXPANEL_TOKEN=your_token_here
```

## 📊 What Gets Tracked

- ✅ App launches and closes
- ✅ Grammar fix attempts and results
- ✅ API response times and errors
- ✅ Permission requests
- ✅ Undo actions
- ✅ Shortcut registrations
- ❌ **NOT tracked**: Actual text content (privacy-first)

## 📁 Files Created

- `analytics.js` - Main analytics module
- `ANALYTICS.md` - Full documentation
- `analytics-integration-example.js` - Code examples

## 🔍 View Your Data

**File Logs**: Check `~/Library/Application Support/GrammrFix/analytics/`

**PostHog**: Visit your PostHog dashboard

**Mixpanel**: Visit your Mixpanel dashboard

## 🎯 Next Steps

1. Add `const analytics = require('./analytics');` to main.js
2. Add 3-5 tracking calls to key functions
3. Test locally (check log files)
4. Configure PostHog/Mixpanel if desired
5. Deploy and monitor!

See `ANALYTICS.md` for complete documentation.

