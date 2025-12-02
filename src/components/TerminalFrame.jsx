import { useTheme } from '@hooks/useTheme';

/**
 * TerminalFrame - A decorative terminal-style frame component
 *
 * Wraps child components with a terminal window aesthetic featuring
 * macOS-style window controls, a header bar with prompt, and themed borders.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap (usually Bonsai)
 * @param {string} [props.title="js-bonsai"] - Text to display in header
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {Object} [props.style={}] - Inline styles
 */
export default function TerminalFrame({
  children,
  title = "js-bonsai",
  className = "",
  style = {}
}) {
  const { theme } = useTheme();

  // Theme-aware shadow
  const shadowClass = theme === 'brown' || theme === 'off-black'
    ? 'shadow-lg shadow-white/5'
    : 'shadow-lg shadow-black/10';

  return (
    <div
      className={`
        w-full max-w-4xl
        rounded-sm overflow-hidden
        ${shadowClass}
        ${className}
      `}
      style={style}
    >
      {/* Terminal header bar */}
      <div className="
        h-8 md:h-10
        bg-(--bg-secondary)
        border border-(--border)
        rounded-t-sm
        border-b-0
        flex items-center gap-3
        px-2 md:px-4
      ">
        {/* Window control buttons */}
        <div className="flex items-center gap-1 md:gap-1.5">
          <span className="text-red-500 text-xs md:text-sm" aria-hidden="true">●</span>
          <span className="text-yellow-500 text-xs md:text-sm" aria-hidden="true">●</span>
          <span className="text-green-500 text-xs md:text-sm" aria-hidden="true">●</span>
        </div>

        {/* Terminal prompt */}
        <span className="
          font-mono
          text-xs md:text-sm
          text-(--text-primary)
        ">
          $ {title}
        </span>
      </div>

      {/* Content area with borders on 3 sides */}
      <div className="
        border-l border-r border-b
        border-(--border)
        rounded-b-sm
        overflow-hidden
      ">
        {children}
      </div>
    </div>
  );
}
