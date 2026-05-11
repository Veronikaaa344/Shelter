import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { getDiagnosticConfig } from '../../diagnosticLogic';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import FlipSidebarItem from '../../components/FlipSidebarItem/FlipSidebarItem';
import '../../shelter-styles.css';
import {
    ChevronLeft,
    Play,
    Pause,
    LifeBuoy,
    CheckCircle,
    Lightbulb,
    Shield,
    Clock,
    ShieldCheck,
    BookOpen,
    Video,
    Headphones,
    FileText,
    LayoutGrid,
    ClipboardList,
    Trophy,
    PenLine,
    BarChart3
} from 'lucide-react';

export default function MaterialPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [material, setMaterial] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("Гість");
    const [pageType, setPageType] = useState("default");
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [viewStartTime, setViewStartTime] = useState(Date.now());
    
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    // Форматер HTML контенту з підтримкою стилів TinyMCE
    const formatText = (htmlContent) => {
        if (!htmlContent) return null;

        // Якщо це HTML, рендеримо як небезпечний HTML
        if (
            typeof htmlContent === 'string' &&
            (htmlContent.includes('<') || htmlContent.includes('>'))
        ) {
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: htmlContent.replace(
                            /data-[^=]*=(["']([^"'])*["'])/g,
                            ''
                        )
                    }}
                />
            );
        }

        // Якщо це просто текст, розбиваємо на параграфи
        return htmlContent.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
                {paragraph}
            </p>
        ));
    };

    // YouTube URL helpers
    const isYouTubeUrl = (url) => {
        return url && (
            url.includes('youtube.com') ||
            url.includes('youtu.be')
        );
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';

        const videoId = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        );

        return videoId
            ? `https://www.youtube.com/embed/${videoId[1]}`
            : url;
    };

    // Event handlers
    const handleVideoPlay = () => {
        setIsPlaying(true);
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    const handleVideoError = () => {
        console.error('Video playback error');
        setIsPlaying(false);
    };

    const handleAudioPlay = () => {
        setIsPlaying(true);
    };

    const handleAudioPause = () => {
        setIsPlaying(false);
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const handleComplete = async (delta = 5) => {
        const userId = localStorage.getItem("userId");

        if (userId) {
            try {
                const response = await api.updateUserProgress(userId, id, 'material');

                if (response.success) {
                    console.log('Progress updated successfully');
                }
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }

        // Записываем время просмотра
        const viewTime = Math.round((Date.now() - viewStartTime) / 60000); // в минутах
        if (userId && viewTime > 0) {
            api.recordMaterialView(userId, id, viewTime)
                .then(() => console.log(`Material view time recorded: ${viewTime} minutes`))
                .catch((err) => console.error('Error recording view time:', err));
        }

        navigate(-1);
    };

    // Data fetching
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch material
                const materialData = await api.getMaterialById(id);
                if (isMounted && materialData) {
                    setMaterial(materialData);
                    setPageType(getDiagnosticConfig({ answers: { anxiety: 0 } }).type);
                    
                    // Записываем просмотр материала в статистику
                    if (userId) {
                        api.recordMaterialView(userId, id)
                            .then(() => console.log(`Material view recorded: ${materialData.title}`))
                            .catch((err) => console.error('Error recording material view:', err));
                    }
                }

                // Fetch user profile
                if (api.isGuest && api.isGuest()) {
                    const profile = await api.getProfile();
                    if (isMounted && profile && profile.username) {
                        setUsername(profile.username);
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id, userId]);

    return (
        <div className="flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden">
            {/* Боковая панель */}
            <aside className="w-20 lg:w-72 border-r border-slate-800 flex flex-col bg-[#0b0f1a] z-20 shadow-2xl">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] shadow-xl">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="hidden lg:block text-2xl font-black text-white italic uppercase tracking-tighter italic">
                        Shelter
                    </span>
                </div>
                <nav className="flex-1 px-4 mt-6 space-y-0">
                    <FlipSidebarItem 
                        id="home" 
                        icon={<LayoutGrid size={22} />} 
                        label="Дашборд" 
                        index={0}
                        isSpecialMode={true}
                    />
                    <FlipSidebarItem 
                        id="quests" 
                        icon={<Trophy size={22} />} 
                        label="Квести" 
                        index={1}
                        isSpecialMode={true}
                    />
                    {/* Медіатека перетворюється на Назад */}
                    <FlipSidebarItem 
                        id="library" 
                        icon={<BookOpen size={22} />} 
                        label="Медіатека" 
                        isDashboard={true} 
                        index={2}
                        isSpecialMode={true}
                        onBackAction={() => navigate(-1)}
                    />
                    <FlipSidebarItem 
                        id="advice" 
                        icon={<Lightbulb size={22} />} 
                        label="Поради" 
                        index={3}
                        isSpecialMode={true}
                    />
                    <FlipSidebarItem 
                        id="diary" 
                        icon={<PenLine size={22} />} 
                        label="Щоденник" 
                        index={4}
                        isSpecialMode={true}
                    />
                    <FlipSidebarItem 
                        id="stats" 
                        icon={<BarChart3 size={22} />} 
                        label="Прогрес" 
                        index={5}
                        isSpecialMode={true}
                    />

                    {/* Активна кнопка матеріалу, яка з'являється після анімації */}
                    <div className="flex items-center gap-4 p-4 robust-rounded-20 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
                        <BookOpen size={22} />
                        <span className="font-bold text-sm hidden lg:block tracking-wide">Матеріал</span>
                    </div>
                </nav>
                <div className="p-6 border-t border-slate-900 space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-[24px] flex items-center gap-3 border border-slate-800/50 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b0f1a] font-black text-xs">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-black text-white font-bold">{username}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resilience: 50%</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Основной контент */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-[#0b0f1a] to-[#121827]">
                {/* Header */}
                <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-[#0b0f1a]/60 border-b border-slate-800/50">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"
                    >
                        <ChevronLeft size={20} /> Назад
                    </button>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/sos')}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/40 transition-all transform hover:scale-105 active:scale-95"
                        >
                            SOS
                        </button>
                    </div>
                </header>

                {/* Контент материала */}
                <div className="flex-1 p-8 space-y-8 animate-in fade-in duration-700">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-slate-500">Завантаження...</div>
                        </div>
                    ) : material ? (
                        <>
                            {/* Заголовок материала */}
                            <section className="space-y-4 animate-in fade-in slide-in-from-left duration-700">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${
                                        material.category === 'anxiety' ? 'bg-blue-500' :
                                        material.category === 'stress' ? 'bg-emerald-500' :
                                        material.category === 'apathy' ? 'bg-rose-500' :
                                        'bg-purple-500'
                                    } text-white shadow-lg`}>
                                        {material.type === 'video' ? <Video size={24} /> :
                                         material.type === 'audio' ? <Headphones size={24} /> :
                                         <FileText size={24} />}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                            {material.title}
                                        </h1>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                {material.type}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Clock size={12} className="inline mr-1" />
                                                {material.duration || '10 хв'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Видео/Аудио контент */}
                            {material.type === 'video' && material.url && (
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                                    {isYouTubeUrl(material.url) ? (
                                        <iframe
                                            src={getYouTubeEmbedUrl(material.url)}
                                            title={material.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-96 rounded-2xl bg-black"
                                        />
                                    ) : (
                                        <div className="relative">
                                            <video
                                                ref={videoRef}
                                                src={material.url}
                                                controls
                                                onPlay={handleVideoPlay}
                                                onPause={handleVideoPause}
                                                onEnded={handleVideoEnded}
                                                onError={handleVideoError}
                                                className="w-full h-96 rounded-2xl bg-black object-cover"
                                            />
                                        </div>
                                    )}
                                </section>
                            )}

                            {material.type === 'audio' && material.url && (
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                                    <audio
                                        ref={audioRef}
                                        src={material.url}
                                        controls
                                        onPlay={handleAudioPlay}
                                        onPause={handleAudioPause}
                                        onEnded={handleAudioEnded}
                                        className="w-full"
                                    />
                                </section>
                            )}

                            {/* Ключевые тезисы */}
                            {material.desc && (
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        <Lightbulb size={24} className="text-emerald-500" />
                                        Ключові тезиси
                                    </h2>
                                    <div className="text-slate-300 leading-relaxed">
                                        {formatText(material.desc)}
                                    </div>
                                </section>
                            )}

                            {/* Полный контент */}
                            {material.content && (
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-450">
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        <BookOpen size={24} className="text-emerald-500" />
                                        Повний текст
                                    </h2>
                                    <div className="text-slate-300 leading-relaxed">
                                        {formatText(material.content)}
                                    </div>
                                </section>
                            )}

                            {/* Кнопка завершения */}
                            <section className="flex justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-600">
                                {!showFeedback ? (
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] px-12 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                                    >
                                        <CheckCircle size={20} />
                                        Завершити ознайомлення
                                    </button>
                                ) : (
                                    <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl text-center">
                                        <p className="text-white mb-6">Як змінився ваш стан?</p>
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                onClick={() => handleComplete(5)}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-500/20 transition-all"
                                            >
                                                😊 Покращився
                                            </button>
                                            <button
                                                onClick={() => handleComplete(2)}
                                                className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs transition-all"
                                            >
                                                😐 Без змін
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📄</div>
                                <h2 className="text-2xl font-black text-white mb-2">Матеріал не знайдено</h2>
                                <p className="text-slate-500">Матеріал не існує або був видалений</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Character Companion */}
            <CharacterCompanion
                context="content"
                position="bottom-right"
            />
        </div>
    );
}
