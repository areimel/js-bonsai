import { useState, useRef } from 'react';
import Bonsai from '@components/Bonsai';
import BonsaiControls from '@components/BonsaiControls';
import './App.css';

function App() {
  const bonsaiRef = useRef(null);
  const [regenerateKey, setRegenerateKey] = useState(0);
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
    seed: null
  });

  const handleRegenerate = () => {
    // Force re-mount by changing the key
    setRegenerateKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold">JS Bonsai</h1>
        <p className="text-gray-400 mt-2">ASCII Bonsai Tree Generator</p>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bonsai display */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Your Bonsai Tree</h2>
            <Bonsai
              key={`${regenerateKey}-${JSON.stringify(bonsaiOptions)}`}
              ref={bonsaiRef}
              options={bonsaiOptions}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <BonsaiControls
              options={bonsaiOptions}
              onOptionsChange={setBonsaiOptions}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
