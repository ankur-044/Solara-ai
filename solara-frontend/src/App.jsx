import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import GlobeView from './pages/Globe';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';

// Updated Login Component with Redirect Logic
const Login = () => {
  const navigate = useNavigate(); // 2. Initialize the navigate function

  const handleLogin = (e) => {
    e.preventDefault();
    // Here you could add validation logic if needed
    // For now, it simply redirects as requested
    navigate('/dashboard'); // 3. Redirect to the dashboard route
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505] pt-20 font-mono transition-colors duration-500">
      <div className="w-full max-w-md p-12 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-900/50 backdrop-blur-md shadow-2xl">
        
        <h2 className="text-3xl font-black italic mb-8 uppercase tracking-tighter text-black dark:text-white">
          Authenticate<span className="text-solar">.</span>
        </h2>

        <form onSubmit={handleLogin} className="space-y-4"> {/* Added form tag for better UX */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Operator ID</label>
            <input 
              required
              type="text" 
              placeholder="XXXX-XXXX-XXXX" 
              className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 p-4 text-xs outline-none focus:border-solar text-black dark:text-white transition-all" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Security Key</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 p-4 text-xs outline-none focus:border-solar text-black dark:text-white transition-all" 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-solar hover:bg-white hover:text-black text-black font-bold py-4 mt-4 uppercase text-[10px] tracking-[0.3em] transition-all transform active:scale-95"
          >
            Initialise Mission
          </button>
        </form>

        <p className="mt-8 text-center text-[9px] text-gray-400 uppercase tracking-widest opacity-50">
          Secure Terminal // encrypted-link active
        </p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/globe" element={<GlobeView />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}