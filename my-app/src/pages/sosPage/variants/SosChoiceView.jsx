import React from 'react';
import { Wind, Anchor, ChevronLeft, Sparkles } from 'lucide-react';

const SosChoiceView = ({ onSelect, onExit }) => {
    return (
        <div className="fixed inset-0 bg-[#070a12] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />

            <button
                onClick={onExit}
                className="absolute top-12 left-12 flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"
            >
                <ChevronLeft size={18} /> На головну
            </button>

            <div className="text-center mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Sparkles size={12} /> Потрібна допомога
                </div>
                <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                    Ми поруч.
                </h1>
                <p className="text-slate-500 text-xl font-medium max-w-md mx-auto italic">
                    Оберіть техніку, яка допоможе вам відновити рівновагу прямо зараз.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
                {/* Breathing Choice */}
                <div 
                    onClick={() => onSelect('breathing')}
                    className="group relative h-96 rounded-[48px] overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.02]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-12 h-full flex flex-col justify-between text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Wind size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Техніка 4-4-6-2</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Дихання</h3>
                            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[200px]">
                                Допоможе заспокоїти серцебиття та зняти тривогу.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grounding Choice */}
                <div 
                    onClick={() => onSelect('grounding')}
                    className="group relative h-96 rounded-[48px] overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.02]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-12 h-full flex flex-col justify-between text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Anchor size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Техніка 5-4-3-2-1</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Заземлення</h3>
                            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[200px]">
                                Поверне вас у момент «тут і зараз» через органи чуття.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SosChoiceView;
