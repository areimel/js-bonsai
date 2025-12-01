import ThemeSwitcher from '@components/ThemeSwitcher';

export default function Header({ theme, onThemeChange }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-(--bg-primary) border-b border-(--border) flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Bonsai tree">
          🌳
        </span>
        <h1 className="text-xl font-bold text-(--text-primary)">JS Bonsai</h1>
      </div>
      <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
    </header>
  );
}
