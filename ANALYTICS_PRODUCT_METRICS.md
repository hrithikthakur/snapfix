# Product Metrics Analytics - Implementation Guide

This enhanced analytics system tracks exactly the metrics you need to make product decisions.

## 🎯 Metrics You'll Track

### 1. **Shortcut Activation Rate**
- **Question**: How many users actually activate the shortcut?
- **Metric**: `totalShortcutActivations` / `totalSessions`
- **Action**: If < 50%, improve onboarding or make shortcut more discoverable

### 2. **Daily Usage Frequency**
- **Question**: How many times per day do they use it?
- **Metric**: `avgDailyUsage`, `todayUsage`
- **Action**: Track power users (20+ uses/day) for premium features

### 3. **AI Failure Rate**
- **Question**: How often does the AI fail?
- **Metric**: `aiFailureRate` = `totalAIFailures` / `totalGrammarFixes` × 100
- **Action**: If > 5%, improve error handling or switch API models

### 4. **Replacement Failure Rate**
- **Question**: How often does replacement fail?
- **Metric**: `replacementFailureRate` = `totalReplacementFailures` / `totalGrammarFixes` × 100
- **Action**: If > 10%, improve native bridge or fallback methods

### 5. **Permission Denial Rate**
- **Question**: How many users never give permissions?
- **Metric**: `permissionDenialRate` = `permissionDeniedCount` / (`permissionDeniedCount` + `permissionGrantedCount`) × 100
- **Action**: If > 30%, improve permission UX or make clipboard mode default

### 6. **Method Preference**
- **Question**: Text replacement vs clipboard mode?
- **Metric**: `nativeModeRate` vs `clipboardModeRate`
- **Action**: Optimize the more popular method, or deprecate the less used one

### 7. **Text Length Distribution**
- **Question**: Small corrections or long paragraphs?
- **Metric**: `textLengthPercentages` (small/medium/large/xlarge)
- **Action**: Optimize UI/UX for the most common use case

### 8. **Power User Identification**
- **Question**: Who uses it 20+ times per day?
- **Metric**: `isPowerUserToday`, `totalPowerUserDays`
- **Action**: Target power users for premium features, gather feedback

### 9. **Onboarding Effectiveness**
- **Question**: Is onboarding working?
- **Metric**: `onboardingCompleted`, `onboardingSteps`
- **Action**: If < 70% complete onboarding, redesign onboarding flow

## 📊 Integration Steps

### Step 1: Replace Analytics Module

In `main.js`, replace:
```javascript
const analytics = require('./analytics');
```

With:
```javascript
const analytics = require('./analytics-enhanced');
```

### Step 2: Track Shortcut Activation

In `app.whenReady()` where shortcut is registered:
```javascript
const ret = globalShortcut.register('Alt+Space', () => {
  analytics.trackShortcutActivated(); // ADD THIS
  handleGlobalFix();
});
```

### Step 3: Track Grammar Fix Attempts

In `handleGlobalFix()`, at the start:
```javascript
async function handleGlobalFix() {
  const startTime = Date.now();
  
  // Get text and method
  let textToFix = '';
  let method = 'clipboard';
  
  if (textBridge) {
    try {
      textToFix = await textBridge.getSelectedText();
      method = 'native';
    } catch (error) {
      textToFix = clipboard.readText();
      method = 'clipboard';
    }
  } else {
    textToFix = clipboard.readText();
    method = 'clipboard';
  }

  // Track attempt
  analytics.trackGrammarFixAttempted(textToFix.length, method); // ADD THIS
  
  // ... rest of function
}
```

### Step 4: Track Success/Failure

After API call:
```javascript
try {
  const correctedText = await processTextInBackground(textToFix);
  const responseTime = Date.now() - startTime;
  
  // Track success
  analytics.trackGrammarFixSucceeded(
    textToFix.length,
    method,
    responseTime
  ); // ADD THIS
  
  // ... replace text logic
} catch (error) {
  // Track AI failure
  analytics.trackAIFailure(
    error.name,
    error.message,
    textToFix.length
  ); // ADD THIS
}
```

### Step 5: Track Replacement Failures

When replacement fails:
```javascript
let replaceSuccess = false;
if (textBridge) {
  try {
    replaceSuccess = await textBridge.replaceSelectedText(correctedText);
  } catch (error) {
    // Track replacement failure
    analytics.trackReplacementFailure(method, textToFix.length); // ADD THIS
  }
}
```

### Step 6: Track Permissions

When checking permissions:
```javascript
const hasPermissions = await textBridge.hasAccessibilityPermissions();

if (hasPermissions) {
  analytics.trackPermissionGranted(); // ADD THIS
} else {
  analytics.trackPermissionDenied(); // ADD THIS
}
```

### Step 7: Track App Close

In `app.on('before-quit')`:
```javascript
app.on('before-quit', () => {
  analytics.trackAppClosed(); // ADD THIS
  app.quit();
});
```

## 📈 Viewing Your Metrics

### Method 1: Programmatic Access

```javascript
const analytics = require('./analytics-enhanced');
const summary = analytics.getSummary();

console.log('Total fixes:', summary.totalGrammarFixes);
console.log('AI failure rate:', summary.aiFailureRate);
console.log('Power user today:', summary.isPowerUserToday);
```

### Method 2: Generate Report File

```javascript
const reportPath = analytics.generateReport();
console.log('Report saved to:', reportPath);
```

### Method 3: View Dashboard

Open `analytics-dashboard.html` in a browser (see below)

## 🎨 Dashboard

A simple HTML dashboard is available at `analytics-dashboard.html` that visualizes:
- Daily usage charts
- Failure rate trends
- Method usage comparison
- Text length distribution
- Power user stats
- Onboarding completion

## 📋 Weekly Review Checklist

After one week, check:

- [ ] **Shortcut activation rate** - Are users finding the shortcut?
- [ ] **Daily usage** - What's the average? Any power users?
- [ ] **AI failure rate** - Is it < 5%? If not, what errors?
- [ ] **Replacement failure rate** - Is it < 10%? If not, which method fails?
- [ ] **Permission denial rate** - Are users giving permissions?
- [ ] **Method preference** - Native vs clipboard usage split
- [ ] **Text length** - Are users fixing short snippets or long text?
- [ ] **Power users** - How many users hit 20+ uses/day?
- [ ] **Onboarding** - Are users completing the flow?

## 🚀 Decision Framework

### If Shortcut Activation < 50%
**Problem**: Users aren't discovering the shortcut
**Solutions**:
- Add onboarding tooltip
- Show shortcut in tray menu
- Add notification on first launch

### If AI Failure Rate > 5%
**Problem**: API is unreliable
**Solutions**:
- Add retry logic
- Switch to different model
- Improve error messages
- Cache common corrections

### If Replacement Failure > 10%
**Problem**: Text replacement isn't working
**Solutions**:
- Improve native bridge
- Make clipboard mode default
- Add better fallback handling
- Test on more applications

### If Permission Denial > 30%
**Problem**: Users won't grant permissions
**Solutions**:
- Improve permission UX
- Make clipboard mode work without permissions
- Add permission explanation video
- Simplify permission flow

### If Clipboard Mode > 70%
**Problem**: Native mode isn't being used
**Solutions**:
- Improve native bridge reliability
- Make native mode default
- Or: deprecate native mode, optimize clipboard

### If Small Text (< 50 chars) > 60%
**Problem**: Users fixing typos, not paragraphs
**Solutions**:
- Optimize for quick fixes
- Reduce UI overhead
- Faster response times
- Batch corrections

### If Power Users > 10%
**Problem**: Opportunity for premium tier
**Solutions**:
- Add usage limits for free tier
- Create premium features
- Target power users for feedback
- Add power user badge

### If Onboarding < 70%
**Problem**: Users not completing setup
**Solutions**:
- Simplify onboarding
- Add progress indicator
- Make steps optional
- Auto-complete where possible

## 📊 Example Metrics After One Week

```json
{
  "totalSessions": 150,
  "totalShortcutActivations": 120,  // 80% activation rate
  "totalGrammarFixes": 2500,
  "avgDailyUsage": 357,  // ~51 fixes per user per day
  "aiFailureRate": "3.2%",  // Good!
  "replacementFailureRate": "8.5%",  // Acceptable
  "permissionDenialRate": "25%",  // Could improve
  "nativeModeRate": "65%",  // Native preferred
  "clipboardModeRate": "35%",
  "textLengthPercentages": {
    "small": "45%",  // Mostly short fixes
    "medium": "35%",
    "large": "15%",
    "xlarge": "5%"
  },
  "totalPowerUserDays": 12,  // 12 users hit 20+ uses
  "onboardingCompleted": true  // 85% completion rate
}
```

## 🎯 Next Steps

1. **Integrate** - Add tracking calls to main.js
2. **Test** - Use app for a day, check metrics
3. **Deploy** - Ship to users
4. **Monitor** - Check metrics daily for first week
5. **Decide** - Use metrics to make product decisions

## 📝 Notes

- All metrics are stored locally in `~/Library/Application Support/GrammrFix/analytics/`
- No sensitive data (text content) is tracked
- Metrics are aggregated daily
- Power user threshold is configurable (default: 20 uses/day)
- Reports can be generated on-demand

