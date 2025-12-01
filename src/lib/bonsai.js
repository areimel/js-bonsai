/**
 * JSBonsai - ASCII Bonsai Tree Generator (Refactored Orchestrator)
 * A vanilla JS port of cbonsai (https://gitlab.com/jallbrit/cbonsai)
 *
 * This orchestrator coordinates all modules to generate ASCII bonsai trees
 */

import CONFIG from './config/index.js';
import { initializeRandomSeed, getRandom } from './utils/random.js';
import { CSSManager } from './modules/css-manager.js';
import { UIControls } from './modules/ui-controls.js';
import { Renderer } from './modules/renderer.js';
import { TreeGenerator } from './modules/tree-generator.js';

export class JSBonsai {
    /**
     * Constructor for JSBonsai
     * Extracted from bonsai.js lines 117-151
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Create shared state object
        this.state = {
            tree: [],                // Display buffer
            timeouts: [],            // Animation handles
            counters: {              // Growth tracking
                branches: 0,
                shoots: 0,
                shootCounter: 0
            },
            flags: {                 // Status flags
                isGrowing: false,
                isScreensaverActive: false
            },
            refs: {                  // DOM references
                container: null,
                keydownListener: null
            },
            options: { ...CONFIG.defaults, ...options }  // Merged options
        };

        // Get container element (support both string ID and direct element reference for React)
        if (typeof this.state.options.container === 'string') {
            this.state.refs.container = document.getElementById(this.state.options.container);
        } else if (this.state.options.container instanceof HTMLElement) {
            this.state.refs.container = this.state.options.container;
        } else {
            console.error('Container must be either a string ID or HTMLElement');
            return;
        }

        if (!this.state.refs.container) {
            console.error(`Container element with ID '${this.state.options.container}' not found`);
            return;
        }

        // Set up screensaver mode if enabled
        if (this.state.options.screensaver) {
            this.state.options.live = true;
            this.state.options.infinite = true;
            this.setupScreensaver();
        }

        // Validate options
        this.validateOptions();

        // Initialize random seed FIRST (before creating modules)
        this.randomGenerator = initializeRandomSeed(this.state.options);

        // Create modules (order matters for dependencies)
        this.cssManager = new CSSManager(CONFIG);

        // Set initial colors based on colorPalette option
        if (this.state.options.colorPalette && this.state.options.colorPalette !== 'default') {
            this.cssManager.colors = CONFIG.getColorsForPalette(this.state.options.colorPalette);
        }

        this.uiControls = new UIControls(this.state.options, {
            onReset: () => this.reset(),
            onClearTimeouts: () => this.clearTimeouts(),
            onStart: () => this.start(),
            onPaletteChange: (paletteName) => this.changePalette(paletteName)
        });
        this.renderer = new Renderer(this.state, CONFIG, this.cssManager);
        this.treeGenerator = new TreeGenerator(this.state, CONFIG, this.cssManager);

        // Create UI if verbose mode is enabled
        if (this.state.options.verbose) {
            this.uiControls.createUI();
        }

        // Inject CSS
        this.cssManager.injectCSS();

        // Start growing the tree
        this.start();
    }

    /**
     * Validate options to ensure they're within acceptable ranges
     * Extracted from bonsai.js lines 156-177
     */
    validateOptions() {
        // Ensure multiplier is within bounds (0-20)
        this.state.options.multiplier = Math.max(0, Math.min(20, this.state.options.multiplier));

        // Ensure life is within bounds (0-200)
        this.state.options.life = Math.max(0, Math.min(200, this.state.options.life));

        // Ensure time step is positive
        if (this.state.options.time <= 0) {
            this.state.options.time = 0.03; // Default value
        }

        // Ensure wait time is positive
        if (this.state.options.wait <= 0) {
            this.state.options.wait = 4.0; // Default value
        }

        // Ensure base type exists
        if (this.state.options.base < 0 || this.state.options.base >= CONFIG.bases.length) {
            this.state.options.base = 1; // Default to first base style
        }
    }

    /**
     * Start growing the tree
     * Extracted from bonsai.js lines 200-206
     */
    start() {
        if (this.state.options.infinite) {
            this.growInfinitely();
        } else {
            this.growTree();
        }
    }

    /**
     * Setup screensaver mode (exit on keypress)
     * Extracted from bonsai.js lines 211-222
     */
    setupScreensaver() {
        this.state.flags.isScreensaverActive = true;

        // Add keydown event listener to exit screensaver
        this.state.refs.keydownListener = () => {
            this.state.flags.isScreensaverActive = false;
            this.clearTimeouts();
            document.removeEventListener('keydown', this.state.refs.keydownListener);
        };

        document.addEventListener('keydown', this.state.refs.keydownListener);
    }

    /**
     * Reset the tree state
     * Extracted from bonsai.js lines 342-347
     */
    reset() {
        // Clear the tree array and container
        this.state.tree = [];
        this.state.refs.container.innerHTML = '';
        this.state.flags.isGrowing = false;
    }

    /**
     * Clear all active timeouts
     * Extracted from bonsai.js lines 352-355
     */
    clearTimeouts() {
        this.state.timeouts.forEach(timeout => clearTimeout(timeout));
        this.state.timeouts = [];
    }

    /**
     * Grow a single tree
     * Extracted from bonsai.js lines 360-409
     * CRITICAL: Math.random() replaced with getRandom()
     */
    growTree() {
        this.state.flags.isGrowing = true;
        this.reset();

        // Reset counters
        this.state.counters = {
            branches: 0,
            shoots: 0,
            shootCounter: Math.floor(getRandom() * 100) // Random starting counter to vary shoot directions
        };

        // Initialize the display area
        this.renderer.initializeDisplay();

        // Calculate starting position - this should be at the bottom center
        const startX = Math.floor(this.state.tree[0].length / 2);
        const startY = this.state.tree.length - 1;

        // Draw the base if specified
        if (this.state.options.base > 0 && CONFIG.bases[this.state.options.base]) {
            this.treeGenerator.drawBase(startX, startY);
        }

        // Seed the trunk's initial position
        // Place the trunk character just above the base
        const trunkY = startY - (this.state.options.base > 0 ? CONFIG.bases[this.state.options.base].length : 0);

        // Build the tree structure first
        this.treeGenerator.growBranch(startX, trunkY, 0, -1, CONFIG.branchTypes.TRUNK, this.state.options.life);

        // Add the message if specified
        if (this.state.options.message) {
            this.treeGenerator.addMessage();
        }

        // If in live mode, animate the rendering
        if (this.state.options.live) {
            this.renderer.animateTreeRendering();
        } else {
            // Render once at the end
            this.renderer.render();
        }

        // Log statistics if verbose
        if (this.state.options.verbose) {
            console.log(`Generated tree with ${this.state.counters.branches} branches and ${this.state.counters.shoots} shoots.`);
        }

        this.state.flags.isGrowing = false;
    }

    /**
     * Grow trees infinitely
     * Extracted from bonsai.js lines 494-508
     */
    growInfinitely() {
        const growLoop = () => {
            if (!this.state.flags.isScreensaverActive && !this.state.options.infinite) return;

            this.growTree();

            const timeout = setTimeout(() => {
                growLoop();
            }, this.state.options.wait * 1000);

            this.state.timeouts.push(timeout);
        };

        growLoop();
    }

    /**
     * Change the color palette and update the display
     * @param {string} paletteName - Name of the palette to apply
     */
    changePalette(paletteName) {
        // Update CSS with new palette colors
        this.cssManager.updateColors(paletteName);

        // Update the option for state consistency
        this.state.options.colorPalette = paletteName;

        // Log if verbose
        if (this.state.options.verbose) {
            console.log(`Color palette changed to: ${paletteName}`);
        }
    }
}
