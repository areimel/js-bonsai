/**
 * Grid utility helpers — pure functions with no random calls.
 * Used by tree-growth modules to perform bounds and occupancy checks
 * on the 2D character grid (state.tree).
 */

/**
 * Check whether a coordinate pair falls within the bounds of the tree grid.
 * @param {Array<Array>} tree - The 2D display buffer (state.tree)
 * @param {number} x - Column index
 * @param {number} y - Row index
 * @returns {boolean} true if (x, y) is a valid cell inside the grid
 */
export function isInBounds(tree, x, y) {
    return y >= 0 && y < tree.length && x >= 0 && x < tree[0].length;
}

/**
 * Check whether a cell is empty (contains a space character or a space-object).
 * A cell is considered empty if it holds the literal ' ' string OR is an object
 * whose .char property is ' '.  Any other value (branch/leaf object, non-space
 * string) is treated as occupied.
 * @param {Array<Array>} tree - The 2D display buffer (state.tree)
 * @param {number} x - Column index
 * @param {number} y - Row index
 * @returns {boolean} true if the cell is empty and available for placement
 */
export function isCellEmpty(tree, x, y) {
    const cell = tree[y][x];
    return cell === ' ' || (typeof cell === 'object' && cell.char === ' ');
}
