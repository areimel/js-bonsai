/**
 * Renderer - handles display rendering and animation
 * Extracted from bonsai.js lines 513-526, 832-857, 414-489
 */

export class Renderer {
    constructor(state, config, cssManager) {
        this.state = state;
        this.config = config;
        this.cssManager = cssManager;
    }

    /**
     * Initialize the display array based on container size
     * Extracted from bonsai.js lines 513-526
     */
    initializeDisplay() {
        // Calculate the dimensions based on container size
        const containerWidth = this.state.refs.container.clientWidth;
        const containerHeight = this.state.refs.container.clientHeight;

        // Estimate how many characters fit in the container
        // Monospace font is approximately 0.6em width x 1.2em height
        const fontSize = parseFloat(getComputedStyle(this.state.refs.container).fontSize);
        const cols = Math.floor(containerWidth / (fontSize * 0.6)) - 2; // Subtract a bit for padding
        const rows = Math.floor(containerHeight / (fontSize * 1.2)) - 2;

        // Create a 2D array of empty spaces
        this.state.tree = Array(rows).fill().map(() => Array(cols).fill(' '));
    }

    /**
     * Generate a unique identifier for a cell position
     * Used for CSS-based animation targeting
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} - Unique identifier
     */
    getCellId(x, y) {
        return `cell-${y}-${x}`;
    }

    /**
     * Render the tree to the DOM
     * Extracted from bonsai.js lines 832-857
     * MODIFIED: Now includes data-cell-id and supports hidden state
     * @param {boolean} hideAll - If true, add 'hidden' class to all cells (for animation)
     */
    render(hideAll = false) {
        let output = '';

        // Convert the 2D array to a string with classed spans
        for (let y = 0; y < this.state.tree.length; y++) {
            const row = this.state.tree[y];
            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (typeof cell === 'object' && cell.char) {
                    // Make sure to HTML-escape any special characters
                    const escapedChar = cell.char
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');

                    // Build classes: base classes + hidden state
                    const cellId = this.getCellId(x, y);
                    const hiddenClass = hideAll ? ` ${this.config.classPrefix}hidden` : '';
                    const classes = `${cell.cssClass}${hiddenClass}`;

                    output += `<span class="${classes}" data-cell-id="${cellId}">${escapedChar}</span>`;
                } else {
                    output += cell;
                }
            }
            output += '\n';
        }

        // Update the container
        this.state.refs.container.innerHTML = output;
    }

    /**
     * Reveal a single cell by removing hidden class and adding visible class
     * Used for CSS-based animation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    revealCell(x, y) {
        const cellId = this.getCellId(x, y);
        const element = this.state.refs.container.querySelector(`[data-cell-id="${cellId}"]`);

        if (element) {
            element.classList.remove(`${this.config.classPrefix}hidden`);
            element.classList.add(`${this.config.classPrefix}visible`);
        }
    }

    /**
     * Animate tree rendering in three phases: base -> branches -> leaves
     * MODIFIED: Uses CSS-based reveal instead of innerHTML manipulation
     * Extracted from bonsai.js lines 414-489
     *
     * PERFORMANCE: This implementation uses CSS-based animation to avoid DOM thrashing.
     * Instead of rebuilding innerHTML on every frame, we render once with all characters
     * hidden, then reveal them by toggling CSS classes. This keeps the DOM structure
     * stable during animation and leverages GPU-accelerated CSS transitions.
     */
    animateTreeRendering() {
        // Render the complete tree with all cells hidden
        this.render(true);

        // Group cells into three categories: base, branches, and leaves
        const baseElements = [];
        const branchElements = [];
        const leafElements = [];

        const rows = this.state.tree.length;
        const cols = this.state.tree[0].length;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = this.state.tree[y][x];
                if (typeof cell === 'object' && cell.char && cell.char !== ' ') {
                    // BUG FIX: Previous implementation used cell.color for categorization, but
                    // cell.color is never set by tree-generator.js. Changed to use cell.type.
                    if (cell.type === 'base') {
                        baseElements.push({ x, y, cell });
                    } else if (cell.type === 'branch') {
                        branchElements.push({ x, y, cell });
                    } else if (cell.type === 'leaf') {
                        leafElements.push({ x, y, cell });
                    } else if (cell.type === 'message') {
                        // Messages are revealed with leaves
                        leafElements.push({ x, y, cell });
                    }
                }
            }
        }

        // Sort base elements from bottom to top
        baseElements.sort((a, b) => b.y - a.y);

        // Sort branch elements from bottom to top
        branchElements.sort((a, b) => b.y - a.y);

        // Sort leaf elements from bottom to top
        leafElements.sort((a, b) => b.y - a.y);

        // Combine the phases in order: base -> branches -> leaves
        const animationSequence = [...baseElements, ...branchElements, ...leafElements];

        // Calculate phase transition delays
        const timePerElement = this.state.options.time * 1000; // ms per element
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
                this.revealCell(item.x, item.y);
            }, delay);

            this.state.timeouts.push(timeout);
        });
    }
}
