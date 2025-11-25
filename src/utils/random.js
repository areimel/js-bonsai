/**
 * Seeded random number generation utilities
 * Extracted from bonsai.js lines 1199-1214 and 182-195
 */

// Store the original Math.random for fallback
const originalRandom = Math.random;

// Active random generator
let activeGenerator = null;

/**
 * Create a seeded random number generator using Linear Congruential Generator (LCG)
 * Extracted from bonsai.js lines 1199-1214
 * @param {number} seed - The seed value for the random number generator
 * @returns {function} A function that returns pseudo-random numbers between 0 and 1
 */
export function seedrandom(seed) {
    let state = seed || Math.floor(originalRandom() * 999999);

    return function() {
        // LCG parameters for a decent pseudo-random sequence
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);

        // Update state using LCG formula
        state = (a * state + c) % m;

        // Return a value between 0 and 1
        return state / m;
    };
}

/**
 * Initialize the random seed from options
 * Extracted from bonsai.js lines 182-195
 * @param {object} options - Options object containing seed and verbose settings
 * @returns {function} The initialized random generator function
 */
export function initializeRandomSeed(options) {
    // If no seed provided, generate one randomly
    if (options.seed === null) {
        options.seed = Math.floor(originalRandom() * 10000);
    }

    // Set up the seeded random number generator
    activeGenerator = seedrandom(options.seed);

    // Log seed if verbose
    if (options.verbose) {
        console.log(`Using random seed: ${options.seed}`);
    }

    return activeGenerator;
}

/**
 * Get a random number from the active generator
 * This is the function that should be used throughout the codebase
 * instead of Math.random()
 * @returns {number} A pseudo-random number between 0 and 1
 */
export function getRandom() {
    if (!activeGenerator) {
        console.warn('getRandom() called before seed initialization, using original Math.random()');
        return originalRandom();
    }
    return activeGenerator();
}
