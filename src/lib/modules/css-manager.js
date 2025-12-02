/**
 * CSS Manager - handles CSS injection and class generation
 * Extracted from bonsai.js lines 1066-1194
 */

export class CSSManager {
    constructor(config) {
        this.config = config;
        this.classPrefix = config.classPrefix;
        this.colors = config.colors;
        this.branchTypes = config.branchTypes;
        this.cssInjected = false;
    }

    /**
     * Inject CSS styles into the document
     * Extracted from bonsai.js lines 1066-1114
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
            .${this.classPrefix}hidden {
                opacity: 0;
            }
            .${this.classPrefix}visible {
                opacity: 1;
                transition: opacity 0.1s ease-in;
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
     * Update CSS colors dynamically for a new palette
     * @param {string} paletteName - Name of the palette to apply
     */
    updateColors(paletteName) {
        // Get new colors for the palette
        const newColors = this.config.getColorsForPalette(paletteName);
        this.colors = newColors;

        // Find the existing style element
        const styleElement = document.getElementById(`${this.classPrefix}style`);
        if (!styleElement) {
            console.error('CSS not injected yet - cannot update colors');
            return;
        }

        // Rebuild CSS with new colors (same structure as injectCSS)
        const css = `
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
            .${this.classPrefix}hidden {
                opacity: 0;
            }
            .${this.classPrefix}visible {
                opacity: 1;
                transition: opacity 0.1s ease-in;
            }
        `;

        // Update the style element
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = css;
        } else {
            styleElement.textContent = css;
        }
    }

    /**
     * Get CSS classes for a branch element
     * Extracted from bonsai.js lines 1123-1159
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
     * Extracted from bonsai.js lines 1166-1178
     * @param {string} char - The character to check
     * @returns {string} - CSS classes for this base element
     */
    getBaseClasses(char) {
        let classes = [`${this.classPrefix}element`];

        if (char === '.' || char === '~') {
            classes.push(`${this.classPrefix}grass`);
        } else {
            classes.push(`${this.classPrefix}base`);
        }

        return classes.join(' ');
    }

    /**
     * Get CSS classes for a leaf element
     * @param {string} variant - Leaf color variant: 'base', 'light', or 'dark'
     * @returns {string} - CSS classes for this leaf element
     */
    getLeafClasses(variant = 'base') {
        let leafClass;

        switch(variant) {
            case 'light':
                leafClass = `${this.classPrefix}leaf-light`;
                break;
            case 'dark':
                leafClass = `${this.classPrefix}leaf-dark`;
                break;
            case 'base':
            default:
                leafClass = `${this.classPrefix}leaf`;
                break;
        }

        return `${this.classPrefix}element ${leafClass}`;
    }

    /**
     * Get CSS classes for a message element
     * Extracted from bonsai.js lines 1192-1194
     * @returns {string} - CSS classes for this message element
     */
    getMessageClasses() {
        return `${this.classPrefix}element ${this.classPrefix}message`;
    }
}
