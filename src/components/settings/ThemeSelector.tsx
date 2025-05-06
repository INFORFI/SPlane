'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme } from '../../hook/useTheme';
import { Theme } from '../../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme, themes, activeTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Preview component for each theme variant
  const ThemePreview = ({ theme, onClick, isActive }: { theme: Theme; onClick: () => void; isActive: boolean }) => (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 overflow-hidden rounded-lg border p-4 transition-all cursor-pointer ${
        isActive 
          ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
          : 'border-[var(--border-secondary)] bg-[var(--background-tertiary)] hover:border-[var(--border)]'
      }`}
    >
      {isActive && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]">
          <Check className="h-3 w-3 text-[var(--primary-foreground)]" />
        </span>
      )}
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-[var(--background-tertiary)] border border-[var(--border-secondary)]">
        {theme.preview}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground-secondary)]'}`}>
        {theme.name}
      </span>
    </motion.button>
  );

  // Small theme button for dropdown
  const ThemeButton = ({ theme, onClick, isActive }: { theme: Theme; onClick: () => void; isActive: boolean }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors rounded-md ${
        isActive 
          ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
          : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]'
      }`}
    >
      {theme.icon}
      <span>{theme.name}</span>
      {isActive && <Check className="ml-auto h-4 w-4" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">Theme</h3>
        
        {/* Mobile/Dropdown view */}
        <div className="block md:hidden relative mb-3">
          <button
            type="button"
            onClick={toggleExpand}
            className="flex items-center justify-between w-full px-4 py-2 text-left rounded-md border border-[var(--border)] bg-[var(--background-tertiary)] text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
          >
            <div className="flex items-center gap-2">
              {activeTheme.icon}
              <span>{activeTheme.name}</span>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background-secondary)] shadow-lg">
              <div className="py-1 max-h-60 overflow-auto">
                {themes.map(t => (
                  <ThemeButton
                    key={t.id}
                    theme={t}
                    onClick={() => {
                      setTheme(t.id);
                      setIsExpanded(false);
                    }}
                    isActive={t.id === theme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop grid view */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {themes.map(t => (
            <ThemePreview
              key={t.id}
              theme={t}
              onClick={() => setTheme(t.id)}
              isActive={t.id === theme}
            />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="hidden md:block space-y-3">
        <h4 className="text-sm font-medium text-[var(--foreground-secondary)]">Preview</h4>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] p-4 bg-[var(--background-tertiary)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-[var(--primary)]"></div>
                <div>
                  <div className="h-4 w-32 rounded-full bg-[var(--foreground)] opacity-80"></div>
                  <div className="mt-1 h-3 w-24 rounded-full bg-[var(--foreground-tertiary)] opacity-60"></div>
                </div>
              </div>
              <div className="h-8 w-20 rounded-md bg-[var(--primary)]"></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3 h-24 rounded-md bg-[var(--background-secondary)] border border-[var(--border)]"></div>
              <div className="col-span-1 h-24 rounded-md bg-[var(--background-secondary)] border border-[var(--border)]"></div>
            </div>
            <div className="h-10 w-full rounded-md bg-[var(--background-secondary)] border border-[var(--border)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}