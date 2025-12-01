export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 md:right-72 z-30 h-12 bg-(--bg-primary) border-t border-(--border) flex items-center justify-between px-4 text-sm text-(--text-muted)">
      <span>&copy; {currentYear} JS Bonsai</span>
      <div className="flex gap-4">
        <a
          href="https://gitlab.com/jallbrit/cbonsai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--text-primary) transition-colors"
        >
          Original cbonsai
        </a>
        <a
          href="https://github.com/areimel/js-bonsai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--text-primary) transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
