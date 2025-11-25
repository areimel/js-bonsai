/**
 * Color definitions for bonsai tree elements
 * Extracted from bonsai.js lines 74-83
 */

// Define all color palettes
export const colorPalettes = {
    default: {
        leaf: "#4e9a06",         // Standard green
        leafLight: "#7bba2d",    // Lighter green for variety
        leafDark: "#366804",     // Darker green for variety
        grass: "#4e9a06"         // Green grass
    },
    cherry: {
        leaf: "#FF80AB",         // Pink
        leafLight: "#FFBDD4",    // Light pink for variety
        leafDark: "#D85A7F",     // Dark pink for variety
        grass: "#4e9a06"         // Keep green grass
    },
    wisteria: {
        leaf: "#9575CD",         // Purple
        leafLight: "#B39DDB",    // Light purple for variety
        leafDark: "#7986CB",     // Blue-purple for variety
        grass: "#A5D6A7"         // Light green grass
    },
    maple: {
        leaf: "#E53935",         // Red
        leafLight: "#FF7043",    // Orange-red for variety
        leafDark: "#B71C1C",     // Dark red for variety
        grass: "#4e9a06"         // Keep green grass
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
