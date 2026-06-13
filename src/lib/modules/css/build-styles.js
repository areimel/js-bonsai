/**
 * CSS string builders — pure functions with no DOM access.
 * Imported by CSSManager to eliminate duplicated template literals.
 */

/**
 * Build the full color/visibility ruleset for a given prefix and color set.
 *
 * This is the canonical ruleset used for both initial injection and palette
 * updates. Keeping a single source of truth prevents the two copies from
 * diverging again (the original bug: injectCSS had z-index layering while
 * updateColors lacked it but added display/white-space declarations).
 *
 * z-index layering rationale:
 *   base(1) < trunk/branch(2) < leaf(3) — characters rendered later in the
 *   growth sequence visually sit on top of earlier ones when cells overlap.
 *
 * @param {string} prefix - CSS class prefix (e.g. 'js-bonsai-')
 * @param {object} colors - Color map: { base, trunk, branch, leaf, leafLight,
 *                          leafDark, dirt, grass, message }
 * @returns {string} Complete CSS ruleset string ready to inject into a
 *                   <style> element.
 */
export function buildColorCSS(prefix, colors) {
    return `
            .${prefix}element {
                /* Grid positioning applied via inline styles */
            }
            .${prefix}base {
                color: ${colors.base};
                z-index: 1;
            }
            .${prefix}trunk {
                color: ${colors.trunk};
                z-index: 2;
            }
            .${prefix}branch {
                color: ${colors.branch};
                z-index: 2;
            }
            .${prefix}leaf {
                color: ${colors.leaf};
                z-index: 3;
            }
            .${prefix}leaf-light {
                color: ${colors.leafLight};
                z-index: 3;
            }
            .${prefix}leaf-dark {
                color: ${colors.leafDark};
                z-index: 3;
            }
            .${prefix}dirt {
                color: ${colors.dirt};
            }
            .${prefix}grass {
                color: ${colors.grass};
            }
            .${prefix}message {
                color: ${colors.message};
            }
            .${prefix}hidden {
                opacity: 0;
            }
            .${prefix}visible {
                opacity: 1;
                /* Snap in within ~one frame so each character pops on individually.
                   Must stay <= the per-character reveal interval (options.time)
                   or successive characters fade together as a band. */
                transition: opacity 0.016s linear;
            }
        `;
}

/**
 * Build the CSS Grid layout ruleset for a tree container.
 *
 * Uses 1ch columns (character width) and 1lh rows (line height) so the grid
 * cells align precisely with the monospace font used for the ASCII art.
 *
 * @param {string} containerId - The DOM id of the container element.
 * @param {number} rows - Number of grid rows.
 * @param {number} cols - Number of grid columns.
 * @returns {string} CSS ruleset string for the container grid.
 */
export function buildGridCSS(containerId, rows, cols) {
    return `
            #${containerId} {
                display: grid;
                grid-template-columns: repeat(${cols}, 1ch);
                grid-template-rows: repeat(${rows}, 1lh);
                position: relative;
            }
        `;
}
