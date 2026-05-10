import React, { useState } from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { api } from '../../../api/api';

const DiaryView = ({ 
    diaryEntry, 
    setDiaryEntry, 
    selectedMood, 
    setSelectedMood, 
    userId, 
    userStats, 
    setUserStats 
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSaveDiary = () => {
      if (!diaryEntry.trim() || selectedMood === null) {
        setSaveMessage('Будь ласка, напишіть щось та виберіть настрій');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }

      setIsSaving(true);
      setSaveMessage('');

      if (userId) {
        api.addDiaryEntry(userId, selectedMood, diaryEntry.trim())
          .then(() => {
            setSaveMessage('✅ Нотатку збережено!');
            setDiaryEntry('');
            setSelectedMood(null);
            
            if (userStats) {
              setUserStats({
                ...userStats,
                diaryEntries: [
                  {
                    date: new Date(),
                    mood: selectedMood,
                    content: diaryEntry.trim(),
                    wordCount: diaryEntry.trim().split(' ').length
                  },
                  ...(userStats.diaryEntries || [])
                ]
              });
            }
          })
          .catch((err) => {
            console.error('Error saving diary entry:', err);
            setSaveMessage('❌ Помилка збереження');
          })
          .finally(() => {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
          });
      }
    };

    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Щоденник рефлексії</h2>
        <div className="bg-slate-900/40 border border-slate-800 p-8 robust-rounded-48 backdrop-blur-xl shadow-2xl space-y-8 text-left">
          <textarea 
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
            placeholder="Опишіть ваші відчуття сьогодні..."
            className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-[24px] p-6 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
          ></textarea>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Мій стан:</span>
              <div className="flex gap-2">
                {[Smile, Meh, Frown].map((Icon, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedMood(idx)} 
                    className={`p-4 rounded-2xl transition-all ${selectedMood === idx ? 'bg-slate-700 scale-110 shadow-lg' : 'bg-slate-800/50 opacity-40 hover:opacity-100'}`}
                  >
                    <Icon size={24} className={idx === 0 ? 'text-emerald-500' : idx === 1 ? 'text-amber-500' : 'text-rose-500'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('✅') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {saveMessage}
                </span>
              )}
              <button 
                onClick={handleSaveDiary}
                disabled={isSaving}
                className="bg-emerald-500 text-[#0b0f1a] px-12 py-4 rounded-2xl font-black uppercase text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Збереження...' : 'Зберегти нотатку'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default DiaryView;
