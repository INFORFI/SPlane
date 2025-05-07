'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { Sun, Moon, Monitor, Palette, Contrast } from 'lucide-react';

export type ThemeType = string;

export type Theme = {
  id: string;
  name: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: Theme[];
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    icon: <Sun className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-white"></div>
        <div className="h-4 w-4 rounded-full bg-zinc-100"></div>
        <div className="h-4 w-4 rounded-full bg-zinc-200"></div>
      </div>
    ),
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-zinc-950"></div>
        <div className="h-4 w-4 rounded-full bg-zinc-900"></div>
        <div className="h-4 w-4 rounded-full bg-zinc-800"></div>
      </div>
    ),
  },
  {
    id: 'system',
    name: 'System',
    icon: <Monitor className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-2 rounded-l-full bg-white"></div>
        <div className="h-4 w-2 rounded-r-full bg-zinc-900"></div>
        <div className="h-4 w-4 rounded-full bg-zinc-300"></div>
      </div>
    ),
  },
  {
    id: 'dark-high-contrast',
    name: 'High Contrast',
    icon: <Contrast className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-black"></div>
        <div className="h-4 w-4 rounded-full bg-[#377DFF]"></div>
        <div className="h-4 w-4 rounded-full bg-[#E637DC]"></div>
      </div>
    ),
  },
  {
    id: 'dracula',
    name: 'Dracula',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#282a36]"></div>
        <div className="h-4 w-4 rounded-full bg-[#bd93f9]"></div>
        <div className="h-4 w-4 rounded-full bg-[#ff79c6]"></div>
      </div>
    ),
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#1a1b26]"></div>
        <div className="h-4 w-4 rounded-full bg-[#7dcfff]"></div>
        <div className="h-4 w-4 rounded-full bg-[#bb9af7]"></div>
      </div>
    ),
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#1e1e2e]"></div>
        <div className="h-4 w-4 rounded-full bg-[#cba6f7]"></div>
        <div className="h-4 w-4 rounded-full bg-[#f38ba8]"></div>
      </div>
    ),
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#011627]"></div>
        <div className="h-4 w-4 rounded-full bg-[#82aaff]"></div>
        <div className="h-4 w-4 rounded-full bg-[#c792ea]"></div>
      </div>
    ),
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-white"></div>
        <div className="h-4 w-4 rounded-full bg-[#1f6feb]"></div>
        <div className="h-4 w-4 rounded-full bg-[#8250df]"></div>
      </div>
    ),
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#0d1117]"></div>
        <div className="h-4 w-4 rounded-full bg-[#58a6ff]"></div>
        <div className="h-4 w-4 rounded-full bg-[#bb80ff]"></div>
      </div>
    ),
  },
  {
    id: 'matcha',
    name: 'Matcha',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#f1ebe1]"></div>
        <div className="h-4 w-4 rounded-full bg-[#74a12e]"></div>
        <div className="h-4 w-4 rounded-full bg-[#8ba888]"></div>
      </div>
    ),
  },
  {
    id: 'houston',
    name: 'Houston',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#17191e]"></div>
        <div className="h-4 w-4 rounded-full bg-[#54b9ff]"></div>
        <div className="h-4 w-4 rounded-full bg-[#acafff]"></div>
      </div>
    ),
  },
  {
    id: 'ayu-mirage',
    name: 'Ayu Mirage',
    icon: <Palette className="h-4 w-4" />,
    preview: (
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-full bg-[#1f212e]"></div>
        <div className="h-4 w-4 rounded-full bg-[#5ccfe6]"></div>
        <div className="h-4 w-4 rounded-full bg-[#ffa759]"></div>
      </div>
    ),
  },
];

const defaultTheme = 'dark';

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => null,
  themes,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Handle system theme
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          const newTheme = e.matches ? 'dark' : 'light';
          root.className = newTheme;
        }
      };
      
      // Apply theme
      if (theme === 'system') {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.className = isDarkMode ? 'dark' : 'light';
        
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', handleSystemThemeChange);
      } else {
        root.className = theme;
      }
      
      localStorage.setItem('theme', theme);
      
      return () => {
        window.matchMedia('(prefers-color-scheme: dark)')
          .removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
