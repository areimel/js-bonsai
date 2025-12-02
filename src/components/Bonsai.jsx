import { useBonsai } from '@hooks/useBonsai';

export default function Bonsai({ options = {}, className = '', style = {} }) {
  const { containerRef } = useBonsai(options);

  return (
    <div
      ref={containerRef}
      className={`font-mono bg-black text-white p-4 md:p-6 overflow-hidden w-full max-w-4xl ${className}`}
      style={{
        minHeight: '500px',
        maxHeight: '80vh',
        whiteSpace: 'pre',
        ...style,
      }}
    />
  );
}
