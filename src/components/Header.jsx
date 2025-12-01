export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Bonsai tree">
          🌳
        </span>
        <h1 className="text-xl font-bold text-white">JS Bonsai</h1>
      </div>
    </header>
  );
}
