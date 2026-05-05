import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const translations = {
  en: {
    mission: "MISSION", about: "ABOUT", dashboard: "DASHBOARD", global: "GLOBAL", settings: "SETTINGS",
    cmd_dash: "COMMAND DASHBOARD", ghi: "GHI", uv: "UV INDEX", cloud: "CLOUD COVER", aod: "AOD", temp: "TEMP",
    peak: "NEXT PEAK", device_lib: "HARDWARE OPTIMIZATION LIBRARY", alerts: "YIELD EFFICIENCY ALERTS",
    predictive_title: "AI HYBRID FORECAST (15-MIN GRANULARITY)"
  },
  de: {
    mission: "MISSION", about: "ÜBER", dashboard: "ÜBERSICHT", global: "GLOBUS", settings: "EINSTELLUNGEN",
    cmd_dash: "KOMMANDO-DASHBOARD", ghi: "GHI", uv: "UV-INDEX", cloud: "BEWÖLKUNG", aod: "AOD", temp: "TEMP",
    peak: "NÄCHSTER PEAK", device_lib: "HARDWARE-OPTIMIERUNGSBIBLIOTHEK", alerts: "EFFIZIENZ-ALARME",
    predictive_title: "AI-HYBRID-PROGNOSE (15-MIN-GRANULARITÄT)"
  },
  hi: {
    mission: "मिशन", about: "विवरण", dashboard: "डैशबोर्ड", global: "ग्लोबल", settings: "सेटिंग्स",
    cmd_dash: "कमांड डैशबोर्ड", ghi: "GHI", uv: "यूवी इंडेक्स", cloud: "बादल", aod: "AOD", temp: "तापमान",
    peak: "अगला पीक", device_lib: "हार्डवेयर अनुकूलन लाइब्रेरी", alerts: "दक्षता अलर्ट",
    predictive_title: "AI हाइब्रिड पूर्वानुमान (15-मिनट अंतराल)"
  }
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('solara-theme') || 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('solara-lang') || 'en');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'simple-light');
    root.classList.add(theme === 'dark' ? 'dark' : 'simple-light');
    localStorage.setItem('solara-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'simple-light' : 'dark');
  const t = (key) => (translations[language] && translations[language][key]) ? translations[language][key] : key;

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};