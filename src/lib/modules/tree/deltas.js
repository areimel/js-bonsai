/**
 * Branch delta calculation — determines (dx, dy) growth direction for each step.
 * Based on cbonsai's setDeltas function; probability distributions are preserved
 * byte-for-byte to guarantee seed-deterministic output.
 * CRITICAL: getRandom() call count and order must match the original exactly.
 */

import { roll } from '../../utils/random.js';

/**
 * Set delta values for branch growth direction.
 * Based on cbonsai's setDeltas function.
 * CRITICAL: Math.random() replaced with getRandom()/roll() — never use Math.random().
 *
 * @param {object} branchTypes - The branchTypes enum (from config.branchTypes)
 * @param {number} branchType  - Type of branch (TRUNK, SHOOT_LEFT, SHOOT_RIGHT, DYING, DEAD)
 * @param {number} life        - Remaining life of this branch
 * @param {number} age         - Current age of this branch (options.life - life)
 * @param {number} multiplier  - Branch multiplier value (options.multiplier)
 * @returns {{ dx: number, dy: number }} Direction delta for this growth step
 */
export function setDeltas(branchTypes, branchType, life, age, multiplier) {
    let dx = 0;
    let dy = 0;

    // Using the exact same probability distributions as cbonsai
    switch (branchType) {
        case branchTypes.TRUNK:
            // New or dead trunk
            if (age <= 2 || life < 4) {
                dy = 0;
                dx = roll(3) - 1; // -1, 0, or 1
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

                dx = roll(3) - 1; // -1, 0, or 1
            }
            break;

        case branchTypes.SHOOT_LEFT:
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

        case branchTypes.SHOOT_RIGHT:
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

        case branchTypes.DYING:
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

        case branchTypes.DEAD:
            // Fill in surrounding area
            {
                const dice = roll(10);
                if (dice <= 2) dy = -1;
                else if (dice >= 3 && dice <= 6) dy = 0;
                else dy = 1;
            }

            dx = roll(3) - 1; // -1, 0, or 1
            break;
    }

    return { dx, dy };
}
