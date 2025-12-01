export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 md:right-72 z-30 h-12 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-4 text-sm text-gray-400">
      <span>&copy; {currentYear} JS Bonsai</span>
      <div className="flex gap-4">
        <a
          href="https://gitlab.com/jallbrit/cbonsai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          Original cbonsai
        </a>
        <a
          href="https://github.com/areimel/js-bonsai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
