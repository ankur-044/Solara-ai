import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    /* Added bg-black and text-white to force dark theme on this page specifically */
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      
      {/* FLOWING IMAGE BACKGROUND */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} // Increased opacity slightly for richness
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2070" 
          className="w-full h-full object-cover" 
          alt="Solar background"
        />
        {/* Ensured the gradient is deep black */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </motion.div>

      {/* POPPING CONTENT */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="z-10 text-center max-w-5xl px-6"
      >
        <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-none mb-4 italic uppercase text-white">
          SOLARA<span className="text-solar">.</span>
        </h1>
        <p className="text-xl md:text-3xl font-light text-gray-300 uppercase tracking-widest mb-10">
          Hyperlocal AI Energy Optimization for the SpaceX Generation.
        </p>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 text-left mb-10 border-solar/20">
           <p className="text-sm text-gray-200 leading-relaxed font-mono">
             [SYSTEM OVERVIEW]: Solara synchronizes solar-dependent hardware with real-time atmospheric conditions. 
             Utilizing LSTM Hybrid AI Models, we provide 72-hour forecasts with 15-minute granularity. 
             Optimized for Tesla Powerwall, Aptera EV, and Garmin wearables.
           </p>
        </div>
        
        <Link 
          to="/dashboard" 
          className="inline-block bg-solar text-black font-bold py-5 px-16 uppercase tracking-[0.3em] hover:bg-white transition-all scale-110"
        >
          Enter Command Center
        </Link>
      </motion.div>
    </div>
  );
}