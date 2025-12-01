/**
 * ASCII character mappings for tree rendering
 * Extracted from bonsai.js lines 27-56
 */

export default {
    // Trunk and branch characters
    trunks: ['|', '/', '||', 'Y', 'V', 'v', '^', '<', '>', 'H'],
    // Branch joint characters
    joints: ['/', '//', 'v', '>', '<', '^', 'Y', 'V', 'y', 'T', 't', 'x', 'X', '+'],
    // Branch strings based on direction - matching cbonsai's implementation
    branchStrings: {
        trunk: {
            straightHorizontal: "/~",
            leftDiagonal: "//|",
            vertical: "/|/",
            rightDiagonal: "|/"
        },
        shootLeft: {
            down: "//",
            horizontal: "//=",
            leftDiagonal: "//|",
            vertical: "/|",
            rightDiagonal: "/"
        },
        shootRight: {
            down: "/",
            horizontal: "=/",
            leftDiagonal: "//|",
            vertical: "/|",
            rightDiagonal: "/"
        }
    },
    // Dead branch characters
    deadChars: ['/', '`', '.', ',', '_']
};
