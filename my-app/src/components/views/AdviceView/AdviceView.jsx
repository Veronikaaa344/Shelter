import React, { useEffect, useState } from 'react';
import { ChevronRight, Activity, Trophy, Brain, Sparkles, Lightbulb, Clock } from 'lucide-react';
import { api } from '../../../infrastructure/api/api';
import { useNavigate } from 'react-router-dom';

const AdviceView = () => {
    const [advices, setAdvices] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const colors = [
        "from-blue-500/20 to-indigo-600/20",
        "from-emerald-500/20 to-teal-600/20",
        "from-orange-500/20 to-rose-600/20",
        "from-purple-500/20 to-fuchsia-600/20",
        "from-cyan-500/20 to-blue-600/20"
    ];

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [advicesData, materialsRes] = await Promise.all([
                    api.getAdvice(),
                    api.getMaterials()
                ]);
                
                if (Array.isArray(advicesData)) setAdvices(advicesData);
                if (Array.isArray(materialsRes)) setMaterials(materialsRes);
            } catch (err) {
                console.error("Error loading knowledge:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest italic">
                Завантаження знань...
            </div>
        );
    }

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="space-y-4">
                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Поради та Стратегії</h2>
                <p className="text-slate-500 font-medium text-lg">Науково обґрунтовані методи зміцнення вашої ментальної броні.</p>
            </header>

            {/* Dynamic Advices from DB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advices.map((advice, i) => (
                    <div 
                        key={advice._id || i} 
                        className={`p-10 rounded-[48px] border border-white/5 bg-gradient-to-br ${colors[i % colors.length]} backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all duration-500`}
                    >
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                                <Lightbulb className="text-white/80" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight italic leading-tight">{advice.title}</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">{advice.text}</p>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Lightbulb size={160} className="text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic Articles from API */}
            {materials.length > 0 && (
                <div className="space-y-8 mt-20">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-widest border-l-4 border-emerald-500 pl-6">Глибоке вивчення</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {materials.map((m) => (
                            <div 
                                key={m._id} 
                                onClick={() => navigate(`/material/${m._id}`)}
                                className="p-8 rounded-[32px] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group"
                            >
                                <h4 className="text-lg font-bold text-white mb-6 leading-tight group-hover:text-emerald-400 transition-colors">{m.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                                    Читати статтю <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdviceView;
