/**
 * UI Controls - handles verbose mode UI generation
 * Extracted from bonsai.js lines 227-337
 */

export class UIControls {
    constructor(options, callbacks) {
        this.options = options;
        this.callbacks = callbacks;
    }

    /**
     * Create UI controls for the bonsai tree
     * Extracted from bonsai.js lines 227-259
     */
    createUI() {
        const optionsContainer = document.querySelector('.option-controls');
        if (!optionsContainer) return;

        // Clear existing controls
        optionsContainer.innerHTML = '';

        // Create controls for each option
        this.createCheckboxOption(optionsContainer, 'live', 'Live Mode');
        this.createNumberOption(optionsContainer, 'time', 'Time (seconds)', 0.01, 10, 0.01);
        this.createCheckboxOption(optionsContainer, 'infinite', 'Infinite Mode');
        this.createNumberOption(optionsContainer, 'wait', 'Wait Time (seconds)', 0.1, 20, 0.1);
        this.createCheckboxOption(optionsContainer, 'screensaver', 'Screensaver Mode');
        this.createTextOption(optionsContainer, 'message', 'Message');
        this.createNumberOption(optionsContainer, 'multiplier', 'Branch Multiplier', 0, 20, 1);
        this.createNumberOption(optionsContainer, 'life', 'Life', 1, 200, 1);
        this.createNumberOption(optionsContainer, 'seed', 'Random Seed', 0, 9999, 1, true);

        // Create a "Generate" button
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'option-group';

        const generateButton = document.createElement('button');
        generateButton.textContent = 'Generate New Tree';
        generateButton.addEventListener('click', () => {
            this.callbacks.onClearTimeouts();
            this.callbacks.onReset();
            this.callbacks.onStart();
        });

        buttonGroup.appendChild(generateButton);
        optionsContainer.appendChild(buttonGroup);
    }

    /**
     * Create a checkbox option in the UI
     * Extracted from bonsai.js lines 264-283
     */
    createCheckboxOption(container, name, label) {
        const group = document.createElement('div');
        group.className = 'option-group';

        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `option-${name}`;
        checkboxLabel.textContent = label;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `option-${name}`;
        checkbox.checked = this.options[name];
        checkbox.addEventListener('change', (e) => {
            this.options[name] = e.target.checked;
        });

        group.appendChild(checkboxLabel);
        group.appendChild(checkbox);
        container.appendChild(group);
    }

    /**
     * Create a number input option in the UI
     * Extracted from bonsai.js lines 288-312
     */
    createNumberOption(container, name, label, min, max, step, allowNull = false) {
        const group = document.createElement('div');
        group.className = 'option-group';

        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = `option-${name}`;
        inputLabel.textContent = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `option-${name}`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = this.options[name] !== null ? this.options[name] : '';

        input.addEventListener('change', (e) => {
            const value = e.target.value === '' && allowNull ? null : parseFloat(e.target.value);
            this.options[name] = value;
        });

        group.appendChild(inputLabel);
        group.appendChild(input);
        container.appendChild(group);
    }

    /**
     * Create a text input option in the UI
     * Extracted from bonsai.js lines 317-337
     */
    createTextOption(container, name, label) {
        const group = document.createElement('div');
        group.className = 'option-group';

        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = `option-${name}`;
        inputLabel.textContent = label;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `option-${name}`;
        input.value = this.options[name];

        input.addEventListener('change', (e) => {
            this.options[name] = e.target.value;
        });

        group.appendChild(inputLabel);
        group.appendChild(input);
        container.appendChild(group);
    }
}
