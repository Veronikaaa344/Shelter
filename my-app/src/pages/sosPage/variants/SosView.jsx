import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import { Heart, Wind, ChevronLeft } from 'lucide-react';

const PHASES = [
    { label: "Вдих", duration: 4000, color: "rgba(16,185,129,0.4)" },
    { label: "Затримка", duration: 7000, color: "rgba(16,185,129,0.2)" },
    { label: "Видих", duration: 8000, color: "rgba(16,185,129,0.08)" }
];

export default function SosView({ answers }) {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [cycle, setCycle] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (phaseIndex === PHASES.length - 1) {
                if (cycle === 3) {
                    setShowModal(true);
                } else {
                    setCycle(c => c + 1);
                    setPhaseIndex(0);
                }
            } else {
                setPhaseIndex(p => p + 1);
            }
        }, PHASES[phaseIndex].duration);

        return () => clearTimeout(timer);
    }, [phaseIndex, cycle]);

    const handleFinish = async (helped) => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            const amount = helped ? 20 : 5;
            await api.updateResilience(userId, amount, "sos", "Техніка дихання (SOS)");
        }
        navigate("/main", { state: { fromSOS: true, helped } });
    };

    const phase = PHASES[phaseIndex];
    const scale = phaseIndex === 0 ? 1.5 : phaseIndex === 1 ? 1.5 : 1.0;

    return (
        <div className="fixed inset-0 bg-[#070a12] flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/5 animate-pulse" />
                <div className="absolute w-[400px] h-[400px] rounded-full border border-emerald-500/10" />
            </div>

            <div className="absolute top-12 left-12 flex items-center gap-3">
                <button onClick={() => navigate('/main')} className="text-slate-600 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <Heart size={14} className="text-rose-500" />
                    Цикл {cycle} / 3
                </div>
            </div>

            <div className="relative flex flex-col items-center gap-12 z-10">
                <div className="text-center">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Техніка 4-7-8</p>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Дихайте повільно</h1>
                </div>

                <div className="relative flex items-center justify-center w-64 h-64">
                    {/* Pulsing glow */}
                    <div 
                        className="absolute inset-0 rounded-full transition-all ease-in-out"
                        style={{ 
                            background: `radial-gradient(circle, ${phase.color} 0%, transparent 70%)`,
                            transform: `scale(${scale * 1.2})`,
                            transitionDuration: `${phase.duration}ms`
                        }}
                    />
                    
                    {/* Main circle */}
                    <div 
                        className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all ease-in-out"
                        style={{ 
                            background: 'rgba(16,185,129,0.06)',
                            border: '2px solid rgba(16,185,129,0.25)',
                            transform: `scale(${scale})`,
                            transitionDuration: `${phase.duration}ms`,
                            boxShadow: '0 0 40px rgba(16,185,129,0.1)'
                        }}
                    >
                        <Wind size={28} className="text-emerald-400 mb-2 opacity-60" />
                        <span key={phaseIndex} className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em] animate-in fade-in duration-500">
                            {phase.label}
                        </span>
                    </div>
                </div>

                <p className="text-slate-500 text-sm italic font-medium">Ви у безпеці. Все добре.</p>
            </div>

            {showModal && (
                <div className="absolute inset-0 bg-[#070a12]/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-500">
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-[40px] max-w-sm w-full text-center shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Heart size={40} className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase mb-4 tracking-tighter leading-none">Як ви почуваєтесь?</h2>
                        <p className="text-slate-400 mb-10 text-lg italic">Чи стало вам легше після вправи?</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => handleFinish(true)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Так, допомогло 🌱</button>
                            <button onClick={() => handleFinish(false)} className="w-full border border-slate-800 text-slate-500 hover:text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all">Не зовсім</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
