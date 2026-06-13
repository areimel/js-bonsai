/**
 * Leaf placement — adds leaf characters to the tree grid near branch tips.
 * Ported from the original addLeaf method in TreeGenerator.
 * CRITICAL: getRandom() call count and order must match the original exactly.
 * Never use Math.random() — always use the seeded getRandom()/roll()/pickRandom().
 */

import { getRandom, getLeafVariant, pickRandom, roll } from '../../utils/random.js';
import { isInBounds, isCellEmpty } from '../../utils/grid.js';

/**
 * Attempt to place a single leaf at (x, y) in the tree grid.
 * Performs bounds and occupancy checks before consuming any random values.
 * If both checks pass, rolls for char and variant — exactly one getRandom() each.
 *
 * DETERMINISM NOTE: char and variant rolls happen ONLY when the cell is in bounds
 * AND empty, matching the original nested-if structure precisely.
 *
 * @param {object} state      - Shared state object (state.tree, state.options.leaves)
 * @param {object} cssManager - CSS manager for leaf class generation
 * @param {number} x          - Column index
 * @param {number} y          - Row index
 * @returns {boolean} true if a leaf was written; false if out of bounds or occupied
 */
function placeLeafAt(state, cssManager, x, y) {
    // 1. Bounds check — no random calls consumed if out of bounds
    if (!isInBounds(state.tree, x, y)) {
        return false;
    }

    // 2. Occupancy check — no random calls consumed if cell is taken
    if (!isCellEmpty(state.tree, x, y)) {
        return false;
    }

    // 3. Select a random leaf character — exactly one getRandom() call
    const char = pickRandom(state.options.leaves);

    // 4. Select a random color variant — exactly one getRandom() call (inside getLeafVariant)
    const variant = getLeafVariant();

    // 5. Write the leaf cell
    state.tree[y][x] = {
        char,
        type: 'leaf',
        cssClass: cssManager.getLeafClasses(variant)
    };

    return true;
}

/**
 * Add leaves near a branch position, trying up to 6 candidate placements.
 * When a primary leaf is placed successfully, attempts secondary and tertiary
 * cluster leaves at nearby positions.
 * Based on cbonsai's leaf-placement logic.
 * CRITICAL: Math.random() replaced with getRandom()/roll()/pickRandom().
 *
 * DETERMINISM-CRITICAL call sequence (must be byte-identical to original):
 *   Each attempt:
 *     - One getRandom() for the 0.6 branch-above gate.
 *     - 0.6 path:  ONE roll(3) for offsetX (offsetY fixed to -1).
 *     - else path: ONE roll(3) for offsetX, ONE roll(3) for offsetY; continue if both 0.
 *     - Primary placeLeafAt: consumes rolls only if in-bounds AND empty (char+variant).
 *     - If primary succeeded:
 *         - One getRandom() for 0.5 secondary gate; if taken: TWO roll(3) for offsets,
 *           then secondary placeLeafAt (char+variant only if in-bounds AND empty).
 *         - One getRandom() for 0.3 tertiary gate; if taken: TWO roll(3) for offsets,
 *           then tertiary placeLeafAt (char+variant only if in-bounds AND empty).
 *         - break out of the attempts loop.
 *   If primary failed (out of bounds or occupied): loop continues — the 0.5/0.3
 *   gates and all their downstream rolls are NOT consumed (they live inside the
 *   primary-success block, exactly as in the original).
 *
 * @param {object} state      - Shared state object
 * @param {object} cssManager - CSS manager for leaf class generation
 * @param {number} x          - Branch column index
 * @param {number} y          - Branch row index
 */
export function addLeaf(state, cssManager, x, y) {
    // Try placing leaves in multiple positions around the branch
    // to create a more natural look — up to 6 attempts
    for (let attempts = 0; attempts < 6; attempts++) {
        // Random offset for the leaf, with bias toward upper positions
        // (negative y values in our coordinate system)
        let offsetX, offsetY;

        // 60% chance for the leaf to be above the branch
        if (getRandom() < 0.6) {
            offsetY = -1;
            offsetX = roll(3) - 1; // -1, 0, or 1
        } else {
            // Otherwise random placement around branch
            offsetX = roll(3) - 1; // -1, 0, or 1
            offsetY = roll(3) - 1; // -1, 0, or 1

            // Avoid placing leaves directly on the branch
            if (offsetX === 0 && offsetY === 0) {
                continue;
            }
        }

        const leafX = x + offsetX;
        const leafY = y + offsetY;

        // Attempt primary placement — char+variant rolls consumed only if cell is usable
        if (placeLeafAt(state, cssManager, leafX, leafY)) {
            // Primary leaf placed successfully — try to grow a cluster

            // Sometimes add additional leaves nearby to create clusters (probability 0.5)
            if (getRandom() < 0.5) {
                // Try to place a secondary leaf
                // ALWAYS consume both offset rolls even if secondary placement fails
                const secondaryOffsetX = roll(3) - 1;
                const secondaryOffsetY = roll(3) - 1;
                placeLeafAt(state, cssManager, leafX + secondaryOffsetX, leafY + secondaryOffsetY);
            }

            // Add tertiary leaves occasionally to create fuller clusters (probability 0.3)
            if (getRandom() < 0.3) {
                // ALWAYS consume both offset rolls even if tertiary placement fails
                const tertiaryOffsetX = roll(3) - 1;
                const tertiaryOffsetY = roll(3) - 1;
                placeLeafAt(state, cssManager, leafX + tertiaryOffsetX, leafY + tertiaryOffsetY);
            }

            // Successfully placed a leaf — exit the attempts loop
            break;
        }
        // If primary placement failed (out of bounds or occupied), loop continues
        // WITHOUT consuming the 0.5/0.3 gate rolls — exactly as in the original.
    }
}
