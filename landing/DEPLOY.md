# Deploy Landing Page

Quick guide to deploy the SnapFix landing page.

## Quick Deploy (Recommended)

```bash
cd /Users/hrithikthakur/Code/snapfix/landing
./deploy.sh
```

This script will:
1. Check if you're logged in to Firebase
2. Set up the project
3. Deploy to Firebase Hosting

## Manual Deploy Steps

### Step 1: Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
cd /Users/hrithikthakur/Code/snapfix/landing
firebase login
```

This will open a browser for authentication. Use: `northernlights271@gmail.com`

### Step 3: Check/Select Firebase Project

```bash
# List your projects
firebase projects:list

# Use existing project (if you have one)
firebase use <project-id>

# Or create a new project
firebase projects:create snapfix-app
firebase use snapfix-app
```

### Step 4: Initialize Hosting (if not already done)

```bash
firebase init hosting
```

When prompted:
- Select "Use an existing project" or "Create a new project"
- Public directory: `.` (current directory)
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

### Step 5: Deploy

```bash
firebase deploy --only hosting
```

## After Deployment

Your site will be live at:
- `https://snapfix.web.app` (if custom site created)
- `https://<project-id>.web.app`
- `https://<project-id>.firebaseapp.com`

## Verify Deployment

1. Visit the URL shown after deployment
2. Check that the page loads correctly
3. Test download links
4. Verify all assets load (images, CSS, etc.)

## Troubleshooting

### "Not logged in"
```bash
firebase login
```

### "Project doesn't exist"
```bash
# Create via console: https://console.firebase.google.com/
# Or via CLI:
firebase projects:create snapfix-app
firebase use snapfix-app
```

### "Permission denied"
- Make sure you're logged in with the correct account
- Check Firebase Console that you have access to the project

### Files not updating
```bash
# Clear Firebase cache and redeploy
firebase deploy --only hosting --force
```

## Alternative Hosting Options

If Firebase doesn't work, you can use:

### Netlify (Easiest)
1. Go to https://app.netlify.com/
2. Drag and drop the `landing` folder
3. Done!

### Vercel
```bash
npm install -g vercel
cd landing
vercel
```

### GitHub Pages
1. Push `landing` folder to GitHub
2. Enable GitHub Pages in repo settings
3. Select `landing` folder as source

## Quick Reference

```bash
# Login
firebase login

# List projects
firebase projects:list

# Use project
firebase use <project-id>

# Deploy
firebase deploy --only hosting

# View deployment history
firebase hosting:channel:list
```

## Update After Changes

Whenever you update `index.html` or other files:

```bash
cd /Users/hrithikthakur/Code/snapfix/landing
firebase deploy --only hosting
```

That's it! Your changes will be live in seconds. 🚀

