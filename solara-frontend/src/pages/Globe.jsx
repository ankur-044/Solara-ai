import React, { useRef, useEffect, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GlobeView() {
  const navigate = useNavigate();
  const globeEl = useRef();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleGlobeClick = async ({ lat, lng }) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const city = res.data.address.city || res.data.address.town || res.data.address.state;
      if (city) navigate(`/dashboard?city=${city.toLowerCase()}`);
      else alert("Uncharted waters. Click on land.");
    } catch (e) {
      alert("Satellite link lost. Retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-mono">
      <div className="absolute top-32 left-10 z-10">
        <h1 className="text-5xl font-black italic text-white uppercase leading-none mb-2">Orbital<br/><span className="text-solar">Selector</span></h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{loading ? "Synchronizing Coordinates..." : "Click surface to lock location"}</p>
      </div>
      <GlobeGL
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeClick={handleGlobeClick}
        atmosphereColor="#f97316"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}