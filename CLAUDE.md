# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

js-bonsai is a vanilla JavaScript port of [cbonsai](https://gitlab.com/jallbrit/cbonsai) - an ASCII art bonsai tree generator. It creates procedurally generated ASCII bonsai trees that can be embedded in any web page with no dependencies.

## Development

This is a static site with no build step. To develop:
- Open `index.html` directly in a browser, or
- Use any local HTTP server (e.g., `python -m http.server`, VS Code Live Server)

Deployed on Netlify (see `.netlify/` for config).

## Architecture

### Core Files
- **bonsai.js** - Single-file library containing the `JSBonsai` class
- **index.html** - Demo page with UI controls
- **style.css** - Demo page styling

### JSBonsai Class Structure

The tree generation algorithm is a direct port of cbonsai's C implementation:

1. **Branch Types** (`branchTypes` enum): TRUNK, SHOOT_LEFT, SHOOT_RIGHT, DYING, DEAD
2. **Growth Loop** (`growBranch`): Recursive method that grows branches by:
   - Calculating direction deltas via `setDeltas()` based on branch type/age/life
   - Choosing character strings via `chooseString()` based on direction
   - Spawning new shoots when cooldown allows
   - Transitioning to DYING/DEAD states when life is low
3. **Rendering**: Tree stored in 2D array, rendered to DOM with colored `<span>` elements

### Key Methods
- `growTree()` - Main entry point, initializes display and starts trunk growth
- `growBranch(x, y, xDir, yDir, branchType, life)` - Recursive branch growth
- `setDeltas(branchType, life, age, multiplier)` - Direction calculation using probability distributions matching cbonsai
- `chooseString(branchType, life, dx, dy)` - Select ASCII character for branch segment
- `animateTreeRendering()` - Live mode animation (base → branches → leaves phases)

### Color System
- `colors` object holds current colors (trunk, branch, leaf variants, base, grass)
- `colorPalettes` defines presets (default, cherry, wisteria, maple)
- `applyColorPalette()` swaps colors and re-injects CSS

### Seeded Random
Custom `Math.seedrandom()` LCG implementation at bottom of bonsai.js for deterministic tree generation.
