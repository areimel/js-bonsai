# JS-Bonsai Refactoring Plan
## Orchestrator Architecture Migration

---

## Overview

### Current State
- **File:** `bonsai.js` (1,224 lines)
- **Structure:** Single monolithic `JSBonsai` class + global `Math.seedrandom` utility
- **Purpose:** ASCII Bonsai Tree Generator (vanilla JS port of cbonsai)

### Goals
1. Split into modular orchestrator architecture
2. Externalize all configuration to JSON files
3. Improve maintainability and testability
4. Enable easy theming and customization

### Critical Constraint
**ALL CURRENT FUNCTIONS MUST REMAIN INTACT** - This is a pure reorganization. Every function keeps its exact logic; we're only moving code to appropriate modules.

---

## Target Folder Structure

```
js-bonsai/
├── src/
│   ├── config/
│   │   ├── colors.json          # Color definitions
│   │   ├── defaults.json        # Default option values
│   │   ├── characters.json      # ASCII character sets
│   │   ├── bases.json           # Pot/base ASCII art
│   │   └── index.js             # Config loader/exporter
│   │
│   ├── utils/
│   │   └── random.js            # Seeded RNG utilities
│   │
│   ├── modules/
│   │   ├── css-manager.js       # CSS injection & class generation
│   │   ├── ui-controls.js       # Verbose mode UI controls
│   │   ├── renderer.js          # Display rendering & animation
│   │   └── tree-generator.js    # Core growth algorithms
│   │
│   └── bonsai.js                # ORCHESTRATOR - main entry point
│
├── index.html
├── style.css
└── REFACTORING-PLAN.md
```

---

## JSON Config File Schemas

### 1. `src/config/colors.json`

```json
{
  "trunk": "#976c3c",
  "branch": "#976c3c",
  "leaf": "#4e9a06",
  "base": "#8a8a8a",
  "dirt": "#6d3300",
  "grass": "#4e9a06",
  "message": "#cccccc"
}
```

**Source:** Lines 74-83 (`colors` object)

---

### 2. `src/config/defaults.json`

```json
{
  "live": false,
  "time": 0.03,
  "infinite": false,
  "wait": 4.0,
  "screensaver": false,
  "message": "",
  "base": 1,
  "multiplier": 5,
  "life": 32,
  "print": true,
  "seed": null,
  "verbose": false,
  "container": "js-bonsai",
  "theme": "default",
  "leaves": ["&", "+", "*", ".", "^", "@", "~", "`", "\"", "/", "_", ",", "o", "O", "0", "#", "%", "$", "v", "V", "x"]
}
```

**Source:** Lines 8-24 (`defaultOptions` object)

---

### 3. `src/config/characters.json`

```json
{
  "trunks": ["|", "/", "||", "Y", "V", "v", "^", "<", ">", "H"],
  "joints": ["/", "//", "v", ">", "<", "^", "Y", "V", "y", "T", "t", "x", "X", "+"],
  "branchStrings": {
    "trunk": {
      "straightHorizontal": "/~",
      "leftDiagonal": "//|",
      "vertical": "/|/",
      "rightDiagonal": "|/"
    },
    "shootLeft": {
      "down": "//",
      "horizontal": "//=",
      "leftDiagonal": "//|",
      "vertical": "/|",
      "rightDiagonal": "/"
    },
    "shootRight": {
      "down": "/",
      "horizontal": "=/",
      "leftDiagonal": "//|",
      "vertical": "/|",
      "rightDiagonal": "/"
    }
  },
  "deadChars": ["/", "`", ".", ",", "_"]
}
```

**Source:** Lines 27-56 (`chars` object, excluding bases)

---

### 4. `src/config/bases.json`

```json
{
  "bases": [
    [],
    [
      ":__________./~~~~~\\.__________:",
      " \\                           /",
      "  \\________________________ /",
      "  (_)                     (_)"
    ],
    [
      "(_---_./~~~\\._---_)",
      " (   (     )   ) ",
      "  (___(___)___) "
    ]
  ]
}
```

**Source:** Lines 57-71 (`chars.bases` array)

---

### 5. `src/config/index.js`

```javascript
// Config Loader - imports all JSON and exports unified CONFIG object

import colors from './colors.json';
import defaults from './defaults.json';
import characters from './characters.json';
import bases from './bases.json';

export const CONFIG = {
  colors,
  defaults,
  characters,
  bases: bases.bases,

  // Constants
  classPrefix: 'js-bonsai-',

  // Branch type enum
  branchTypes: {
    TRUNK: 0,
    SHOOT_LEFT: 1,
    SHOOT_RIGHT: 2,
    DYING: 3,
    DEAD: 4
  }
};

export default CONFIG;
```

---

## Module Descriptions

### Module 1: `src/utils/random.js`

**Purpose:** Seeded random number generation for reproducible trees

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `seedrandom(seed)` | 1199-1214 | LCG-based seeded random generator |
| `initializeRandomSeed()` | 182-195 | Sets up seeded RNG from options |

**Exports:**
```javascript
export function seedrandom(seed) { ... }
export function initializeRandomSeed(options) { ... }
export function getRandom() { ... }  // wrapper for Math.random
```

**Dependencies:** None

---

### Module 2: `src/modules/css-manager.js`

**Purpose:** CSS generation and class name management

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `injectCSS()` | 1066-1114 | Generates and injects CSS stylesheet |
| `getBranchClasses(branchType, dx, dy)` | 1123-1159 | Returns CSS classes for branch elements |
| `getBaseClasses(char)` | 1166-1178 | Returns CSS classes for base elements |
| `getLeafClasses()` | 1184-1186 | Returns CSS classes for leaf elements |
| `getMessageClasses()` | 1192-1194 | Returns CSS classes for message elements |

**Exports:**
```javascript
export class CSSManager {
  constructor(config) { ... }
  injectCSS() { ... }
  getBranchClasses(branchType, dx, dy) { ... }
  getBaseClasses(char) { ... }
  getLeafClasses() { ... }
  getMessageClasses() { ... }
}
```

**Dependencies:** `CONFIG` (colors, classPrefix, branchTypes)

---

### Module 3: `src/modules/ui-controls.js`

**Purpose:** Verbose mode UI control generation

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `createUI()` | 227-259 | Creates verbose mode UI in `.option-controls` |
| `createCheckboxOption(container, name, label)` | 264-283 | Creates checkbox input |
| `createNumberOption(container, name, label, min, max, step, allowNull)` | 288-312 | Creates number input |
| `createTextOption(container, name, label)` | 317-337 | Creates text input |

**Exports:**
```javascript
export class UIControls {
  constructor(options, callbacks) { ... }
  createUI() { ... }
  createCheckboxOption(container, name, label) { ... }
  createNumberOption(container, name, label, min, max, step, allowNull) { ... }
  createTextOption(container, name, label) { ... }
}
```

**Dependencies:** `CONFIG` (defaults), callbacks from orchestrator

---

### Module 4: `src/modules/renderer.js`

**Purpose:** Display rendering and animation

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `initializeDisplay()` | 513-526 | Creates 2D array sized to container |
| `render()` | 832-857 | Converts tree array to HTML output |
| `animateTreeRendering()` | 414-489 | Animates tree growth in live mode |

**Exports:**
```javascript
export class Renderer {
  constructor(state, config) { ... }
  initializeDisplay() { ... }
  render() { ... }
  animateTreeRendering() { ... }
}
```

**Dependencies:** `CONFIG` (colors), `CSSManager`, shared state (tree, container, options, timeouts)

---

### Module 5: `src/modules/tree-generator.js`

**Purpose:** Core tree growth algorithms

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `growBranch(x, y, xDir, yDir, branchType, life)` | 571-696 | Core recursive branch growth |
| `setDeltas(branchType, life, age, multiplier)` | 940-1061 | Calculates direction deltas |
| `chooseString(branchType, life, dx, dy)` | 869-928 | Selects branch ASCII character |
| `addLeaf(x, y)` | 703-805 | Adds leaf characters with clustering |
| `drawBase(x, y)` | 531-559 | Draws pot/base ASCII art |
| `addMessage()` | 810-827 | Adds user message to display |

**Exports:**
```javascript
export class TreeGenerator {
  constructor(state, config, cssManager) { ... }
  growBranch(x, y, xDir, yDir, branchType, life) { ... }
  setDeltas(branchType, life, age, multiplier) { ... }
  chooseString(branchType, life, dx, dy) { ... }
  addLeaf(x, y) { ... }
  drawBase(x, y) { ... }
  addMessage() { ... }
}
```

**Dependencies:** `CONFIG` (characters, bases, branchTypes, defaults), `CSSManager`, `random`, shared state

---

### Module 6: `src/bonsai.js` (Orchestrator)

**Purpose:** Central control, lifecycle management, public API

**Functions:**
| Function | Original Lines | Description |
|----------|----------------|-------------|
| `constructor(options)` | 117-151 | Entry point, initializes all modules |
| `validateOptions()` | 156-177 | Validates configuration ranges |
| `setupScreensaver()` | 211-222 | Configures screensaver mode |
| `start()` | 200-206 | Entry point for tree growth |
| `reset()` | 342-347 | Clears tree state |
| `clearTimeouts()` | 352-355 | Clears animation timeouts |
| `growTree()` | 360-409 | Main tree generation orchestrator |
| `growInfinitely()` | 494-508 | Infinite growth loop |

**Exports:**
```javascript
export class JSBonsai {
  constructor(options) { ... }
  validateOptions() { ... }
  setupScreensaver() { ... }
  start() { ... }
  reset() { ... }
  clearTimeouts() { ... }
  growTree() { ... }
  growInfinitely() { ... }
}
```

**Dependencies:** All modules, owns shared state

---

## Function-to-Module Mapping Table

| Function | Original Lines | Target Module | Modifications Needed |
|----------|----------------|---------------|---------------------|
| `constructor(options)` | 117-151 | `bonsai.js` | Import modules, instantiate components |
| `validateOptions()` | 156-177 | `bonsai.js` | Import CONFIG for bounds |
| `initializeRandomSeed()` | 182-195 | `random.js` | Accept options param |
| `start()` | 200-206 | `bonsai.js` | None |
| `setupScreensaver()` | 211-222 | `bonsai.js` | None |
| `createUI()` | 227-259 | `ui-controls.js` | Accept callbacks param |
| `createCheckboxOption()` | 264-283 | `ui-controls.js` | None |
| `createNumberOption()` | 288-312 | `ui-controls.js` | None |
| `createTextOption()` | 317-337 | `ui-controls.js` | None |
| `reset()` | 342-347 | `bonsai.js` | None |
| `clearTimeouts()` | 352-355 | `bonsai.js` | None |
| `growTree()` | 360-409 | `bonsai.js` | Call module methods |
| `animateTreeRendering()` | 414-489 | `renderer.js` | Accept state param |
| `growInfinitely()` | 494-508 | `bonsai.js` | None |
| `initializeDisplay()` | 513-526 | `renderer.js` | Accept container param |
| `drawBase(x, y)` | 531-559 | `tree-generator.js` | Import CONFIG.bases |
| `growBranch()` | 571-696 | `tree-generator.js` | Import CONFIG.branchTypes |
| `addLeaf(x, y)` | 703-805 | `tree-generator.js` | Import CONFIG |
| `addMessage()` | 810-827 | `tree-generator.js` | Accept state param |
| `render()` | 832-857 | `renderer.js` | Accept state param |
| `chooseString()` | 869-928 | `tree-generator.js` | Import CONFIG.characters |
| `setDeltas()` | 940-1061 | `tree-generator.js` | Import CONFIG.branchTypes |
| `injectCSS()` | 1066-1114 | `css-manager.js` | Import CONFIG.colors |
| `getBranchClasses()` | 1123-1159 | `css-manager.js` | Import CONFIG.branchTypes |
| `getBaseClasses()` | 1166-1178 | `css-manager.js` | None |
| `getLeafClasses()` | 1184-1186 | `css-manager.js` | None |
| `getMessageClasses()` | 1192-1194 | `css-manager.js` | None |
| `Math.seedrandom()` | 1199-1214 | `random.js` | Export as function |
| `Math.random override` | 1217-1224 | `random.js` | Encapsulate in module |

---

## Dependency Graph

```
                         ┌─────────────────────────┐
                         │     src/config/         │
                         │  ┌─────────────────┐    │
                         │  │  colors.json    │    │
                         │  │  defaults.json  │    │
                         │  │  characters.json│    │
                         │  │  bases.json     │    │
                         │  │  index.js       │    │
                         │  └─────────────────┘    │
                         └───────────┬─────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  src/utils/         │   │  src/modules/       │   │  src/modules/       │
│  random.js          │   │  css-manager.js     │   │  ui-controls.js     │
│                     │   │                     │   │                     │
│  - seedrandom()     │   │  - injectCSS()      │   │  - createUI()       │
│  - initRandomSeed() │   │  - getBranchClasses │   │  - createCheckbox() │
│  - getRandom()      │   │  - getBaseClasses() │   │  - createNumber()   │
│                     │   │  - getLeafClasses() │   │  - createText()     │
└──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘
           │                         │                         │
           │         ┌───────────────┴───────────────┐         │
           │         │                               │         │
           ▼         ▼                               ▼         │
┌─────────────────────────────┐       ┌─────────────────────────────┐
│  src/modules/               │       │  src/modules/               │
│  tree-generator.js          │       │  renderer.js                │
│                             │       │                             │
│  - growBranch()             │       │  - initializeDisplay()      │
│  - setDeltas()              │       │  - render()                 │
│  - chooseString()           │       │  - animateTreeRendering()   │
│  - addLeaf()                │       │                             │
│  - drawBase()               │       │                             │
│  - addMessage()             │       │                             │
└──────────────┬──────────────┘       └──────────────┬──────────────┘
               │                                     │
               └──────────────┬──────────────────────┘
                              │
                              ▼
                   ┌─────────────────────────┐
                   │  src/bonsai.js          │
                   │  (ORCHESTRATOR)         │
                   │                         │
                   │  - constructor()        │
                   │  - validateOptions()    │
                   │  - start()              │
                   │  - reset()              │
                   │  - clearTimeouts()      │
                   │  - growTree()           │
                   │  - growInfinitely()     │
                   │  - setupScreensaver()   │
                   └─────────────────────────┘
```

---

## Shared State Management

### State Object Structure

The orchestrator will own a shared state object passed to component modules:

```javascript
const sharedState = {
  // Display buffer
  tree: [],                    // 2D array of tree characters

  // Animation control
  timeouts: [],                // Animation timeout handles

  // Growth tracking
  counters: {
    branches: 0,
    shoots: 0,
    shootCounter: 0
  },

  // Flags
  flags: {
    isGrowing: false,
    isScreensaverActive: false,
    cssInjected: false
  },

  // DOM references
  refs: {
    container: null,           // Target container element
    keydownListener: null      // Event handler reference
  },

  // Merged options
  options: {}                  // User options merged with defaults
};
```

### State Access Pattern

```javascript
// Orchestrator creates and owns state
class JSBonsai {
  constructor(options) {
    this.state = createInitialState();
    this.state.options = { ...CONFIG.defaults, ...options };

    // Pass state to modules
    this.cssManager = new CSSManager(CONFIG);
    this.renderer = new Renderer(this.state, CONFIG, this.cssManager);
    this.treeGenerator = new TreeGenerator(this.state, CONFIG, this.cssManager);
    this.uiControls = new UIControls(this.state.options, {
      onReset: () => this.reset(),
      onClearTimeouts: () => this.clearTimeouts(),
      onStart: () => this.start()
    });
  }
}
```

---

## Implementation Order

### Phase 1: Foundation (No Breaking Changes)

| Step | Task | Rationale |
|------|------|-----------|
| 1.1 | Create folder structure | Set up `src/config/`, `src/utils/`, `src/modules/` |
| 1.2 | Create JSON config files | Extract hardcoded values, no code changes yet |
| 1.3 | Create `src/config/index.js` | Config loader that exports unified CONFIG |

### Phase 2: Utility Modules

| Step | Task | Rationale |
|------|------|-----------|
| 2.1 | Create `src/utils/random.js` | Self-contained, no dependencies |
| 2.2 | Test random module | Ensure seeded RNG works identically |

### Phase 3: CSS Module

| Step | Task | Rationale |
|------|------|-----------|
| 3.1 | Create `src/modules/css-manager.js` | Only depends on config |
| 3.2 | Test CSS injection | Verify styles apply correctly |

### Phase 4: UI Module

| Step | Task | Rationale |
|------|------|-----------|
| 4.1 | Create `src/modules/ui-controls.js` | Depends on config + callbacks |
| 4.2 | Test verbose mode UI | Ensure controls work |

### Phase 5: Renderer Module

| Step | Task | Rationale |
|------|------|-----------|
| 5.1 | Create `src/modules/renderer.js` | Depends on config, css-manager, state |
| 5.2 | Test rendering | Verify display output matches |

### Phase 6: Tree Generator Module

| Step | Task | Rationale |
|------|------|-----------|
| 6.1 | Create `src/modules/tree-generator.js` | Most complex, depends on all |
| 6.2 | Test tree generation | Compare output with original |

### Phase 7: Orchestrator Integration

| Step | Task | Rationale |
|------|------|-----------|
| 7.1 | Refactor `src/bonsai.js` | Wire up all modules |
| 7.2 | Full integration test | End-to-end verification |
| 7.3 | Remove old `bonsai.js` | Clean up root directory |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `src/` directory
- [ ] Create `src/config/` directory
- [ ] Create `src/utils/` directory
- [ ] Create `src/modules/` directory
- [ ] Create `src/config/colors.json`
- [ ] Create `src/config/defaults.json`
- [ ] Create `src/config/characters.json`
- [ ] Create `src/config/bases.json`
- [ ] Create `src/config/index.js`
- [ ] Verify config loads correctly

### Phase 2: Random Utility
- [ ] Create `src/utils/random.js`
- [ ] Move `seedrandom()` function
- [ ] Move `initializeRandomSeed()` function
- [ ] Create `getRandom()` wrapper
- [ ] Test seeded random generation

### Phase 3: CSS Manager
- [ ] Create `src/modules/css-manager.js`
- [ ] Move `injectCSS()` function
- [ ] Move `getBranchClasses()` function
- [ ] Move `getBaseClasses()` function
- [ ] Move `getLeafClasses()` function
- [ ] Move `getMessageClasses()` function
- [ ] Test CSS injection and class generation

### Phase 4: UI Controls
- [ ] Create `src/modules/ui-controls.js`
- [ ] Move `createUI()` function
- [ ] Move `createCheckboxOption()` function
- [ ] Move `createNumberOption()` function
- [ ] Move `createTextOption()` function
- [ ] Test verbose mode UI controls

### Phase 5: Renderer
- [ ] Create `src/modules/renderer.js`
- [ ] Move `initializeDisplay()` function
- [ ] Move `render()` function
- [ ] Move `animateTreeRendering()` function
- [ ] Test static rendering
- [ ] Test live mode animation

### Phase 6: Tree Generator
- [ ] Create `src/modules/tree-generator.js`
- [ ] Move `growBranch()` function
- [ ] Move `setDeltas()` function
- [ ] Move `chooseString()` function
- [ ] Move `addLeaf()` function
- [ ] Move `drawBase()` function
- [ ] Move `addMessage()` function
- [ ] Test tree generation with fixed seed

### Phase 7: Orchestrator
- [ ] Refactor `src/bonsai.js` as orchestrator
- [ ] Import all modules
- [ ] Create shared state object
- [ ] Wire up module dependencies
- [ ] Keep `constructor()` function
- [ ] Keep `validateOptions()` function
- [ ] Keep `start()` function
- [ ] Keep `reset()` function
- [ ] Keep `clearTimeouts()` function
- [ ] Keep `growTree()` function
- [ ] Keep `growInfinitely()` function
- [ ] Keep `setupScreensaver()` function
- [ ] Update `index.html` to use new path
- [ ] Full integration test
- [ ] Remove old root `bonsai.js`

### Final Verification
- [ ] Static mode works
- [ ] Live mode works
- [ ] Infinite mode works
- [ ] Screensaver mode works
- [ ] Verbose mode UI works
- [ ] Custom seed produces same tree
- [ ] All color themes apply correctly
- [ ] Base/pot renders correctly
- [ ] Messages display correctly

---

## Notes

### Import Strategy
Since this is a browser-based project, consider:
1. **ES Modules:** Use native `import`/`export` with `<script type="module">`
2. **Bundler:** Use Vite/Rollup/Webpack to bundle modules
3. **JSON Imports:** May need bundler or fetch() for JSON files

### Backward Compatibility
The refactored `JSBonsai` class should maintain the same public API:
```javascript
// This should continue to work unchanged
const bonsai = new JSBonsai({
  container: 'my-container',
  life: 40,
  multiplier: 6
});
```

### Testing Strategy
Use a fixed seed to generate trees before and after refactoring. The output should be **identical** for the same seed, proving no logic changes occurred.

---

*Document created for js-bonsai orchestrator architecture refactoring*
*Last updated: Session 1*
