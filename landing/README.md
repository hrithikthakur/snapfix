# SnapFix Landing Page

A modern, responsive landing page for SnapFix, ready to deploy on Firebase Hosting.

## Features

- 🎨 Modern, attractive design with smooth animations
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast loading with optimized assets
- 🔍 SEO-friendly structure
- 🚀 Ready for Firebase Hosting

## Local Development

To preview the landing page locally:

1. **Using a simple HTTP server:**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server)
   npx http-server -p 8000
   ```

2. Open your browser and navigate to `http://localhost:8000`

## Deploy to Firebase

### Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Initial Setup

1. **Initialize Firebase in the landing directory:**
   ```bash
   cd landing
   firebase init hosting
   ```
   
   When prompted:
   - Select "Use an existing project" or "Create a new project"
   - Set public directory to `.` (current directory)
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No` (unless you want CI/CD)

2. **Update `.firebaserc`** with your Firebase project ID if needed

### Deploy

1. **Create custom Firebase site (first time only):**
   ```bash
   # Create a custom site ID for a cleaner URL (e.g., snapfix.web.app)
   firebase hosting:sites:create snapfix --project snapfix
   ```
   
   Or create it via [Firebase Console](https://console.firebase.google.com) → Hosting → Add another site

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

3. Your site will be live at:
   - Custom site: `https://snapfix.web.app` (after creating the custom site)
   - Default: `https://snapfix.web.app` or `https://snapfix.firebaseapp.com`

### Custom Domain

To use a custom domain (e.g., `snapfix.app`), you can use either the Firebase Console or CLI:

#### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`snapfix`)
3. Navigate to **Hosting** → **Add custom domain**
4. Enter your domain (e.g., `snapfix.app` or `www.snapfix.app`)
5. Firebase will provide DNS records to add:
   - For apex domain: Add A records pointing to Firebase IPs
   - For subdomain: Add CNAME record pointing to Firebase
6. Add the DNS records at your domain registrar
7. Firebase will automatically provision SSL certificate (may take a few hours)

#### Option 2: Using Firebase CLI

```bash
# List existing domains
firebase hosting:sites:list

# Add a custom domain (you'll need to verify via DNS)
firebase hosting:sites:create your-site-id

# Then add domain via Console or use:
firebase hosting:channel:deploy preview --only hosting
```

**Important Notes:**
- SSL certificate provisioning takes 24-48 hours
- Make sure DNS records are properly configured before Firebase can verify
- You can add both apex domain (`snapfix.app`) and subdomain (`www.snapfix.app`)
- After verification, both will serve your Firebase Hosting site

## File Structure

```
landing/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── script.js           # JavaScript for interactivity
├── firebase.json       # Firebase hosting configuration
├── .firebaserc         # Firebase project configuration
└── README.md           # This file
```

## Customization

### Update Download Links / DMG

Firebase Hosting’s Spark plan blocks executable files, so the DMG is hosted on a separate GitHub Pages site (`snapfix-downloads` repo) at `https://downloads.snapfix.app/SnapFix.dmg`.

1. Build a new DMG from the root project: `npm run build:mac`.
2. Replace the file in `~/Library/Mobile Documents/com~apple~CloudDocs/Codes/snapfix-downloads/SnapFix.dmg`.
3. From that repo run:
   ```bash
   git add SnapFix.dmg
   git commit -m "Update SnapFix DMG"
   git push origin gh-pages
   ```
   (The repo is already configured with Git LFS + CNAME.)
4. Deploy the landing site from `landing/`: `firebase deploy --only hosting`.

If you ever move the host, update both download buttons in `index.html` to the new URL.

### Change Colors

Update CSS variables in `styles.css`:
```css
:root {
    --primary: #6366F1;
    --secondary: #8B5CF6;
    /* ... */
}
```

### Update Content

All content is in `index.html`. Simply edit the text, headings, and sections as needed.

## Performance Tips

- Images are optimized for web
- CSS and JS are minified-ready
- Caching headers are configured in `firebase.json`
- Consider using a CDN for static assets if needed

## License

MIT

