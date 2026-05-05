import React, { useRef, useEffect, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function GlobeView() {
  const navigate = useNavigate();
  const globeEl = useRef();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. PERSISTENT ROTATION: Ensures globe continues to spin
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.6;
    }
  }, []);

  const handleGlobeClick = async ({ lat, lng }) => {
    setLoading(true);
    try {
      // Nominatim API translates coordinates to City Name
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const city = res.data.address.city || res.data.address.town || res.data.address.state || res.data.address.country;
      
      if (city) {
        // Navigate to Dashboard with the city name as a URL parameter
        navigate(`/dashboard?city=${city.toLowerCase()}`);
      } else {
        alert("Location unknown. Click near a populated area.");
      }
    } catch (e) {
      console.error("Globe click failed", e);
      alert("Satellite connection unstable. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-mono">
      <div className="absolute top-32 left-10 z-10 pointer-events-none">
        <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black italic text-white uppercase leading-none mb-2"
        >
            Orbital<br/><span className="text-solar">Selector</span>
        </motion.h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">
            {loading ? "SYNCHRONIZING_COORDINATES..." : "Click surface to lock location"}
        </p>
      </div>

      <GlobeGL
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeClick={handleGlobeClick}
        atmosphereColor="#f97316"
        atmosphereAltitude={0.15}
      />

      <div className="absolute bottom-10 w-full text-center pointer-events-none">
         <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em]">360° Dynamic Rotation Active</p>
      </div>
    </div>
  );
}