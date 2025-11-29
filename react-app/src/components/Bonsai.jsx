import { useBonsai } from '@hooks/useBonsai';

export default function Bonsai({ options = {}, className = '', style = {} }) {
  const { containerRef } = useBonsai(options);

  return (
    <div
      ref={containerRef}
      className={`font-mono bg-black text-white p-6 rounded-lg overflow-hidden ${className}`}
      style={{
        minHeight: '500px',
        minWidth: '800px',
        maxHeight: '80vh',
        whiteSpace: 'pre',
        ...style
      }}
    />
  );
}
