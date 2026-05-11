import React, { useEffect, useState } from 'react';
import { ChevronRight, Activity, Trophy, Brain, Sparkles, Lightbulb, Clock } from 'lucide-react';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';

const AdviceView = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getMaterials()
            .then(data => {
                if (Array.isArray(data)) {
                    setMaterials(data);
                }
            })
            .catch(err => console.error("Error loading materials:", err))
            .finally(() => setLoading(false));
    }, []);

    const staticAdvices = [
        { 
            title: "Полівагальна теорія: Безпека тіла", 
            text: "Ваша нервова система реагує на загрози швидше, ніж мозок. Використовуйте техніку 'Полоскання горла' або холодної води на обличчя, щоб миттєво активувати блукаючий нерв та заспокоїтись.",
            color: "from-blue-500/20 to-indigo-600/20",
            icon: <Activity className="text-blue-400" />
        },
        { 
            title: "Принцип маленьких перемог", 
            text: "Дофамін виділяється не від результату, а від очікування успіху. Розбивайте великі цілі на завдання по 5 хвилин. Кожна галочка в списку — це біологічне паливо для вашої стійкості.",
            color: "from-emerald-500/20 to-teal-600/20",
            icon: <Trophy className="text-emerald-400" />
        },
        { 
            title: "Вікно толерантності", 
            text: "Навчіться розпізнавати стани гіперзбудження (гнів) та гіпозбудження (апатія). Ваша мета — залишатися в 'вікні', де ви можете обробляти емоції, не втрачаючи контроль.",
            color: "from-orange-500/20 to-rose-600/20",
            icon: <Brain className="text-orange-400" />
        },
        { 
            title: "Цифрова резильєнтність", 
            text: "Ми часто використовуємо скролінг як спосіб втечі, але це лише виснажує ресурс уваги. Спробуйте 'Правило 20-20-20': кожні 20 хв дивіться на 20 метрів вдалину протягом 20 секунд.",
            color: "from-purple-500/20 to-fuchsia-600/20",
            icon: <Sparkles className="text-purple-400" />
        }
    ];

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

            {/* Static Pro Advices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staticAdvices.map((advice, i) => (
                    <div 
                        key={i} 
                        className={`p-10 rounded-[48px] border border-white/5 bg-gradient-to-br ${advice.color} backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all duration-500`}
                    >
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                                {advice.icon}
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight italic leading-tight">{advice.title}</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">{advice.text}</p>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            {React.cloneElement(advice.icon, { size: 160 })}
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
