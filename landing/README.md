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

1. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

2. Your site will be live at: `https://your-project-id.web.app` or `https://your-project-id.firebaseapp.com`

### Custom Domain

To use a custom domain:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Hosting → Add custom domain
4. Follow the instructions to verify your domain

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

### Update Download Links

Edit the download buttons in `index.html`:
```html
<a href="YOUR_DOWNLOAD_URL" class="btn-primary">Download for Mac</a>
```

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

