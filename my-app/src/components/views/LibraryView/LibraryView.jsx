import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Wind, Play, Pause, Camera } from 'lucide-react';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';

// Import grounding images
import grounding1 from '../../../images/forVideo/grounding_1.png';
import grounding2 from '../../../images/forVideo/grounding_2.jpg';
import grounding3 from '../../../images/forVideo/grounding_3.png';
import grounding4 from '../../../images/forVideo/grounding_4.jpg';
import grounding5 from '../../../images/forVideo/grounding_5.jpg';
import grounding6 from '../../../images/forVideo/grounding_6.png';

const LibraryView = ({ 
    mediaLibraryData, 
    libraryFilter, 
    setLibraryFilter, 
    searchTerm, 
    userId, 
    userStats, 
    setUserStats 
}) => {
    const navigate = useNavigate();
    const [activeNoise, setActiveNoise] = useState(null);
    const [isNoisePlaying, setIsNoisePlaying] = useState(false);
    
    // Audio API refs
    const audioCtx = useRef(null);
    const noiseNode = useRef(null);
    const gainNode = useRef(null);

    const filteredMedia = mediaLibraryData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = libraryFilter === 'Всі' || item.type === libraryFilter;
      return matchesSearch && matchesFilter;
    });

    // Noise generation logic
    const createNoiseBuffer = (type) => {
        if (!audioCtx.current) return null;
        const bufferSize = 2 * audioCtx.current.sampleRate;
        const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'Білий') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'Рожевий') {
            let b0, b1, b2, b3, b4, b5, b6;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // compensation
                b6 = white * 0.115926;
            }
        } else if (type === 'Коричневий') {
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.002;
                lastOut = output[i];
                output[i] *= 3.5; // compensation
            }
        }
        return buffer;
    };

    const toggleNoise = (type) => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (isNoisePlaying && activeNoise === type) {
            // Stop
            stopNoise();
        } else {
            // Start or Switch
            stopNoise();
            startNoise(type);
        }
    };

    const startNoise = (type) => {
        if (audioCtx.current.state === 'suspended') {
            audioCtx.current.resume();
        }

        const buffer = createNoiseBuffer(type);
        const source = audioCtx.current.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = audioCtx.current.createGain();
        gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.current.currentTime + 0.5);

        source.connect(gain);
        gain.connect(audioCtx.current.destination);

        source.start();
        
        noiseNode.current = source;
        gainNode.current = gain;
        setActiveNoise(type);
        setIsNoisePlaying(true);
    };

    const stopNoise = () => {
        if (noiseNode.current) {
            const nodeToStop = noiseNode.current;
            const gainToFade = gainNode.current;
            
            gainToFade.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 0.3);
            setTimeout(() => {
                try {
                    nodeToStop.stop();
                    nodeToStop.disconnect();
                } catch(e) {}
            }, 300);
            
            noiseNode.current = null;
            gainNode.current = null;
        }
        setIsNoisePlaying(false);
    };

    useEffect(() => {
        return () => {
            if (noiseNode.current) {
                noiseNode.current.stop();
            }
        };
    }, []);

    const handleMaterialClick = (material) => {
      if (userId) {
        api.recordMaterialView(userId, material.id)
          .then(() => {
            if (userStats) {
              setUserStats({
                ...userStats,
                materialsViewed: {
                  ...userStats.materialsViewed,
                  count: (userStats.materialsViewed?.count || 0) + 1
                }
              });
            }
          })
          .catch((err) => console.error('Error recording material view:', err));
      }
      navigate(`/material/${material.id}`);
    };

    return (
      <div className="p-8 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Бібліотека спокою</h2>
          <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            {['Всі', 'Аудіо', 'Відео', 'Стаття'].map((f) => (
              <button key={f} onClick={() => setLibraryFilter(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${libraryFilter === f ? 'bg-emerald-500 text-[#0b0f1a]' : 'text-slate-500 hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Soundscapes Section */}
        {libraryFilter === 'Всі' && (
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Звукові ландшафти</h3>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wind size={120} className="text-blue-500" />
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                        <div className="space-y-6 flex-1">
                            <div>
                                <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Кольори шуму</h4>
                                <p className="text-slate-400 max-w-md">Оберіть частотний діапазон, який найкраще підходить для вашого стану.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { name: 'Білий', desc: 'Фокус та концентрація', color: 'bg-white/10', border: 'hover:border-white' },
                                    { name: 'Рожевий', desc: 'Заспокоєння та релакс', color: 'bg-rose-500/10', border: 'hover:border-rose-500' },
                                    { name: 'Коричневий', desc: 'Глибокий сон', color: 'bg-amber-900/20', border: 'hover:border-amber-700' }
                                ].map((noise) => (
                                    <button 
                                        key={noise.name} 
                                        onClick={() => toggleNoise(noise.name)}
                                        className={`p-6 rounded-[32px] border transition-all ${activeNoise === noise.name && isNoisePlaying ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 ' + noise.color + ' ' + noise.border} text-left group`}
                                    >
                                        <p className="text-lg font-black text-white uppercase italic mb-1">{noise.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{noise.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full lg:w-72 h-48 bg-slate-900/80 rounded-[32px] border border-slate-800 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Visualizer</span>
                                <div className="flex gap-1">
                                    {isNoisePlaying ? (
                                        [1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)
                                    ) : (
                                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-center gap-1.5 h-20">
                                {[...Array(12)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-1.5 rounded-full transition-all duration-500 ${isNoisePlaying ? 'bg-blue-500' : 'bg-slate-800 h-2'}`}
                                        style={isNoisePlaying ? { 
                                            height: `${20 + Math.random() * 80}%`,
                                            animation: 'visualizerScale 1s ease-in-out infinite alternate',
                                            animationDelay: `${i * 0.1}s`
                                        } : {}}
                                    ></div>
                                ))}
                            </div>

                            <button 
                                onClick={() => activeNoise && toggleNoise(activeNoise)}
                                className={`w-full py-3 ${isNoisePlaying ? 'bg-rose-600' : 'bg-blue-600'} hover:opacity-90 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center justify-center gap-2`}
                            >
                                {isNoisePlaying ? <><Pause size={14} /> Вимкнути</> : <><Play size={14} /> Активувати звук</>}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* Photo Grounding Section */}
        {libraryFilter === 'Всі' && (
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Фото заземлення</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Ранковий вітер у травах', img: grounding6 },
                        { title: 'Мерехтіння води', img: grounding1 },
                        { title: 'Лісовий туман', img: grounding4 },
                        { title: 'Гірський струмок', img: grounding2 },
                        { title: 'Вечірнє багаття', img: grounding5 },
                        { title: 'Дощ за склом', img: grounding3 }
                    ].map((photo, i) => (
                        <div key={i} className="relative aspect-[16/10] rounded-[32px] overflow-hidden group shadow-2xl border border-slate-800 bg-slate-900">
                            <img 
                                src={photo.img} 
                                alt={photo.title}
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 p-6 w-full text-left">
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic opacity-80 flex items-center gap-2">
                                    <Camera size={10} /> Photo Grounding
                                </p>
                                <h5 className="text-lg font-black text-white italic uppercase tracking-tight leading-none">{photo.title}</h5>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Main Content List */}
        <section className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Всі матеріали</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((item) => (
                <div key={item.id} onClick={() => handleMaterialClick(item)} className="group bg-slate-900/40 border border-slate-800 p-8 robust-rounded-48 hover:border-emerald-500/50 transition-all cursor-pointer relative text-left shadow-xl">
                <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg`}>{item.icon}</div>
                    <div className="bg-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-400">{item.duration}</div>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{item.type}</p>
                    <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors uppercase leading-none">{item.title}</h4>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mt-6 group-hover:gap-4 transition-all italic">Відкрити контент <ChevronRight size={14} /></div>
                </div>
                </div>
            ))}
            </div>
        </section>
      </div>
    );
};

export default LibraryView;

