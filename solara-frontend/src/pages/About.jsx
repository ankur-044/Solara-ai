import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Zap, ShieldCheck } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen pt-24 px-6 md:px-20 bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-10 border-b border-solar pb-4">Mission Briefing</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section>
                        <h2 className="text-solar font-bold uppercase tracking-widest mb-4">01. The Purpose</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-mono">
                            Solara was engineered to bridge the gap between atmospheric volatility and energy hardware. 
                            Our platform synchronizes solar-dependent devices—from EVs to Powerwalls—with hyperlocal 
                            "Solar Windows" to ensure 100% charging efficiency.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-solar font-bold uppercase tracking-widest mb-4">02. Core Technology</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-mono">
                            By utilizing 15-minute granularity predictive nowcasting and Ensemble Data Ingestion 
                            (GHI, UV, AOD), our AI models account for micro-climates like coastal fog and urban heat islands.
                        </p>
                    </section>
                </div>

                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <Feature icon={<Cpu />} label="AI INFERENCE" />
                    <Feature icon={<Globe />} label="GEOFENCING" />
                    <Feature icon={<Zap />} label="OPTIMIZATION" />
                    <Feature icon={<ShieldCheck />} label="RELIABILITY" />
                </div>
            </motion.div>
        </div>
    );
}

const Feature = ({ icon, label }) => (
    <div className="flex flex-col items-center p-6 border border-gray-200 dark:border-white/10 group hover:border-solar transition-all">
        <div className="text-solar mb-4">{icon}</div>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{label}</span>
    </div>
);