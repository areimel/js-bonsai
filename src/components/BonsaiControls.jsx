import { useState } from 'react';

export default function BonsaiControls({
  options,
  onOptionsChange,
  onRegenerate,
  isOpen,
  onToggle,
}) {
  const [localOptions, setLocalOptions] = useState(options);

  const handleChange = (key, value) => {
    const newOptions = { ...localOptions, [key]: value };
    setLocalOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const handleNumberChange = (key, value, min, max) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      handleChange(key, numValue);
    }
  };

  const handleGenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
    // Close drawer on mobile after generating
    if (window.innerWidth < 768 && onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 bottom-12 right-0 w-72 bg-(--bg-secondary) border-l border-(--border)
          transform transition-transform duration-300 ease-in-out z-50
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-4 space-y-4">
          {/* Header with close button (mobile only) */}
          <div className="flex items-center justify-between md:hidden">
            <h2 className="text-lg font-semibold text-(--text-primary)">Controls</h2>
            <button
              onClick={onToggle}
              className="p-2 text-(--text-muted) hover:text-(--text-primary)"
              aria-label="Close controls"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop header */}
          <h2 className="hidden md:block text-lg font-semibold text-(--text-primary)">
            Controls
          </h2>

          {/* Tree Settings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wide">
              Tree
            </h3>

            {/* Life - Number Input */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--text-secondary)">Life (Size)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={localOptions.life}
                onChange={(e) =>
                  handleNumberChange('life', e.target.value, 1, 200)
                }
                className="w-20 bg-(--bg-tertiary) text-(--text-primary) text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
              />
            </div>

            {/* Multiplier - Number Input */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--text-secondary)">Density</label>
              <input
                type="number"
                min="0"
                max="20"
                value={localOptions.multiplier}
                onChange={(e) =>
                  handleNumberChange('multiplier', e.target.value, 0, 20)
                }
                className="w-20 bg-(--bg-tertiary) text-(--text-primary) text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
              />
            </div>

            {/* Base Style - Compact Select */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--text-secondary)">Base</label>
              <select
                value={localOptions.base}
                onChange={(e) =>
                  handleNumberChange('base', e.target.value, 0, 2)
                }
                className="w-28 bg-(--bg-tertiary) text-(--text-primary) rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
              >
                <option value="0">None</option>
                <option value="1">Large Pot</option>
                <option value="2">Small Pot</option>
              </select>
            </div>

            {/* Color Palette - Compact Select */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--text-secondary)">Colors</label>
              <select
                value={localOptions.colorPalette}
                onChange={(e) => handleChange('colorPalette', e.target.value)}
                className="w-28 bg-(--bg-tertiary) text-(--text-primary) rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
              >
                <option value="default">Green</option>
                <option value="cherry">Pink</option>
                <option value="wisteria">Purple</option>
                <option value="maple">Red</option>
              </select>
            </div>
          </div>

          {/* Animation Section */}
          <div className="space-y-3 pt-2 border-t border-(--border)">
            <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wide">
              Animation
            </h3>

            {/* Live Animation - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.live}
                onChange={(e) => handleChange('live', e.target.checked)}
                className="w-4 h-4 accent-(--accent) bg-(--bg-tertiary) border-(--border) rounded focus:ring-(--accent)"
              />
              <span className="text-sm text-(--text-secondary)">Animate</span>
            </label>

            {/* Animation Speed - Number Input (conditional) */}
            {localOptions.live && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-(--text-secondary)">Speed (s)</label>
                <input
                  type="number"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={localOptions.time}
                  onChange={(e) =>
                    handleNumberChange('time', e.target.value, 0.001, 0.1)
                  }
                  className="w-20 bg-(--bg-tertiary) text-(--text-primary) text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
                />
              </div>
            )}

            {/* Infinite Mode - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.infinite}
                onChange={(e) => handleChange('infinite', e.target.checked)}
                className="w-4 h-4 accent-(--accent) bg-(--bg-tertiary) border-(--border) rounded focus:ring-(--accent)"
              />
              <span className="text-sm text-(--text-secondary)">Infinite</span>
            </label>

            {/* Wait Time - Number Input (conditional) */}
            {localOptions.infinite && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-(--text-secondary)">Wait (s)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={localOptions.wait}
                  onChange={(e) =>
                    handleNumberChange('wait', e.target.value, 1, 10)
                  }
                  className="w-20 bg-(--bg-tertiary) text-(--text-primary) text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
                />
              </div>
            )}

            {/* Screensaver - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.screensaver}
                onChange={(e) => handleChange('screensaver', e.target.checked)}
                className="w-4 h-4 accent-(--accent) bg-(--bg-tertiary) border-(--border) rounded focus:ring-(--accent)"
              />
              <span className="text-sm text-(--text-secondary)">Screensaver</span>
            </label>
          </div>

          {/* Options Section */}
          <div className="space-y-3 pt-2 border-t border-(--border)">
            <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wide">
              Options
            </h3>

            {/* Message */}
            <div>
              <label className="block text-sm text-(--text-secondary) mb-1">Message</label>
              <input
                type="text"
                value={localOptions.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Optional"
                className="w-full bg-(--bg-tertiary) text-(--text-primary) rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent) placeholder:text-(--text-muted)"
              />
            </div>

            {/* Seed */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-(--text-secondary)">Seed</label>
              <input
                type="number"
                value={localOptions.seed || ''}
                onChange={(e) =>
                  handleChange(
                    'seed',
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="Random"
                className="w-24 bg-(--bg-tertiary) text-(--text-primary) text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent) placeholder:text-(--text-muted)"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-(--accent) hover:bg-(--accent-hover) text-white font-semibold py-2 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-(--accent)"
          >
            Generate
          </button>
        </div>
      </aside>
    </>
  );
}
