export default function ThemeSwitcher({ theme, onThemeChange }) {
  return (
    <select
      value={theme}
      onChange={(e) => onThemeChange(e.target.value)}
      className="bg-(--bg-tertiary) text-(--text-primary) border border-(--border) rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-(--accent)"
      aria-label="Select color theme"
    >
      <option value="off-white">Off-White</option>
      <option value="beige">Beige</option>
      <option value="brown">Brown</option>
      <option value="off-black">Off-Black</option>
    </select>
  );
}
