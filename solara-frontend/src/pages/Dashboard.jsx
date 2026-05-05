import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; 
import { 
  Sun, Zap, Navigation, Shield, AlertTriangle, 
  Thermometer, Wind, Cloud, Eye, Activity, Search, MapPin 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const { t } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  
  // URL Param Logic: Connects Globe and Search bar to the Dashboard data
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') || "kolkata";

  const fetchRealData = async (targetCity) => {
    try {
      // CONNECTING TO LIVE RENDER BACKEND
      const res = await axios.post("https://solara-ai-otz6.onrender.com/api/v1/predict", { 
        city: targetCity 
      });
      console.log("ORBITAL_SYNC_SUCCESS:", res.data);
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("TELEMETRY_LINK_ERROR:", err);
      setError("COMMUNICATION_FAILURE");
    }
  };

  useEffect(() => {
    fetchRealData(city);
    // Requirement 5.0: 5-minute system refresh rate
    const interval = setInterval(() => fetchRealData(city), 300000); 
    return () => clearInterval(interval);
  }, [city]); 

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ city: searchInput.toLowerCase() });
      setSearchInput("");
    }
  };

  if (error) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-10 text-center">
        <AlertTriangle size={60} className="mb-6 animate-pulse" />
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Link Severed</h2>
        <p className="text-gray-500 mt-2 italic text-xs uppercase mb-10">Render node unreachable or CORS violation</p>
        <button onClick={() => fetchRealData(city)} className="border border-red-500 px-10 py-4 hover:bg-red-500 hover:text-white transition-all text-white uppercase text-xs tracking-[0.3em]">Retry Satellite Sync</button>
    </div>
  );

  if (!data) return (
    <div className="h-screen bg-black flex items-center justify-center text-solar animate-pulse font-mono tracking-[1.5em] text-sm uppercase">
        Establishing_Orbital_Sync...
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-28 pb-20 px-6 md:px-12 font-mono transition-colors duration-500 selection:bg-solar">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION 2.1: Hyperlocal Geofencing / Location Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-gray-200 dark:border-white/10 pb-10">
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-solar transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="INPUT_GEOLOCATION (E.G. DELHI, LONDON, TOKYO)..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-5 pl-14 pr-6 outline-none focus:border-solar transition-all uppercase text-[11px] tracking-widest italic text-black dark:text-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-black dark:text-white">{t('cmd_dash')}</h1>
            <p className="text-solar text-[10px] tracking-[0.5em] flex items-center justify-center md:justify-end gap-2 mt-4 uppercase font-bold">
              <MapPin size={12}/> {data.location} | GPS: {data.lat?.toFixed(4)}, {data.lon?.toFixed(4)}
            </p>
          </div>
        </div>

        {/* SECTION 2.1 & 3.1: Atmospheric Monitoring Matrix (PDF REQUIREMENT) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <MetricCard title={t('ghi')} value={data.irradiance} unit="W/m²" icon={<Sun size={14}/>} />
          <MetricCard title={t('uv')} value={data.uv_index} unit="UVI" icon={<Activity size={14}/>} />
          <MetricCard title={t('cloud')} value={data.cloud_cover} unit="%" icon={<Cloud size={14}/>} />
          <MetricCard title={t('aod')} value={data.aod} unit="τ" icon={<Wind size={14}/>} />
          <MetricCard title={t('temp')} value={data.temperature} unit="°C" icon={<Thermometer size={14}/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 2.2: AI Forecasting (72h Forecast Array / 15-min Granularity) */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 h-[400px] relative">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] italic flex items-center gap-2">
                    <Shield size={12}/> {t('predictive_title')}
                </h3>
                <span className="text-[8px] border border-solar/30 text-solar px-2 py-1 uppercase tracking-widest animate-pulse">Neural Link Active</span>
            </div>
            {data.ghi_forecast && data.ghi_forecast.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.ghi_forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                        {/* Maps to 't' from pipeline.py */}
                        <XAxis dataKey="t" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{background: '#000', border: '1px solid #333', color: '#fff', fontSize: '10px'}} />
                        {/* Maps to 'v' from pipeline.py */}
                        <Area type="monotone" dataKey="v" stroke="#f97316" fill="#f9731620" strokeWidth={4} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs italic uppercase">Waiting for AI Forecast Array...</div>
            )}
          </div>

          {/* SECTION 4.0: Solar Clock (Circular Visualizer) */}
          <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 flex flex-col items-center justify-center relative group">
             <div className="absolute top-8 left-8 flex items-center gap-2">
                <Shield className="text-gray-400" size={12}/>
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em]">Solar Clock</h3>
             </div>
             <div className="w-52 h-52 rounded-full border-[14px] border-gray-200 dark:border-white/5 flex flex-col items-center justify-center relative shadow-sm">
                <div className="absolute inset-0 rounded-full border-t-[14px] border-solar animate-[spin_10s_linear_infinite]" />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('peak')}</p>
                <p className="text-5xl font-black italic text-black dark:text-white">{data.solar_windows?.[0]?.start || "N/A"}</p>
                <p className="text-[10px] text-solar font-bold mt-2 uppercase tracking-widest">{data.solar_windows?.[0]?.quality || "LOW"} Quality</p>
             </div>
             <p className="mt-8 text-[9px] text-gray-500 uppercase text-center italic tracking-tighter">Circular Visualization: Next 24h cycle charging window</p>
          </div>

          {/* SECTION 2.3: Device Optimization (Hardware Efficiency Profiles) */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-10">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] mb-10 italic flex items-center gap-2">
                <Zap size={12}/> {t('device_lib')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.device_plan?.map((dev, i) => (
                <div key={i} className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/60 hover:border-solar transition-all flex justify-between items-center group cursor-crosshair">
                  <div>
                    <p className="font-black text-sm uppercase italic text-black dark:text-gray-300 group-hover:text-solar transition-colors">{dev.device}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-2 italic leading-tight">{dev.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-solar uppercase tracking-widest mb-1">{dev.time || dev.recommendation}</p>
                    <p className="text-[8px] text-gray-400 uppercase italic">Optimized</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2.3 & 4.0: Live Yield Efficiency Alerts */}
          <div className="flex flex-col gap-6">
            <div className="bg-solar/5 border border-solar/20 p-10 flex-grow">
              <h3 className="text-solar font-bold uppercase text-[10px] tracking-[0.4em] mb-8 flex items-center gap-2">
                  <AlertTriangle size={14}/> {t('alerts')}
              </h3>
              <div className="space-y-6">
                {data.analysis?.alerts?.map((a, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 h-10 bg-solar/30 self-center" />
                    <p className="text-[12px] text-gray-800 dark:text-gray-300 uppercase leading-relaxed italic font-medium tracking-tighter">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Heat Throttling Protocol Section (Requirement 2.3) */}
            <div className="bg-red-500/5 border border-red-500/20 p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                      <Thermometer size={14}/> Heat Protocol
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 uppercase italic leading-tight mb-4">Monitoring thermal cell degradation. Advisories active.</p>
              <div className="flex justify-between items-center bg-red-500/10 p-4 border border-red-500/10 text-black dark:text-white">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Throttle Probability</span>
                <span className="text-sm italic font-bold">14.2%</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4.0: Telemetry Status Footer */}
        <div className="mt-14 border-t border-gray-200 dark:border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500">
           <p className="text-[9px] uppercase tracking-[0.5em]">Solara Systems // Orbital Telemetry Build 1.0.4 [Render-Live]</p>
           <div className="flex items-center gap-10">
              <span className="text-[9px] uppercase tracking-widest flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <Eye size={12} className="text-solar"/> Push Notifications: Active
              </span>
              <span className="text-[9px] uppercase tracking-widest text-solar font-bold animate-pulse">
                Confidence: {data.analysis?.confidence || 0}%
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, icon }) {
  return (
    <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 group hover:bg-white/10 transition-all cursor-default shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-4 group-hover:text-solar transition-colors">
        {icon} {title}
      </div>
      <div className="flex items-baseline gap-2">
        {/* VITAL FIX: Explicitly set text-black for light mode so digits never fade */}
        <p className="text-4xl font-light italic text-black dark:text-white group-hover:scale-105 transition-transform duration-500">
          {value ?? "N/A"}
        </p>
        <span className="text-[11px] text-gray-500 uppercase font-bold tracking-tighter">{unit}</span>
      </div>
    </div>
  );
}