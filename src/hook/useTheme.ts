'use client';

import { useContext } from 'react';
import { ThemeContext, ThemeType, Theme, themes } from '../context/ThemeContext';

interface UseThemeReturn {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: Theme[];
  activeTheme: Theme;
}

export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  const { theme, setTheme, themes } = context;
  
  // Find the current theme object
  const activeTheme = themes.find(t => t.id === theme) || themes[1]; // Default to dark if not found
  
  return {
    theme,
    setTheme,
    themes,
    activeTheme,
  };
}
