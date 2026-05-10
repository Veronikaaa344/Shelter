import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { getDiagnosticConfig } from '../../diagnosticLogic';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import {
    ArrowLeft,
    Play,
    Pause,
    LifeBuoy,
    CheckCircle,
    Lightbulb,
    Shield,
    Clock,
    ChevronLeft,
    ShieldCheck,
    Search,
    X,
    Layout,
    BookOpen,
    Video,
    Headphones,
    FileText
} from 'lucide-react';

import './materialPage.css';

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

        // Якщо це просто текст, рендеримо як параграф
        return <p>{htmlContent}</p>;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                console.log('Fetching material with ID:', id);

                // Спочатку пробуємо знайти серед матеріалів
                const materialsData = await api.getMaterials();
                console.log('Materials data:', materialsData);

                let foundMaterial = null;

                if (isMounted && Array.isArray(materialsData)) {
                    foundMaterial = materialsData.find(m => m._id === id);

                    if (foundMaterial) {
                        console.log('Found material:', foundMaterial);
                        setMaterial(foundMaterial);
                    }
                }

                // Якщо не знайдено в матеріалах, пробуємо в сценаріях (відео/аудіо)
                if (!foundMaterial && isMounted) {
                    try {
                        console.log('Searching in scenarios...');

                        const scenariosData = await api.getScenarios();
                        console.log('Scenarios data:', scenariosData);

                        if (Array.isArray(scenariosData)) {
                            const foundScenario = scenariosData.find(
                                s => s.scenarioId === id || s._id === id
                            );

                            console.log('Found scenario:', foundScenario);

                            if (
                                foundScenario &&
                                (foundScenario.type === "video" ||
                                    foundScenario.type === "audio")
                            ) {
                                console.log('Converting scenario to material...');
                                console.log('Scenario fields:', {
                                    videoUrl: foundScenario.videoUrl,
                                    audioUrl: foundScenario.audioUrl,
                                    videoTranscript: foundScenario.videoTranscript,
                                    audioTranscript: foundScenario.audioTranscript
                                });

                                // Перетворюємо сценарій в формат матеріалу для відображення
                                const materialFromScenario = {
                                    _id: foundScenario._id,
                                    title: foundScenario.name,
                                    desc:
                                        foundScenario.description ||
                                        "Відео/аудіо тренування",
                                    type: foundScenario.type,
                                    url:
                                        foundScenario.type === "video"
                                            ? (
                                                foundScenario.videoUrl ||
                                                foundScenario.url
                                            )
                                            : (
                                                foundScenario.audioUrl ||
                                                foundScenario.url
                                            ),
                                    content:
                                        foundScenario.type === "video"
                                            ? (
                                                foundScenario.videoTranscript ||
                                                foundScenario.content
                                            )
                                            : (
                                                foundScenario.audioTranscript ||
                                                foundScenario.content
                                            ),
                                    duration: foundScenario.duration,
                                    category: foundScenario.category
                                };

                                console.log(
                                    'Material from scenario:',
                                    materialFromScenario
                                );

                                setMaterial(materialFromScenario);
                            }
                        }
                    } catch (scenarioErr) {
                        console.error(
                            "Error fetching scenarios:",
                            scenarioErr
                        );
                    }
                }

                const savedData = JSON.parse(
                    localStorage.getItem("dr_test_results")
                );

                const config = getDiagnosticConfig(savedData?.answers);

                if (isMounted) {
                    setPageType(config?.type || "default");
                }

                const guestStatus = api.isGuest
                    ? api.isGuest()
                    : false;

                
                if (guestStatus) {
                    const profile = await api.getProfile();

                    if (isMounted && profile?.username) {
                        setUsername(profile.username);
                    }
                } else {
                    if (isMounted) {
                        setUsername("Профіль");
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            api.getMaterialById(id)
                .then((data) => {
                    if (data) {
                        setMaterial(data);
                        setPageType(getDiagnosticConfig({ answers: { anxiety: 0 } }).type);
                        
                        // Записываем просмотр материала в статистику
                        if (userId) {
                            api.recordMaterialView(userId, id)
                                .then(() => console.log(`Material view recorded: ${data.title}`))
                                .catch((err) => console.error('Error recording material view:', err));
                        }
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error loading material:', error);
                    setLoading(false);
                });
        }, [id, userId]);

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleComplete = async (delta = 5) => {
        const userId = localStorage.getItem("userId");

        if (userId && material) {
            await api.updateResilience(
                userId,
                delta,
                "material_complete",
                material.title
            );
        }

        navigate('/main');
    };

    const getStateLabel = () => {
        const labels = {
            anxiety: "Тривога",
            apathy: "Апатія",
            stress: "Стрес"
        };

        return labels[pageType] || "Норма";
    };

    const handleVideoPlay = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.error('Video play error:', err);
            });

            setIsPlaying(true);
        }
    };

    const handleVideoPause = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    const extractVideoUrl = (material) => {
        // Спочатку перевіряємо пряме поле url
        if (material?.url && material.url.startsWith('http')) {
            return material.url;
        }

        // Якщо немає прямого URL, шукаємо в контенті
        if (material?.content) {
            // Регулярний вираз для пошуку YouTube URL
            const youtubeRegex =
                /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s<>"{}|\\^`\[\]]+/i;

            const match = material.content.match(youtubeRegex);

            if (match) {
                return match[0];
            }

            // Регулярний вираз для пошуку будь-яких HTTP URL
            const urlRegex =
                /https?:\/\/[^\s<>"{}|^`[\]]+/i;

            const urlMatch = material.content.match(urlRegex);

            if (urlMatch) {
                return urlMatch[0];
            }
        }

        return null;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;

        // Перетворюємо різні формати YouTube URL в embed формат
        const youtubeIdMatch = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
        );

        if (youtubeIdMatch) {
            const videoId = youtubeIdMatch[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return null;
    };

    const isYouTubeUrl = (url) => {
        return (
            url &&
            (
                url.includes('youtube.com') ||
                url.includes('youtu.be')
            )
        );
    };

    const handleVideoError = (e) => {
        console.error('Video error:', e);

        const videoUrl = extractVideoUrl(material);

        console.log('Video src:', videoUrl);
        console.log('Material structure:', material);
    };

    const handleAudioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => {
                console.error('Audio play error:', err);
            });

            setIsPlaying(true);
        }
    };

    const handleAudioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    if (loading) {
        return (
            <div className="dr-new-layout dr-st-center">
                <h2>Завантаження...</h2>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="dr-new-layout dr-st-center">
                <h2>Матеріал не знайдено</h2>
            </div>
        );
    }

    const type = material.type?.toLowerCase();

    const isVideo = type === 'video';
    const isAudio = type === 'audio';
    const isText = !isVideo && !isAudio;

    // Діагностика
    const extractedUrl = extractVideoUrl(material);

    console.log('Material debug:', {
        type,
        isVideo,
        isAudio,
        isText,
        material,
        videoUrl: material?.url,
        content: material?.content,
        extractedUrl
    });

    // Додаткові тести для діагностики
    if (isVideo) {
        console.log(
            '✅ Video URL successfully extracted and should be playing'
        );

        console.log(
            '🎬 Video element src:',
            videoRef.current?.src
        );
    }

    return (
        <div className="dr-new-layout dr-mat-page">
            <div className="dr-cloud dr-cloud-1">☁️</div>
            <div className="dr-cloud dr-cloud-2">☁️</div>

            <header className="dr-new-header">
                <div className="dr-header-container">
                    <div className="dr-header-inner">
                        <div
                            className="dr-new-logo"
                            onClick={() => navigate("/main")}
                        >
                            <div className="dr-logo-icon-box">
                                <Shield size={20} />
                            </div>

                            <h1 className="dr-logo-text">
                                Броня для розуму
                            </h1>
                        </div>

                        <button
                            className="dr-nav-link"
                            onClick={() => navigate('/main')}
                        >
                            <ArrowLeft size={18} /> Бібліотека
                        </button>

                        <div className="dr-user-section">
                            <div className="dr-state-badge">
                                Стан:
                                <span className="dr-state-value">
                                    {getStateLabel()}
                                </span>
                            </div>

                            <div className="dr-user-profile-btn">
                                {username}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dr-new-main dr-mat-content">
                <div className="dr-status-card dr-mat-card">
                    <div className="dr-mat-meta">
                        <span className="dr-type-label">
                            {material.type}
                        </span>

                        <span className="dr-mat-time">
                            <Clock size={14} /> 5-10 хв
                        </span>
                    </div>

                    <h1 className="dr-status-title dr-mat-main-title">
                        {material.title}
                    </h1>

                    <div className="dr-mat-body">
                        {isVideo && (
                            <div className="dr-mat-media-section">
                                {(() => {
                                    const videoUrl =
                                        extractVideoUrl(material);

                                    return videoUrl ? (
                                        <div className="dr-mat-video-wrapper">
                                            {isYouTubeUrl(videoUrl) ? (
                                                <iframe
                                                    className="dr-mat-player"
                                                    src={getYouTubeEmbedUrl(videoUrl)}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{
                                                        width: '100%',
                                                        height: '400px',
                                                        borderRadius: '16px',
                                                        background: '#000'
                                                    }}
                                                />
                                            ) : (
                                                <video
                                                    ref={videoRef}
                                                    className="dr-mat-player"
                                                    src={videoUrl}
                                                    controls
                                                    preload="metadata"
                                                    onPlay={handleVideoPlay}
                                                    onPause={handleVideoPause}
                                        />
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Видео/Аудио контент */}
                            {material.type === 'video' && material.url && (
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl">
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
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl">
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
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl">
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
                                <section className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl">
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
                            <section className="flex justify-center">
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