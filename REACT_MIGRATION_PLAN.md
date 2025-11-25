# React + Vite Migration Checklist for js-bonsai

> **Instructions for Claude Code:**
> - Mark completed items with `[x]` instead of `[ ]`
> - Add completion notes under each checked item using `> ✅ Completed: [brief note]`
> - Update the "Last Updated" timestamp when checking off items
> - If a step fails, add `> ⚠️ Issue: [description]` and move to troubleshooting section
> - Always verify each step before marking as complete

**Last Updated:** Not started
**Current Phase:** Pre-migration
**Branch:** `refactor-react-site`

---

## Migration Overview

**Goal:** Migrate js-bonsai from plain HTML/CSS/JS to React + Vite + Tailwind CSS

**Strategy:** Wrap existing vanilla JavaScript (no full rewrite)

**Key Decisions:**
- ✓ Migration Approach: Wrap existing vanilla JS
- ✓ Styling: Tailwind CSS
- ✓ Legacy Code: Keep as reference in `legacy-vanilla/`
- ✓ Component Granularity: Medium (OptionsPanel, BonsaiCanvas, ControlButtons)

---

## Pre-Migration Checklist

### Current State Verification
- [ ] Confirm current branch is `refactor-react-site`
- [ ] Verify vanilla version works correctly
  - [ ] Test tree generation with default settings
  - [ ] Test all 4 color palettes (default, cherry, wisteria, maple)
  - [ ] Test live mode animation
  - [ ] Test infinite mode
  - [ ] Test with fixed seed (record seed number: _____)
- [ ] Take screenshots of current UI for comparison
  - [ ] Default palette
  - [ ] Cherry palette
  - [ ] Wisteria palette
  - [ ] Maple palette
- [ ] Document current file structure
- [ ] Commit any uncommitted changes

### Backup Strategy
- [ ] Create git tag `pre-react-migration` for easy rollback
- [ ] Verify `.gitignore` exists and is current

---

## Phase 1: Project Setup (Vite + React + Tailwind)

**Goal:** Initialize modern build tooling and dependencies

### 1.1 Initialize Node.js Project
- [ ] Run `npm create vite@latest . -- --template react`
  - [ ] Select "React" as framework
  - [ ] Select "JavaScript" as variant (not TypeScript)
- [ ] Verify `package.json` was created
- [ ] Verify `vite.config.js` was created
- [ ] Run `npm install` to install base dependencies
  - [ ] Verify `node_modules/` folder created
  - [ ] Verify `package-lock.json` created

### 1.2 Install Additional Dependencies
- [ ] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Install utility library: `npm install clsx`
- [ ] Initialize Tailwind: `npx tailwindcss init -p`
  - [ ] Verify `tailwind.config.js` created
  - [ ] Verify `postcss.config.js` created
- [ ] Verify all packages in `package.json`:
  - [ ] `react` and `react-dom`
  - [ ] `vite` and `@vitejs/plugin-react`
  - [ ] `tailwindcss`, `postcss`, `autoprefixer`
  - [ ] `clsx`

### 1.3 Configure Vite

- [ ] Update `vite.config.js` with path aliases:
  ```js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
        '@lib': '/src/lib',
        '@components': '/src/components',
        '@hooks': '/src/hooks',
      },
    },
  })
  ```
- [ ] Test config by running `npm run dev` (should fail but validate config)
- [ ] Stop dev server

### 1.4 Configure Tailwind CSS

- [ ] Update `tailwind.config.js` with custom colors:
  ```js
  export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          'bonsai-bg': '#222',
          'bonsai-card': '#333',
          'bonsai-border': '#444',
          'bonsai-green': '#4e9a06',
          'bonsai-accent': '#4a5',
        },
      },
    },
  }
  ```
- [ ] Verify Tailwind content paths include all necessary files

### 1.5 Configure Deployment

- [ ] Create `netlify.toml` in project root:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"

  [build.environment]
    NODE_VERSION = "18"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- [ ] Verify file is in project root
- [ ] Verify TOML syntax is correct

### 1.6 Update Git Configuration

- [ ] Update `.gitignore` to include:
  ```
  # Build output
  dist
  node_modules
  *.local

  # Logs
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*

  # Netlify (keep existing .netlify ignore)
  ```
- [ ] Verify `.gitignore` has all necessary entries

### 1.7 Verify Package Scripts

- [ ] Confirm `package.json` has correct scripts:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

**Phase 1 Completion Check:**
- [ ] All dependencies installed without errors
- [ ] All config files created and valid
- [ ] Git ignore updated
- [ ] Ready to proceed to Phase 2

---

## Phase 2: Preserve Legacy & Reorganize

**Goal:** Safely move vanilla code to legacy folder and prepare new structure

### 2.1 Create Legacy Backup

- [ ] Create `legacy-vanilla/` folder in project root
- [ ] Create `legacy-vanilla/README.md` with note:
  ```markdown
  # Legacy Vanilla JavaScript Version

  This folder contains the original vanilla HTML/CSS/JS implementation
  before React migration. Preserved for reference and rollback capability.

  **Branch:** refactor-react-site (pre-React)
  **Date Preserved:** [date]
  ```

### 2.2 Move Files to Legacy

- [ ] Move `src/` → `legacy-vanilla/src/`
  - [ ] Verify all modules copied: bonsai.js, config/, modules/, utils/
- [ ] Move `index.html` → `legacy-vanilla/index.html`
- [ ] Move `style.css` → `legacy-vanilla/style.css`
- [ ] Move all `test-*.html` files → `legacy-vanilla/`
- [ ] Verify vanilla version still in `legacy-vanilla/index.html` (can open directly)

### 2.3 Copy Vanilla JS to New Location

- [ ] Create `src/lib/` folder
- [ ] Copy `legacy-vanilla/src/bonsai.js` → `src/lib/bonsai.js`
- [ ] Copy `legacy-vanilla/src/config/` → `src/lib/config/`
  - [ ] Verify: bases.js, characters.js, colors.js, defaults.js, index.js
- [ ] Copy `legacy-vanilla/src/modules/` → `src/lib/modules/`
  - [ ] Verify: css-manager.js, renderer.js, tree-generator.js, ui-controls.js
- [ ] Copy `legacy-vanilla/src/utils/` → `src/lib/utils/`
  - [ ] Verify: random.js

### 2.4 Verify File Structure

- [ ] Confirm new structure exists:
  ```
  src/
  └── lib/
      ├── bonsai.js
      ├── config/
      ├── modules/
      └── utils/
  legacy-vanilla/
  ├── src/
  ├── index.html
  ├── style.css
  └── test-*.html
  ```

**Phase 2 Completion Check:**
- [ ] Legacy files preserved and accessible
- [ ] Vanilla JS copied to `src/lib/`
- [ ] No files lost or corrupted
- [ ] Ready to proceed to Phase 3

---

## Phase 3: Adapt Vanilla JS for React

**Goal:** Make minimal changes to JSBonsai to work with React refs

### 3.1 Modify JSBonsai Constructor (src/lib/bonsai.js)

- [ ] Read current `src/lib/bonsai.js` constructor (lines 21-89)
- [ ] Update constructor signature to accept `containerRef` parameter:
  ```js
  constructor(options = {}, containerRef = null) {
    // Create shared state object (keep existing lines 23-40)
    this.state = {
      tree: [],
      timeouts: [],
      counters: { branches: 0, shoots: 0, shootCounter: 0 },
      flags: { isGrowing: false, isScreensaverActive: false },
      refs: { container: null, keydownListener: null },
      options: { ...CONFIG.defaults, ...options }
    };

    // UPDATED: Accept containerRef from React
    if (containerRef) {
      this.state.refs.container = containerRef;
    } else if (this.state.options.container) {
      this.state.refs.container = document.getElementById(this.state.options.container);
    }

    // UPDATED: Don't fail if container not ready
    if (!this.state.refs.container) {
      console.warn('Container not provided - call setContainer() before rendering');
    }

    // ... keep existing: screensaver, validateOptions, random, modules (lines 50-85)

    // REMOVED: this.start() - React will control this
  }
  ```
- [ ] Verify constructor accepts `containerRef` parameter
- [ ] Verify constructor doesn't auto-start tree generation
- [ ] Verify warning logged if no container

### 3.2 Add New Methods to JSBonsai

- [ ] Add `setContainer()` method at end of class (after `changePalette()`):
  ```js
  /**
   * Set container after construction (for React refs)
   */
  setContainer(containerRef) {
    this.state.refs.container = containerRef;
    if (containerRef) {
      this.renderer.initializeDisplay();
    }
  }

  /**
   * Get current options
   */
  getOptions() {
    return { ...this.state.options };
  }

  /**
   * Update single option
   */
  updateOption(key, value) {
    this.state.options[key] = value;
    this.validateOptions();
  }
  ```
- [ ] Verify `setContainer()` method added
- [ ] Verify `getOptions()` method added
- [ ] Verify `updateOption()` method added

### 3.3 Disable Auto-UI Creation

- [ ] Find lines 80-82 (UI creation in constructor)
- [ ] Update condition to prevent UI creation when using React:
  ```js
  // UPDATED: Only create UI in verbose mode AND when not using React
  if (this.state.options.verbose && !containerRef) {
    this.uiControls.createUI();
  }
  ```
- [ ] Verify UI creation is conditional

### 3.4 Test Adapted JSBonsai (Manual Verification)

- [ ] Open `src/lib/bonsai.js` in editor
- [ ] Verify all 4 changes made correctly:
  - [ ] Constructor signature updated
  - [ ] Auto-start removed
  - [ ] UI creation conditional
  - [ ] Three new methods added
- [ ] Check for syntax errors (no dangling brackets, etc.)

**Phase 3 Completion Check:**
- [ ] `src/lib/bonsai.js` modified with exactly 4 changes
- [ ] No other vanilla JS files modified
- [ ] Syntax validated
- [ ] Ready to proceed to Phase 4

---

## Phase 4: Create React Structure

**Goal:** Build React components and hooks

### 4.1 Create Folder Structure

- [ ] Create `src/components/` folder
- [ ] Create `src/hooks/` folder
- [ ] Create `src/styles/` folder
- [ ] Verify structure:
  ```
  src/
  ├── components/
  ├── hooks/
  ├── lib/
  └── styles/
  ```

### 4.2 Create Entry Point (src/main.jsx)

- [ ] Create `src/main.jsx` with content:
  ```jsx
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App.jsx'
  import './styles/index.css'

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  ```
- [ ] Verify file created at correct path
- [ ] Verify imports are correct

### 4.3 Create Core Hook (src/hooks/useBonsai.js)

- [ ] Create `src/hooks/useBonsai.js`
- [ ] Implement complete hook with useState, useEffect, refs
  - [ ] State: bonsaiInstance, options, isGrowing
  - [ ] Ref: containerRef
  - [ ] Effect: Initialize JSBonsai instance
  - [ ] Effect: Set container when ref ready
  - [ ] Function: updateOption
  - [ ] Function: generateTree
  - [ ] Cleanup: clearTimeouts on unmount
- [ ] Verify hook exports: `{ bonsaiInstance, containerRef, options, updateOption, generateTree, isGrowing }`

### 4.4 Create App Component (src/App.jsx)

- [ ] Create `src/App.jsx`
- [ ] Import useBonsai hook
- [ ] Import BonsaiCanvas and OptionsPanel (will create next)
- [ ] Implement layout:
  - [ ] Header with title and description
  - [ ] Main grid (5 columns: 2 for options, 3 for canvas)
  - [ ] Footer with attribution
- [ ] Use Tailwind classes for styling
- [ ] Verify responsive grid (lg:grid-cols-5)

### 4.5 Create Canvas Component (src/components/BonsaiCanvas.jsx)

- [ ] Create `src/components/BonsaiCanvas.jsx`
- [ ] Accept `containerRef` prop
- [ ] Render card with ref attached to inner div
- [ ] Apply `bonsai-canvas` class for ASCII rendering
- [ ] Use Tailwind for card styling

### 4.6 Create Options Panel (src/components/OptionsPanel.jsx)

- [ ] Create `src/components/OptionsPanel.jsx`
- [ ] Accept props: options, updateOption, generateTree, isGrowing
- [ ] Import child components (will create next)
- [ ] Structure with scrollable area + fixed button
- [ ] Create 3 OptionCategory sections:
  - [ ] Display Mode (live, time, infinite, wait)
  - [ ] Growth Parameters (multiplier, life, seed)
  - [ ] Appearance (message, color palette)
- [ ] Add ControlButtons at bottom

### 4.7 Create Reusable Components

**OptionCategory.jsx:**
- [ ] Create `src/components/OptionCategory.jsx`
- [ ] Accept title and children props
- [ ] Style with dark background and accent border
- [ ] Use Tailwind classes

**OptionInput.jsx:**
- [ ] Create `src/components/OptionInput.jsx`
- [ ] Accept: type, label, value, onChange, disabled, ...props
- [ ] Handle checkbox type separately (flex layout)
- [ ] Handle number/text types (vertical layout)
- [ ] Style with Tailwind (bg-gray-700, border, focus ring)
- [ ] Support disabled state

**ColorPalettePicker.jsx:**
- [ ] Create `src/components/ColorPalettePicker.jsx`
- [ ] Import CONFIG from @lib/config
- [ ] Map over palettes: ['default', 'cherry', 'wisteria', 'maple']
- [ ] Render color swatch buttons
- [ ] Show checkmark on selected palette
- [ ] Use palette leaf color as swatch background
- [ ] Handle onClick to call onChange

**ControlButtons.jsx:**
- [ ] Create `src/components/ControlButtons.jsx`
- [ ] Accept: generateTree, isGrowing props
- [ ] Render full-width button
- [ ] Show "Growing..." when isGrowing is true
- [ ] Disable button during growth
- [ ] Style with Tailwind

### 4.8 Verify All Components Created

- [ ] Check `src/components/` has 6 files:
  - [ ] BonsaiCanvas.jsx
  - [ ] OptionsPanel.jsx
  - [ ] OptionCategory.jsx
  - [ ] OptionInput.jsx
  - [ ] ColorPalettePicker.jsx
  - [ ] ControlButtons.jsx
- [ ] Check `src/hooks/` has 1 file:
  - [ ] useBonsai.js
- [ ] Check `src/` has 2 files:
  - [ ] main.jsx
  - [ ] App.jsx

**Phase 4 Completion Check:**
- [ ] All React components created
- [ ] All imports use path aliases (@lib, @components, @hooks)
- [ ] No TypeScript errors (if using editor)
- [ ] Ready to proceed to Phase 5

---

## Phase 5: Styling with Tailwind

**Goal:** Set up Tailwind and preserve ASCII rendering styles

### 5.1 Create Base Styles

- [ ] Create `src/styles/index.css` with content:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* CRITICAL: Preserve ASCII rendering styles */
  @layer components {
    .bonsai-canvas {
      /* Essential for ASCII art - DO NOT CHANGE */
      white-space: pre;
      font-family: monospace;
      line-height: 1.2;
      font-size: 16px;

      /* Tailwind utilities for layout/colors */
      @apply bg-black text-bonsai-accent p-5 rounded-lg;
      @apply w-full min-h-[500px] overflow-auto;
      @apply shadow-lg border border-gray-800;
    }
  }
  ```
- [ ] Verify Tailwind directives at top
- [ ] Verify `.bonsai-canvas` class in components layer
- [ ] Verify ASCII properties preserved (whitespace, monospace, line-height)

### 5.2 Verify CSS Integration

- [ ] Confirm `src/main.jsx` imports `./styles/index.css`
- [ ] Confirm Tailwind will process this file (in content paths)

### 5.3 Test Tailwind Build

- [ ] Run `npm run dev`
- [ ] Check terminal for Tailwind processing
- [ ] Open browser to dev server URL
- [ ] Check for CSS errors in browser console
- [ ] Stop dev server

**Phase 5 Completion Check:**
- [ ] Tailwind CSS file created
- [ ] ASCII rendering styles preserved
- [ ] Dev server runs without CSS errors
- [ ] Ready to proceed to Phase 6

---

## Phase 6: Update Entry HTML

**Goal:** Replace vanilla HTML with minimal Vite entry point

### 6.1 Backup Current index.html

- [ ] Copy current `index.html` to `legacy-vanilla/` (if not already done)

### 6.2 Create New index.html

- [ ] Replace root `index.html` with minimal version:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>js-bonsai - ASCII Bonsai Tree Generator</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```
- [ ] Verify `<div id="root">` exists
- [ ] Verify script points to `/src/main.jsx`
- [ ] Verify no old script tags remain
- [ ] Verify no inline styles or old CSS links

**Phase 6 Completion Check:**
- [ ] New index.html in place
- [ ] Old vanilla HTML preserved in legacy folder
- [ ] Ready to proceed to Phase 7

---

## Phase 7: Initial Testing & Debugging

**Goal:** Get the React app running and fix initial issues

### 7.1 First Dev Server Run

- [ ] Run `npm run dev`
- [ ] Check for compilation errors
- [ ] Note dev server URL (usually http://localhost:5173)
- [ ] Open browser to dev server URL

### 7.2 Debug Common Issues

**If blank page:**
- [ ] Check browser console for errors
- [ ] Verify `#root` div exists
- [ ] Verify React mounting in console

**If import errors:**
- [ ] Check path aliases in vite.config.js
- [ ] Verify all import paths use @ aliases correctly
- [ ] Check for typos in component names

**If tree doesn't render:**
- [ ] Check containerRef is being set
- [ ] Check JSBonsai instance created
- [ ] Check console for JSBonsai errors
- [ ] Verify CSSManager injecting styles (check <head> for style tag)

### 7.3 Verify Core Functionality

- [ ] Tree renders on page load
- [ ] "Generate Tree" button works
- [ ] Live mode checkbox toggles
- [ ] Infinite mode checkbox toggles
- [ ] Multiplier slider updates
- [ ] Life slider updates
- [ ] Seed input works
- [ ] Message input works
- [ ] Color palette buttons switch colors

### 7.4 Visual Comparison

- [ ] Compare to screenshots from pre-migration
- [ ] Verify ASCII art renders correctly (no extra spaces/wrapping)
- [ ] Verify colors match (check all 4 palettes)
- [ ] Verify layout matches (2/5 options, 3/5 canvas)
- [ ] Test responsive behavior (shrink browser window)

### 7.5 Fix Critical Issues

- [ ] Document any bugs found
- [ ] Fix render-blocking issues
- [ ] Fix state sync issues
- [ ] Fix CSS/styling issues

**Phase 7 Completion Check:**
- [ ] App runs in dev mode
- [ ] No console errors
- [ ] Tree generates correctly
- [ ] All controls work
- [ ] Visual parity with vanilla version
- [ ] Ready to proceed to Phase 8

---

## Phase 8: Production Build & Deployment

**Goal:** Create production build and deploy to Netlify

### 8.1 Production Build

- [ ] Run `npm run build`
- [ ] Check for build warnings
- [ ] Check for build errors
- [ ] Verify `dist/` folder created
- [ ] Check `dist/` folder contents:
  - [ ] index.html
  - [ ] assets/ folder with JS bundles
  - [ ] assets/ folder with CSS files

### 8.2 Preview Production Build

- [ ] Run `npm run preview`
- [ ] Open preview URL in browser
- [ ] Test all functionality in production build
- [ ] Verify no console errors
- [ ] Stop preview server

### 8.3 Commit Changes

- [ ] Stage all new/modified files
- [ ] Review changes with `git status`
- [ ] Create commit: `git commit -m "Migrate to React + Vite + Tailwind

- Wrap vanilla JS logic in React components
- Add Tailwind CSS for styling
- Preserve legacy version in legacy-vanilla/
- Configure Vite build and Netlify deployment

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`
- [ ] Verify commit created

### 8.4 Push to Remote

- [ ] Push to remote: `git push origin refactor-react-site`
- [ ] Verify push successful
- [ ] Check GitHub/remote for updated branch

### 8.5 Deploy to Netlify

- [ ] Netlify auto-build should trigger (if connected)
- [ ] Monitor Netlify build logs
- [ ] Wait for deployment to complete
- [ ] Note deployment URL

### 8.6 Test Production Deployment

- [ ] Open Netlify deployment URL
- [ ] Test all functionality:
  - [ ] Tree generation
  - [ ] All 4 color palettes
  - [ ] Live mode
  - [ ] Infinite mode
  - [ ] All controls
  - [ ] Responsive layout on mobile
- [ ] Check browser console for errors
- [ ] Test with fixed seed, compare to vanilla version

### 8.7 Verify Deterministic Generation

- [ ] Use fixed seed (e.g., 12345)
- [ ] Generate tree in React version
- [ ] Open `legacy-vanilla/index.html` locally
- [ ] Generate tree with same seed
- [ ] Compare trees (should be identical)

**Phase 8 Completion Check:**
- [ ] Production build successful
- [ ] Deployed to Netlify
- [ ] All functionality works in production
- [ ] Deterministic generation verified
- [ ] Migration complete! 🎉

---

## Post-Migration Tasks

### Documentation

- [ ] Update main README.md with:
  - [ ] React + Vite stack information
  - [ ] Development setup instructions (`npm install`, `npm run dev`)
  - [ ] Build instructions (`npm run build`)
  - [ ] Deployment information
- [ ] Update package.json description
- [ ] Add this checklist to project for reference

### Cleanup

- [ ] Remove unused Vite template files (if any)
- [ ] Verify no dead code in components
- [ ] Check for TODO comments and address
- [ ] Review bundle size (`dist/assets/`)

### Optional Enhancements

- [ ] Add PropTypes or TypeScript
- [ ] Add ESLint configuration
- [ ] Add Prettier configuration
- [ ] Add unit tests for components
- [ ] Add E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add performance monitoring

---

## Rollback Plan

If migration fails or issues arise:

### Option 1: Revert to Legacy

- [ ] Stop using React version
- [ ] Use `legacy-vanilla/index.html` directly
- [ ] Deploy legacy folder to separate Netlify site

### Option 2: Git Rollback

- [ ] Checkout pre-migration tag: `git checkout pre-react-migration`
- [ ] Create new branch from tag
- [ ] Deploy old version

### Option 3: Keep Both Versions

- [ ] Deploy React version to main domain
- [ ] Deploy legacy to subdomain or `/vanilla` path
- [ ] Use Netlify redirects to manage both

---

## Troubleshooting Guide

### Issue: "Cannot find module '@lib/bonsai'"

**Solution:**
- Check vite.config.js has correct alias: `'@lib': '/src/lib'`
- Restart dev server after config changes
- Verify file exists at `src/lib/bonsai.js`

### Issue: Tree doesn't render

**Solution:**
- Check containerRef is being passed to BonsaiCanvas
- Check useEffect dependencies in useBonsai hook
- Verify JSBonsai.setContainer() is called
- Check console for JSBonsai errors

### Issue: Colors don't work

**Solution:**
- Verify CSSManager still injects styles (check `<head>` for `<style id="js-bonsai-style">`)
- Check Tailwind not purging dynamic classes
- Verify color palette CONFIG import works

### Issue: Infinite mode doesn't stop

**Solution:**
- Check clearTimeouts() called on unmount
- Verify useEffect cleanup function runs
- Check flags.isScreensaverActive reset correctly

### Issue: Build fails

**Solution:**
- Check all imports use correct paths
- Verify no missing dependencies
- Check for syntax errors
- Run `npm install` again

### Issue: Netlify build fails

**Solution:**
- Check netlify.toml exists and is valid
- Verify NODE_VERSION is compatible
- Check build command in netlify.toml matches package.json
- Review Netlify build logs for specific errors

---

## Success Metrics

Migration is successful when:

✅ React app runs locally without errors
✅ Production build completes successfully
✅ App deploys to Netlify
✅ All vanilla JS functionality preserved
✅ Trees render identically (test with fixed seed)
✅ All 4 color palettes work
✅ Responsive layout works
✅ Performance is acceptable
✅ No console errors
✅ Legacy version preserved for reference

---

**End of Checklist**

*Remember: Check off items as you complete them, add notes, and update "Last Updated" timestamp!*
