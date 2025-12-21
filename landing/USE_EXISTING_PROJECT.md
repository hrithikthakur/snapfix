# Using an Existing Firebase Project

## Steps

1. **List your projects:**
   ```bash
   cd landing
   firebase projects:list
   ```

2. **Select a project:**
   ```bash
   firebase use <project-id>
   ```
   
   This will update `.firebaserc` automatically.

3. **Initialize hosting (if not already done):**
   ```bash
   firebase init hosting
   ```
   
   When prompted:
   - Select "Use an existing project"
   - Choose your project
   - Public directory: `.` (current directory)
   - Single-page app: Yes
   - Automatic builds: No

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

## Quick Commands

```bash
# See all projects
firebase projects:list

# Use a project
firebase use <project-id>

# Deploy
firebase deploy --only hosting
```

