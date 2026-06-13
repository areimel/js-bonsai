/**
 * Cell class builders — stateless free functions that compute CSS class
 * strings for individual tree/base/leaf/message cells.
 *
 * Extracted from CSSManager so the logic can be unit-tested without
 * constructing the full manager.  CSSManager delegates to these functions,
 * keeping its public method signatures unchanged.
 */

/**
 * Get CSS classes for a branch/trunk cell.
 *
 * Returns a space-separated class string that encodes both the semantic type
 * of the branch (trunk, shoot, leaf) and its travel direction (horizontal,
 * vertical, diagonal).  The renderer uses these classes to apply colour and
 * to query cells by type during the reveal animation.
 *
 * @param {string} prefix      - CSS class prefix (e.g. 'js-bonsai-')
 * @param {object} branchTypes - Enum object with TRUNK, SHOOT_LEFT,
 *                               SHOOT_RIGHT, DYING, DEAD keys.
 * @param {number} branchType  - The branch type value for this cell.
 * @param {number} dx          - Horizontal direction (-1, 0, or 1).
 * @param {number} dy          - Vertical direction (-1, 0, or 1).
 * @returns {string} Space-separated CSS class string.
 */
export function getBranchClasses(prefix, branchTypes, branchType, dx, dy) {
    let classes = [`${prefix}element`];

    // Base branch type class
    if (branchType === branchTypes.TRUNK) {
        classes.push(`${prefix}trunk`);
    } else if (branchType === branchTypes.SHOOT_LEFT || branchType === branchTypes.SHOOT_RIGHT) {
        classes.push(`${prefix}branch`);
    } else if (branchType === branchTypes.DYING || branchType === branchTypes.DEAD) {
        classes.push(`${prefix}leaf`);
        return classes.join(' '); // Return early for leaves
    }

    // Add branch subtype
    if (branchType === branchTypes.TRUNK) {
        classes.push(`${prefix}trunk-main`);
    } else if (branchType === branchTypes.SHOOT_LEFT) {
        classes.push(`${prefix}shoot-left`);
    } else if (branchType === branchTypes.SHOOT_RIGHT) {
        classes.push(`${prefix}shoot-right`);
    }

    // Add direction class
    if (dy === 0) {
        classes.push(`${prefix}horizontal`);
    } else if (dx < 0 && dy < 0) {
        classes.push(`${prefix}left-diagonal`);
    } else if (dx === 0 && dy < 0) {
        classes.push(`${prefix}vertical`);
    } else if (dx > 0 && dy < 0) {
        classes.push(`${prefix}right-diagonal`);
    } else if (dy > 0) {
        classes.push(`${prefix}down`);
    }

    return classes.join(' ');
}

/**
 * Get CSS classes for a base/pot cell.
 *
 * Grass characters ('.' and '~') receive the grass colour; everything else
 * (pot walls, rim, etc.) receives the base/pot colour.
 *
 * @param {string} prefix - CSS class prefix (e.g. 'js-bonsai-')
 * @param {string} char   - The ASCII character for this cell.
 * @returns {string} Space-separated CSS class string.
 */
export function getBaseClasses(prefix, char) {
    let classes = [`${prefix}element`];

    if (char === '.' || char === '~') {
        classes.push(`${prefix}grass`);
    } else {
        classes.push(`${prefix}base`);
    }

    return classes.join(' ');
}

/**
 * Get CSS classes for a leaf cell.
 *
 * Supports three colour variants so the canopy has visible tonal variation.
 *
 * @param {string} prefix              - CSS class prefix (e.g. 'js-bonsai-')
 * @param {'base'|'light'|'dark'} variant - Leaf colour variant.
 * @returns {string} Space-separated CSS class string.
 */
export function getLeafClasses(prefix, variant = 'base') {
    let leafClass;

    switch (variant) {
        case 'light':
            leafClass = `${prefix}leaf-light`;
            break;
        case 'dark':
            leafClass = `${prefix}leaf-dark`;
            break;
        case 'base':
        default:
            leafClass = `${prefix}leaf`;
            break;
    }

    return `${prefix}element ${leafClass}`;
}

/**
 * Get CSS classes for a message cell (the optional user message rendered
 * beneath the tree).
 *
 * @param {string} prefix - CSS class prefix (e.g. 'js-bonsai-')
 * @returns {string} Space-separated CSS class string.
 */
export function getMessageClasses(prefix) {
    return `${prefix}element ${prefix}message`;
}
