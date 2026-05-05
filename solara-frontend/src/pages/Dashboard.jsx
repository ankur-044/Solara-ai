import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; 
import { Sun, Zap, Navigation, Shield, AlertTriangle, Thermometer, Wind, Cloud, Eye, Activity, Search, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const context = useContext(AppContext);
  const t = context ? context.t : (key) => key; 

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get city from URL
  const city = searchParams.get('city') || "kolkata";

  const fetchRealData = async (targetCity) => {
    try {
      const res = await axios.post("https://solara-ai-otz6.onrender.com/api/v1/predict", { 
        city: targetCity 
      });
      
      // If backend returns an error object, handle it
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      setError("SERVER_OFFLINE_OR_CORS_ISSUE");
    }
  };

  useEffect(() => {
    fetchRealData(city);
  }, [city]); 

  // Error State
  if (error) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-10 text-center">
      <AlertTriangle size={50} className="mb-4 animate-pulse" />
      <h1 className="text-xl font-bold uppercase">Mission Failure</h1>
      <p className="text-gray-500 text-xs mt-2 uppercase">{error}</p>
      <button onClick={() => window.location.href='/dashboard'} className="mt-8 border border-red-500 px-6 py-2 hover:bg-red-500 hover:text-white transition-all text-xs">RESET_ORBITAL_LINK</button>
    </div>
  );

  // Loading State
  if (!data) return (
    <div className="h-screen bg-black flex items-center justify-center text-solar animate-pulse font-mono tracking-[1em]">
      SYNCING_DATA...
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-20 px-6 font-mono transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-gray-200 dark:border-white/10 pb-8">
          <div className="w-full md:w-1/2">
            <form onSubmit={(e) => { e.preventDefault(); setSearchParams({ city: searchInput.toLowerCase() }); }} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH_LOCATION..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-4 pl-14 pr-6 outline-none focus:border-solar text-black dark:text-white uppercase italic text-xs"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black italic uppercase text-black dark:text-white leading-none">{t('cmd_dash')}</h1>
            <p className="text-solar text-[10px] tracking-[0.4em] mt-3 uppercase">
              <MapPin size={10} className="inline mr-1"/> {data?.location || "UNKNOWN"} | GPS: {data?.lat?.toFixed(2) || "0"}, {data?.lon?.toFixed(2) || "0"}
            </p>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <MetricCard title={t('ghi')} value={data?.irradiance} unit="W/m²" icon={<Sun size={14}/>} />
          <MetricCard title={t('uv')} value={data?.uv_index || "0.0"} unit="UVI" icon={<Activity size={14}/>} />
          <MetricCard title={t('cloud')} value={data?.cloud_cover || "0"} unit="%" icon={<Cloud size={14}/>} />
          <MetricCard title={t('aod')} value={data?.aod || "0.0"} unit="τ" icon={<Wind size={14}/>} />
          <MetricCard title={t('temp')} value={data?.temperature || "0"} unit="°C" icon={<Thermometer size={14}/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Graph Section */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 h-[400px]">
            <h3 className="text-[10px] font-bold text-gray-500 mb-6 italic uppercase">{t('predictive_title')}</h3>
            {data?.ghi_forecast?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.ghi_forecast}>
                        <XAxis dataKey="t" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip contentStyle={{background: '#000', border: '1px solid #333', color: '#fff'}} />
                        <Area type="monotone" dataKey="v" stroke="#f97316" fill="#f9731620" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs italic uppercase">No Forecast Stream Available</div>
            )}
          </div>

          {/* Solar Clock */}
          <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 flex flex-col items-center justify-center relative">
             <div className="w-48 h-48 rounded-full border-[12px] border-gray-200 dark:border-white/5 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-t-[12px] border-solar animate-[spin_10s_linear_infinite]" />
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{t('peak')}</p>
                <p className="text-4xl font-black italic text-black dark:text-white">{data?.solar_windows?.[0]?.start || "N/A"}</p>
             </div>
          </div>

          {/* Device Library */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8">
            <h3 className="text-[10px] font-bold text-gray-500 mb-8 italic uppercase">{t('device_lib')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.device_plan?.map((dev, i) => (
                <div key={i} className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/60 hover:border-solar transition-all flex justify-between items-center group">
                  <div>
                    <p className="font-black text-sm uppercase italic text-black dark:text-gray-300 group-hover:text-solar">{dev?.device}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{dev?.reason}</p>
                  </div>
                  <p className="text-[10px] font-bold text-solar uppercase">{dev?.time || dev?.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-solar/5 border border-solar/20 p-8 flex-grow">
            <h3 className="text-solar font-bold uppercase text-[10px] mb-5 flex items-center gap-2"><AlertTriangle size={14}/> {t('alerts')}</h3>
            {data?.analysis?.alerts?.map((a, i) => (
              <p key={i} className="text-[11px] text-gray-800 dark:text-gray-300 italic border-l-2 border-solar/30 pl-4 mb-2 uppercase">• {a}</p>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, icon }) {
  return (
    <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5 group hover:bg-white/10 transition-all cursor-default">
      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase mb-3 group-hover:text-solar">{icon} {title}</div>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-light italic text-black dark:text-white">{value ?? "0"}</p>
        <span className="text-[9px] text-gray-500 uppercase font-bold">{unit}</span>
      </div>
    </div>
  );
}