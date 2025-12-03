/**
 * Default configuration options
 * Extracted from bonsai.js lines 8-24
 */

export default {
    live: false,         // Live mode: show each step of growth
    time: 0.03,          // In live mode, wait time (seconds) between steps
    autoplay: false,     // Autoplay mode: continuous tree regeneration (auto-enables live mode)
    autoplayBuffer: 2.0, // In autoplay mode, buffer time (seconds) after animation completes before next tree
    message: '',         // Attach message next to the tree
    base: 1,             // ASCII-art plant base to use (0 is none)
    baseBuffer: 0,       // Empty rows between tree and base pot (prevents overlap)
    leaves: ['&', '+', '*', '.', '^', '@', '~', '`', '"', '/', '_', ',', 'o', 'O', '0', '#', '%', '$', 'v', 'V', 'x'], // Enhanced leaves list
    multiplier: 5,       // Branch multiplier (0-20)
    life: 32,            // Life (0-200)
    print: true,         // Print tree when finished
    seed: null,          // Random seed
    verbose: false,      // Increase output verbosity
    container: 'js-bonsai', // ID of container element
    colorPalette: 'default'  // Color palette for the tree
};
