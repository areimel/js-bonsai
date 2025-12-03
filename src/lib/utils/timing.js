/**
 * Timing utilities for calculating animation durations
 * Used by autoplay mode to prevent overlapping tree generation
 */

/**
 * Count elements in the tree by type
 * @param {Array<Array>} tree - 2D array representing the tree display buffer
 * @returns {Object} Element counts by type
 */
export function countTreeElements(tree) {
    const counts = {
        base: 0,
        branch: 0,
        leaf: 0,
        message: 0,
        total: 0
    };

    if (!tree || tree.length === 0) {
        return counts;
    }

    for (let y = 0; y < tree.length; y++) {
        for (let x = 0; x < tree[y].length; x++) {
            const cell = tree[y][x];

            // Check if cell is an object with a type
            if (typeof cell === 'object' && cell.type) {
                counts[cell.type] = (counts[cell.type] || 0) + 1;
                counts.total++;
            }
        }
    }

    return counts;
}

/**
 * Calculate total render time based on tree contents and animation options
 * Mirrors the timing calculation in renderer.js animateTreeRendering()
 *
 * @param {Object} state - Shared state object containing tree and options
 * @returns {number} Total render time in milliseconds
 */
export function calculateRenderTime(state) {
    // If time is 0, rendering is instant
    if (state.options.time === 0) {
        return 0;
    }

    // If live mode is disabled, rendering is instant
    if (!state.options.live) {
        return 0;
    }

    // Count elements in the tree
    const counts = countTreeElements(state.tree);

    // If no elements, no animation time needed
    if (counts.total === 0) {
        return 0;
    }

    // Calculate time per element (convert seconds to milliseconds)
    const timePerElement = state.options.time * 1000;

    // Calculate total element rendering time
    const elementRenderTime = counts.total * timePerElement;

    // Add phase pauses (300ms after base phase, 300ms after branch phase)
    // See renderer.js line 159
    const phasePauses = 600; // 2 pauses × 300ms

    // Total render time
    const totalRenderTime = elementRenderTime + phasePauses;

    return totalRenderTime;
}
