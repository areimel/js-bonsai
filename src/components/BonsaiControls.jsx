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
          fixed top-14 bottom-12 right-0 w-72 bg-gray-800 border-l border-gray-700
          transform transition-transform duration-300 ease-in-out z-50
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-4 space-y-4">
          {/* Header with close button (mobile only) */}
          <div className="flex items-center justify-between md:hidden">
            <h2 className="text-lg font-semibold text-gray-200">Controls</h2>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-white"
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
          <h2 className="hidden md:block text-lg font-semibold text-gray-200">
            Controls
          </h2>

          {/* Tree Settings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Tree
            </h3>

            {/* Life - Number Input */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Life (Size)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={localOptions.life}
                onChange={(e) =>
                  handleNumberChange('life', e.target.value, 1, 200)
                }
                className="w-20 bg-gray-700 text-white text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Multiplier - Number Input */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Density</label>
              <input
                type="number"
                min="0"
                max="20"
                value={localOptions.multiplier}
                onChange={(e) =>
                  handleNumberChange('multiplier', e.target.value, 0, 20)
                }
                className="w-20 bg-gray-700 text-white text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Base Style - Compact Select */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Base</label>
              <select
                value={localOptions.base}
                onChange={(e) =>
                  handleNumberChange('base', e.target.value, 0, 2)
                }
                className="w-28 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="0">None</option>
                <option value="1">Small Pot</option>
                <option value="2">Large Pot</option>
              </select>
            </div>

            {/* Color Palette - Compact Select */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Colors</label>
              <select
                value={localOptions.colorPalette}
                onChange={(e) => handleChange('colorPalette', e.target.value)}
                className="w-28 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="default">Green</option>
                <option value="cherry">Pink</option>
                <option value="wisteria">Purple</option>
                <option value="maple">Red</option>
              </select>
            </div>
          </div>

          {/* Animation Section */}
          <div className="space-y-3 pt-2 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Animation
            </h3>

            {/* Live Animation - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.live}
                onChange={(e) => handleChange('live', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-300">Animate</span>
            </label>

            {/* Animation Speed - Number Input (conditional) */}
            {localOptions.live && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Speed (s)</label>
                <input
                  type="number"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={localOptions.time}
                  onChange={(e) =>
                    handleNumberChange('time', e.target.value, 0.001, 0.1)
                  }
                  className="w-20 bg-gray-700 text-white text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            {/* Infinite Mode - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.infinite}
                onChange={(e) => handleChange('infinite', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-300">Infinite</span>
            </label>

            {/* Wait Time - Number Input (conditional) */}
            {localOptions.infinite && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Wait (s)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={localOptions.wait}
                  onChange={(e) =>
                    handleNumberChange('wait', e.target.value, 1, 10)
                  }
                  className="w-20 bg-gray-700 text-white text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            {/* Screensaver - Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions.screensaver}
                onChange={(e) => handleChange('screensaver', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-300">Screensaver</span>
            </label>
          </div>

          {/* Options Section */}
          <div className="space-y-3 pt-2 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Options
            </h3>

            {/* Message */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Message</label>
              <input
                type="text"
                value={localOptions.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Optional"
                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Seed */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Seed</label>
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
                className="w-24 bg-gray-700 text-white text-right rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Generate
          </button>
        </div>
      </aside>
    </>
  );
}
