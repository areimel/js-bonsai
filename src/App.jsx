import { useState, useRef } from 'react';
import Bonsai from '@components/Bonsai';
import BonsaiControls from '@components/BonsaiControls';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { useTheme } from '@hooks/useTheme';
import './App.css';

function App() {
  const bonsaiRef = useRef(null);
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [bonsaiOptions, setBonsaiOptions] = useState({
    live: true,
    time: 0.03,
    infinite: false,
    wait: 4.0,
    message: '',
    base: 1,
    multiplier: 5,
    life: 32,
    colorPalette: 'default',
    seed: null,
  });

  const handleRegenerate = () => {
    setRegenerateKey((prev) => prev + 1);
  };

  const toggleControls = () => {
    setIsControlsOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
      {/* Header */}
      <Header theme={theme} onThemeChange={setTheme} />

      {/* Mobile toggle button */}
      <button
        onClick={toggleControls}
        className="fixed top-16 right-4 z-50 md:hidden p-2 bg-(--bg-secondary) rounded-lg border border-(--border) hover:bg-(--bg-tertiary) transition-colors"
        aria-label="Toggle controls"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Main content area */}
      <main className="pt-14 pb-12 md:pr-72 min-h-screen flex items-center justify-center p-4">
        <Bonsai
          key={`${regenerateKey}-${JSON.stringify(bonsaiOptions)}`}
          ref={bonsaiRef}
          options={bonsaiOptions}
        />
      </main>

      {/* Sidebar Controls */}
      <BonsaiControls
        options={bonsaiOptions}
        onOptionsChange={setBonsaiOptions}
        onRegenerate={handleRegenerate}
        isOpen={isControlsOpen}
        onToggle={toggleControls}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
