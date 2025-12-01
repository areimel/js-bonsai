# 🌳 JS Bonsai

> A beautiful ASCII art bonsai tree generator for the web

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- TODO: Add demo link once deployed -->
<!-- **[Live Demo](https://your-demo-url-here.netlify.app)** -->

## Screenshots

<!-- TODO: Add screenshots or animated GIFs showing:
- Tree generation animation
- Different color palettes (default, cherry, wisteria, maple)
- Various tree configurations (different sizes, densities, bases)
- Example: ![Demo Animation](docs/demo.gif)
-->

## About

JS Bonsai is a web application that generates beautiful, procedurally-generated ASCII art bonsai trees with smooth CSS-based animations. Watch your bonsai grow from a small seedling into a unique tree, or let it continuously generate new trees in infinite mode for a mesmerizing screensaver effect.

This project is a JavaScript port of [cbonsai](https://gitlab.com/jallbrit/cbonsai) by Jules Allbritton, reimagined as a modern React web application.

### Key Features

- 🎨 **Procedurally-generated ASCII art** - Every tree is unique
- ✨ **Smooth CSS animations** - Watch your tree grow step-by-step
- 🎲 **Seeded random generation** - Save and share your favorite trees
- 🌸 **Multiple color palettes** - Default green, cherry pink, wisteria purple, maple red
- ⚙️ **Highly customizable** - Control size, density, animation speed, and more
- 🔄 **Infinite mode** - Continuous tree generation for endless zen
- 💬 **Custom messages** - Add personalized text to your tree

## Features

### Tree Customization

- **Life (Size)**: 1-200 - Control the overall size of your bonsai tree
- **Multiplier (Density)**: 0-20 - Adjust branch density and foliage
- **Base Styles**: Choose from no base, small pot, or large pot

### Color Palettes

- **Default** - Classic green foliage
- **Cherry** - Pink blossoms for spring vibes
- **Wisteria** - Purple blooms
- **Maple** - Red autumn leaves

### Animation Modes

- **Live Animation** - Watch the tree grow step-by-step in real-time
- **Instant Generation** - Generate trees immediately without animation
- **Infinite Mode** - Continuously generate new trees
- **Screensaver Mode** - Combines live animation + infinite mode

### Reproducibility

Each tree is generated using a random seed. Save the seed value to recreate the exact same tree later or share it with others!

### Custom Messages

Add a personalized message that appears alongside your bonsai tree.

## Usage

<!-- Update this section once deployed -->
Visit the live demo and customize your bonsai tree using the controls panel:

1. **Adjust tree parameters** - Use the sliders to control size, density, and other properties
2. **Choose a color palette** - Select from the available color schemes
3. **Enable animations** - Toggle live animation to watch your tree grow
4. **Save your seed** - Note the seed value to recreate your favorite trees
5. **Generate** - Click the generate button to create a new tree

### Tips for Creating Interesting Trees

- Higher **Life** values (80-150) create larger, more majestic trees
- Lower **Multiplier** values (2-4) create sparse, elegant trees
- Higher **Multiplier** values (10-18) create dense, full foliage
- Try **Infinite Mode** for a relaxing screensaver experience
- Save interesting seed values to build a collection of favorite trees

## Installation

For local development:

```bash
# Clone the repository
git clone https://github.com/areimel/js-bonsai.git
cd js-bonsai

# Install dependencies (this project uses pnpm)
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Development Commands

```bash
# Start development server with hot module replacement
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run ESLint
pnpm lint
```

## Configuration Options

When using the JSBonsai library directly, you can configure trees with these options:

```javascript
{
  life: 32,              // Tree size (1-200)
  multiplier: 5,         // Branch density (0-20)
  base: 1,               // Base style: 0 (none), 1 (small pot), 2 (large pot)
  colorPalette: 'default', // 'default' | 'cherry' | 'wisteria' | 'maple'
  time: 0.03,            // Animation speed in seconds per step (0.001-0.1)
  live: true,            // Enable/disable live animation
  infinite: false,       // Continuous generation mode
  wait: 4.0,             // Seconds between trees in infinite mode (1-10)
  message: '',           // Custom text message to display
  seed: null             // Integer seed for reproducible trees (null for random)
}
```

## Architecture Overview

JS Bonsai uses an **orchestrator pattern** where the `JSBonsai` class coordinates specialized modules:

- **JSBonsai** (`src/lib/bonsai.js`) - Main orchestrator managing lifecycle and state
- **TreeGenerator** (`src/lib/modules/tree-generator.js`) - Recursive tree growth algorithms
- **Renderer** (`src/lib/modules/renderer.js`) - DOM rendering and CSS-based animation
- **CSSManager** (`src/lib/modules/css-manager.js`) - Dynamic CSS injection and color management
- **UIControls** (`src/lib/modules/ui-controls.js`) - Legacy vanilla UI controls

### React Integration

- **useBonsai** (`src/hooks/useBonsai.js`) - Custom hook bridging React and vanilla JSBonsai
- **Bonsai** (`src/components/Bonsai.jsx`) - React component wrapper
- **BonsaiControls** (`src/components/BonsaiControls.jsx`) - UI controls for tree configuration
- **App** (`src/App.jsx`) - Main application component

### Key Technical Features

- **Custom RNG**: Seeded random number generator for reproducible tree generation
- **CSS-based Animation**: Renders complete tree with hidden cells, then reveals using CSS class transitions (GPU-accelerated, avoids DOM thrashing)
- **Path Aliases**: `@/`, `@lib/`, `@components/`, `@hooks/` configured in vite.config.js

For detailed architecture documentation, see [CLAUDE.md](CLAUDE.md).

## Technology Stack

- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool with HMR
- **Tailwind CSS** 4.1.17 - Styling
- **pnpm** - Package manager

## Project Structure

```
js-bonsai/
├── src/
│   ├── components/          # React UI components
│   │   ├── Bonsai.jsx      # Main bonsai display component
│   │   └── BonsaiControls.jsx  # Control panel
│   ├── hooks/               # Custom React hooks
│   │   └── useBonsai.js    # React-JSBonsai bridge
│   ├── lib/                 # Core vanilla JS library
│   │   ├── config/          # Configuration files
│   │   │   ├── colors.js   # Color palettes
│   │   │   ├── characters.js  # Branch characters
│   │   │   ├── bases.js    # ASCII art pots
│   │   │   └── defaults.js # Default options
│   │   ├── modules/         # Specialized modules
│   │   │   ├── tree-generator.js  # Tree growth logic
│   │   │   ├── renderer.js        # DOM rendering
│   │   │   └── css-manager.js     # CSS injection
│   │   ├── utils/           # Utility functions
│   │   │   └── random.js   # Custom RNG
│   │   └── bonsai.js       # Main orchestrator
│   └── App.jsx              # Root component
├── public/                  # Static assets
├── legacy-reference-files/  # Original cbonsai C code & docs
└── CLAUDE.md               # Detailed architecture documentation
```

## Credits

- **Original Project**: [cbonsai](https://gitlab.com/jallbrit/cbonsai) by Jules Allbritton
- **JavaScript Port & React Implementation**: Alec Reimel

This project faithfully recreates cbonsai's tree generation algorithms and probability distributions to maintain the authentic bonsai aesthetic.

## License

MIT License

Copyright (c) 2024 Alec Reimel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on [GitHub](https://github.com/areimel/js-bonsai).
