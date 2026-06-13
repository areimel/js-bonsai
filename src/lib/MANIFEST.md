# src/lib Manifest

Table of contents for the JS Bonsai core library — an orchestrator-pattern ASCII bonsai
generator ported from [cbonsai](https://gitlab.com/jallbrit/cbonsai). React never touches
these files directly except through `bonsai.js` (via the `useBonsai` hook).

```
src/lib/
├── bonsai.js              # Entry point — JSBonsai orchestrator class
├── config/                # Static configuration & data
├── modules/               # Behavior modules (tree growth, rendering, CSS)
│   ├── tree/              # Tree-growth submodules
│   └── css/               # CSS string-building & class-name submodules
└── utils/                 # Shared low-level helpers
```

## Entry Point

| File | Purpose | Key Exports |
|------|---------|-------------|
| `bonsai.js` | Orchestrator: creates the shared state object, instantiates all modules, runs the grow lifecycle (single tree or autoplay loop). | `JSBonsai` — public API: `constructor(options)`, `start()`, `reset()`, `clearTimeouts()`, `changePalette(name)` |

## Modules

| File | Purpose | Key Exports | Depends On |
|------|---------|-------------|------------|
| `modules/tree-generator.js` | Core recursive growth algorithm (`growBranch`), pot/base drawing, message placement. Delegates direction math, character choice, and leaf placement to `tree/` submodules. | `TreeGenerator` | `tree/*`, `utils/random`, `utils/grid`, CSSManager (injected) |
| `modules/tree/deltas.js` | Probability-weighted direction deltas per branch type/age — mirrors cbonsai's `setDeltas` dice rolls exactly. | `setDeltas(branchTypes, branchType, life, age, multiplier)` | `utils/random` |
| `modules/tree/branch-chars.js` | Maps (branch type, direction) → display character string; dying/dead branches become random leaf chars. | `chooseString(config, leaves, branchType, life, dx, dy)` | `utils/random` |
| `modules/tree/leaves.js` | Leaf cluster placement (primary → secondary → tertiary tiers) around branches, with upward bias. | `addLeaf(state, cssManager, x, y)` | `utils/random`, `utils/grid` |
| `modules/renderer.js` | Tree → DOM: sizes the display grid, renders cells as classed `<span>`s, and runs the three-phase CSS reveal animation (base → branches → leaves). | `Renderer` | CSSManager (injected) |
| `modules/css-manager.js` | Stylesheet lifecycle: injects/updates the color stylesheet and grid layout styles; exposes thin class-name getters used by the tree generator. | `CSSManager` | `css/*` |
| `modules/css/build-styles.js` | Pure CSS string builders (no DOM) — single source of truth for the color ruleset and grid template. | `buildColorCSS(prefix, colors)`, `buildGridCSS(containerId, rows, cols)` | — |
| `modules/css/cell-classes.js` | Stateless class-name lookups for branch/base/leaf/message cells. | `getBranchClasses`, `getBaseClasses`, `getLeafClasses`, `getMessageClasses` | — |

## Config

| File | Purpose | Key Exports |
|------|---------|-------------|
| `config/index.js` | Aggregates all config into one object; defines `classPrefix` and the `branchTypes` enum (TRUNK / SHOOT_LEFT / SHOOT_RIGHT / DYING / DEAD). | `CONFIG` (default) |
| `config/defaults.js` | Default options: `live`, `time`, `autoplay`, `autoplayBuffer`, `message`, `base`, `baseBuffer`, `leaves`, `multiplier`, `life`, `seed`, `verbose`, `container`, `colorPalette`. | defaults object (default) |
| `config/characters.js` | Branch/joint character sets and direction-keyed `branchStrings`. | characters object (default) |
| `config/colors.js` | Color palettes (`default`, `cherry`, `wisteria`, `maple`) + shared colors. | `colorPalettes`, `sharedColors`, `getColorsForPalette(name)` |
| `config/bases.js` | ASCII-art pot/base designs, indexed by `options.base` (0 = none). | `bases` |

## Utils

| File | Purpose | Key Exports |
|------|---------|-------------|
| `utils/random.js` | **CRITICAL** — seeded LCG random generation for deterministic trees. All randomness in the library flows through `getRandom()`. | `seedrandom`, `initializeRandomSeed`, `getRandom`, `roll(mod)`, `pickRandom(array)`, `getLeafVariant` |
| `utils/grid.js` | 2D display-buffer predicates shared by growth code. | `isInBounds(tree, x, y)`, `isCellEmpty(tree, x, y)` |
| `utils/timing.js` | Animation duration estimation for autoplay scheduling. | `countTreeElements(tree)`, `calculateRenderTime(state)` |

## Shared State Shape

Created in `bonsai.js` and passed to every module; modules mutate it directly (intentional, for performance):

| Property | Shape | Mutated By |
|----------|-------|------------|
| `state.tree` | 2D array of `' '` or `{ char, type, cssClass, ... }` cells | Renderer (init), TreeGenerator + `tree/leaves.js` (writes), JSBonsai (reset) |
| `state.counters` | `{ branches, shoots, shootCounter }` | TreeGenerator (increments), JSBonsai (reset per tree) |
| `state.flags` | `{ isGrowing }` | JSBonsai |
| `state.refs` | `{ container }` (DOM element) | JSBonsai |
| `state.options` | merged `CONFIG.defaults` + user options | JSBonsai (validation, palette changes) |
| `state.timeouts` | pending `setTimeout` handles | Renderer + JSBonsai (push), JSBonsai (clear) |

## Invariants

1. **Never use `Math.random()`** — always `getRandom()` (or `roll`/`pickRandom` which wrap it). The exact count and order of `getRandom()` calls defines seed determinism: same seed → identical tree.
2. **Public API surface** is only what `JSBonsai` exposes (see Entry Point); everything else is internal and free to change.
3. Cell `type` values are `'base' | 'branch' | 'leaf' | 'message'` — the renderer's animation phases group by these.
4. CSS class names are built from `CONFIG.classPrefix` (`js-bonsai-`); `css/build-styles.js` is the single source of truth for the color ruleset.
