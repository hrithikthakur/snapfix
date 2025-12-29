# App Store Screenshots Guide

## Required Screenshot Sizes for macOS

The Mac App Store requires screenshots at these specific resolutions:

- **1280 × 800px** (13" MacBook Air/Pro)
- **1440 × 900px** (13" MacBook Pro)
- **2560 × 1600px** (15" MacBook Pro)
- **2880 × 1800px** (15" MacBook Pro Retina)

## How to Capture Screenshots

### Option 1: Using Your Mac (Recommended)

1. **Set up your app window:**
   - Open flickfix
   - Make sure the window looks good (settings page, main interface, etc.)
   - Arrange UI elements nicely

2. **Capture screenshots:**
   ```bash
   # Method 1: Use screenshot tool with specific size
   # Open Screenshot app (Cmd+Shift+5)
   # Select "Capture Selected Window"
   # But this won't give you exact sizes...
   
   # Method 2: Use screencapture command
   screencapture -T 0 -x ~/Desktop/flickfix-1280x800.png
   ```

3. **Resize to exact dimensions:**
   - Use Preview, Photoshop, or online tools
   - Or use `sips` command (built into macOS):
   ```bash
   # Resize to 1280x800
   sips -z 800 1280 your-screenshot.png --out flickfix-1280x800.png
   
   # Resize to 1440x900
   sips -z 900 1440 your-screenshot.png --out flickfix-1440x900.png
   
   # Resize to 2560x1600
   sips -z 1600 2560 your-screenshot.png --out flickfix-2560x1600.png
   
   # Resize to 2880x1800
   sips -z 1800 2880 your-screenshot.png --out flickfix-2880x1800.png
   ```

### Option 2: Using Simulator/Design Tools

1. **Create mockups in design tools:**
   - Figma, Sketch, or Adobe XD
   - Design your app interface
   - Export at exact sizes

2. **Use browser developer tools:**
   - Open your app's HTML in browser
   - Use responsive design mode
   - Set viewport to exact sizes
   - Take screenshots

### Option 3: Programmatic Screenshots

If you want to automate this, you can use Electron's built-in screenshot capability:

```javascript
// In your app or a separate script
const { BrowserWindow } = require('electron');

const sizes = [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 2560, height: 1600 },
  { width: 2880, height: 1800 }
];

sizes.forEach(({ width, height }) => {
  const win = new BrowserWindow({
    width,
    height,
    show: false
  });
  
  win.loadFile('index.html');
  win.webContents.once('did-finish-load', () => {
    win.capturePage().then(image => {
      require('fs').writeFileSync(
        `screenshot-${width}x${height}.png`,
        image.toPNG()
      );
      win.close();
    });
  });
});
```

## What to Show in Screenshots

1. **Main Interface:**
   - Settings window with API key input
   - Keyboard shortcut configuration
   - Status overlay (if possible)

2. **Key Features:**
   - Show the app working
   - Demonstrate the correction process
   - Highlight privacy features

3. **Best Practices:**
   - Use clean, uncluttered backgrounds
   - Show real content (not lorem ipsum)
   - Highlight key features with annotations (optional)
   - Keep text readable

## Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → App Store tab
3. Go to the version you're submitting
4. Scroll to "Screenshots"
5. Upload each size:
   - Drag and drop or click to upload
   - Add captions if desired (optional)
   - At least one screenshot is required per size

## Quick Command Reference

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Resize screenshots (using ImageMagick)
convert input.png -resize 1280x800 flickfix-1280x800.png
convert input.png -resize 1440x900 flickfix-1440x900.png
convert input.png -resize 2560x1600 flickfix-2560x1600.png
convert input.png -resize 2880x1800 flickfix-2880x1800.png

# Or using sips (built-in macOS)
sips -z 800 1280 input.png --out flickfix-1280x800.png
sips -z 900 1440 input.png --out flickfix-1440x900.png
sips -z 1600 2560 input.png --out flickfix-2560x1600.png
sips -z 1800 2880 input.png --out flickfix-2880x1800.png
```

## Tips

- **Start with highest resolution:** Capture at 2880x1800, then downscale to other sizes
- **Maintain aspect ratio:** All sizes have the same 16:10 aspect ratio
- **Use PNG format:** App Store prefers PNG
- **Keep file sizes reasonable:** Compress if needed, but maintain quality
- **Test on different displays:** Make sure screenshots look good on various Mac screens

## Example Workflow

1. Open flickfix app
2. Arrange window nicely
3. Take a screenshot at highest resolution (2880x1800)
4. Resize to all required sizes using `sips` or ImageMagick
5. Upload all 4 sizes to App Store Connect

Good luck! 📸

