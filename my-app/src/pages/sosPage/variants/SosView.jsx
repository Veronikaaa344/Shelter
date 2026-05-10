import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import { Heart, ChevronLeft, Wind } from 'lucide-react';

const PHASES = [
    { label: "Вдих", duration: 4000, scale: 1.6, color: "rgba(16,185,129,0.4)" },
    { label: "Затримка", duration: 4000, scale: 1.6, color: "rgba(16,185,129,0.2)" },
    { label: "Видих", duration: 6000, scale: 1.0, color: "rgba(16,185,129,0.1)" },
    { label: "Пауза", duration: 2000, scale: 1.0, color: "rgba(16,185,129,0.05)" },
];

export default function SosView() {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [statusCheck, setStatusCheck] = useState(false);
    const [cycles, setCycles] = useState(0);
    const navigate = useNavigate();

    const phase = PHASES[phaseIndex];

    useEffect(() => {
        const timeout = setTimeout(() => {
            const nextIndex = (phaseIndex + 1) % PHASES.length;
            setPhaseIndex(nextIndex);
            if (nextIndex === 0) setCycles(prev => prev + 1);
        }, phase.duration);
        return () => clearTimeout(timeout);
    }, [phaseIndex]);

    // Після 3 циклів — запитати чи полегшало
    useEffect(() => {
        if (cycles >= 3) setStatusCheck(true);
    }, [cycles]);

    const handleStabilized = async () => {
        const userId = localStorage.getItem("userId");
        if (userId) await api.updateResilience(userId, 20, "sos", "Стабілізація (Дихання)");
        navigate("/main");
    };

    const handleNotBetter = () => {
        navigate("/main");
    };

    return (
        <div className="fixed inset-0 bg-[#070a12] flex flex-col items-center justify-center overflow-hidden">
            {/* Фонові кола */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/5 animate-pulse" />
                <div className="absolute w-[400px] h-[400px] rounded-full border border-emerald-500/5" style={{ animationDelay: '1s' }} />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/10" />
            </div>

            {/* Кнопка виходу */}
            <button
                onClick={() => navigate("/main")}
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-slate-300 font-bold uppercase text-xs tracking-widest transition-all duration-500 z-10"
            >
                <ChevronLeft size={18} /> Вийти
            </button>

            {/* Лічильник циклів */}
            <div className="absolute top-8 right-8 flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-widest">
                <Heart size={14} className="text-rose-500" />
                Цикл {cycles + 1}
            </div>

            {/* Основний контент */}
            <div className="flex flex-col items-center gap-12 z-10">
                <div className="text-center">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-3">Ти в безпеці</p>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Дихаємо разом</h1>
                </div>

                {/* Коло дихання */}
                <div className="relative flex items-center justify-center w-72 h-72">
                    {/* Зовнішнє кільце — пульсує разом з фазою */}
                    <div
                        className="absolute inset-0 rounded-full transition-all ease-in-out"
                        style={{
                            background: `radial-gradient(circle, ${phase.color} 0%, transparent 70%)`,
                            transform: `scale(${phase.scale})`,
                            transitionDuration: `${phase.duration}ms`,
                        }}
                    />

                    {/* Основне коло */}
                    <div
                        className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all ease-in-out"
                        style={{
                            background: 'rgba(16,185,129,0.08)',
                            border: '2px solid rgba(16,185,129,0.3)',
                            boxShadow: `0 0 60px ${phase.color}`,
                            transform: `scale(${phase.scale})`,
                            transitionDuration: `${phase.duration}ms`,
                        }}
                    >
                        <Wind size={28} className="text-emerald-400 mb-2" style={{ opacity: 0.7 }} />
                        <span
                            className="text-xl font-black text-emerald-400 uppercase tracking-widest"
                            key={phaseIndex}
                            style={{ animation: 'fadeLabel 0.5s ease-out' }}
                        >
                            {phase.label}
                        </span>
                        <span className="text-xs text-emerald-600 font-bold mt-1">
                            {phase.duration / 1000}с
                        </span>
                    </div>
                </div>

                {/* Підказка */}
                <div className="text-center max-w-xs">
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {phaseIndex === 0 && "Повільно вдихай через ніс, наповнюй живіт..."}
                        {phaseIndex === 1 && "Затримай дихання, відчуй тишу всередині..."}
                        {phaseIndex === 2 && "Повільно видихай через рот, відпускай напругу..."}
                        {phaseIndex === 3 && "Відпочинь перед наступним вдихом..."}
                    </p>
                </div>

                {/* Прогрес-бар */}
                <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all ease-linear"
                        style={{
                            width: `${Math.min((cycles / 3) * 100, 100)}%`,
                            transitionDuration: '1s',
                        }}
                    />
                </div>
            </div>

            {/* Запит після 3 циклів */}
            {statusCheck && (
                <div className="absolute inset-0 bg-[#070a12]/80 backdrop-blur-lg flex items-center justify-center z-20 animate-in fade-in duration-700">
                    <div className="bg-slate-900/80 border border-slate-700 rounded-[40px] p-12 max-w-md text-center shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Heart size={32} className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
                            Як ти зараз?
                        </h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Ти виконав {cycles} цикли дихання. Чи стало легше?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleStabilized}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20"
                            >
                                Так, стало краще 🌱
                            </button>
                            <button
                                onClick={handleNotBetter}
                                className="w-full border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                            >
                                Продовжити на головній
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeLabel {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
