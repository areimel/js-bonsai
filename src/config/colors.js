/**
 * Color definitions for bonsai tree elements
 * Extracted from bonsai.js lines 74-83
 */

// Define all color palettes
export const colorPalettes = {
    default: {
        leaf: "#4e9a06",     // Standard green
        grass: "#4e9a06"     // Green grass
    },
    cherry: {
        leaf: "#FF80AB",     // Pink
        grass: "#4e9a06"     // Keep green grass
    },
    wisteria: {
        leaf: "#9575CD",     // Purple
        grass: "#A5D6A7"     // Light green grass
    },
    maple: {
        leaf: "#E53935",     // Red
        grass: "#4e9a06"     // Keep green grass
    }
};

// Shared colors across all palettes
export const sharedColors = {
    trunk: "#976c3c",    // Brown for trunk and branches
    branch: "#976c3c",   // Same as trunk
    base: "#8a8a8a",     // Gray for base/pot
    dirt: "#6d3300",     // Brown for soil
    message: "#cccccc"   // Light gray for messages
};

// Helper function to get complete color set for a palette
export function getColorsForPalette(paletteName) {
    const palette = colorPalettes[paletteName] || colorPalettes.default;
    return {
        ...sharedColors,
        ...palette
    };
}

// Default export for backward compatibility
export default getColorsForPalette('default');
