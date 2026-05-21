import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'gamer' | 'biohacker';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gamer');

  const toggleTheme = () => {
    setTheme(prev => prev === 'gamer' ? 'biohacker' : 'gamer');
  };

  useEffect(() => {
    document.documentElement.classList.remove('gamer', 'biohacker');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'gamer' 
          ? 'bg-slate-950 text-cyan-400 selection:bg-fuchsia-500/30' 
          : 'bg-stone-50 text-stone-900 selection:bg-emerald-500/20'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
