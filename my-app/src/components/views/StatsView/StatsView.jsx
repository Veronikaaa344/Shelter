import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    TrendingUp,
    Zap,
    Heart
} from 'recharts';
import { Leaf, TreeDeciduous } from 'lucide-react';

const StatsView = ({ userStats, resilience = 50, completedCount = 0 }) => {
    // Формуємо дані для графіка з історії резильєнтності
    // Формуємо дані для графіка з історії резильєнтності
    const historyData = (userStats?.resilience?.history && userStats.resilience.history.length > 0) 
        ? userStats.resilience.history.map(h => {
            const date = new Date(h.date);
            const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            return {
                day: days[date.getDay()],
                val: h.value
            };
        }) 
        : [{ day: 'Сьогодні', val: resilience }]; // Якщо історії немає, показуємо лише поточну точку

    // Розрахунок росту дерева (Resilience Garden)
    const treeScale = 0.5 + (resilience / 100) * 0.5;
    const leafCount = Math.max(0, completedCount); // Використовуємо реальну кількість виконаних завдань

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
           {/* Section 1: Garden Visualization */}
           <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Сад Стійкості</h2>
                </div>
                
                <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[48px] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                    {/* The Tree */}
                    <div className="relative flex items-center justify-center w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                        <div 
                            className="transition-all duration-1000 ease-out flex items-center justify-center"
                            style={{ transform: `scale(${treeScale})` }}
                        >
                            <TreeDeciduous size={160} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                        </div>
                        
                        {/* Interactive Leaves */}
                        {[...Array(leafCount)].map((_, i) => (
                            <div 
                                key={i} 
                                className="absolute animate-bounce" 
                                style={{ 
                                    top: `${20 + Math.random() * 60}%`, 
                                    left: `${20 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    opacity: 0.6
                                }}
                            >
                                <Leaf size={16} className="text-emerald-300" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Ваше дерево росте</h3>
                            <p className="text-slate-400 max-w-md">Ваша стійкість — це живий організм. Чим частіше ви практикуєте, тим міцнішим стає коріння вашого ментального здоров'я.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-6 rounded-[32px] border border-slate-700/30">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Рівень стійкості</p>
                                <p className="text-3xl font-black text-white italic">{resilience}%</p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-[32px] border border-slate-700/30">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Зібрано артефактів</p>
                                <p className="text-3xl font-black text-white italic">{leafCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
           </section>

           {/* Section 2: Resilience Graph */}
           <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Аналітика прогресу</h2>
                </div>
                <div className="bg-slate-900/30 border border-slate-800 p-10 robust-rounded-48 shadow-2xl backdrop-blur-xl h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                            <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}} />
                            <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
           </section>
        </div>
    );
};

export default StatsView;
