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
        leaves: ['&', '+', '*', '.', '^', '@', '~', '`', '"', '/', '_', ','], // List of characters for leaves
        multiplier: 5,       // Branch multiplier (0-20)
        life: 32,            // Life (0-200)
        print: true,         // Print tree when finished
        seed: null,          // Random seed
        verbose: false,      // Increase output verbosity
        container: 'js-bonsai' // ID of container element
    };

    // Character mappings
    chars = {
        // Trunk and branch characters
        trunks: ['|', '/', '//', 'Y', 'V', 'v', '^', '<', '>', 'i'],
        // Branch joint characters
        joints: ['/', '//', 'v', '>', '<', '^', 'Y', 'V', 'y', 'T', 't', 'x', 'X', '+'],
        // Branch strings based on direction - matching cbonsai's implementation
        branchStrings: {
            trunk: {
                straightHorizontal: "/~",
                leftDiagonal: "//|",
                vertical: "/|//",
                rightDiagonal: "|/"
            },
            shootLeft: {
                down: "//",
                horizontal: "//_",
                leftDiagonal: "//|",
                vertical: "/|",
                rightDiagonal: "/"
            },
            shootRight: {
                down: "/",
                horizontal: "_/",
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
        leaf: "#4e9a06",     // Green for leaves
        base: "#8a8a8a",     // Gray for base/pot
        dirt: "#6d3300",     // Brown for soil
        grass: "#4e9a06",     // Green for grass in pot
        message: "#cccccc"   // Light gray for messages
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
        const optionsContainer = document.querySelector('.option-controls');
        if (!optionsContainer) return;

        // Clear existing controls
        optionsContainer.innerHTML = '';

        // Create controls for each option
        this.createCheckboxOption(optionsContainer, 'live', 'Live Mode');
        this.createNumberOption(optionsContainer, 'time', 'Time (seconds)', 0.01, 10, 0.01);
        this.createCheckboxOption(optionsContainer, 'infinite', 'Infinite Mode');
        this.createNumberOption(optionsContainer, 'wait', 'Wait Time (seconds)', 0.1, 20, 0.1);
        this.createCheckboxOption(optionsContainer, 'screensaver', 'Screensaver Mode');
        this.createTextOption(optionsContainer, 'message', 'Message');
        this.createNumberOption(optionsContainer, 'multiplier', 'Branch Multiplier', 0, 20, 1);
        this.createNumberOption(optionsContainer, 'life', 'Life', 1, 200, 1);
        this.createNumberOption(optionsContainer, 'seed', 'Random Seed', 0, 9999, 1, true);

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
        optionsContainer.appendChild(buttonGroup);
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
        
        // Create a flat list of all cells to animate
        const cellsToAnimate = [];
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = completedTree[y][x];
                if (typeof cell === 'object' && cell.char && cell.char !== ' ') {
                    cellsToAnimate.push({
                        x, 
                        y, 
                        cell,
                        // Prioritize trunk and branches over leaves
                        isPriority: cell.color === this.colors.branch
                    });
                }
            }
        }
        
        // Sort the cells from bottom to top (higher y values first)
        // Within the same y-coordinate, branches come before leaves
        cellsToAnimate.sort((a, b) => {
            // First sort by y-coordinate (descending - bottom to top)
            if (b.y !== a.y) {
                return b.y - a.y;
            }
            
            // For cells in the same row, branches come before leaves
            if (a.isPriority && !b.isPriority) return -1;
            if (!a.isPriority && b.isPriority) return 1;
            
            // For cells with the same priority, they can be ordered from left to right
            return a.x - b.x;
        });
        
        // Animate each cell with a timeout
        cellsToAnimate.forEach((item, index) => {
            const timeout = setTimeout(() => {
                this.tree[item.y][item.x] = item.cell;
                this.render();
            }, index * (this.options.time * 1000));
            
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
                        // Determine color based on character type
                        let color = this.colors.base;
                        const char = baseRow[j];
                        
                        // Color specific parts differently
                        if (char === '.' || char === '~') {
                            color = this.colors.grass; // Green for grass/plants
                        } else if (char === '/') {
                            color = this.colors.dirt; // Brown for dirt
                        }
                        
                        this.tree[row][col] = {
                            char: baseRow[j],
                            color: color
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
                this.growBranch(x, y, dx, adjustedDy, this.branchTypes.DEAD, life);
            }
            
            // Dying trunk should branch into leaves
            else if (branchType === this.branchTypes.TRUNK && life < (this.options.multiplier + 2)) {
                this.growBranch(x, y, dx, adjustedDy, this.branchTypes.DYING, life);
            }
            
            // Dying shoots should branch into leaves
            else if ((branchType === this.branchTypes.SHOOT_LEFT || branchType === this.branchTypes.SHOOT_RIGHT) 
                     && life < (this.options.multiplier + 2)) {
                this.growBranch(x, y, dx, adjustedDy, this.branchTypes.DYING, life);
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
            const color = this.colors.branch;
            
            // Set the character on the display if within bounds
            if (y >= 0 && y < this.tree.length && x >= 0 && x < this.tree[0].length) {
                this.tree[y][x] = { char: branchStr, color };
            }
            
            // Add leaves for non-trunk branches with a certain probability
            if (branchType !== this.branchTypes.TRUNK && Math.random() < 0.25) {
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
        // to create a more natural look
        for (let attempts = 0; attempts < 4; attempts++) {
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
                    
                    this.tree[leafY][leafX] = { 
                        char: leafChar, 
                        color: this.colors.leaf 
                    };
                    
                    // Sometimes add additional leaves nearby to create clusters
                    if (Math.random() < 0.3) {
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
                                
                                this.tree[secondaryLeafY][secondaryLeafX] = { 
                                    char: secondaryLeafChar, 
                                    color: this.colors.leaf 
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
                    color: this.colors.message 
                };
            }
        }
    }

    /**
     * Render the tree to the container
     */
    render() {
        let output = '';
        
        // Convert the 2D array to a string with colored spans
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
                    
                    output += `<span style="color:${cell.color}">${escapedChar}</span>`;
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