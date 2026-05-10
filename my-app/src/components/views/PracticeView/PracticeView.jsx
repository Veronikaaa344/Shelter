import React, { useState } from 'react';
import { ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react';
import { api } from '../../../api/api';

const PracticeView = ({ 
    isActive, 
    setIsActive, 
    timer, 
    setTimer, 
    breathStage, 
    setBreathStage, 
    userId, 
    userStats, 
    setUserStats, 
    navigateTo 
}) => {
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [totalSessionTime, setTotalSessionTime] = useState(0);

    const handleStartSession = () => {
      setIsActive(true);
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
    };

    const handleEndSession = () => {
      setIsActive(false);
      if (sessionStartTime) {
        const sessionMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
        setTotalSessionTime(sessionMinutes);
        
        if (userId && sessionMinutes > 0) {
          api.recordBreathingSession(userId, sessionMinutes)
            .then(() => {
              if (userStats) {
                setUserStats({
                  ...userStats,
                  breathingSessions: {
                    ...userStats.breathingSessions,
                    count: (userStats.breathingSessions?.count || 0) + 1,
                    totalMinutes: (userStats.breathingSessions?.totalMinutes || 0) + sessionMinutes,
                    lastSession: new Date()
                  },
                  totalSessions: (userStats.totalSessions || 0) + 1,
                  totalMinutes: (userStats.totalMinutes || 0) + sessionMinutes
                });
              }
            })
            .catch((err) => console.error('Error saving breathing session:', err));
        }
        setSessionStartTime(null);
      }
    };

    const handleReset = () => {
      setTimer(4);
      setBreathStage('Вдих');
      setIsActive(false);
      setSessionStartTime(null);
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#0b0f1a] flex flex-col p-8 animate-in zoom-in duration-500 text-slate-300">
         <div className="flex justify-between items-center mb-12">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"><ChevronLeft size={20} /> Вийти</button>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Техніка дихання</span>
         </div>
         <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative mb-20">
               <div className={`absolute inset-0 bg-emerald-500/10 rounded-full transition-all duration-[4000ms] ${isActive && breathStage === 'Вдих' ? 'scale-150' : 'scale-100'}`}></div>
               <div className="w-64 h-64 border-8 border-emerald-500/20 rounded-full flex items-center justify-center relative z-10 transition-all duration-[4000ms] shadow-2xl shadow-emerald-900/5">
                  <div>
                     <h2 className="text-7xl font-black text-white italic mb-2 tracking-tighter leading-none">{timer}</h2>
                     <p className="text-xs font-black uppercase text-emerald-500 tracking-[0.2em]">{breathStage}</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-6">
               <button onClick={isActive ? handleEndSession : handleStartSession} className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'bg-white text-black hover:scale-105'}`}>
                  {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
               </button>
               <button onClick={handleReset} className="w-24 h-24 rounded-[32px] bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all"><RotateCcw size={32} /></button>
            </div>
            {totalSessionTime > 0 && (
              <div className="mt-8 text-emerald-400 text-sm">
                Сесія завершена: {totalSessionTime} хвилин
              </div>
            )}
         </div>
      </div>
    );
};

export default PracticeView;
