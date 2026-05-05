import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Start with 'dark'
  const [theme, setTheme] = useState(localStorage.getItem('solara-theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old classes
    root.classList.remove('dark', 'simple-light');
    
    // Add the new class
    root.classList.add(theme);
    
    // Save preference
    localStorage.setItem('solara-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'simple-light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};