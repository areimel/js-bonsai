/**
 * TEMPORARY determinism verification script for the DRY refactor.
 * Runs the tree-growth algorithm in Node (no DOM) with fixed seeds and
 * serializes the resulting character grid. Run before and after the
 * refactor — outputs must be byte-identical.
 *
 * Usage:
 *   node scripts/determinism-check.mjs capture   # write golden files
 *   node scripts/determinism-check.mjs verify    # diff against golden files
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import CONFIG from '../src/lib/config/index.js';
import { initializeRandomSeed, getRandom } from '../src/lib/utils/random.js';
import { TreeGenerator } from '../src/lib/modules/tree-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS = [12345, 777, 42];
const ROWS = 40;
const COLS = 120;

// Stub CSSManager — class strings don't affect tree geometry/characters,
// and the real one touches the DOM.
const cssManagerStub = {
    getBaseClasses: () => '',
    getBranchClasses: () => '',
    getLeafClasses: () => '',
    getMessageClasses: () => ''
};

function growTreeForSeed(seed) {
    const options = { ...CONFIG.defaults, seed };
    const state = {
        tree: Array(ROWS).fill().map(() => Array(COLS).fill(' ')),
        timeouts: [],
        counters: { branches: 0, shoots: 0, shootCounter: 0 },
        flags: { isGrowing: false },
        refs: { container: null },
        options
    };

    initializeRandomSeed(options);

    // Mirror JSBonsai.growTree()'s random-call sequence exactly
    state.counters.shootCounter = Math.floor(getRandom() * 100);

    const generator = new TreeGenerator(state, CONFIG, cssManagerStub);

    const startX = Math.floor(COLS / 2);
    const startY = ROWS - 1;

    if (options.base > 0 && CONFIG.bases[options.base]) {
        generator.drawBase(startX, startY);
    }

    const baseHeight = options.base > 0 ? CONFIG.bases[options.base].length : 0;
    const buffer = options.base > 0 ? options.baseBuffer : 0;
    const trunkY = startY - baseHeight - buffer;

    generator.growBranch(startX, trunkY, 0, -1, CONFIG.branchTypes.TRUNK, options.life);

    // Serialize: char grid + cell types + counters (full structural fingerprint)
    const grid = state.tree.map(row =>
        row.map(cell => (typeof cell === 'object' ? cell.char : cell)).join('')
    ).join('\n');
    const types = state.tree.map(row =>
        row.map(cell => (typeof cell === 'object' ? (cell.type ?? '?')[0] : '.')).join('')
    ).join('\n');

    return `seed=${seed} branches=${state.counters.branches} shoots=${state.counters.shoots}\n${grid}\n--types--\n${types}\n`;
}

const mode = process.argv[2];
if (mode !== 'capture' && mode !== 'verify') {
    console.error('Usage: node scripts/determinism-check.mjs <capture|verify>');
    process.exit(1);
}

let failed = false;
for (const seed of SEEDS) {
    const output = growTreeForSeed(seed);
    const goldenPath = join(__dirname, `golden-tree-${seed}.txt`);

    if (mode === 'capture') {
        writeFileSync(goldenPath, output);
        console.log(`captured ${goldenPath}`);
    } else {
        const golden = readFileSync(goldenPath, 'utf8');
        if (golden === output) {
            console.log(`seed ${seed}: MATCH`);
        } else {
            console.error(`seed ${seed}: MISMATCH`);
            writeFileSync(join(__dirname, `actual-tree-${seed}.txt`), output);
            failed = true;
        }
    }
}
process.exit(failed ? 1 : 0);
