/**
 * Tree Generator - core tree growth algorithms.
 * Orchestrates recursive branch growth, base drawing, leaf placement, and
 * message rendering. Delegates to focused submodules for random-call-heavy
 * operations so each concern lives in one place.
 *
 * Based on cbonsai (https://gitlab.com/jallbrit/cbonsai).
 * CRITICAL: Never use Math.random() — always use getRandom() or the roll/pickRandom
 * helpers from utils/random.js to preserve seed-deterministic output.
 */

import { getRandom, roll } from '../utils/random.js';
import { isInBounds } from '../utils/grid.js';
import { setDeltas } from './tree/deltas.js';
import { chooseString } from './tree/branch-chars.js';
import { addLeaf } from './tree/leaves.js';

export class TreeGenerator {
    constructor(state, config, cssManager) {
        this.state = state;
        this.config = config;
        this.cssManager = cssManager;
    }

    /**
     * Draw the base of the tree (pot/stand art from config.bases).
     * The base is centered on x and drawn upward from y.
     * No random calls — purely deterministic layout.
     * @param {number} x - Horizontal center column for the base
     * @param {number} y - Bottom row for the base
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

            // Per-row bounds check (separate from per-column check below)
            if (row >= 0 && row < this.state.tree.length) {
                for (let j = 0; j < baseRow.length; j++) {
                    const col = baseStartX + j;

                    // Per-column bounds check
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
     * Recursively grow a branch from (x, y) in direction (xDir, yDir).
     * Mirrors cbonsai's growBranch loop, including shoot spawning, foliage
     * branching, and per-step character selection.
     * CRITICAL: getRandom() call order must stay identical to the original.
     *
     * @param {number} x          - X coordinate (column)
     * @param {number} y          - Y coordinate (row)
     * @param {number} xDir       - Initial X direction (-1, 0, 1)
     * @param {number} yDir       - Initial Y direction (-1, 0, 1)
     * @param {number} branchType - Type of branch (from config.branchTypes enum)
     * @param {number} life       - Life remaining for this branch
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
            const { dx, dy } = setDeltas(this.config.branchTypes, branchType, life, age, this.state.options.multiplier);

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
                    const leafDx = dx + (roll(3) - 1);
                    const leafDy = adjustedDy + (roll(3) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DEAD, life);
                }
            }

            // Dying trunk should branch into leaves
            else if (branchType === this.config.branchTypes.TRUNK && life < (this.state.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (roll(3) - 1);
                    const leafDy = adjustedDy + (roll(2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DYING, life);
                }
            }

            // Dying shoots should branch into leaves
            else if ((branchType === this.config.branchTypes.SHOOT_LEFT || branchType === this.config.branchTypes.SHOOT_RIGHT)
                     && life < (this.state.options.multiplier + 2)) {
                // Create multiple leaf branches to make foliage denser
                for (let i = 0; i < 2; i++) {
                    // Randomize direction slightly for each leaf branch
                    const leafDx = dx + (roll(3) - 1);
                    const leafDy = adjustedDy + (roll(2) - 1);
                    this.growBranch(x, y, leafDx, leafDy, this.config.branchTypes.DYING, life);
                }
            }

            // Trunk should re-branch randomly or at regular intervals
            else if (branchType === this.config.branchTypes.TRUNK &&
                     ((roll(3) === 0) || (life % this.state.options.multiplier === 0))) {

                // If trunk is branching and not about to die, create another trunk with random life
                if ((roll(8) === 0) && life > 7) {
                    shootCooldown = this.state.options.multiplier * 2; // Reset shoot cooldown
                    const lifeDelta = roll(5) - 2; // -2 to 2
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
            const branchStr = chooseString(this.config, this.state.options.leaves, branchType, life, dx, adjustedDy);

            // Set the character on the display if within bounds
            if (isInBounds(this.state.tree, x, y)) {
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

            // Add leaves — higher probability for non-trunk branches
            if (branchType !== this.config.branchTypes.TRUNK && getRandom() < 0.40) {
                // Higher probability for non-trunk branches (was 0.25)
                addLeaf(this.state, this.cssManager, x, y);
            } else if (branchType === this.config.branchTypes.TRUNK && getRandom() < 0.15) {
                // Add some leaves to trunk branches too
                addLeaf(this.state, this.cssManager, x, y);
            }
        }
    }

    /**
     * Add the message string to the display grid.
     * Writes each character at a fixed center-ish position — no random calls.
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
}
