import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Sun, Moon, Languages } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme, language, setLanguage, t } = useContext(AppContext);

  return (
    <div className="min-h-screen pt-32 px-6 bg-white dark:bg-[#050505] text-black dark:text-white transition-all font-mono">
      <div className="max-w-xl mx-auto border border-gray-200 dark:border-white/10 p-12 bg-gray-50 dark:bg-white/5">
        <h1 className="text-3xl font-black italic uppercase mb-12 italic">{t('settings')}</h1>
        
        <div className="space-y-12">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold uppercase text-sm">Visual Mode</p>
              <p className="text-[10px] text-gray-500 uppercase">Current: {theme}</p>
            </div>
            <button onClick={toggleTheme} className="p-4 border border-gray-200 dark:border-white/20 hover:border-solar transition-colors">
              {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </div>

          {/* Language Selection */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold uppercase text-sm">Language</p>
              <p className="text-[10px] text-gray-500 uppercase">Select System Language</p>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border border-gray-200 dark:border-white/20 p-2 text-xs font-bold uppercase outline-none text-black dark:text-white"
            >
              <option value="en" className="text-black">English (US)</option>
              <option value="de" className="text-black">German (DE)</option>
              <option value="hi" className="text-black">Hindi (IN)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}