/**
 * CSS Manager — handles CSS injection and class generation.
 *
 * Delegates string building to css/build-styles.js (pure functions, no DOM)
 * and class computation to css/cell-classes.js (stateless free functions).
 * This class owns only DOM manipulation and palette state.
 */

import { buildColorCSS, buildGridCSS } from './css/build-styles.js';
import {
    getBranchClasses as _getBranchClasses,
    getBaseClasses   as _getBaseClasses,
    getLeafClasses   as _getLeafClasses,
    getMessageClasses as _getMessageClasses,
} from './css/cell-classes.js';

export class CSSManager {
    constructor(config) {
        this.config = config;
        this.classPrefix = config.classPrefix;
        this.colors = config.colors;
        this.branchTypes = config.branchTypes;
        this.cssInjected = false;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Apply a CSS string to a style element.
     *
     * Handles the legacy IE styleSheet API (IE 8 and earlier) where
     * textContent is not available on style elements.
     *
     * @param {HTMLStyleElement} styleElement - Target <style> element.
     * @param {string} css - CSS text to apply.
     */
    applyCss(styleElement, css) {
        if (styleElement.styleSheet) {
            // IE 8 and earlier
            styleElement.styleSheet.cssText = css;
        } else {
            styleElement.textContent = css;
        }
    }

    // -------------------------------------------------------------------------
    // CSS injection
    // -------------------------------------------------------------------------

    /**
     * Inject base color and visibility styles into the document <head>.
     *
     * Guarded by cssInjected so it is safe to call multiple times — only the
     * first call has any effect.  The style element is given a stable id so
     * updateColors() can find and replace it later.
     */
    injectCSS() {
        // Don't inject CSS multiple times
        if (this.cssInjected) return;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = `${this.classPrefix}style`;

        this.applyCss(style, buildColorCSS(this.classPrefix, this.colors));

        document.head.appendChild(style);
        this.cssInjected = true;
    }

    /**
     * Inject CSS Grid layout styles for the tree container.
     *
     * Removes any previously injected grid style element before creating a
     * new one so that dimension changes (e.g. window resize) are reflected
     * immediately without accumulating stale rules.
     *
     * @param {string} containerId - ID of the container element.
     * @param {number} rows - Number of grid rows.
     * @param {number} cols - Number of grid columns.
     */
    injectGridStyles(containerId, rows, cols) {
        // Remove old grid styles if they exist
        const oldStyle = document.getElementById(`${this.classPrefix}grid-style`);
        if (oldStyle) {
            oldStyle.remove();
        }

        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = `${this.classPrefix}grid-style`;

        this.applyCss(style, buildGridCSS(containerId, rows, cols));

        document.head.appendChild(style);
    }

    /**
     * Swap the active color palette by rebuilding the canonical ruleset.
     *
     * Re-applies the exact same ruleset as injectCSS() — including z-index
     * layering — so there is no behavioural difference between initial load
     * and a mid-session palette switch.
     *
     * @param {string} paletteName - Key of the palette to activate.
     */
    updateColors(paletteName) {
        this.colors = this.config.getColorsForPalette(paletteName);

        const styleElement = document.getElementById(`${this.classPrefix}style`);
        if (!styleElement) {
            console.error('CSS not injected yet - cannot update colors');
            return;
        }

        this.applyCss(styleElement, buildColorCSS(this.classPrefix, this.colors));
    }

    // -------------------------------------------------------------------------
    // Class name helpers — thin delegates so call sites don't change
    // -------------------------------------------------------------------------

    /**
     * Get CSS classes for a branch/trunk cell.
     * @param {number} branchType - Type of branch (see branchTypes enum).
     * @param {number} dx - Horizontal direction.
     * @param {number} dy - Vertical direction.
     * @returns {string} Space-separated CSS class string.
     */
    getBranchClasses(branchType, dx, dy) {
        return _getBranchClasses(this.classPrefix, this.branchTypes, branchType, dx, dy);
    }

    /**
     * Get CSS classes for a base/pot cell.
     * @param {string} char - The ASCII character for this cell.
     * @returns {string} Space-separated CSS class string.
     */
    getBaseClasses(char) {
        return _getBaseClasses(this.classPrefix, char);
    }

    /**
     * Get CSS classes for a leaf cell.
     * @param {'base'|'light'|'dark'} variant - Leaf colour variant.
     * @returns {string} Space-separated CSS class string.
     */
    getLeafClasses(variant = 'base') {
        return _getLeafClasses(this.classPrefix, variant);
    }

    /**
     * Get CSS classes for a message cell.
     * @returns {string} Space-separated CSS class string.
     */
    getMessageClasses() {
        return _getMessageClasses(this.classPrefix);
    }
}
