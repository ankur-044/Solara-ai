import { Link } from 'react-router-dom';
import { Sun, Globe, Settings as SettingsIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-10 py-5 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2 transition-transform hover:scale-105">
          <Sun className="text-solar" /> SOLARA
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 lg:gap-10 text-[10px] font-bold uppercase tracking-[0.4em] items-center">
          <Link to="/" className="hover:text-solar transition-all">Mission</Link>
          
          <Link to="/about" className="hover:text-solar transition-all">About</Link>
          
          <Link to="/dashboard" className="hover:text-solar transition-all">Dashboard</Link>
          
          {/* Global link with a subtle pulse to indicate interactivity */}
          <Link to="/globe" className="hover:text-solar transition-all flex items-center gap-2 text-solar/80">
            <Globe size={12} className="animate-spin-slow" /> Global
          </Link>
          
          <Link to="/settings" className="hover:text-solar transition-all flex items-center gap-2">
            <SettingsIcon size={12} /> Settings
          </Link>

          <Link to="/login" className="border border-white px-6 py-2 hover:bg-white hover:text-black transition-all ml-4">
            Authenticate
          </Link>
        </div>
      </div>
    </nav>
  );
}