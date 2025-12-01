import { useState } from 'react';

export default function BonsaiControls({ options, onOptionsChange, onRegenerate }) {
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
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Tree Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Tree Settings</h3>
        <div className="space-y-4">
          {/* Life */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Life (Size): {localOptions.life}
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={localOptions.life}
              onChange={(e) => handleNumberChange('life', e.target.value, 1, 200)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small (1)</span>
              <span>Large (200)</span>
            </div>
          </div>

          {/* Multiplier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Multiplier (Density): {localOptions.multiplier}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={localOptions.multiplier}
              onChange={(e) => handleNumberChange('multiplier', e.target.value, 0, 20)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Sparse (0)</span>
              <span>Dense (20)</span>
            </div>
          </div>

          {/* Base Style */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Base Style
            </label>
            <select
              value={localOptions.base}
              onChange={(e) => handleNumberChange('base', e.target.value, 0, 2)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="0">No Base</option>
              <option value="1">Small Pot</option>
              <option value="2">Large Pot</option>
            </select>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Color Palette
            </label>
            <select
              value={localOptions.colorPalette}
              onChange={(e) => handleChange('colorPalette', e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="default">Default (Green)</option>
              <option value="cherry">Cherry (Pink)</option>
              <option value="wisteria">Wisteria (Purple)</option>
              <option value="maple">Maple (Red)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Animation Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Animation</h3>
        <div className="space-y-4">
          {/* Live Animation */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="live"
              checked={localOptions.live}
              onChange={(e) => handleChange('live', e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label htmlFor="live" className="ml-2 text-sm text-gray-300">
              Live Animation (Show Growth)
            </label>
          </div>

          {/* Animation Speed */}
          {localOptions.live && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Animation Speed: {localOptions.time.toFixed(3)}s per step
              </label>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={localOptions.time}
                onChange={(e) => handleNumberChange('time', e.target.value, 0.001, 0.1)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast (0.001s)</span>
                <span>Slow (0.1s)</span>
              </div>
            </div>
          )}

          {/* Infinite Mode */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="infinite"
              checked={localOptions.infinite}
              onChange={(e) => handleChange('infinite', e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label htmlFor="infinite" className="ml-2 text-sm text-gray-300">
              Infinite Mode (Keep Growing New Trees)
            </label>
          </div>

          {/* Wait Time */}
          {localOptions.infinite && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wait Between Trees: {localOptions.wait.toFixed(1)}s
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={localOptions.wait}
                onChange={(e) => handleNumberChange('wait', e.target.value, 1, 10)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1s</span>
                <span>10s</span>
              </div>
            </div>
          )}

          {/* Screensaver */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="screensaver"
              checked={localOptions.screensaver}
              onChange={(e) => handleChange('screensaver', e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label htmlFor="screensaver" className="ml-2 text-sm text-gray-300">
              Screensaver Mode (Live + Infinite)
            </label>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Message</h3>
        <input
          type="text"
          value={localOptions.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Optional message to display with tree"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Random Seed */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Random Seed</h3>
        <input
          type="number"
          value={localOptions.seed || ''}
          onChange={(e) => handleChange('seed', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Leave empty for random"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Set a seed number for reproducible trees
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        Generate New Tree
      </button>
    </div>
  );
}
