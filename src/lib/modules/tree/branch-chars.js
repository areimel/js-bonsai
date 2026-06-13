/**
 * Branch character selection — maps branch type and direction to the ASCII
 * character string that visually represents each growth step.
 * Based on cbonsai's chooseString function.
 * CRITICAL: getRandom() call count and order must match the original exactly.
 */

import { pickRandom } from '../../utils/random.js';

/**
 * Choose the appropriate string to represent a branch segment.
 * Based on cbonsai's chooseString function.
 * CRITICAL: pickRandom() is used only for DYING/DEAD — exactly one getRandom()
 * call — matching the original Math.floor(getRandom() * leaves.length) pattern.
 *
 * @param {object} config      - Config object providing config.characters.branchStrings
 *                               and config.branchTypes
 * @param {Array<string>} leaves - The options.leaves array of leaf characters
 * @param {number} branchType  - Type of branch (from config.branchTypes enum)
 * @param {number} life        - Remaining life of the branch
 * @param {number} dx          - X direction delta
 * @param {number} dy          - Y direction delta
 * @returns {string} The character (or string) to place at this branch segment
 */
export function chooseString(config, leaves, branchType, life, dx, dy) {
    // Dying branches become leaves — override type so the switch below picks leaves
    if (life < 4) {
        branchType = config.branchTypes.DYING;
    }

    // Default fallback character (should never appear in practice)
    let branchStr = '?';

    switch (branchType) {
        case config.branchTypes.TRUNK:
            if (dy === 0) {
                branchStr = config.characters.branchStrings.trunk.straightHorizontal;
            } else if (dx < 0) {
                branchStr = config.characters.branchStrings.trunk.leftDiagonal;
            } else if (dx === 0) {
                branchStr = config.characters.branchStrings.trunk.vertical;
            } else if (dx > 0) {
                branchStr = config.characters.branchStrings.trunk.rightDiagonal;
            }
            break;

        case config.branchTypes.SHOOT_LEFT:
            if (dy > 0) {
                branchStr = config.characters.branchStrings.shootLeft.down;
            } else if (dy === 0) {
                branchStr = config.characters.branchStrings.shootLeft.horizontal;
            } else if (dx < 0) {
                branchStr = config.characters.branchStrings.shootLeft.leftDiagonal;
            } else if (dx === 0) {
                branchStr = config.characters.branchStrings.shootLeft.vertical;
            } else if (dx > 0) {
                branchStr = config.characters.branchStrings.shootLeft.rightDiagonal;
            }
            break;

        case config.branchTypes.SHOOT_RIGHT:
            if (dy > 0) {
                branchStr = config.characters.branchStrings.shootRight.down;
            } else if (dy === 0) {
                branchStr = config.characters.branchStrings.shootRight.horizontal;
            } else if (dx < 0) {
                branchStr = config.characters.branchStrings.shootRight.leftDiagonal;
            } else if (dx === 0) {
                branchStr = config.characters.branchStrings.shootRight.vertical;
            } else if (dx > 0) {
                branchStr = config.characters.branchStrings.shootRight.rightDiagonal;
            }
            break;

        case config.branchTypes.DYING:
        case config.branchTypes.DEAD:
            // Use a random leaf character for dying/dead branches — exactly one getRandom() call
            branchStr = pickRandom(leaves);
            break;
    }

    return branchStr;
}
