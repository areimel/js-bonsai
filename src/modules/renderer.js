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
     * Render the tree to the DOM
     * Extracted from bonsai.js lines 832-857
     */
    render() {
        let output = '';

        // Convert the 2D array to a string with classed spans
        for (let row of this.state.tree) {
            for (let cell of row) {
                if (typeof cell === 'object' && cell.char) {
                    // Make sure to HTML-escape any special characters
                    const escapedChar = cell.char
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');

                    output += `<span class="${cell.cssClass}">${escapedChar}</span>`;
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
     * Animate tree rendering in three phases: base -> branches -> leaves
     * Extracted from bonsai.js lines 414-489
     */
    animateTreeRendering() {
        // Create a copy of the completed tree for animation
        const completedTree = JSON.parse(JSON.stringify(this.state.tree));

        // Reset the visible tree to empty
        const rows = this.state.tree.length;
        const cols = this.state.tree[0].length;
        this.state.tree = Array(rows).fill().map(() => Array(cols).fill(' '));

        // Group cells into three categories: base, branches, and leaves
        const baseElements = [];
        const branchElements = [];
        const leafElements = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = completedTree[y][x];
                if (typeof cell === 'object' && cell.char && cell.char !== ' ') {
                    // Categorize elements based on their color
                    if (cell.color === this.config.colors.base || cell.color === this.config.colors.dirt) {
                        baseElements.push({ x, y, cell });
                    } else if (cell.color === this.config.colors.branch) {
                        branchElements.push({ x, y, cell });
                    } else {
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
                this.state.tree[item.y][item.x] = item.cell;
                this.render();
            }, delay);

            this.state.timeouts.push(timeout);
        });
    }
}
