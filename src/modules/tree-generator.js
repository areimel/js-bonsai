/**
 * Tree Generator - core tree growth algorithms
 * Extracted from bonsai.js lines 531-1061
 * CRITICAL: All Math.random() replaced with getRandom()
 */

import { getRandom, getLeafVariant } from '../utils/random.js';

export class TreeGenerator {
    constructor(state, config, cssManager) {
        this.state = state;
        this.config = config;
        this.cssManager = cssManager;
    }

    /**
     * Draw the base of the tree
     * Extracted from bonsai.js lines 531-560
     */
    drawBase(x, y) {
        const base = this.config.bases[this.state.options.base];
        if (!base || base.length === 0) return;

        // Calculate the starting position to center the base
        const baseWidth = base[0].length;
        const baseStartX = Math.max(0, x - Math.floor(baseWidth / 2));

        // Draw each line of the base
        for (let i = 0; i < base.length; i++) {
            const baseRow = base[i];
            const row = y - base.length + i + 1;

            if (row >= 0 && row < this.state.tree.length) {
                for (let j = 0; j < baseRow.length; j++) {
                    const col = baseStartX + j;

                    if (col >= 0 && col < this.state.tree[0].length) {
                        const char = baseRow[j];

                        this.state.tree[row][col] = {
                            char: char,
                            type: 'base',
                            cssClass: this.cssManager.getBaseClasses(char)
                        };
                    }
                }
            }
        }
    }

    /**
     * Recursively grow a branch
     * Extracted from bonsai.js lines 571-696
     * CRITICAL: Math.random() replaced with getRandom()
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} xDir - X direction (-1, 0, 1)
     * @param {number} yDir - Y direction (-1, 0, 1)
     * @param {number} branchType - Type of branch (from branchTypes enum)
     * @param {number} life - Life remaining for this branch
     */
    growBranch(x, y, xDir, yDir, branchType, life) {
        // Track branches for statistics
        this.state.counters.branches++;

        // Initialize the shoot cooldown
        let shootCooldown = this.state.options.multiplier;
        let age = 0;

        // Use a while loop like in cbonsai to keep growing the branch
        while (life > 0) {
            // Decrement life
            life--;

            // Calculate age of the branch
            age = this.state.options.life - life;

            // Get delta values based on branch type and age
            const { dx, dy } = this.setDeltas(branchType, life, age, this.state.options.multiplier);

            // Prevent going too low (close to the ground)
            let adjustedDy = dy;
            if (dy > 0 && y > (this.state.tree.length - 2)) {
                adjustedDy = 0; // Reduce dy if too close to the ground
            }

            // Near-dead branches should branch into leaves
            if (life < 3) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 3; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(getRandom() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(getRandom() * 3) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DEAD, life);
                }
            }

            // Dying trunk should branch into leaves
            else if (branchType === this.config.branchTypes.TRUNK && life < (this.state.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(getRandom() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(getRandom() * 2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DYING, life);
                }
            }

            // Dying shoots should branch into leaves
            else if ((branchType === this.config.branchTypes.SHOOT_LEFT || branchType === this.config.branchTypes.SHOOT_RIGHT)
                     && life < (this.state.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (Math.floor(getRandom() * 3) - 1);
                    const leafDy = adjustedDy + (Math.floor(getRandom() * 2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DYING, life);
                }
            }

            // Trunk should re-branch randomly or at regular intervals
            else if (branchType === this.config.branchTypes.TRUNK &&
                     ((Math.floor(getRandom() * 3) === 0) || (life % this.state.options.multiplier === 0))) {

                // If trunk is branching and not about to die, create another trunk with random life
                if ((Math.floor(getRandom() * 8) === 0) && life > 7) {
                    shootCooldown = this.state.options.multiplier * 2; // Reset shoot cooldown
                    const lifeDelta = Math.floor(getRandom() * 5) - 2; // -2 to 2
                    this.growBranch(x, y, dx, adjustedDy, this.config.branchTypes.TRUNK, life + lifeDelta);
                }

                // Otherwise create a shoot if cooldown allows
                else if (shootCooldown <= 0) {
                    shootCooldown = this.state.options.multiplier * 2; // Reset shoot cooldown

                    const shootLife = life + this.state.options.multiplier;

                    // Increment shoot counters
                    this.state.counters.shoots++;
                    this.state.counters.shootCounter++;

                    // Determine shoot direction (left or right alternating)
                    const shootType = (this.state.counters.shootCounter % 2 === 0) ?
                                       this.config.branchTypes.SHOOT_LEFT :
                                       this.config.branchTypes.SHOOT_RIGHT;

                    // Get initial shoot direction
                    const shootDx = (shootType === this.config.branchTypes.SHOOT_LEFT) ? -1 : 1;

                    // Call branch with the shoot starting at an offset position
                    this.growBranch(x + shootDx, y - 1, shootDx, -1, shootType, shootLife);
                }
            }

            // Decrement shoot cooldown
            shootCooldown--;

            // Move in x and y directions
            x += dx;
            y += adjustedDy;

            // Choose the branch character string based on type and direction
            const branchStr = this.chooseString(branchType, life, dx, adjustedDy);

            // Set the character on the display if within bounds
            if (y >= 0 && y < this.state.tree.length && x >= 0 && x < this.state.tree[0].length) {
                this.state.tree[y][x] = {
                    char: branchStr,
                    type: branchType === this.config.branchTypes.DYING || branchType === this.config.branchTypes.DEAD ? 'leaf' : 'branch',
                    branchType: branchType,
                    direction: { dx, dy: adjustedDy },
                    cssClass: branchType === this.config.branchTypes.DYING || branchType === this.config.branchTypes.DEAD ?
                        this.cssManager.getLeafClasses() :
                        this.cssManager.getBranchClasses(branchType, dx, adjustedDy)
                };
            }

            // Add leaves - increased probability and add to all branch types
            if (branchType !== this.config.branchTypes.TRUNK && getRandom() < 0.40) {
                // Higher probability for non-trunk branches (was 0.25)
                this.addLeaf(x, y);
            } else if (branchType === this.config.branchTypes.TRUNK && getRandom() < 0.15) {
                // Add some leaves to trunk branches too
                this.addLeaf(x, y);
            }
        }
    }

    /**
     * Add leaves near a branch
     * Extracted from bonsai.js lines 703-805
     * CRITICAL: Math.random() replaced with getRandom()
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    addLeaf(x, y) {
        // Try placing leaves in multiple positions around the branch
        // to create a more natural look - increased from 4 to 6 attempts
        for (let attempts = 0; attempts < 6; attempts++) {
            // Random offset for the leaf, with bias toward upper positions
            // (negative y values in our coordinate system)
            let offsetX, offsetY;

            // 60% chance for the leaf to be above the branch
            if (getRandom() < 0.6) {
                offsetY = -1;
                offsetX = Math.floor(getRandom() * 3) - 1; // -1, 0, or 1
            } else {
                // Otherwise random placement around branch
                offsetX = Math.floor(getRandom() * 3) - 1; // -1, 0, or 1
                offsetY = Math.floor(getRandom() * 3) - 1; // -1, 0, or 1

                // Avoid placing leaves directly on the branch
                if (offsetX === 0 && offsetY === 0) {
                    continue;
                }
            }

            const leafX = x + offsetX;
            const leafY = y + offsetY;

            // Ensure we're within bounds
            if (leafY >= 0 && leafY < this.state.tree.length &&
                leafX >= 0 && leafX < this.state.tree[0].length) {

                // Don't overwrite existing characters
                if (this.state.tree[leafY][leafX] === ' ' ||
                    (typeof this.state.tree[leafY][leafX] === 'object' && this.state.tree[leafY][leafX].char === ' ')) {

                    // Select a random leaf character
                    const leafChar = this.state.options.leaves[Math.floor(getRandom() * this.state.options.leaves.length)];
                    const leafVariant = getLeafVariant();

                    this.state.tree[leafY][leafX] = {
                        char: leafChar,
                        type: 'leaf',
                        cssClass: this.cssManager.getLeafClasses(leafVariant)
                    };

                    // Sometimes add additional leaves nearby to create clusters
                    // Increased probability from 0.3 to 0.5
                    if (getRandom() < 0.5) {
                        // Try to place a secondary leaf
                        const secondaryOffsetX = Math.floor(getRandom() * 3) - 1;
                        const secondaryOffsetY = Math.floor(getRandom() * 3) - 1;

                        const secondaryLeafX = leafX + secondaryOffsetX;
                        const secondaryLeafY = leafY + secondaryOffsetY;

                        if (secondaryLeafX >= 0 && secondaryLeafX < this.state.tree[0].length &&
                            secondaryLeafY >= 0 && secondaryLeafY < this.state.tree.length) {

                            if (this.state.tree[secondaryLeafY][secondaryLeafX] === ' ' ||
                                (typeof this.state.tree[secondaryLeafY][secondaryLeafX] === 'object' &&
                                 this.state.tree[secondaryLeafY][secondaryLeafX].char === ' ')) {

                                const secondaryLeafChar = this.state.options.leaves[Math.floor(getRandom() * this.state.options.leaves.length)];
                                const secondaryLeafVariant = getLeafVariant();

                                this.state.tree[secondaryLeafY][secondaryLeafX] = {
                                    char: secondaryLeafChar,
                                    type: 'leaf',
                                    cssClass: this.cssManager.getLeafClasses(secondaryLeafVariant)
                                };
                            }
                        }
                    }

                    // Add tertiary leaves occasionally to create fuller clusters
                    if (getRandom() < 0.3) {
                        const tertiaryOffsetX = Math.floor(getRandom() * 3) - 1;
                        const tertiaryOffsetY = Math.floor(getRandom() * 3) - 1;

                        const tertiaryLeafX = leafX + tertiaryOffsetX;
                        const tertiaryLeafY = leafY + tertiaryOffsetY;

                        if (tertiaryLeafX >= 0 && tertiaryLeafX < this.state.tree[0].length &&
                            tertiaryLeafY >= 0 && tertiaryLeafY < this.state.tree.length) {

                            if (this.state.tree[tertiaryLeafY][tertiaryLeafX] === ' ' ||
                                (typeof this.state.tree[tertiaryLeafY][tertiaryLeafX] === 'object' &&
                                 this.state.tree[tertiaryLeafY][tertiaryLeafX].char === ' ')) {

                                const tertiaryLeafChar = this.state.options.leaves[Math.floor(getRandom() * this.state.options.leaves.length)];
                                const tertiaryLeafVariant = getLeafVariant();

                                this.state.tree[tertiaryLeafY][tertiaryLeafX] = {
                                    char: tertiaryLeafChar,
                                    type: 'leaf',
                                    cssClass: this.cssManager.getLeafClasses(tertiaryLeafVariant)
                                };
                            }
                        }
                    }

                    // Successfully placed a leaf, we can exit the loop
                    break;
                }
            }
        }
    }

    /**
     * Add the message to the display
     * Extracted from bonsai.js lines 810-827
     */
    addMessage() {
        if (!this.state.options.message) return;

        // Find a good location for the message
        const y = Math.floor(this.state.tree.length / 2);
        const x = Math.floor(this.state.tree[0].length / 3);

        // Add each character of the message
        for (let i = 0; i < this.state.options.message.length; i++) {
            if (x + i < this.state.tree[0].length) {
                this.state.tree[y][x + i] = {
                    char: this.state.options.message[i],
                    type: 'message',
                    cssClass: this.cssManager.getMessageClasses()
                };
            }
        }
    }

    /**
     * Choose the appropriate string to represent a branch segment
     * Based on cbonsai's chooseString function
     * Extracted from bonsai.js lines 869-928
     * CRITICAL: Math.random() replaced with getRandom()
     *
     * @param {number} branchType - Type of branch from branchTypes enum
     * @param {number} life - Remaining life of branch
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     * @returns {string} - The string to use for this branch segment
     */
    chooseString(branchType, life, dx, dy) {
        // Dying branches become leaves
        if (life < 4) {
            branchType = this.config.branchTypes.DYING;
        }

        // Default fallback character
        let branchStr = "?";

        switch(branchType) {
            case this.config.branchTypes.TRUNK:
                if (dy === 0) {
                    branchStr = this.config.characters.branchStrings.trunk.straightHorizontal;
                } else if (dx < 0) {
                    branchStr = this.config.characters.branchStrings.trunk.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.config.characters.branchStrings.trunk.vertical;
                } else if (dx > 0) {
                    branchStr = this.config.characters.branchStrings.trunk.rightDiagonal;
                }
                break;

            case this.config.branchTypes.SHOOT_LEFT:
                if (dy > 0) {
                    branchStr = this.config.characters.branchStrings.shootLeft.down;
                } else if (dy === 0) {
                    branchStr = this.config.characters.branchStrings.shootLeft.horizontal;
                } else if (dx < 0) {
                    branchStr = this.config.characters.branchStrings.shootLeft.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.config.characters.branchStrings.shootLeft.vertical;
                } else if (dx > 0) {
                    branchStr = this.config.characters.branchStrings.shootLeft.rightDiagonal;
                }
                break;

            case this.config.branchTypes.SHOOT_RIGHT:
                if (dy > 0) {
                    branchStr = this.config.characters.branchStrings.shootRight.down;
                } else if (dy === 0) {
                    branchStr = this.config.characters.branchStrings.shootRight.horizontal;
                } else if (dx < 0) {
                    branchStr = this.config.characters.branchStrings.shootRight.leftDiagonal;
                } else if (dx === 0) {
                    branchStr = this.config.characters.branchStrings.shootRight.vertical;
                } else if (dx > 0) {
                    branchStr = this.config.characters.branchStrings.shootRight.rightDiagonal;
                }
                break;

            case this.config.branchTypes.DYING:
            case this.config.branchTypes.DEAD:
                // Use a random leaf character for dying/dead branches
                const leafIndex = Math.floor(getRandom() * this.state.options.leaves.length);
                branchStr = this.state.options.leaves[leafIndex];
                break;
        }

        return branchStr;
    }

    /**
     * Set delta values for branch growth direction
     * Based on cbonsai's setDeltas function
     * Extracted from bonsai.js lines 940-1061
     * CRITICAL: Math.random() replaced with getRandom()
     *
     * @param {number} branchType - Type of branch from branchTypes enum
     * @param {number} life - Remaining life of branch
     * @param {number} age - Current age of branch
     * @param {number} multiplier - Branch multiplier value
     * @returns {Object} - Contains dx and dy direction values
     */
    setDeltas(branchType, life, age, multiplier) {
        let dx = 0;
        let dy = 0;

        // Helper function to simulate cbonsai's roll function precisely
        const roll = (mod) => {
            return Math.floor(getRandom() * mod);
        };

        // Using the exact same probability distributions as cbonsai
        switch(branchType) {
            case this.config.branchTypes.TRUNK:
                // New or dead trunk
                if (age <= 2 || life < 4) {
                    dy = 0;
                    dx = (Math.floor(getRandom() * 3)) - 1; // -1, 0, or 1
                }
                // Young trunk should grow wide
                else if (age < (multiplier * 3)) {
                    // Every (multiplier * 0.5) steps, raise tree to next level
                    if (age % Math.floor(multiplier * 0.5) === 0) {
                        dy = -1;
                    } else {
                        dy = 0;
                    }

                    // Using exact dice ranges as in cbonsai
                    const dice = roll(10);
                    if (dice === 0) dx = -2;
                    else if (dice >= 1 && dice <= 3) dx = -1;
                    else if (dice >= 4 && dice <= 5) dx = 0;
                    else if (dice >= 6 && dice <= 8) dx = 1;
                    else if (dice === 9) dx = 2;
                }
                // Middle-aged trunk
                else {
                    const dice = roll(10);
                    if (dice > 2) {
                        dy = -1; // Mostly grow upward
                    } else {
                        dy = 0;
                    }

                    dx = (Math.floor(getRandom() * 3)) - 1; // -1, 0, or 1
                }
                break;

            case this.config.branchTypes.SHOOT_LEFT:
                // Vertical movement - using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1; // Some upward growth
                    else if (dice >= 2 && dice <= 7) dy = 0; // Mostly horizontal
                    else dy = 1; // Occasional downward growth
                }

                // Horizontal movement - trend left, using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dx = -2; // Strong left
                    else if (dice >= 2 && dice <= 5) dx = -1; // Moderate left
                    else if (dice >= 6 && dice <= 8) dx = 0; // No horizontal movement
                    else dx = 1; // Occasional right movement
                }
                break;

            case this.config.branchTypes.SHOOT_RIGHT:
                // Vertical movement - same as left shoot
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1;
                    else if (dice >= 2 && dice <= 7) dy = 0;
                    else dy = 1;
                }

                // Horizontal movement - trend right, using exact dice ranges
                {
                    const dice = roll(10);
                    if (dice <= 1) dx = 2; // Strong right
                    else if (dice >= 2 && dice <= 5) dx = 1; // Moderate right
                    else if (dice >= 6 && dice <= 8) dx = 0; // No horizontal movement
                    else dx = -1; // Occasional left movement
                }
                break;

            case this.config.branchTypes.DYING:
                // Vertical movement - mostly horizontal
                {
                    const dice = roll(10);
                    if (dice <= 1) dy = -1;
                    else if (dice >= 2 && dice <= 8) dy = 0;
                    else dy = 1;
                }

                // Horizontal movement - wider range, using exact dice ranges
                {
                    const dice = roll(15);
                    if (dice === 0) dx = -3;
                    else if (dice >= 1 && dice <= 2) dx = -2;
                    else if (dice >= 3 && dice <= 5) dx = -1;
                    else if (dice >= 6 && dice <= 8) dx = 0;
                    else if (dice >= 9 && dice <= 11) dx = 1;
                    else if (dice >= 12 && dice <= 13) dx = 2;
                    else if (dice === 14) dx = 3;
                }
                break;

            case this.config.branchTypes.DEAD:
                // Fill in surrounding area
                {
                    const dice = roll(10);
                    if (dice <= 2) dy = -1;
                    else if (dice >= 3 && dice <= 6) dy = 0;
                    else dy = 1;
                }

                dx = (Math.floor(getRandom() * 3)) - 1; // -1, 0, or 1
                break;
        }

        return { dx, dy };
    }
}
