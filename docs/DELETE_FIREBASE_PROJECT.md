# How to Delete a Firebase Project

## ⚠️ Warning

**Deleting a Firebase project is PERMANENT and cannot be undone!**
- All data will be permanently deleted
- All hosting sites will be removed
- All databases, storage, and configurations will be lost
- This action cannot be reversed

## Method 1: Delete via Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - Visit https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select the project:**
   - Click on the project you want to delete
   - Or use the project selector at the top

3. **Open Project Settings:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

4. **Scroll to bottom:**
   - Scroll down to the bottom of the settings page
   - Find the "Delete project" section

5. **Delete the project:**
   - Click "Delete project"
   - Type the project ID to confirm
   - Click "Delete" again to confirm

6. **Wait for deletion:**
   - Deletion may take a few minutes
   - You'll receive an email when it's complete

## Method 2: Delete via Firebase CLI

**Note:** CLI deletion may not be available for all projects. Use the console method if CLI doesn't work.

```bash
# List your projects
firebase projects:list

# Delete a project (if CLI supports it)
firebase projects:delete <project-id>
```

**Note:** The `projects:delete` command may not be available in all Firebase CLI versions. If it doesn't work, use Method 1 (Console).

## Method 3: Delete via Google Cloud Console

Firebase projects are also Google Cloud projects, so you can delete them there:

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/
   - Select the project

2. **Open IAM & Admin:**
   - Click "IAM & Admin" in the left menu
   - Select "Settings"

3. **Delete project:**
   - Click "Shut down"
   - Enter project ID to confirm
   - Click "Shut down"

## After Deleting

1. **Update local config:**
   - Remove or update `.firebaserc` file
   - Remove the project reference

2. **Create new project (if needed):**
   ```bash
   firebase projects:create <new-project-name>
   firebase use <new-project-id>
   ```

## Common Issues

### "Cannot delete project"
- Make sure you're the project owner
- Check that billing is disabled (if applicable)
- Ensure all resources are deleted first

### "Project not found"
- Project may already be deleted
- Check if you're using the correct project ID
- Verify you have access to the project

### "Billing account attached"
- You may need to disable billing first
- Go to Project Settings > Usage and billing
- Remove billing account before deleting

## Quick Reference

**Console:** https://console.firebase.google.com/ → Project Settings → Delete project  
**CLI:** `firebase projects:delete <project-id>` (if available)  
**Cloud Console:** https://console.cloud.google.com/ → IAM & Admin → Settings → Shut down

