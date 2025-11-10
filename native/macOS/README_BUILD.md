# macOS Native Module Build Guide

## Quick Fix for Python 3.13 distutils Error

If you're getting `ModuleNotFoundError: No module named 'distutils'`, this is because Python 3.12+ removed the `distutils` module that `node-gyp` depends on.

### Solution 1: Use Python 3.11 (Recommended)

```bash
# Install Python 3.11
brew install python@3.11

# Tell npm to use Python 3.11
npm config set python /opt/homebrew/bin/python3.11

# Try building again
npm run build:native
```

### Solution 2: Install setuptools for Python 3.13

```bash
# Install setuptools (which includes distutils)
pip3 install setuptools

# Try building again
npm run build:native
```

### Solution 3: Skip Native Build (App Still Works!)

The native build is **optional**. The app will automatically use fallback methods (clipboard + keyboard simulation) if the native module is not available.

```bash
# Just skip the build and run the app
npm start
```

The app will:
- Use clipboard method to get selected text
- Use clipboard + keyboard simulation to replace text
- Work exactly the same, just using fallback methods

## Building Manually

If you want to build the native module manually:

```bash
cd native/macOS
node-gyp configure
node-gyp build
```

## Verifying the Build

After building, you should see:
```
native/macOS/build/Release/textBridge.node
```

You can test it:
```bash
node -e "const m = require('./native/macOS/build/Release/textBridge.node'); console.log('Module loaded:', m.hasAccessibilityPermissions());"
```

## Why Native Modules?

Native modules provide:
- Direct access to system APIs
- More reliable text replacement
- No clipboard manipulation needed

But the fallback method works fine for most use cases!

## Troubleshooting

### "Cannot find module" after build
- Make sure the `.node` file exists in `build/Release/`
- Try running `npm run rebuild`
- Check that Electron version matches Node version used to build

### Build succeeds but module doesn't load
- Make sure you're running `npm start` (Electron) not `node`
- Check Electron version compatibility
- Try rebuilding: `npm run rebuild`

### Permission errors
- Grant Accessibility permissions in System Settings
- Restart the app after granting permissions

