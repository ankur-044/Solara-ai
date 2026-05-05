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
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') || "kolkata";

  const fetchRealData = async (targetCity) => {
    try {
      // Using your LIVE Render URL
      const res = await axios.post("https://solara-ai-otz6.onrender.com/api/v1/predict", { 
        city: targetCity 
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("CONNECTION_FAILED");
    }
  };

  useEffect(() => {
    fetchRealData(city);
    const interval = setInterval(() => fetchRealData(city), 300000); 
    return () => clearInterval(interval);
  }, [city]); 

  if (error) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-10 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold uppercase text-white">System Link Severed</h2>
        <button onClick={() => fetchRealData(city)} className="mt-8 border border-red-500 px-8 py-3 hover:bg-red-500 hover:text-white text-white uppercase text-xs tracking-widest">Retry Sync</button>
    </div>
  );

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-solar animate-pulse font-mono tracking-[1em]">SYNCING_REAL_DATA...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-20 px-6 font-mono transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-gray-200 dark:border-white/10 pb-8">
          <div className="w-full md:w-1/2">
            <form onSubmit={(e) => { e.preventDefault(); setSearchParams({ city: searchInput.toLowerCase() }); }}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="SEARCH_LOCATION..."
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-4 pl-14 pr-6 outline-none focus:border-solar text-black dark:text-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black italic uppercase text-black dark:text-white">{t('cmd_dash')}</h1>
            <p className="text-solar text-[10px] tracking-[0.4em] flex items-center justify-center md:justify-end gap-2 mt-3 uppercase">
              <MapPin size={12}/> GEOFENCE: {data.location} | GPS: {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Real Metrics Only */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <MetricCard title="IRRADIANCE" value={data.irradiance} unit="W/m²" icon={<Sun size={14}/>} />
          <MetricCard title="CONFIDENCE" value={data.analysis.confidence} unit="%" icon={<Shield size={14}/>} />
          {/* These will show "NO DATA" if your backend doesn't send them */}
          <MetricCard title="UV INDEX" value={data.uv_index || "NO DATA"} unit="" icon={<Activity size={14}/>} />
          <MetricCard title="CLOUD COVER" value={data.cloud_cover || "NO DATA"} unit="" icon={<Cloud size={14}/>} />
          <MetricCard title="TEMP" value={data.temperature || "NO DATA"} unit="" icon={<Thermometer size={14}/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Graph Section: Only visible if your backend sends the 'ghi_forecast' array */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 h-[400px] relative">
            <h3 className="text-[10px] font-bold text-gray-500 mb-6 uppercase italic">AI Forecast Data Stream</h3>
            {!data.ghi_forecast ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-[10px] uppercase italic">
                    Waiting for backend forecast array (ghi_forecast)...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.ghi_forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                        <XAxis dataKey="time" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="yield" stroke="#f97316" fill="#f9731620" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Solar Clock (Real Data) */}
          <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8 flex flex-col items-center justify-center relative">
             <div className="w-48 h-48 rounded-full border-[12px] border-gray-200 dark:border-white/5 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-t-[12px] border-solar animate-[spin_8s_linear_infinite]" />
                <p className="text-[9px] text-gray-500 uppercase">NEXT PEAK</p>
                <p className="text-4xl font-black italic text-black dark:text-white">{data.solar_windows[0]?.start || "N/A"}</p>
                <p className="text-[10px] text-solar font-bold uppercase">{data.solar_windows[0]?.quality}</p>
             </div>
          </div>

          {/* Device Optimization (Real Data) */}
          <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 p-8">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-8 italic">Active Device Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.device_plan.map((dev, i) => (
                <div key={i} className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/60 flex justify-between items-center">
                  <div>
                    <p className="font-black text-sm uppercase italic text-black dark:text-gray-300">{dev.device}</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1 leading-tight">{dev.reason}</p>
                  </div>
                  <p className="text-[10px] font-bold text-solar uppercase">{dev.time || dev.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real Alerts Only */}
          <div className="bg-solar/5 border border-solar/20 p-8 flex-grow">
            <h3 className="text-solar font-bold uppercase text-[10px] mb-5 flex items-center gap-2"><AlertTriangle size={14}/> System Alerts</h3>
            {data.analysis.alerts.map((a, i) => (
              <p key={i} className="text-[11px] text-gray-800 dark:text-gray-300 italic border-l-2 border-solar/30 pl-4 mb-3">• {a.toUpperCase()}</p>
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
      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
        {icon} {title}
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-light italic text-black dark:text-white">
          {value}
        </p>
        <span className="text-[9px] text-gray-500 uppercase font-bold">{unit}</span>
      </div>
    </div>
  );
}