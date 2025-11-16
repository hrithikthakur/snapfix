# Analytics Data Flow Chart

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT ORIGINS                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   RENDERER PROCESS   │              │   MAIN PROCESS        │
│   (index.html)       │              │   (main.js)          │
├──────────────────────┤              ├──────────────────────┤
│                      │              │                      │
│ User clicks button   │              │ App launches         │
│ User types shortcut  │              │ Global shortcut      │
│ Window opens         │              │ Tray clicked         │
│ API call succeeds    │              │ Grammar fix          │
│ API call fails       │              │ Undo action          │
│                      │              │ Permission check     │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           │ window.electronAPI.trackEvent()    │ analytics.track()
           │                                     │
           └──────────────┬──────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    IPC COMMUNICATION LAYER                               │
│                    (preload.js + ipcMain)                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   preload.js         │              │   main.js            │
│   (Renderer Side)    │              │   (Main Side)        │
├──────────────────────┤              ├──────────────────────┤
│                      │              │                      │
│ contextBridge        │              │ ipcMain.handle()     │
│ .exposeInMainWorld() │              │                      │
│                      │              │ 'analytics-track'    │
│ trackEvent() ────────┼──────────────►│ 'analytics-identify'│
│ identifyUser()       │              │                      │
│                      │              │                      │
└──────────────────────┘              └──────────┬───────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ANALYTICS MODULE                                     │
│                    (analytics.js)                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  analytics.track(eventName, properties)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Check if enabled? ──NO──► Return (skip)                           │
│     │                                                                   │
│     YES                                                                 │
│     │                                                                   │
│  2. Build Event Object:                                                │
│     {                                                                   │
│       event: eventName,                                                │
│       properties: {                                                    │
│         ...yourProperties,                                             │
│         userId: "user_1234567890_abc",  ← Persistent ID               │
│         sessionId: "session_123_xyz",   ← Current Session              │
│         timestamp: "2024-01-15T10:30:00Z",                             │
│         platform: "darwin",                                            │
│         version: "0.1.0"                                                │
│       }                                                                 │
│     }                                                                   │
│     │                                                                   │
│     ▼                                                                   │
│  3. Route to Provider:                                                │
│     │                                                                   │
│     ├─► provider === 'posthog' ──► sendToPostHog()                     │
│     │                                                                   │
│     ├─► provider === 'mixpanel' ──► sendToMixpanel()                  │
│     │                                                                   │
│     └─► provider === 'file' (default) ──► logToFile()                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROVIDER ROUTING                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   POSTHOG PROVIDER    │  │  MIXPANEL PROVIDER  │  │   FILE PROVIDER      │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│                      │  │                      │  │                      │
│ 1. Check API key?    │  │ 1. Check token?     │  │ 1. Check logFile?    │
│    NO ──► Fallback   │  │    NO ──► Fallback   │  │    NO ──► Skip       │
│    │                 │  │    │                 │  │    │                 │
│    YES               │  │    YES               │  │    YES               │
│    │                 │  │    │                 │  │    │                 │
│ 2. HTTP POST to:     │  │ 2. HTTP GET to:      │  │ 2. Append to file:  │
│    https://app.      │  │    https://api.      │  │    ~/Library/.../    │
│    posthog.com/      │  │    mixpanel.com/     │  │    analytics-       │
│    capture/          │  │    track             │  │    YYYY-MM-DD.log   │
│    │                 │  │    │                 │  │    │                 │
│    Body: {           │  │    Query: data=     │  │    Format: JSON     │
│      api_key: "...", │  │    base64(...)      │  │    (one per line)   │
│      event: "...",   │  │    │                 │  │    │                 │
│      properties: {}  │  │    │                 │  │    │                 │
│    }                 │  │    │                 │  │    │                 │
│    │                 │  │    │                 │  │    │                 │
│ 3. Success?          │  │ 3. Success?         │  │ 3. Always succeeds  │
│    YES ──► Done      │  │    YES ──► Done      │  │    (local file)     │
│    │                 │  │    │                 │  │    │                 │
│    NO ──► Fallback  │  │    NO ──► Fallback   │  │    │                 │
│         to file      │  │         to file      │  │    │                 │
│                      │  │                      │  │    │                 │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FINAL DESTINATIONS                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   POSTHOG CLOUD      │  │  MIXPANEL CLOUD       │  │   LOCAL FILE LOG     │
│   (Dashboard)         │  │  (Dashboard)          │  │   (Your Computer)    │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│                      │  │                      │  │                      │
│ • View events        │  │ • View events        │  │ • View events        │
│ • Create funnels     │  │ • Create funnels     │  │ • Search logs        │
│ • User analytics     │  │ • User analytics     │  │ • Parse JSON         │
│ • Retention          │  │ • Retention          │  │ • Manual analysis    │
│ • Cohorts            │  │ • Cohorts            │  │                      │
│                      │  │                      │  │ Location:            │
│                      │  │                      │  │ ~/Library/Application │
│                      │  │                      │  │ Support/GrammrFix/   │
│                      │  │                      │  │ analytics/           │
│                      │  │                      │  │ analytics-2024-01-15 │
│                      │  │                      │  │ .log                 │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

## Detailed Step-by-Step Flow

### Example: User Clicks "Fix Grammar" Button

```
Step 1: USER ACTION
┌─────────────────────────────────────┐
│ User clicks "Fix Grammar" button    │
│ in index.html (renderer)            │
└──────────────┬──────────────────────┘
               │
               ▼
Step 2: RENDERER TRACKING
┌─────────────────────────────────────┐
│ index.html JavaScript:              │
│                                     │
│ window.electronAPI.trackEvent(      │
│   'grammar_fix_attempted',         │
│   { text_length: 100 }             │
│ )                                   │
└──────────────┬──────────────────────┘
               │
               ▼
Step 3: PRELOAD BRIDGE
┌─────────────────────────────────────┐
│ preload.js:                         │
│                                     │
│ ipcRenderer.invoke(                 │
│   'analytics-track',                │
│   'grammar_fix_attempted',          │
│   { text_length: 100 }             │
│ )                                   │
└──────────────┬──────────────────────┘
               │
               ▼
Step 4: MAIN PROCESS IPC HANDLER
┌─────────────────────────────────────┐
│ main.js:                             │
│                                     │
│ ipcMain.handle('analytics-track',   │
│   async (event, eventName, props) =>│
│     analytics.track(eventName, props)│
│ )                                   │
└──────────────┬──────────────────────┘
               │
               ▼
Step 5: ANALYTICS MODULE PROCESSING
┌─────────────────────────────────────┐
│ analytics.js:                        │
│                                     │
│ 1. Check: isEnabled? → YES         │
│ 2. Build event object:             │
│    {                                │
│      event: 'grammar_fix_attempted',│
│      properties: {                   │
│        text_length: 100,            │
│        userId: 'user_123...',       │
│        sessionId: 'session_456...', │
│        timestamp: '2024-01-15...',   │
│        platform: 'darwin',          │
│        version: '0.1.0'             │
│      }                               │
│    }                                 │
│ 3. Check provider: 'file' (default)  │
└──────────────┬──────────────────────┘
               │
               ▼
Step 6: FILE LOGGING
┌─────────────────────────────────────┐
│ analytics.js: logToFile()           │
│                                     │
│ fs.appendFileSync(                  │
│   '~/Library/.../analytics-2024-01-15.log',│
│   JSON.stringify(event) + '\n'     │
│ )                                   │
└──────────────┬──────────────────────┘
               │
               ▼
Step 7: DATA STORED
┌─────────────────────────────────────┐
│ File: analytics-2024-01-15.log     │
│                                     │
│ {"timestamp":"2024-01-15T10:30:00Z",│
│  "event":"grammar_fix_attempted",   │
│  "properties":{                     │
│    "text_length":100,               │
│    "userId":"user_123...",          │
│    "sessionId":"session_456...",    │
│    "platform":"darwin",             │
│    "version":"0.1.0"                │
│  }                                   │
│ }                                    │
└──────────────────────────────────────┘
```

## Configuration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION SOURCES                                 │
└─────────────────────────────────────────────────────────────────────────┘

Environment Variables (.env file)
├─► ANALYTICS_PROVIDER=file|posthog|mixpanel
├─► POSTHOG_API_KEY=your_key_here
├─► POSTHOG_HOST=https://app.posthog.com
├─► MIXPANEL_TOKEN=your_token_here
└─► ANALYTICS_LOG_TO_FILE=true|false
         │
         ▼
┌─────────────────────────────────────┐
│ analytics.js constructor            │
│ Reads process.env                   │
│ Sets this.config                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ initialize() method                │
│                                     │
│ switch (provider) {                 │
│   case 'posthog':                   │
│     initializePostHog()             │
│   case 'mixpanel':                  │
│     initializeMixpanel()            │
│   default:                          │
│     provider = 'file'                │
│ }                                   │
└──────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                       │
└─────────────────────────────────────────────────────────────────────────┘

Event Tracking Attempt
         │
         ▼
┌─────────────────────────────────────┐
│ Try: PostHog API call               │
│                                     │
│ ❌ Error: No API key                │
│    └─► Fallback to file            │
│                                     │
│ ❌ Error: Network failure           │
│    └─► Fallback to file            │
│                                     │
│ ❌ Error: Invalid response         │
│    └─► Fallback to file            │
│                                     │
│ ✅ Success: Event sent              │
│    └─► Done                         │
└──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Fallback: File Logging              │
│                                     │
│ Always succeeds (local file)        │
│ No data loss                        │
└──────────────────────────────────────┘
```

## Data Enrichment

Every event automatically gets enriched with:

```
Your Custom Properties
    +
┌─────────────────────────────────────┐
│ Automatic Properties Added:        │
├─────────────────────────────────────┤
│ • userId (persistent, per device)  │
│ • sessionId (new each app launch)   │
│ • timestamp (ISO 8601 format)        │
│ • platform (darwin/win32/linux)     │
│ • version (app version from package) │
└─────────────────────────────────────┘
    =
Complete Event Object
```

## Summary

1. **Event Origin**: Renderer (UI) or Main Process (background)
2. **IPC Bridge**: preload.js exposes safe API to renderer
3. **Main Handler**: IPC handlers forward to analytics module
4. **Analytics Processing**: Enriches event with metadata
5. **Provider Routing**: Sends to PostHog/Mixpanel/File based on config
6. **Fallback**: Always falls back to file logging if provider fails
7. **Storage**: Events end up in cloud dashboard or local log file

