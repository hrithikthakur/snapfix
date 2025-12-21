# Fix Firebase Project Reference

## Problem
Your `.firebaserc` references `snapfix-app-2025` which doesn't exist.

## Solution

### Step 1: List Your Projects
```bash
cd landing
firebase projects:list
```

This will show all your existing Firebase projects. Copy one of the project IDs.

### Step 2: Update .firebaserc

**Option A: Use Firebase CLI (Recommended)**
```bash
firebase use <project-id-from-list>
```

This automatically updates `.firebaserc`.

**Option B: Edit Manually**
If you know a project ID, edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### Step 3: Initialize Hosting
```bash
firebase init hosting
```

When prompted:
- Select "Use an existing project"
- Choose your project from the list
- Public directory: `.` (current directory)
- Single-page app: Yes
- Automatic builds: No

### Step 4: Deploy
```bash
firebase deploy --only hosting
```

## If You Have No Projects

If `firebase projects:list` shows no projects, you have two options:

1. **Wait for quota** - Wait 24 hours or request quota increase
2. **Use alternative hosting** - Netlify or Vercel (easier!)

