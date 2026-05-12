import React, { useState, useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import { AudioManager } from '../../infrastructure/utils/audioManager';

export default function AudioVolumeDialog({ isOpen, onClose, onVolumeSet }) {
  const [volume, setVolume] = useState(AudioManager.getVolume());
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    // Проверяем первый ли раз запускается звук
    const hasSeenDialog = localStorage.getItem('audioVolumeDialogShown');
    if (hasSeenDialog) {
      setIsFirstTime(false);
    }
  }, []);

  const handleConfirm = () => {
    const normalizedVolume = volume / 100;
    AudioManager.setVolume(normalizedVolume);
    
    if (isFirstTime) {
      localStorage.setItem('audioVolumeDialogShown', 'true');
      setIsFirstTime(false);
    }
    
    onVolumeSet(normalizedVolume);
    onClose();
  };

  const handleCancel = () => {
    if (isFirstTime) {
      // При первом запуске не даем отменить
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1f2937] border border-[#374151] rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Volume2 size={24} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isFirstTime ? 'Налаштування звуку' : 'Регулювання гучності'}
              </h3>
              <p className="text-sm text-slate-400">
                {isFirstTime 
                  ? 'Будь ласка, встановіть комфортну гучність перед першим використанням звуку'
                  : 'Відрегулюйте гучність звуку'
                }
              </p>
            </div>
          </div>
          
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Ползунок громкости */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300">Гучність</span>
            <span className="text-sm font-bold text-emerald-500 min-w-[45px] text-right">
              {volume}%
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume}%, #374151 ${volume}%, #374151 100%)`
              }}
            />
            
            {/* Визуализация частот */}
            <div className="flex justify-between mt-6 mb-2">
              {['Білий', 'Рожевий', 'Коричневий'].map((color, index) => (
                <div key={color} className="text-center">
                  <div className={`w-3 h-3 rounded-full mb-1 ${
                    color === 'Білий' ? 'bg-slate-300' :
                    color === 'Рожевий' ? 'bg-rose-400' :
                    'bg-amber-700'
                  }`} />
                  <span className="text-xs text-slate-400 block">{color}</span>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-slate-500 text-center mb-4">
              {volume <= 20 ? 'Білий: Фокус та концентрація' :
               volume <= 40 ? 'Рожевий: Заспокоєння та релакс' :
               volume <= 60 ? 'Коричневий: Глибокий сон' :
               'Висока гучність'}
            </div>
          </div>
        </div>

        {/* Описания частот */}
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-bold text-white mb-3">Частотні діапазони:</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Білий (0-20%)</span>
              <span className="text-slate-400">Фокус та концентрація</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Рожевий (21-40%)</span>
              <span className="text-slate-400">Заспокоєння та релакс</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Коричневий (41-60%)</span>
              <span className="text-slate-400">Глибокий сон</span>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 mt-6">
          {isFirstTime ? (
            <button
              onClick={handleConfirm}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
            >
              Активувати звук
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all"
              >
                Відміна
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
              >
                Зберегти
              </button>
            </>
          )}
        </div>

        {/* Подпись для первого запуска */}
        {isFirstTime && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-400 text-center">
              💡 Ви можете змінити гучність будь-коли в налаштуваннях програми
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #0f172a;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #0f172a;
        }
      `}</style>
    </div>
  );
}
