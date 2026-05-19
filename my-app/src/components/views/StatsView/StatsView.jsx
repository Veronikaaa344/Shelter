import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    LabelList
} from 'recharts';
import { Leaf, TreeDeciduous, Zap, Sprout, Shrub, Trees } from 'lucide-react';

const StatsView = ({ userStats, resilience = 50, resilienceMultiplier = 1.0, completedCount = 0, isVisible }) => {
    // console.log('📊 StatsView: Received Props', { userStats, resilience, resilienceMultiplier, completedCount, isVisible });
    
    const getTreeIcon = () => {
        if (resilience <= 30) {
            return <Sprout size={160} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />;
        } else if (resilience <= 60) {
            return <Shrub size={160} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500" />;
        } else if (resilience <= 85) {
            return <TreeDeciduous size={160} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500" />;
        } else {
            return <Trees size={160} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500" />;
        }
    };
    
    // Формуємо дані для графіка з історії резильєнтності
    let rawHistory = [];
    if (userStats?.resilience?.history) {
        rawHistory = userStats.resilience.history.map(h => ({ date: h.date, val: h.value }));
    } else if (userStats?.history) {
        rawHistory = userStats.history.map(h => ({ date: h.date, val: h.newScore || h.value }));
    }
    
    const historyData = (rawHistory.length > 0) 
        ? [...rawHistory].slice().reverse().slice(0, 10).reverse().map(h => ({
            date: h.date,
            val: h.val
        })) 
        : [{ date: new Date(), val: resilience }]; 

    const treeScale = 0.5 + (resilience / 100) * 0.5;
    const leafCount = Math.max(0, completedCount); 

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
           <style>{`
               .recharts-cartesian-grid-horizontal line { stroke: #1e293b; }
               .recharts-cartesian-grid-vertical line { display: none; }
           `}</style>
           {/* Section 1: Garden Visualization */}
           <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Сад Стійкості</h2>
                </div>
                
                <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[48px] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                    <div className="relative flex items-center justify-center w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                        <div 
                            className="transition-all duration-1000 ease-out flex items-center justify-center"
                            style={{ transform: `scale(${treeScale})` }}
                        >
                            {getTreeIcon()}
                        </div>
                        
                        {[...Array(Math.min(leafCount, 20))].map((_, i) => (
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

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Історія активності</h2>
                </div>
                
                <div className="space-y-4">
                    {(userStats?.activities || userStats?.history || []).slice().reverse().slice(0, 5).map((act, i) => (
                        <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${act.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{act.name || act.activityName || 'Активність'}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{new Date(act.date).toLocaleDateString()} • {act.type || act.activityType}</p>
                                </div>
                            </div>
                            <div className={`text-xl font-black italic ${act.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {act.change >= 0 ? `+${act.change}` : act.change}
                            </div>
                        </div>
                    ))}
                    
                    {!(userStats?.activities || userStats?.history || []).length && (
                        <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[40px]">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Історія поки порожня</p>
                        </div>
                    )}
                </div>
           </section>

           <section className="space-y-6 pb-12">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Аналітика прогресу</h2>
                </div>
                <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[48px] shadow-2xl backdrop-blur-xl h-96 min-h-[400px]">
                    {isVisible ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={historyData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(str) => {
                                        try {
                                            const d = new Date(str);
                                            return isNaN(d.getTime()) ? '?' : d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                                        } catch (e) {
                                            return '?';
                                        }
                                    }}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#0f172a', 
                                        border: 'none', 
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#10b981' }}
                                    labelFormatter={(label) => {
                                        try {
                                            const d = new Date(label);
                                            if (isNaN(d.getTime())) return label;
                                            const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                                            const date = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                                            return `${time} ${date}`;
                                        } catch (e) {
                                            return label;
                                        }
                                    }}
                                    formatter={(value) => [`${value}%`, 'Стійкість']}
                                />
                                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)">
                                    <LabelList 
                                        dataKey="val" 
                                        position="top" 
                                        offset={12} 
                                        style={{ fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} 
                                        formatter={(val) => `${val}%`}
                                    />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
           </section>
        </div>
    );
};

export default StatsView;
