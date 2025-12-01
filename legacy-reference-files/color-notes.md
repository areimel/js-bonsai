 // Tree color mappings - adapted to match cbonsai
    colors = {
        trunk: "#976c3c",    // Brown for trunk and branches
        branch: "#976c3c",   // Same as trunk
        leaf: "#4e9a06",     // Standard green for leaves
        leafLight: "#7bba2d", // Lighter green for variety
        leafDark: "#366804",  // Darker green for variety
        base: "#8a8a8a",     // Gray for base/pot
        grass: "#4e9a06",     // Green for grass in pot
        message: "#cccccc"   // Light gray for messages
    };

    // Predefined color palettes
    colorPalettes = {
        default: {
            leaf: "#4e9a06",     // Standard green
            leafLight: "#7bba2d", // Lighter green
            leafDark: "#366804",  // Darker green
            grass: "#4e9a06"      // Green for grass in pot
        },
        cherry: {
            leaf: "#FF80AB",      // Pink
            leafLight: "#FFBDD4", // Light pink
            leafDark: "#D85A7F",  // Dark pink
            grass: "#4e9a06"      // Keep green grass
        },
        wisteria: {
            leaf: "#9575CD",      // Purple
            leafLight: "#B39DDB", // Light purple
            leafDark: "#7986CB",  // Light blue-purple
            grass: "#A5D6A7"      // Light green grass
        },
        maple: {
            leaf: "#E53935",      // Red
            leafLight: "#FF7043", // Orange-red
            leafDark: "#B71C1C",  // Dark red
            grass: "#4e9a06"      // Keep green grass
        }
    };

// Add color palette selection
        this.createSelectOption(container, 'colorPalette', 'Color Palette', [
            { value: 'default', label: 'Default Green' },
            { value: 'cherry', label: 'Cherry Blossom Pink' },
            { value: 'wisteria', label: 'Wisteria Purple' },
            { value: 'maple', label: 'Maple Red' }
        ]);