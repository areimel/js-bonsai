import { useState, useEffect } from 'react';

const THEMES = ['off-white', 'beige', 'brown', 'off-black'];
const STORAGE_KEY = 'js-bonsai-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.includes(stored)) return stored;
    }
    return 'off-white'; // Default
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
