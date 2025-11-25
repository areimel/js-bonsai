/**
 * Unified configuration loader
 * Aggregates all config files into a single CONFIG export
 */

import colors from './colors.js';
import defaults from './defaults.js';
import characters from './characters.js';
import bases from './bases.js';

export const CONFIG = {
    colors,
    defaults,
    characters,
    bases: bases.bases,

    // Constants
    classPrefix: 'js-bonsai-',

    // Branch type enum - mimicking cbonsai's enum
    branchTypes: {
        TRUNK: 0,
        SHOOT_LEFT: 1,
        SHOOT_RIGHT: 2,
        DYING: 3,
        DEAD: 4
    }
};

export default CONFIG;
