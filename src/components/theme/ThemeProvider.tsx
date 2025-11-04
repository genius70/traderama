import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'auto',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const getTimeBasedTheme = (): 'light' | 'dark' => {
    const hour = new Date().getHours();
    // Night mode from 6 PM (18:00) to 6 AM (06:00)
    return hour >= 18 || hour < 6 ? 'dark' : 'light';
  };

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      let newResolvedTheme: 'light' | 'dark';

      if (theme === 'auto') {
        newResolvedTheme = getTimeBasedTheme();
      } else {
        newResolvedTheme = theme as 'light' | 'dark';
      }

      setResolvedTheme(newResolvedTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(newResolvedTheme);
    };

    updateTheme();

    // Update theme every minute if in auto mode to catch time changes
    let interval: NodeJS.Timeout | null = null;
    if (theme === 'auto') {
      interval = setInterval(updateTheme, 60000); // Check every minute
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        updateTheme();
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      if (interval) clearInterval(interval);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
