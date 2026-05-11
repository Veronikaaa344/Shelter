import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';

const AdviceView = () => {
    const [advices, setAdvices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getMaterials()
            .then(data => {
                if (Array.isArray(data)) {
                    // Вибираємо матеріали для порад (наприклад, останні 4 або за категорією)
                    setAdvices(data.slice(0, 4));
                }
            })
            .catch(err => console.error("Error loading advices:", err))
            .finally(() => setLoading(false));
    }, []);

    const getCatLabel = (cat) => {
        const labels = {
            'stress': 'Фізіологія',
            'general': 'Психологія',
            'anxiety': 'Практика',
            'apathy': 'Наука'
        };
        return labels[cat] || 'Загальне';
    };

    const getColorClass = (cat) => {
        const colors = {
            'stress': 'border-blue-500/30 bg-blue-500/5',
            'general': 'border-purple-500/30 bg-purple-500/5',
            'anxiety': 'border-emerald-500/30 bg-emerald-500/5',
            'apathy': 'border-orange-500/30 bg-orange-500/5'
        };
        return colors[cat] || 'border-slate-500/30 bg-slate-500/5';
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                Завантаження корисних порад...
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Поради та Знання</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advices.map((advice, i) => (
                    <div 
                        key={advice._id || i} 
                        onClick={() => navigate(`/material/${advice._id}`)}
                        className={`p-10 robust-rounded-48 border-2 group cursor-pointer transition-all hover:scale-[1.02] ${getColorClass(advice.category)} shadow-xl shadow-black/20 text-left`}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            {getCatLabel(advice.category)}
                        </p>
                        <h4 className="text-xl font-bold text-white uppercase leading-none tracking-tight">
                            {advice.title}
                        </h4>
                        <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-white transition-all italic">
                            Читати статтю <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdviceView;
