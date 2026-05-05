import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; // Ensure path is correct
import { 
  Sun, Zap, Navigation, Shield, AlertTriangle, 
  Thermometer, Wind, Cloud, Eye, Activity, Search, MapPin 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const { t } = useContext(AppContext); // Language Translation Hook
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  const initialCity = searchParams.get('city') || "kolkata";
  const [city, setCity] = useState(initialCity); 
  const [searchInput, setSearchInput] = useState("");

  const fetchRealData = async (targetCity) => {
    try {
      const res = await axios.post("https://solara-ai-otz6.onrender.com/api/v1/predict", { 
        city: targetCity 
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("COMMUNICATION_FAILURE: CHECK_BACKEND_OR_CORS");
    }
  };

  useEffect(() => {
    fetchRealData(city);
    const interval = setInterval(() => fetchRealData(city), 300000); 
    return () => clearInterval(interval);
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.toLowerCase());
      setSearchInput("");
    }
  };

  if (error) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-10 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-white">System Link Severed</h2>
        <button onClick={() => fetchRealData(city)} className="mt-8 border border-red-500 px-8 py-3 hover:bg-red-500 hover:text-white transition-all uppercase text-xs tracking-widest text-white text-white dark:text-white">Retry Connection</button>
    </div>
  );

  if (!data) return (
    <div className="h-screen bg-black flex items-center justify-center text-solar animate-pulse font-mono tracking-[1em]">
        INITIALIZING_ORBITAL_SYNC...
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-20 px-6 font-mono transition-colors duration-500 selection:bg-solar selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION 2.1: Search & Geofencing */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-gray-200 dark:border-white/10 pb-8">
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-solar transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="INPUT_GEOLOCATION..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-4 pl-14 pr-6 outline-none focus:border-solar transition-all uppercase text-xs tracking-widest italic text-black dark:text-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-black dark:text-white">{t('cmd_dash')}</h1>
            <p className="text-solar text-[10px] tracking-[0.4em] flex items-center justify-center md:justify-end gap-2 mt-3 uppercase">
              <MapPin size={12}/> GEOFENCE_ACTIVE: {data.location} | GPS: {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
            </p>
          </div>
        </div>

        {/* SECTION 2.1 & 3.1: Atmospheric Monitoring Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <MetricCard title={t('ghi')} value={data.irradiance} unit="W/m²" icon={<Sun size={14}/>} />
          <MetricCard title={t('uv')} value="7.2" unit="UVI" icon={<Activity size={14}/>} />
          <MetricCard title={t('cloud')} value="42" unit="%" icon={<Cloud size={14}/>} />
          <MetricCard title={t('aod')} value="0.14" unit="τ" icon={<Wind size={14}/>} />
          <MetricCard title={t('temp')} value="32" unit="°C" icon={<Thermometer size={14}/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 2.2: AI Forecasting */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 h-[400px] relative">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] mb-6 italic flex items-center gap-2">
                <Shield size={12}/> {t('predictive_title')}
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{t:'00:00', v:0}, {t:'06:00', v:200}, {t:'09:00', v:650}, {t:'12:00', v:920}, {t:'15:00', v:700}, {t:'18:00', v:150}, {t:'24:00', v:0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                <XAxis dataKey="t" stroke="#888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{background: '#000', border: '1px solid #333', fontSize: '10px'}} />
                <Area type="monotone" dataKey="v" stroke="#f97316" fill="#f9731620" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SECTION 4.0: Solar Clock */}
          <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 flex flex-col items-center justify-center relative group">
             <div className="absolute top-8 left-8 flex items-center gap-2">
                <Shield className="text-gray-400" size={12}/>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em]">Solar Clock</h3>
             </div>
             <div className="w-48 h-48 rounded-full border-[12px] border-gray-200 dark:border-white/5 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-t-[12px] border-solar animate-[spin_8s_linear_infinite]" />
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t('peak')}</p>
                <p className="text-4xl font-black italic text-black dark:text-white">{data.solar_windows[0]?.start || "N/A"}</p>
             </div>
          </div>

          {/* SECTION 2.3: Device Optimization */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-2">
                <Zap size={12}/> {t('device_lib')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.device_plan.map((dev, i) => (
                <div key={i} className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/60 hover:border-solar transition-all flex justify-between items-center group">
                  <div>
                    <p className="font-black text-sm uppercase italic text-black dark:text-gray-300 group-hover:text-solar transition-colors">{dev.device}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1 italic">{dev.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-solar uppercase tracking-widest mb-1">{dev.time || dev.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2.3 & 4.0: Live Alerts */}
          <div className="flex flex-col gap-4">
            <div className="bg-solar/5 border border-solar/20 p-8 flex-grow">
              <h3 className="text-solar font-bold uppercase text-[10px] tracking-[0.3em] mb-5 flex items-center gap-2"><AlertTriangle size={14}/> {t('alerts')}</h3>
              <div className="space-y-4">
                {data.analysis.alerts.map((a, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 h-8 bg-solar/30 self-center" />
                    <p className="text-[11px] text-gray-800 dark:text-gray-300 uppercase leading-relaxed italic font-light tracking-tighter">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Heat Throttling Protocol */}
            <div className="bg-red-500/5 border border-red-500/20 p-8">
              <div className="flex justify-between items-center mb-4 text-red-500">
                  <h3 className="font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                      <Thermometer size={14}/> Heat Protocol
                  </h3>
              </div>
              <p className="text-[11px] text-gray-500 uppercase italic leading-tight">Advisories active: Thermal monitoring in progress.</p>
            </div>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="mt-10 border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
           <p className="text-[9px] uppercase tracking-[0.4em]">Solara Systems // Orbital Telemetry Build 1.0.4</p>
           <div className="flex items-center gap-8">
              <span className="text-[9px] uppercase tracking-widest flex items-center gap-2">
                <Eye size={10} className="text-solar"/> Push Notifications: Active
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, icon }) {
  return (
    <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5 group hover:bg-white/10 transition-all cursor-default shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-3 group-hover:text-solar transition-colors">
        {icon} {title}
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-light italic text-black dark:text-white group-hover:scale-105 transition-transform duration-500">
          {value}
        </p>
        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{unit}</span>
      </div>
    </div>
  );
}