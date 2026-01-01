import { useEffect, useState } from 'react';

function getInitialDarkMode() {
  const saved = localStorage.getItem('pointflow_dark_mode');
  if (saved !== null) {
    return saved === 'true';
  }
  // Default to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const initialValue = getInitialDarkMode();
    // Apply immediately to prevent flash
    if (initialValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return initialValue;
  });

  useEffect(() => {
    console.log('[useDarkMode] isDark changed to:', isDark);
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      console.log('[useDarkMode] Added dark class');
    } else {
      root.classList.remove('dark');
      console.log('[useDarkMode] Removed dark class');
    }
    localStorage.setItem('pointflow_dark_mode', String(isDark));
  }, [isDark]);

  const toggleDarkMode = () => {
    console.log('[useDarkMode] toggleDarkMode called, current isDark:', isDark);
    setIsDark(!isDark);
  };

  return { isDark, toggleDarkMode };
}
