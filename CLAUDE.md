# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JS Bonsai is an ASCII bonsai tree generator - a React + Vite web application that renders procedurally-generated ASCII art bonsai trees with CSS-based animations. This is a JavaScript port of cbonsai (https://gitlab.com/jallbrit/cbonsai).

## Development Commands

```bash
# Start development server with HMR
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Architecture

### Core Design Pattern: Orchestrator Architecture

The codebase follows an **orchestrator pattern** where `JSBonsai` (src/lib/bonsai.js) coordinates specialized modules:

- **JSBonsai** (orchestrator): Manages lifecycle, coordinates modules, handles shared state
- **TreeGenerator** (src/lib/modules/tree-generator.js): Recursive tree growth algorithms, branch/leaf placement
- **Renderer** (src/lib/modules/renderer.js): DOM rendering, CSS-based animation sequencing
- **CSSManager** (src/lib/modules/css-manager.js): Dynamic CSS injection, color palette management
- **UIControls** (src/lib/modules/ui-controls.js): Legacy vanilla UI controls (not used in React app)

### Shared State Object

All modules share a single state object managed by JSBonsai:
- `state.tree`: 2D array display buffer
- `state.counters`: Branch/shoot tracking
- `state.flags`: Growth and screensaver status
- `state.refs`: DOM references
- `state.options`: Configuration (merged defaults + user options)
- `state.timeouts`: Animation timeout handles

Modules receive the state object and modify it directly - this is intentional for performance.

### React Integration

- **useBonsai hook** (src/hooks/useBonsai.js): Bridge between React and vanilla JSBonsai
- **Bonsai component** (src/components/Bonsai.jsx): Wrapper that uses the hook
- **BonsaiControls component** (src/components/BonsaiControls.jsx): UI for tree configuration
- **App.jsx**: Main component coordinating display and controls

React components use key-based re-mounting to regenerate trees rather than imperative updates.

### Configuration System

Centralized in src/lib/config/:
- **index.js**: Aggregates all config, exports unified CONFIG object
- **defaults.js**: Default options (time, life, multiplier, leaves, etc.)
- **characters.js**: Branch characters for different directions/types
- **colors.js**: Color palettes (default, vintage, energetic, etc.)
- **bases.js**: ASCII art tree base designs

### Randomness and Seeding

**CRITICAL**: The codebase uses a custom random number generator (src/lib/utils/random.js) to support deterministic tree generation via seeds. **Never use Math.random()** - always use `getRandom()` from random.js. This allows users to regenerate identical trees using the same seed.

### Animation System

Uses **CSS-based animation** instead of DOM manipulation for performance:
1. Render complete tree with all cells initially hidden (CSS class)
2. Group cells by type: base → branches → leaves
3. Reveal cells by toggling CSS classes in sequence
4. Leverages GPU-accelerated CSS transitions

This avoids DOM thrashing from repeated `innerHTML` updates.

## Path Aliases

Configured in vite.config.js:
- `@/` → `/src/`
- `@lib/` → `/src/lib/`
- `@components/` → `/src/components/`
- `@hooks/` → `/src/hooks/`

## Important Notes

- **legacy-reference-files/**: Contains original cbonsai C code, old versions, and migration plans. For reference only - do not modify.
- The tree growth algorithm closely mirrors cbonsai's probability distributions and branching logic for authenticity.
- Container sizing is calculated dynamically based on font size and container dimensions.
- The project uses pnpm as the package manager.
