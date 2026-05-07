# Color Wheel Component - Installation & Setup Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For Standalone HTML Usage

If you just want to use the Color Wheel component in a standalone HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Color Wheel Demo</title>
    <link rel="stylesheet" href="https://raw.githubusercontent.com/AncientOfLight/color-palette-and-wheel/main/color-wheel.css">
</head>
<body>
    <div id="color-wheel-container"></div>
    
    <script src="https://raw.githubusercontent.com/AncientOfLight/color-palette-and-wheel/main/color-wheel.js"></script>
    <script>
        const wheel = new ColorWheel({
            container: '#color-wheel-container',
            size: 300,
            initialColor: '#667eea'
        });
    </script>
</body>
</html>
```

### For Project Integration

```bash
# Clone the repository
git clone https://github.com/AncientOfLight/color-palette-and-wheel.git
cd color-palette-and-wheel

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📦 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/AncientOfLight/color-palette-and-wheel.git
cd color-palette-and-wheel
```

### Step 2: Install Node.js Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Step 3: Verify Installation

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (Vite default port).

---

## ⚙️ Configuration

### Vite Configuration (`vite.config.js`)

The project is pre-configured with:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/color-palette-and-wheel/', // Important for GitHub Pages
})
```

**Key Settings:**
- `base`: Set to repository name for GitHub Pages deployment
- `plugins`: React plugin for JSX support
- Build output: `dist/` folder

### Customize the Base Path

If deploying to a different repository or domain:

```javascript
// For custom domain
base: '/',

// For subdirectory
base: '/my-app/',

// For specific GitHub Pages URL
base: '/color-palette-and-wheel/',
```

---

## 🌐 GitHub Pages Deployment

### Prerequisites
- GitHub account with the repository
- Repository should be public or have GitHub Pages enabled
- Node.js 18+ installed locally

### Step 1: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under "Build and deployment":
   - Source: **GitHub Actions**
   - (The workflow will handle the rest)

### Step 2: Create GitHub Actions Workflow

Create file: `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint
        continue-on-error: true

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'dist'

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Configure GitHub Pages Branch

After the first deployment:

1. Go to **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **Deploy from a branch** (or GitHub Actions)
   - Branch: `gh-pages` (auto-created by workflow)
   - Folder: `/ (root)`
3. Click **Save**

### Step 4: Push to Main Branch

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Setup GitHub Pages deployment"

# Push to main branch
git push origin main
```

### Step 5: Monitor Deployment

1. Go to **Actions** tab in your repository
2. Click on the workflow run
3. Wait for "Deploy to GitHub Pages" job to complete
4. Your site will be live at: `https://ancientoflight.github.io/color-palette-and-wheel/`

---

## 💻 Development Workflow

### Available npm Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

### Project Structure

```
color-palette-and-wheel/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── public/                      # Static files served as-is
│   └── favicon.ico
├── src/                         # React source files (optional)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── color-wheel.js              # Color Wheel component
├── color-wheel.css             # Color Wheel styles
├── color-wheel-demo.html       # Standalone demo
├── script.js                   # Palette generator script
├── styles.css                  # Palette generator styles
├── index.html                  # Main entry point
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies and scripts
├── package-lock.json           # Dependency lock file
├── eslint.config.js            # ESLint configuration
├── README.md                   # Project documentation
└── INSTALLATION.md             # This file
```

### Development Best Practices

1. **Always use feature branches:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Write descriptive commit messages:**
   ```bash
   git commit -m "feat: Add new color algorithm"
   git commit -m "fix: Resolve color wheel lag on Firefox"
   git commit -m "docs: Update installation guide"
   ```

3. **Test before pushing:**
   ```bash
   npm run build
   npm run preview
   npm run lint
   ```

4. **Keep dependencies updated:**
   ```bash
   npm outdated  # Check for updates
   npm update    # Update to latest versions
   ```

---

## 🔧 Troubleshooting

### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
kill -9 $(lsof -t -i :5173)

# Or use a different port
npm run dev -- --port 3000
```

### Issue: GitHub Pages shows 404

**Check:**
1. Verify `base` in `vite.config.js` matches repository name
2. Check that `gh-pages` branch exists
3. Verify Settings → Pages points to correct branch
4. Wait 1-2 minutes for GitHub Pages to rebuild

**Solution:**
```bash
# Force rebuild
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### Issue: Build fails with "npm ci" error

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: Color Wheel not rendering

**Check:**
1. Canvas element exists in DOM: `<div id="color-wheel"></div>`
2. CSS file is loaded: `<link rel="stylesheet" href="color-wheel.css">`
3. JavaScript file is loaded: `<script src="color-wheel.js"></script>`
4. Correct selector in initialization: `new ColorWheel({ container: '#color-wheel' })`

**Solution:**
```javascript
// Verify container exists
console.log(document.querySelector('#color-wheel'));

// Check for errors in console
// Press F12 and check for red error messages
```

### Issue: Touch events not working on mobile

**Check:**
1. `enableTouch: true` in ColorWheel config (default)
2. Touch events are not prevented elsewhere
3. Device has touch support (not all simulators support this)

**Solution:**
```javascript
const wheel = new ColorWheel({
    container: '#color-wheel',
    enableTouch: true,  // Explicitly enable
    onColorChange: (color) => {
        console.log('Touch detected:', color.hex);
    }
});
```

### Issue: Slow performance on large canvases

**Solution:**
```javascript
// Reduce canvas size
const wheel = new ColorWheel({
    container: '#color-wheel',
    size: 250  // Instead of 400+
});

// Debounce heavy operations
const wheel = new ColorWheel({
    container: '#color-wheel',
    onColorChange: debounce((color) => {
        performHeavyOperation(color);
    }, 100)
});

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
```

### Issue: Linting errors

**Solution:**
```bash
# View all linting issues
npm run lint

# Auto-fix fixable issues
npm run lint -- --fix

# Ignore specific files (edit eslint.config.js)
```

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/AncientOfLight/color-palette-and-wheel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AncientOfLight/color-palette-and-wheel/discussions)
- **Documentation**: [color-wheel-demo.html](color-wheel-demo.html)

---

## ✅ Checklist for First-Time Setup

- [ ] Cloned repository locally
- [ ] Installed Node.js 18+
- [ ] Ran `npm install` successfully
- [ ] Started dev server with `npm run dev`
- [ ] Viewed application at `http://localhost:5173`
- [ ] Built project with `npm run build`
- [ ] Verified `dist/` folder exists
- [ ] Created `.github/workflows/deploy.yml`
- [ ] Enabled GitHub Pages in Settings
- [ ] Pushed to main branch
- [ ] Verified workflow completed in Actions tab
- [ ] Accessed live site on GitHub Pages

---

## 🎉 You're All Set!

Your Color Palette Generator & Color Wheel is now installed and configured. 

**Next Steps:**
1. Explore the [README.md](README.md) for full documentation
2. Check [color-wheel-demo.html](color-wheel-demo.html) for API examples
3. Customize the component for your needs
4. Deploy to GitHub Pages and share your creation!

---

**Made with ❤️ by AncientOfLight**

Last updated: May 7, 2026
