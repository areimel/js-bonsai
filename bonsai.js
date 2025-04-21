/**
 * js-bonsai - ASCII Bonsai Tree Generator
 * A vanilla JS port of cbonsai (https://gitlab.com/jallbrit/cbonsai)
 */

class JSBonsai {
    // Default configuration options
    defaultOptions = {
        live: false,         // Live mode: show each step of growth
        time: 0.03,          // In live mode, wait time (seconds) between steps
        infinite: false,     // Infinite mode: keep growing trees
        wait: 4.0,           // In infinite mode, wait time between each tree
        screensaver: false,  // Screensaver mode (equivalent to live + infinite)
        message: '',         // Attach message next to the tree
        base: 1,             // ASCII-art plant base to use (0 is none)
        leaves: ['&', '+', '*', '.', '^', '@', '~', '`', '"', '/', '_', ',', 'o', 'O', '0', '#', '%', '$', 'v', 'V', 'x'], // Enhanced leaves list
        multiplier: 5,       // Branch multiplier (0-20)
        life: 32,            // Life (0-200)
        print: true,         // Print tree when finished
        seed: null,          // Random seed
        verbose: false,      // Increase output verbosity
        container: 'js-bonsai', // ID of container element
        theme: 'default',    // Color theme for the tree
        colorPalette: 'default' // Color palette to use (default, cherry, wisteria, maple)
    };

    // Character mappings
    chars = {
        // Trunk and branch characters
        trunks: ['|', '/', '||', 'Y', 'V', 'v', '^', '<', '>', 'H'],
        // Branch joint characters
        joints: ['/', '//', 'v', '>', '<', '^', 'Y', 'V', 'y', 'T', 't', 'x', 'X', '+'],
        // Branch strings based on direction - matching cbonsai's implementation
        branchStrings: {
            trunk: {
                straightHorizontal: "/~",
                leftDiagonal: "//|",
                vertical: "/|/",
                rightDiagonal: "|/"
            },
            shootLeft: {
                down: "//",
                horizontal: "//=",
                leftDiagonal: "//|",
                vertical: "/|",
                rightDiagonal: "/"
            },
            shootRight: {
                down: "/",
                horizontal: "=/",
                leftDiagonal: "//|",
                vertical: "/|",
                rightDiagonal: "/"
            }
        },
        // Dead branch characters
        deadChars: ['/', '`', '.', ',', '_'],
        // Base styles - adapted from cbonsai.c
        bases: [
            [], // Base 0 - no base
            [   // Base 1 - pot with dirt and grass
                ":__________./~~~~~\\.__________:",
                " \\                           /",
                "  \\________________________ /",
                "  (_)                     (_)"
            ],
            [   // Base 2 - simple round pot
                "(_---_./~~~\\._---_)",
                " (   (     )   ) ",
                "  (___(___)___) "
            ]
        ]
    };

    // Tree color mappings - adapted to match cbonsai
    colors = {
        trunk: "#976c3c",    // Brown for trunk and branches
        branch: "#976c3c",   // Same as trunk
        leaf: "#4e9a06",     // Standard green for leaves
        leafLight: "#7bba2d", // Lighter green for variety
        leafDark: "#366804",  // Darker green for variety
        base: "#8a8a8a",     // Gray for base/pot
        dirt: "#6d3300",     // Brown for soil
        grass: "#4e9a06",     // Green for grass in pot
        message: "#cccccc"   // Light gray for messages
    };

    // Predefined color palettes
    colorPalettes = {
        default: {
            leaf: "#4e9a06",     // Standard green
            leafLight: "#7bba2d", // Lighter green
            leafDark: "#366804",  // Darker green
            grass: "#4e9a06"      // Green for grass in pot
        },
        cherry: {
            leaf: "#FF80AB",      // Pink
            leafLight: "#FFBDD4", // Light pink
            leafDark: "#D85A7F",  // Dark pink
            grass: "#4e9a06"      // Keep green grass
        },
        wisteria: {
            leaf: "#9575CD",      // Purple
            leafLight: "#B39DDB", // Light purple
            leafDark: "#7986CB",  // Light blue-purple
            grass: "#A5D6A7"      // Light green grass
        },
        maple: {
            leaf: "#E53935",      // Red
            leafLight: "#FF7043", // Orange-red
            leafDark: "#B71C1C",  // Dark red
            grass: "#4e9a06"      // Keep green grass
        }
    };

    // Variables for tree generation
    tree = []; // 2D array representing the tree display
    timeouts = []; // Store timeouts for animation
    isGrowing = false;
    isScreensaverActive = false;
    container = null;
    keydownListener = null;

    // Branch types - mimicking cbonsai's enum
    branchTypes = {
        TRUNK: 0,
        SHOOT_LEFT: 1,
        SHOOT_RIGHT: 2,
        DYING: 3,
        DEAD: 4
    };

    // Counters to track tree growth
    counters = {
        branches: 0,
        shoots: 0,
        shootCounter: 0
    };

    // CSS class prefix to prevent conflicts
    classPrefix = 'js-bonsai-';
    cssInjected = false;

    /**
     * Constructor for JSBonsai
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Merge provided options with defaults
        this.options = { ...this.defaultOptions, ...options };
        
        // Get container element
        this.container = document.getElementById(this.options.container);
        if (!this.container) {
            console.error(`Container element with ID '${this.options.container}' not found`);
            return;
        }
        
        // Apply selected color palette
        this.applyColorPalette(this.options.colorPalette);
        
        // Set up screensaver mode if enabled
        if (this.options.screensaver) {
            this.options.live = true;
            this.options.infinite = true;
            this.setupScreensaver();
        }
        
        // Validate options
        this.validateOptions();
        
        // Create a UI if verbose mode is enabled
        if (this.options.verbose) {
            this.createUI();
        }
        
        // Initialize the random seed if provided
        this.initializeRandomSeed();
        
        // Generate and inject CSS
        this.injectCSS();
        
        // Start growing the tree
        this.start();
    }
    
    /**
     * Validate options to ensure they're within acceptable ranges
     */
    validateOptions() {
        // Ensure multiplier is within bounds (0-20)
        this.options.multiplier = Math.max(0, Math.min(20, this.options.multiplier));
        
        // Ensure life is within bounds (0-200)
        this.options.life = Math.max(0, Math.min(200, this.options.life));
        
        // Ensure time step is positive
        if (this.options.time <= 0) {
            this.options.time = 0.03; // Default value
        }
        
        // Ensure wait time is positive
        if (this.options.wait <= 0) {
            this.options.wait = 4.0; // Default value
        }
        
        // Ensure base type exists
        if (this.options.base < 0 || this.options.base >= this.chars.bases.length) {
            this.options.base = 1; // Default to first base style
        }
    }
    
    /**
     * Initialize random seed for consistent tree generation
     */
    initializeRandomSeed() {
        // If no seed provided, generate one randomly
        if (this.options.seed === null) {
            this.options.seed = Math.floor(Math.random() * 10000);
        }
        
        // Set up the seeded random number generator
        Math.customRandom = Math.seedrandom(this.options.seed);
        
        // Log seed if verbose
        if (this.options.verbose) {
            console.log(`Using random seed: ${this.options.seed}`);
        }
    }

    /**
     * Start growing the tree
     */
    start() {
        if (this.options.infinite) {
            this.growInfinitely();
        } else {
            this.growTree();
        }
    }

    /**
     * Setup screensaver mode (exit on keypress)
     */
    setupScreensaver() {
        this.isScreensaverActive = true;
        
        // Add keydown event listener to exit screensaver
        this.keydownListener = () => {
            this.isScreensaverActive = false;
            this.clearTimeouts();
            document.removeEventListener('keydown', this.keydownListener);
        };
        
        document.addEventListener('keydown', this.keydownListener);
    }

    /**
     * Create UI controls for the bonsai tree
     */
    createUI() {
        // Get container elements for each option category
        const liveOptionsContainer = document.getElementById('live-options');
        const growthOptionsContainer = document.getElementById('growth-options');
        const appearanceOptionsContainer = document.getElementById('appearance-options');
        const advancedOptionsContainer = document.getElementById('advanced-options');
        const controlButtonsContainer = document.getElementById('control-buttons');
        
        // If containers don't exist, try to use the legacy container
        if (!liveOptionsContainer || !growthOptionsContainer || !appearanceOptionsContainer || 
            !advancedOptionsContainer || !controlButtonsContainer) {
            const optionsContainer = document.querySelector('.option-controls');
            if (!optionsContainer) return;
            
            // Clear existing controls
            optionsContainer.innerHTML = '';
            
            // Create legacy UI (fallback for compatibility)
            this.createLegacyUI(optionsContainer);
            return;
        }
        
        // Clear existing controls in each container
        liveOptionsContainer.innerHTML = '';
        growthOptionsContainer.innerHTML = '';
        appearanceOptionsContainer.innerHTML = '';
        advancedOptionsContainer.innerHTML = '';
        controlButtonsContainer.innerHTML = '';
        
        // Create Display Mode options
        this.createCheckboxOption(liveOptionsContainer, 'live', 'Live Mode');
        this.createNumberOption(liveOptionsContainer, 'time', 'Animation Speed (sec)', 0.01, 10, 0.01);
        this.createCheckboxOption(liveOptionsContainer, 'infinite', 'Infinite Mode');
        this.createNumberOption(liveOptionsContainer, 'wait', 'Wait Between Trees (sec)', 0.1, 20, 0.1);
        this.createCheckboxOption(liveOptionsContainer, 'screensaver', 'Screensaver Mode');
        
        // Create Growth Parameters options
        this.createNumberOption(growthOptionsContainer, 'multiplier', 'Branch Multiplier', 0, 20, 1);
        this.createNumberOption(growthOptionsContainer, 'life', 'Life', 1, 200, 1);
        
        // Create Appearance options
        this.createTextOption(appearanceOptionsContainer, 'message', 'Message');
        this.createSelectOption(appearanceOptionsContainer, 'base', 'Base Style', [
            { value: 0, label: 'None' },
            { value: 1, label: 'Pot with soil' },
            { value: 2, label: 'Simple pot' }
        ]);
        this.createSelectOption(appearanceOptionsContainer, 'colorPalette', 'Color Palette', [
            { value: 'default', label: 'Default Green' },
            { value: 'cherry', label: 'Cherry Blossom Pink' },
            { value: 'wisteria', label: 'Wisteria Purple' },
            { value: 'maple', label: 'Maple Red' }
        ]);
        
        // Create Advanced options
        this.createNumberOption(advancedOptionsContainer, 'seed', 'Random Seed', 0, 9999, 1, true);
        
        // Create color palette
        this.createColorPalette();
        
        // Create control buttons
        const generateButton = document.createElement('button');
        generateButton.textContent = 'Generate New Tree';
        generateButton.addEventListener('click', () => {
            this.clearTimeouts();
            this.reset();
            this.start();
        });
        
        controlButtonsContainer.appendChild(generateButton);
    }
    
    /**
     * Legacy UI creation method (for backwards compatibility)
     * @param {HTMLElement} container - The container element for the UI
     */
    createLegacyUI(container) {
        // Create controls for each option
        this.createCheckboxOption(container, 'live', 'Live Mode');
        this.createNumberOption(container, 'time', 'Time (seconds)', 0.01, 10, 0.01);
        this.createCheckboxOption(container, 'infinite', 'Infinite Mode');
        this.createNumberOption(container, 'wait', 'Wait Time (seconds)', 0.1, 20, 0.1);
        this.createCheckboxOption(container, 'screensaver', 'Screensaver Mode');
        this.createTextOption(container, 'message', 'Message');
        this.createNumberOption(container, 'multiplier', 'Branch Multiplier', 0, 20, 1);
        this.createNumberOption(container, 'life', 'Life', 1, 200, 1);
        this.createNumberOption(container, 'seed', 'Random Seed', 0, 9999, 1, true);
        
        // Add color palette selection
        this.createSelectOption(container, 'colorPalette', 'Color Palette', [
            { value: 'default', label: 'Default Green' },
            { value: 'cherry', label: 'Cherry Blossom Pink' },
            { value: 'wisteria', label: 'Wisteria Purple' },
            { value: 'maple', label: 'Maple Red' }
        ]);
        
        // Create a color palette in legacy mode
        const colorGroup = document.createElement('div');
        colorGroup.className = 'option-group';
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color Palette';
        colorGroup.appendChild(colorLabel);
        container.appendChild(colorGroup);
        
        // Create a palette container inside the option group
        const paletteContainer = document.createElement('div');
        paletteContainer.id = 'color-palette';
        colorGroup.appendChild(paletteContainer);
        
        // Generate the color palette
        this.createColorPalette();
        
        // Create a "Generate" button
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'option-group';
        
        const generateButton = document.createElement('button');
        generateButton.textContent = 'Generate New Tree';
        generateButton.addEventListener('click', () => {
            this.clearTimeouts();
            this.reset();
            this.start();
        });
        
        buttonGroup.appendChild(generateButton);
        container.appendChild(buttonGroup);
    }

    /**
     * Create a checkbox option in the UI
     */
    createCheckboxOption(container, name, label) {
        const group = document.createElement('div');
        group.className = 'option-group';
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `option-${name}`;
        checkboxLabel.textContent = label;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `option-${name}`;
        checkbox.checked = this.options[name];
        checkbox.addEventListener('change', (e) => {
            this.options[name] = e.target.checked;
        });
        
        group.appendChild(checkboxLabel);
        group.appendChild(checkbox);
        container.appendChild(group);
    }

    /**
     * Create a number input option in the UI
     */
    createNumberOption(container, name, label, min, max, step, allowNull = false) {
        const group = document.createElement('div');
        group.className = 'option-group';
        
        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = `option-${name}`;
        inputLabel.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `option-${name}`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = this.options[name] !== null ? this.options[name] : '';
        
        input.addEventListener('change', (e) => {
            const value = e.target.value === '' && allowNull ? null : parseFloat(e.target.value);
            this.options[name] = value;
        });
        
        group.appendChild(inputLabel);
        group.appendChild(input);
        container.appendChild(group);
    }

    /**
     * Create a text input option in the UI
     */
    createTextOption(container, name, label) {
        const group = document.createElement('div');
        group.className = 'option-group';
        
        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = `option-${name}`;
        inputLabel.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `option-${name}`;
        input.value = this.options[name];
        
        input.addEventListener('change', (e) => {
            this.options[name] = e.target.value;
        });
        
        group.appendChild(inputLabel);
        group.appendChild(input);
        container.appendChild(group);
    }

    /**
     * Create a select option in the UI
     */
    createSelectOption(container, name, label, options) {
        const group = document.createElement('div');
        group.className = 'option-group';
        
        const selectLabel = document.createElement('label');
        selectLabel.htmlFor = `option-${name}`;
        selectLabel.textContent = label;
        
        const select = document.createElement('select');
        select.id = `option-${name}`;
        
        // Add options to select
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (this.options[name] === parseInt(opt.value) || this.options[name] === opt.value) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            const newValue = isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value);
            this.options[name] = newValue;
            
            // Special handling for color palette changes
            if (name === 'colorPalette') {
                this.applyColorPalette(newValue);
                this.createColorPalette(); // Refresh the color palette display
                
                // If not in live mode, regenerate the tree to show the new palette
                if (!this.options.live) {
                    this.clearTimeouts();
                    this.reset();
                    this.start();
                }
            }
        });
        
        group.appendChild(selectLabel);
        group.appendChild(select);
        container.appendChild(group);
    }

    /**
     * Reset the tree state
     */
    reset() {
        // Clear the tree array and container
        this.tree = [];
        this.container.innerHTML = '';
        this.isGrowing = false;
    }

    /**
     * Clear all active timeouts
     */
    clearTimeouts() {
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
    }

    /**
     * Grow a single tree
     */
    growTree() {
        this.isGrowing = true;
        this.reset();
        
        // Reset counters
        this.counters = {
            branches: 0,
            shoots: 0,
            shootCounter: Math.floor(Math.random() * 100) // Random starting counter to vary shoot directions
        };
        
        // Initialize the display area
        this.initializeDisplay();
        
        // Calculate starting position - this should be at the bottom center
        const startX = Math.floor(this.tree[0].length / 2);
        const startY = this.tree.length - 1;
        
        // Draw the base if specified
        if (this.options.base > 0 && this.chars.bases[this.options.base]) {
            this.drawBase(startX, startY);
        }
        
        // Seed the trunk's initial position
        // Place the trunk character just above the base
        const trunkY = startY - (this.options.base > 0 ? this.chars.bases[this.options.base].length : 0);
        
        // Build the tree structure first
        this.growBranch(startX, trunkY, 0, -1, this.branchTypes.TRUNK, this.options.life);
        
        // Add the message if specified
        if (this.options.message) {
            this.addMessage();
        }
        
        // If in live mode, animate the rendering
        if (this.options.live) {
            this.animateTreeRendering();
        } else {
            // Render once at the end
            this.render();
        }
        
        // Log statistics if verbose
        if (this.options.verbose) {
            console.log(`Generated tree with ${this.counters.branches} branches and ${this.counters.shoots} shoots.`);
        }
        
        this.isGrowing = false;
    }

    /**
     * Animate the tree rendering in live mode
     */
    animateTreeRendering() {
        // Create a copy of the completed tree for animation
        const completedTree = JSON.parse(JSON.stringify(this.tree));
        
        // Reset the visible tree to empty
        const rows = this.tree.length;
        const cols = this.tree[0].length;
        this.tree = Array(rows).fill().map(() => Array(cols).fill(' '));
        
        // Group cells into three categories: base, branches, and leaves
        const baseElements = [];
        const branchElements = [];
        const leafElements = [];
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = completedTree[y][x];
                if (typeof cell === 'object' && cell.char && cell.char !== ' ') {
                    // First, check by explicit type as the most reliable indicator
                    if (cell.type === 'base') {
                        baseElements.push({ x, y, cell });
                    } else if (cell.type === 'leaf') {
                        leafElements.push({ x, y, cell });
                    } else if (cell.type === 'branch') {
                        branchElements.push({ x, y, cell });
                    } 
                    // Second, check by branchType
                    else if (cell.branchType === this.branchTypes.DYING || cell.branchType === this.branchTypes.DEAD) {
                        leafElements.push({ x, y, cell });
                    }
                    // Third, check by color if type isn't explicit
                    else if (cell.color === this.colors.base || cell.color === this.colors.dirt || cell.color === this.colors.grass) {
                        baseElements.push({ x, y, cell });
                    } else if (cell.color === this.colors.branch || cell.color === this.colors.trunk) {
                        branchElements.push({ x, y, cell });
                    } else if (cell.color === this.colors.leaf || cell.color === this.colors.leafLight || cell.color === this.colors.leafDark) {
                        leafElements.push({ x, y, cell });
                    } else if (cell.color === this.colors.message) {
                        // Messages should be rendered with branches
                        branchElements.push({ x, y, cell });
                    } else {
                        // Default to branches for unknown types
                        console.log("Unknown element type:", cell);
                        branchElements.push({ x, y, cell }); 
                    }
                }
            }
        }
        
        // Sort elements from bottom to top to maintain proper drawing order
        baseElements.sort((a, b) => b.y - a.y);
        branchElements.sort((a, b) => b.y - a.y);
        leafElements.sort((a, b) => b.y - a.y);
        
        // Combine the phases in strict order: base -> branches -> leaves
        const animationSequence = [...baseElements, ...branchElements, ...leafElements];
        
        // Calculate phase transition delays
        const timePerElement = this.options.time * 1000; // ms per element
        const basePhaseEndTime = baseElements.length * timePerElement;
        const branchPhaseEndTime = basePhaseEndTime + (branchElements.length * timePerElement);
        
        // Add a small pause between phases for visual effect
        const phasePause = 300; // ms
        
        // Animate each element with appropriate timing
        animationSequence.forEach((item, index) => {
            let delay;
            
            // Calculate delay based on the phase
            if (index < baseElements.length) {
                // Base phase elements
                delay = index * timePerElement;
            } else if (index < baseElements.length + branchElements.length) {
                // Branch phase elements - start after base phase + pause
                const branchIndex = index - baseElements.length;
                delay = basePhaseEndTime + phasePause + (branchIndex * timePerElement);
            } else {
                // Leaf phase elements - start after branch phase + pause
                const leafIndex = index - (baseElements.length + branchElements.length);
                delay = branchPhaseEndTime + phasePause + (leafIndex * timePerElement);
            }
            
            const timeout = setTimeout(() => {
                this.tree[item.y][item.x] = item.cell;
                this.render();
            }, delay);
            
            this.timeouts.push(timeout);
        });
    }

    /**
     * Grow trees infinitely
     */
    growInfinitely() {
        const growLoop = () => {
            if (!this.isScreensaverActive && !this.options.infinite) return;
            
            this.growTree();
            
            const timeout = setTimeout(() => {
                growLoop();
            }, this.options.wait * 1000);
            
            this.timeouts.push(timeout);
        };
        
        growLoop();
    }

    /**
     * Initialize the display area with empty spaces
     */
    initializeDisplay() {
        // Calculate the dimensions based on container size
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        
        // Estimate how many characters fit in the container
        // Monospace font is approximately 0.6em width x 1.2em height
        const fontSize = parseFloat(getComputedStyle(this.container).fontSize);
        const cols = Math.floor(containerWidth / (fontSize * 0.6)) - 2; // Subtract a bit for padding
        const rows = Math.floor(containerHeight / (fontSize * 1.2)) - 2;
        
        // Create a 2D array of empty spaces
        this.tree = Array(rows).fill().map(() => Array(cols).fill(' '));
    }

    /**
     * Draw the base of the tree
     */
    drawBase(x, y) {
        const base = this.chars.bases[this.options.base];
        if (!base || base.length === 0) return;
        
        // Calculate the starting position to center the base
        const baseWidth = base[0].length;
        const baseStartX = Math.max(0, x - Math.floor(baseWidth / 2));
        
        // Draw each line of the base
        for (let i = 0; i < base.length; i++) {
            const baseRow = base[i];
            const row = y - base.length + i + 1;
            
            if (row >= 0 && row < this.tree.length) {
                for (let j = 0; j < baseRow.length; j++) {
                    const col = baseStartX + j;
                    
                    if (col >= 0 && col < this.tree[0].length) {
                        const char = baseRow[j];
                        let color;
                        
                        // Determine the color based on the character
                        if (char === '.' || char === '~') {
                            color = this.colors.grass;
                        } else if (char === '/') {
                            color = this.colors.dirt;
                        } else {
                            color = this.colors.base;
                        }
                        
                        this.tree[row][col] = {
                            char: char,
                            type: 'base',
                            color: color,
                            cssClass: this.getBaseClasses(char)
                        };
                    }
                }
            }
        }
    }

    /**
     * Recursively grow a branch
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} xDir - X direction (-1, 0, 1)
     * @param {number} yDir - Y direction (-1, 0, 1)
     * @param {number} branchType - Type of branch (from branchTypes enum)
     * @param {number} life - Life remaining for this branch
     */
    growBranch(x, y, xDir, yDir, branchType, life) {
        // Track branches for statistics
        this.counters.branches++;
        
        // Initialize the shoot cooldown 
        let shootCooldown = this.options.multiplier;
        let age = 0;
        
        // Use a while loop like in cbonsai to keep growing the branch
        while (life > 0) {
            // Decrement life
            life--;
            
            // Calculate age of the branch
            age = this.options.life - life;
            
            // Get delta values based on branch type and age
            const { dx, dy } = this.setDeltas(branchType, life, age, this.options.multiplier);
            
            // Prevent going too low (close to the ground)
            let adjustedDy = dy;
            if (dy > 0 && y > (this.tree.length - 2)) {
                adjustedDy = 0; // Reduce dy if too close to the ground
            }
            
            // Near-dead branches should branch into leaves
            if (life < 3) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 3; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(Math.random() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(Math.random() * 3) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.branchTypes.DEAD, life);
                }
            }
            
            // Dying trunk should branch into leaves
            else if (branchType === this.branchTypes.TRUNK && life < (this.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(Math.random() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(Math.random() * 2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.branchTypes.DYING, life);
                }
            }
            
            // Dying shoots should branch into leaves
            else if ((branchType === this.branchTypes.SHOOT_LEFT || branchType === this.branchTypes.SHOOT_RIGHT) 
                     && life < (this.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(Math.random() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(Math.random() * 2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.branchTypes.DYING, life);
                }
            }
            
            // Trunk should re-branch randomly or at regular intervals
            else if (branchType === this.branchTypes.TRUNK && 
                     ((Math.floor(Math.random() * 3) === 0) || (life % this.options.multiplier === 0))) {
                     
                // If trunk is branching and not about to die, create another trunk with random life
                if ((Math.floor(Math.random() * 8) === 0) && life > 7) {
                    shootCooldown = this.options.multiplier * 2; // Reset shoot cooldown
                    const lifeDelta = Math.floor(Math.random() * 5) - 2; // -2 to 2
                    this.growBranch(x, y, dx, adjustedDy, this.branchTypes.TRUNK, life + lifeDelta);
                }
                
                // Otherwise create a shoot if cooldown allows
                else if (shootCooldown <= 0) {
                    shootCooldown = this.options.multiplier * 2; // Reset shoot cooldown
                    
                    const shootLife = life + this.options.multiplier;
                    
                    // Increment shoot counters
                    this.counters.shoots++;
                    this.counters.shootCounter++;
                    
                    // Determine shoot direction (left or right alternating)
                    const shootType = (this.counters.shootCounter % 2 === 0) ? 
                                       this.branchTypes.SHOOT_LEFT : 
                                       this.branchTypes.SHOOT_RIGHT;
                                       
                    // Get initial shoot direction
                    const shootDx = (shootType === this.branchTypes.SHOOT_LEFT) ? -1 : 1;
                    
                    // Call branch with the shoot starting at an offset position
                    this.growBranch(x + shootDx, y - 1, shootDx, -1, shootType, shootLife);
                }
            }
            
            // Decrement shoot cooldown
            shootCooldown--;
            
            // Move in x and y directions
            x += dx;
            y += adjustedDy;
            
            // Choose the branch character string based on type and direction
            const branchStr = this.chooseString(branchType, life, dx, adjustedDy);
            
            // Set the character on the display if within bounds
            if (y >= 0 && y < this.tree.length && x >= 0 && x < this.tree[0].length) {
                // Determine if this is a leaf-type branch (dying or dead)
                const isLeafType = branchType === this.branchTypes.DYING || branchType === this.branchTypes.DEAD;
                
                // Get a random leaf color if this is a leaf type
                const leafColor = isLeafType ? this.getRandomLeafColor() : null;
                
                this.tree[y][x] = {
                    char: branchStr,
                    type: isLeafType ? 'leaf' : 'branch',
                    branchType: branchType,
                    color: isLeafType ? leafColor : this.colors.branch,
                    direction: { dx, dy: adjustedDy },
                    cssClass: isLeafType ? 
                        this.getLeafClasses(leafColor) : 
                        this.getBranchClasses(branchType, dx, adjustedDy)
                };
            }
            
            // Add leaves - increased probability and add to all branch types
            if (branchType !== this.branchTypes.TRUNK && Math.random() < 0.40) {
                // Higher probability for non-trunk branches (was 0.25)
                this.addLeaf(x, y);
            } else if (branchType === this.branchTypes.TRUNK && Math.random() < 0.15) {
                // Add some leaves to trunk branches too
                this.addLeaf(x, y);
            }
        }
    }

    /**
     * Add leaves near a branch
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    addLeaf(x, y) {
        // Try placing leaves in multiple positions around the branch
        // to create a more natural look - increased from 4 to 6 attempts
        for (let attempts = 0; attempts < 6; attempts++) {
            // Random offset for the leaf, with bias toward upper positions
            // (negative y values in our coordinate system)
            let offsetX, offsetY;
            
            // 60% chance for the leaf to be above the branch
            if (Math.random() < 0.6) {
                offsetY = -1;
                offsetX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            } else {
                // Otherwise random placement around branch
                offsetX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                offsetY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                
                // Avoid placing leaves directly on the branch
                if (offsetX === 0 && offsetY === 0) {
                    continue;
                }
            }
            
            const leafX = x + offsetX;
            const leafY = y + offsetY;
            
            // Ensure we're within bounds
            if (leafY >= 0 && leafY < this.tree.length && 
                leafX >= 0 && leafX < this.tree[0].length) {
                
                // Don't overwrite existing characters
                if (this.tree[leafY][leafX] === ' ' || 
                    (typeof this.tree[leafY][leafX] === 'object' && this.tree[leafY][leafX].char === ' ')) {
                    
                    // Select a random leaf character
                    const leafChar = this.options.leaves[Math.floor(Math.random() * this.options.leaves.length)];
                    
                    // Select a random leaf color
                    const leafColor = this.getRandomLeafColor();
                    
                    this.tree[leafY][leafX] = { 
                        char: leafChar,
                        type: 'leaf',
                        color: leafColor,
                        cssClass: this.getLeafClasses(leafColor)
                    };
                    
                    // Sometimes add additional leaves nearby to create clusters
                    // Increased probability from 0.3 to 0.5
                    if (Math.random() < 0.5) {
                        // Try to place a secondary leaf
                        const secondaryOffsetX = Math.floor(Math.random() * 3) - 1;
                        const secondaryOffsetY = Math.floor(Math.random() * 3) - 1;
                        
                        const secondaryLeafX = leafX + secondaryOffsetX;
                        const secondaryLeafY = leafY + secondaryOffsetY;
                        
                        if (secondaryLeafX >= 0 && secondaryLeafX < this.tree[0].length &&
                            secondaryLeafY >= 0 && secondaryLeafY < this.tree.length) {
                            
                            if (this.tree[secondaryLeafY][secondaryLeafX] === ' ' || 
                                (typeof this.tree[secondaryLeafY][secondaryLeafX] === 'object' && 
                                 this.tree[secondaryLeafY][secondaryLeafX].char === ' ')) {
                                
                                const secondaryLeafChar = this.options.leaves[Math.floor(Math.random() * this.options.leaves.length)];
                                const secondaryLeafColor = this.getRandomLeafColor();
                                
                                this.tree[secondaryLeafY][secondaryLeafX] = { 
                                    char: secondaryLeafChar,
                                    type: 'leaf',
                                    color: secondaryLeafColor,
                                    cssClass: this.getLeafClasses(secondaryLeafColor)
                                };
                            }
                        }
                    }
                    
                    // Add tertiary leaves occasionally to create fuller clusters
                    if (Math.random() < 0.3) {
                        const tertiaryOffsetX = Math.floor(Math.random() * 3) - 1;
                        const tertiaryOffsetY = Math.floor(Math.random() * 3) - 1;
                        
                        const tertiaryLeafX = leafX + tertiaryOffsetX;
                        const tertiaryLeafY = leafY + tertiaryOffsetY;
                        
                        if (tertiaryLeafX >= 0 && tertiaryLeafX < this.tree[0].length &&
                            tertiaryLeafY >= 0 && tertiaryLeafY < this.tree.length) {
                            
                            if (this.tree[tertiaryLeafY][tertiaryLeafX] === ' ' || 
                                (typeof this.tree[tertiaryLeafY][tertiaryLeafX] === 'object' && 
                                 this.tree[tertiaryLeafY][tertiaryLeafX].char === ' ')) {
                                
                                const tertiaryLeafChar = this.options.leaves[Math.floor(Math.random() * this.options.leaves.length)];
                                const tertiaryLeafColor = this.getRandomLeafColor();
                                
                                this.tree[tertiaryLeafY][tertiaryLeafX] = { 
                                    char: tertiaryLeafChar,
                                    type: 'leaf',
                                    color: tertiaryLeafColor,
                                    cssClass: this.getLeafClasses(tertiaryLeafColor)
                                };
                            }
                        }
                    }
                    
                    // Successfully placed a leaf, we can exit the loop
                    break;
                }
            }
        }
    }

    /**
     * Add the message to the display
     */
    addMessage() {
        if (!this.options.message) return;
        
        // Find a good location for the message
        const y = Math.floor(this.tree.length / 2);
        const x = Math.floor(this.tree[0].length / 3);
        
        // Add each character of the message
        for (let i = 0; i < this.options.message.length; i++) {
            if (x + i < this.tree[0].length) {
                this.tree[y][x + i] = { 
                    char: this.options.message[i],
                    type: 'message',
                    color: this.colors.message,
                    cssClass: this.getMessageClasses()
                };
            }
        }
    }

    /**
     * Render the tree to the container
     */
    render() {
        let output = '';
        
        // Convert the 2D array to a string with classed spans
        for (let row of this.tree) {
            for (let cell of row) {
                if (typeof cell === 'object' && cell.char) {
                    // Make sure to HTML-escape any special characters
                    const escapedChar = cell.char
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    
                    // Use inline style for color as a backup, but also keep classes for consistent styling
                    const colorStyle = cell.color ? `color: ${cell.color};` : '';
                    output += `<span class="${cell.cssClass}" style="${colorStyle}">${escapedChar}</span>`;
                } else {
                    output += cell;
                }
            }
            output += '\n';
        }
        
        // Update the container
        this.container.innerHTML = output;
    }

    /**
     * Choose the appropriate string to represent a branch segment
     * Based on cbonsai's chooseString function
     * 
     * @param {number} branchType - Type of branch from branchTypes enum
     * @param {number} life - Remaining life of branch
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     * @returns {string} - The string to use for this branch segment
     */
    chooseString(branchType, life, dx, dy) {
        // Dying branches become leaves
        if (life < 4) {
            branchType = this.branchTypes.DYING;
        }
        
        // Default fallback character
        let branchStr = "?";
        
        switch(branchType) {
            case this.branchTypes.TRUNK:
                if (dy === 0) {
                    branchStr = this.chars.branchStrings.trunk.straightHorizontal;
                } else if (dx < 0) {
                    branchStr = this.chars.branchStrings.trunk.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.chars.branchStrings.trunk.vertical;
                } else if (dx > 0) {
                    branchStr = this.chars.branchStrings.trunk.rightDiagonal;
                }
                break;
                
            case this.branchTypes.SHOOT_LEFT:
                if (dy > 0) {
                    branchStr = this.chars.branchStrings.shootLeft.down;
                } else if (dy === 0) {
                    branchStr = this.chars.branchStrings.shootLeft.horizontal;
                } else if (dx < 0) {
                    branchStr = this.chars.branchStrings.shootLeft.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.chars.branchStrings.shootLeft.vertical;
                } else if (dx > 0) {
                    branchStr = this.chars.branchStrings.shootLeft.rightDiagonal;
                }
                break;
                
            case this.branchTypes.SHOOT_RIGHT:
                if (dy > 0) {
                    branchStr = this.chars.branchStrings.shootRight.down;
                } else if (dy === 0) {
                    branchStr = this.chars.branchStrings.shootRight.horizontal;
                } else if (dx < 0) {
                    branchStr = this.chars.branchStrings.shootRight.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.chars.branchStrings.shootRight.vertical;
                } else if (dx > 0) {
                    branchStr = this.chars.branchStrings.shootRight.rightDiagonal;
                }
                break;
                
            case this.branchTypes.DYING:
            case this.branchTypes.DEAD:
                // Use a random leaf character for dying/dead branches
                const leafIndex = Math.floor(Math.random() * this.options.leaves.length);
                branchStr = this.options.leaves[leafIndex];
                break;
        }
        
        return branchStr;
    }

    /**
     * Set delta values for branch growth direction
     * Based on cbonsai's setDeltas function
     * 
     * @param {number} branchType - Type of branch from branchTypes enum
     * @param {number} life - Remaining life of branch
     * @param {number} age - Current age of branch
     * @param {number} multiplier - Branch multiplier value
     * @returns {Object} - Contains dx and dy direction values
     */
    setDeltas(branchType, life, age, multiplier) {
        let dx = 0;
        let dy = 0;
        
        // Helper function to simulate cbonsai's roll function precisely
        const roll = (mod) => {
            return Math.floor(Math.random() * mod);
        };
        
        // Using the exact same probability distributions as cbonsai
        switch(branchType) {
            case this.branchTypes.TRUNK:
                // New or dead trunk
                if (age <= 2 || life < 4) {
                    dy = 0;
                    dx = (Math.floor(Math.random() * 3)) - 1; // -1, 0, or 1
                }
                // Young trunk should grow wide
                else if (age < (multiplier * 3)) {
                    // Every (multiplier * 0.5) steps, raise tree to next level
                    if (age % Math.floor(multiplier * 0.5) === 0) {
                        dy = -1;
                    } else {
                        dy = 0;
                    }
                    
                    // Using exact dice ranges as in cbonsai
                    const dice = roll(10);
                    if (dice === 0) dx = -2;
                    else if (dice >= 1 && dice <= 3) dx = -1;
                    else if (dice >= 4 && dice <= 5) dx = 0;
                    else if (dice >= 6 && dice <= 8) dx = 1;
                    else if (dice === 9) dx = 2;
                }
                // Middle-aged trunk
                else {
                    const dice = roll(10);
                    if (dice > 2) {
                        dy = -1; // Mostly grow upward
                    } else {
                        dy = 0;
                    }
                    
                    dx = (Math.floor(Math.random() * 3)) - 1; // -1, 0, or 1
                }
                break;
                
            case this.branchTypes.SHOOT_LEFT:
                // Vertical movement - using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1; // Some upward growth
                    else if (dice >= 2 && dice <= 7) dy = 0; // Mostly horizontal
                    else dy = 1; // Occasional downward growth
                }
                
                // Horizontal movement - trend left, using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dx = -2; // Strong left
                    else if (dice >= 2 && dice <= 5) dx = -1; // Moderate left
                    else if (dice >= 6 && dice <= 8) dx = 0; // No horizontal movement
                    else dx = 1; // Occasional right movement
                }
                break;
                
            case this.branchTypes.SHOOT_RIGHT:
                // Vertical movement - same as left shoot
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1;
                    else if (dice >= 2 && dice <= 7) dy = 0;
                    else dy = 1;
                }
                
                // Horizontal movement - trend right, using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dx = 2; // Strong right
                    else if (dice >= 2 && dice <= 5) dx = 1; // Moderate right
                    else if (dice >= 6 && dice <= 8) dx = 0; // No horizontal movement
                    else dx = -1; // Occasional left movement
                }
                break;
                
            case this.branchTypes.DYING:
                // Vertical movement - mostly horizontal
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1;
                    else if (dice >= 2 && dice <= 8) dy = 0;
                    else dy = 1;
                }
                
                // Horizontal movement - wider range, using exact dice ranges
                {
                    const dice = roll(15);
                    if (dice === 0) dx = -3;
                    else if (dice >= 1 && dice <= 2) dx = -2;
                    else if (dice >= 3 && dice <= 5) dx = -1;
                    else if (dice >= 6 && dice <= 8) dx = 0;
                    else if (dice >= 9 && dice <= 11) dx = 1;
                    else if (dice >= 12 && dice <= 13) dx = 2;
                    else if (dice === 14) dx = 3;
                }
                break;
                
            case this.branchTypes.DEAD:
                // Fill in surrounding area
                {
                    const dice = roll(10);
                    if (dice <= 2) dy = -1;
                    else if (dice >= 3 && dice <= 6) dy = 0;
                    else dy = 1;
                }
                
                dx = (Math.floor(Math.random() * 3)) - 1; // -1, 0, or 1
                break;
        }
        
        return { dx, dy };
    }

    /**
     * Generate and inject CSS for elements
     */
    injectCSS() {
        // Don't inject CSS multiple times
        if (this.cssInjected) return;
        
        // Create a style element
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = `${this.classPrefix}style`;
        
        // Build CSS rules
        let css = `
            .${this.classPrefix}element {
                display: inline-block;
                white-space: pre;
            }
            .${this.classPrefix}trunk {
                color: ${this.colors.trunk};
            }
            .${this.classPrefix}branch {
                color: ${this.colors.branch};
            }
            .${this.classPrefix}leaf {
                color: ${this.colors.leaf};
            }
            .${this.classPrefix}leaf-light {
                color: ${this.colors.leafLight};
            }
            .${this.classPrefix}leaf-dark {
                color: ${this.colors.leafDark};
            }
            .${this.classPrefix}base {
                color: ${this.colors.base};
            }
            .${this.classPrefix}dirt {
                color: ${this.colors.dirt};
            }
            .${this.classPrefix}grass {
                color: ${this.colors.grass};
            }
            .${this.classPrefix}message {
                color: ${this.colors.message};
            }
        `;
        
        // Add CSS to the style element
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        
        // Add the style element to the document head
        document.head.appendChild(style);
        this.cssInjected = true;
    }

    /**
     * Get CSS classes for a branch element
     * @param {number} branchType - Type of branch
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     * @returns {string} - CSS classes for this branch
     */
    getBranchClasses(branchType, dx, dy) {
        let classes = [`${this.classPrefix}element`];
        
        // Base branch type class
        if (branchType === this.branchTypes.TRUNK) {
            classes.push(`${this.classPrefix}trunk`);
        } else if (branchType === this.branchTypes.SHOOT_LEFT || branchType === this.branchTypes.SHOOT_RIGHT) {
            classes.push(`${this.classPrefix}branch`);
        } else if (branchType === this.branchTypes.DYING || branchType === this.branchTypes.DEAD) {
            classes.push(`${this.classPrefix}leaf`);
            return classes.join(' '); // Return early for leaves
        }
        
        // Add branch subtype
        if (branchType === this.branchTypes.TRUNK) {
            classes.push(`${this.classPrefix}trunk-main`);
        } else if (branchType === this.branchTypes.SHOOT_LEFT) {
            classes.push(`${this.classPrefix}shoot-left`);
        } else if (branchType === this.branchTypes.SHOOT_RIGHT) {
            classes.push(`${this.classPrefix}shoot-right`);
        }
        
        // Add direction class
        if (dy === 0) {
            classes.push(`${this.classPrefix}horizontal`);
        } else if (dx < 0 && dy < 0) {
            classes.push(`${this.classPrefix}left-diagonal`);
        } else if (dx === 0 && dy < 0) {
            classes.push(`${this.classPrefix}vertical`);
        } else if (dx > 0 && dy < 0) {
            classes.push(`${this.classPrefix}right-diagonal`);
        } else if (dy > 0) {
            classes.push(`${this.classPrefix}down`);
        }
        
        return classes.join(' ');
    }

    /**
     * Get CSS classes for a base element
     * @param {string} char - The character to check
     * @returns {string} - CSS classes for this base element
     */
    getBaseClasses(char) {
        let classes = [`${this.classPrefix}element`];
        
        if (char === '.' || char === '~') {
            classes.push(`${this.classPrefix}grass`);
        } else if (char === '/') {
            classes.push(`${this.classPrefix}dirt`);
        } else {
            classes.push(`${this.classPrefix}base`);
        }
        
        return classes.join(' ');
    }

    /**
     * Get CSS classes for a leaf element
     * @param {string} color - The color to use for this leaf 
     * @returns {string} - CSS classes for this leaf element
     */
    getLeafClasses(color) {
        let colorClass = `${this.classPrefix}leaf`;
        
        // Add specific color class if provided
        if (color) {
            if (color === this.colors.leafLight) {
                colorClass = `${this.classPrefix}leaf-light`;
            } else if (color === this.colors.leafDark) {
                colorClass = `${this.classPrefix}leaf-dark`;
            }
        }
        
        return `${this.classPrefix}element ${colorClass}`;
    }

    /**
     * Get CSS classes for a message element
     * @returns {string} - CSS classes for this message element
     */
    getMessageClasses() {
        return `${this.classPrefix}element ${this.classPrefix}message`;
    }

    /**
     * Create a color palette display showing the colors used in the bonsai
     */
    createColorPalette() {
        // Get the container for the color palette
        const colorPaletteContainer = document.getElementById('color-palette');
        if (!colorPaletteContainer) return;
        
        // Clear any existing content
        colorPaletteContainer.innerHTML = '';
        
        // Create a flex container for the color swatches
        const paletteDisplay = document.createElement('div');
        paletteDisplay.className = 'color-palette-container';
        
        // Get unique colors (some are duplicates like trunk/branch and leaf/grass)
        const uniqueColors = {};
        
        // Process each color in the colors object
        for (const [key, value] of Object.entries(this.colors)) {
            // Skip duplicates
            if (!uniqueColors[value]) {
                uniqueColors[value] = key;
            } else if (uniqueColors[value] !== key) {
                // If multiple elements use the same color, combine their names
                uniqueColors[value] += `/${key}`;
            }
        }
        
        // Create a swatch for each unique color
        for (const [color, label] of Object.entries(uniqueColors)) {
            // Create the swatch element
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            
            // Add tooltip with the color hex value
            swatch.title = color;
            
            // Add a label for the swatch
            const swatchLabel = document.createElement('div');
            swatchLabel.className = 'color-swatch-label';
            swatchLabel.textContent = label;
            
            // Add click behavior to copy the color to clipboard
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color)
                    .then(() => {
                        // Show brief notification
                        const originalTitle = swatch.title;
                        swatch.title = 'Copied!';
                        setTimeout(() => {
                            swatch.title = originalTitle;
                        }, 1000);
                    });
            });
            
            // Add the label to the swatch
            swatch.appendChild(swatchLabel);
            
            // Add the swatch to the palette
            paletteDisplay.appendChild(swatch);
        }
        
        // Add the palette display to the container
        colorPaletteContainer.appendChild(paletteDisplay);
    }

    /**
     * Get a random leaf color
     * @returns {string} - A random color from the three leaf color options
     */
    getRandomLeafColor() {
        // Randomly choose between the three leaf colors
        const leafColors = [this.colors.leaf, this.colors.leafLight, this.colors.leafDark];
        const randomIndex = Math.floor(Math.random() * 3);
        return leafColors[randomIndex];
    }

    /**
     * Apply a color palette to the tree
     * @param {string} paletteName - Name of the palette to apply
     */
    applyColorPalette(paletteName) {
        // Ensure the palette exists
        if (!this.colorPalettes[paletteName]) {
            console.warn(`Color palette "${paletteName}" not found, using default.`);
            paletteName = 'default';
        }
        
        // Get the palette
        const palette = this.colorPalettes[paletteName];
        
        // Update colors
        Object.keys(palette).forEach(key => {
            this.colors[key] = palette[key];
        });
        
        // Update the option
        this.options.colorPalette = paletteName;
        
        // Re-inject CSS if already injected
        if (this.cssInjected) {
            // Remove existing style
            const existingStyle = document.getElementById(`${this.classPrefix}style`);
            if (existingStyle) {
                existingStyle.remove();
            }
            
            // Reset flag to force re-injection
            this.cssInjected = false;
            
            // Re-inject CSS
            this.injectCSS();
        }
        
        // If verbose, log the palette change
        if (this.options.verbose) {
            console.log(`Applied color palette: ${paletteName}`);
        }
    }
}

// Add seedrandom for consistent random number generation with seeds
// This implementation is based on a simple LCG algorithm
Math.seedrandom = function(seed) {
    let state = seed || Math.floor(Math.random() * 999999);
    
    return function() {
        // LCG parameters for a decent pseudo-random sequence
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        
        // Update state using LCG formula
        state = (a * state + c) % m;
        
        // Return a value between 0 and 1
        return state / m;
    };
};

// Replace the Math.random with our seeded version
const originalRandom = Math.random;

Math.random = function() {
    if (this.customRandom) {
        return this.customRandom();
    }
    return originalRandom.call(this);
}; 