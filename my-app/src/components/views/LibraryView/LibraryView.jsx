import React from 'react';
import { ChevronRight, Wind } from 'lucide-react';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';

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

    const filteredMedia = mediaLibraryData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = libraryFilter === 'Всі' || item.type === libraryFilter;
      return matchesSearch && matchesFilter;
    });

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
                                    { name: 'Білий', desc: 'Фокус та концентрація', color: 'bg-white/10' },
                                    { name: 'Рожевий', desc: 'Заспокоєння та релакс', color: 'bg-rose-500/10' },
                                    { name: 'Коричневий', desc: 'Глибокий сон', color: 'bg-amber-900/20' }
                                ].map((noise) => (
                                    <button key={noise.name} className={`p-6 rounded-[32px] border border-slate-800 text-left hover:border-blue-500 transition-all ${noise.color} group`}>
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
                                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-center gap-1.5 h-20">
                                {[...Array(12)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-1.5 bg-blue-500/40 rounded-full" 
                                        style={{ 
                                            height: `${20 + Math.random() * 60}%`,
                                            animation: 'visualizerScale 1.5s ease-in-out infinite alternate',
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20">
                                Активувати звук
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* Video Guides / Cinemagraphs */}
        {libraryFilter === 'Всі' && (
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Відео-гайди заземлення</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: 'Ранковий вітер у травах', url: 'https://images.pexels.com/video-files/3248316/3248316-uhd_2560_1440_25fps.mp4' },
                        { title: 'Мерехтіння води', url: 'https://images.pexels.com/video-files/5781335/5781335-hd_1920_1080_25fps.mp4' }
                    ].map((video, i) => (
                        <div key={i} className="relative aspect-video rounded-[40px] overflow-hidden group shadow-2xl border border-slate-800">
                            <video 
                                src={video.url} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 p-8">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Cinemagraph</p>
                                <h5 className="text-2xl font-black text-white italic uppercase tracking-tighter">{video.title}</h5>
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
