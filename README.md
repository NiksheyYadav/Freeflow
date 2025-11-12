# Freeflow - Virtual Whiteboard

A fully functional whiteboard application inspired by Excalidraw, built with React, TypeScript, and Rough.js.

## Setup Instructions

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
npm run preview
```

## Troubleshooting 404 Errors

### Understanding 404 Errors

The console message "Failed to load resource: the server responded with a status of 404 ()" indicates that your web browser attempted to request a resource (such as an image, script file, CSS file, font, or another web page) from the server, but the server reported that it could not find the requested resource at the specified URL.

### Common Causes

1. **Incorrect file path/URL** - Typos in filenames or directory names
2. **Case sensitivity** - File systems on web servers (especially Linux/Unix) are case-sensitive
3. **Relative vs. Absolute paths** - Path resolution depends on the base URL
4. **Missing files** - The file doesn't exist at the expected location
5. **Server misconfiguration** - URL rewriting rules or incorrect base paths

### How to Verify

1. **Inspect the Network tab**: 
   - Open Chrome DevTools (F12 or Ctrl+Shift+I/Cmd+Option+I)
   - Navigate to the "Network" tab and refresh the page
   - Look for any entry with a "Status" of 404
   - The "Name" column shows which resource failed to load

2. **Check the URL manually**: 
   - Copy the URL of the failed resource from the Network tab
   - Paste it directly into your browser's address bar
   - If you get a 404 page, the resource is missing or the URL is incorrect

### Common Fixes

#### Static Assets (Images, Fonts, etc.)

For Vite projects, static assets should be placed in the `public/` directory:

```
public/
  └── vite.svg      # Accessible as /vite.svg in HTML
  └── favicon.ico   # Accessible as /favicon.ico
```

In `index.html`:
```html
<!-- Correct -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />

<!-- Incorrect - do NOT include 'public' in the path -->
<link rel="icon" type="image/svg+xml" href="/public/vite.svg" />
```

#### GitHub Pages Deployment

For GitHub Pages, configure the base path in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',  // Must match your repository name
  // ...
});
```

#### Case Sensitivity

File systems on servers are often case-sensitive:
```html
<!-- These are DIFFERENT files on Linux/Unix servers -->
<img src="/assets/Image.PNG" alt="My Image">
<img src="/assets/image.png" alt="My Image">
```

### Project-Specific Configuration

This project uses:
- **Base path**: `/Freeflow/` (configured in `vite.config.ts`)
- **Static assets**: Stored in `public/` directory
- **Icon**: `public/vite.svg`

All paths are automatically adjusted during build based on the base configuration.

### Testing for 404 Errors

Run the development server and check the browser console:
```bash
npm run dev
# Open http://localhost:3000/Freeflow/
# Check the browser console for any 404 errors
```

Test the production build:
```bash
npm run build
npm run preview
# Check the preview server for any 404 errors
```

More documentation coming soon...