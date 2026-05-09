import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { getDiagnosticConfig } from '../../diagnosticLogic';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import { ArrowLeft, Play, Pause, LifeBuoy, CheckCircle, Lightbulb, Shield, Clock } from 'lucide-react';
import './materialPage.css';

export default function MaterialPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("Гість");
    const [isGuest, setIsGuest] = useState(false);
    const [pageType, setPageType] = useState("default");
    
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    // Форматер HTML контенту з підтримкою стилів TinyMCE
    const formatText = (htmlContent) => {
        if (!htmlContent) return null;
        
        // Якщо це HTML, рендеримо як небезпечний HTML
        if (typeof htmlContent === 'string' && (htmlContent.includes('<') || htmlContent.includes('>'))) {
            return <div 
                className="dr-mat-html-content" 
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />;
        }
        
        // Якщо це простий текст, форматуємо як раніше
        return htmlContent.split('\n').map((paragraph, index) => {
            if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                return <li key={index} className="dr-mat-list-item">{paragraph.trim().substring(1).trim()}</li>;
            }
            if (paragraph.trim() === '') return <br key={index} />;
            return <p key={index} className="dr-mat-p">{paragraph}</p>;
        });
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                console.log('Fetching material with ID:', id);
                
                // Спочатку пробуємо знайти серед матеріалів
                const materialsData = await api.getMaterials();
                console.log('Materials data:', materialsData);
                
                if (isMounted && Array.isArray(materialsData)) {
                    const found = materialsData.find(m => m._id === id);
                    if (found) {
                        console.log('Found material:', found);
                        setMaterial(found);
                    }
                }

                // Якщо не знайдено в матеріалах, пробуємо в сценаріях (відео/аудіо)
                if (!material && isMounted) {
                    try {
                        console.log('Searching in scenarios...');
                        const scenariosData = await api.getScenarios();
                        console.log('Scenarios data:', scenariosData);
                        
                        if (Array.isArray(scenariosData)) {
                            const foundScenario = scenariosData.find(s => s.scenarioId === id || s._id === id);
                            console.log('Found scenario:', foundScenario);
                            
                            if (foundScenario && (foundScenario.type === "video" || foundScenario.type === "audio")) {
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
                                    desc: foundScenario.description || "Відео/аудіо тренування",
                                    type: foundScenario.type,
                                    url: foundScenario.type === "video" ? (foundScenario.videoUrl || foundScenario.url) : (foundScenario.audioUrl || foundScenario.url),
                                    content: foundScenario.type === "video" ? (foundScenario.videoTranscript || foundScenario.content) : (foundScenario.audioTranscript || foundScenario.content),
                                    duration: foundScenario.duration,
                                    category: foundScenario.category
                                };
                                console.log('Material from scenario:', materialFromScenario);
                                setMaterial(materialFromScenario);
                            }
                        }
                    } catch (scenarioErr) {
                        console.error("Error fetching scenarios:", scenarioErr);
                    }
                }

                const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
                const config = getDiagnosticConfig(savedData?.answers);
                if (isMounted) setPageType(config?.type || "default");

                const guestStatus = api.isGuest ? api.isGuest() : false;
                if (isMounted) setIsGuest(guestStatus);

                if (guestStatus) {
                    const profile = await api.getProfile();
                    if (isMounted && profile?.username) setUsername(profile.username);
                } else {
                    if (isMounted) setUsername("Профіль");
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [id]);

    const handleComplete = async (delta = 5) => {
        const userId = localStorage.getItem("userId");
        if (userId && material) {
            await api.updateResilience(userId, delta, "material_complete", material.title);
        }
        navigate('/main');
    };

    const getStateLabel = () => {
        const labels = { anxiety: "Тривога", apathy: "Апатія", stress: "Стрес" };
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
            const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s<>"{}|\\^`\[\]]+/i;
            const match = material.content.match(youtubeRegex);
            if (match) {
                return match[0];
            }
            
            // Регулярний вираз для пошуку будь-яких HTTP URL
            const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/i;
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
        const youtubeIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (youtubeIdMatch) {
            const videoId = youtubeIdMatch[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        return null;
    };

    const isYouTubeUrl = (url) => {
        return url && (url.includes('youtube.com') || url.includes('youtu.be'));
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

    if (loading) return <div className="dr-new-layout dr-st-center"><h2>Завантаження...</h2></div>;
    if (!material) return <div className="dr-new-layout dr-st-center"><h2>Матеріал не знайдено</h2></div>;

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
        console.log('✅ Video URL successfully extracted and should be playing');
        console.log('🎬 Video element src:', videoRef.current?.src);
    }

    return (
        <div className="dr-new-layout dr-mat-page">
            <div className="dr-cloud dr-cloud-1">☁️</div>
            <div className="dr-cloud dr-cloud-2">☁️</div>

            <header className="dr-new-header">
                <div className="dr-header-container">
                    <div className="dr-header-inner">
                        <div className="dr-new-logo" onClick={() => navigate("/main")}>
                            <div className="dr-logo-icon-box"><Shield size={20} /></div>
                            <h1 className="dr-logo-text">Броня для розуму</h1>
                        </div>
                        <button className="dr-nav-link" onClick={() => navigate('/main')}>
                            <ArrowLeft size={18} /> Бібліотека
                        </button>
                        <div className="dr-user-section">
                            <div className="dr-state-badge">Стан: <span className="dr-state-value">{getStateLabel()}</span></div>
                            <div className="dr-user-profile-btn">{username}</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dr-new-main dr-mat-content">
                <div className="dr-status-card dr-mat-card">
                    <div className="dr-mat-meta">
                        <span className="dr-type-label">{material.type}</span>
                        <span className="dr-mat-time"><Clock size={14} /> 5-10 хв</span>
                    </div>
                    
                    <h1 className="dr-status-title dr-mat-main-title">{material.title}</h1>

                    <div className="dr-mat-body">
                        {isVideo && (
                            <div className="dr-mat-media-section">
                                {/* Перевіряємо чи є справжній відео URL */}
                                {(() => {
                                    const videoUrl = extractVideoUrl(material);
                                    return videoUrl ? (
                                        <div className="dr-mat-video-wrapper">
                                            {isYouTubeUrl(videoUrl) ? (
                                                // YouTube iframe для відтворення
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
                                                // Звичайний video елемент для інших URL
                                                <video 
                                                    ref={videoRef} 
                                                    className="dr-mat-player" 
                                                    src={videoUrl}
                                                    controls
                                                    preload="metadata"
                                                    onPlay={handleVideoPlay}
                                                    onPause={handleVideoPause}
                                                    onEnded={handleVideoEnded}
                                                    onError={handleVideoError}
                                                    style={{
                                                        width: '100%',
                                                        height: '400px',
                                                        borderRadius: '16px',
                                                        background: '#000',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                            {!isPlaying && !isYouTubeUrl(videoUrl) && (
                                                <div className="dr-mat-video-overlay">
                                                    <button 
                                                        className="dr-mat-big-play" 
                                                        onClick={handleVideoPlay}
                                                    >
                                                        ▶️
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="dr-mat-no-video">
                                            <div className="dr-mat-no-video-icon">🎥</div>
                                            <h3>Відео недоступне</h3>
                                            <p>Відео URL не знайдено або некоректний</p>
                                            {material?.url && (
                                                <div className="dr-mat-debug-info">
                                                    <small>URL: {material.url}</small>
                                                </div>
                                            )}
                                            {material?.content && (
                                                <div className="dr-mat-debug-info">
                                                    <small>Content містить: {material.content.substring(0, 100)}...</small>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                                <div className="dr-mat-highlights">
                                    <h3><Lightbulb className="dr-st-text-pos" /> Ключові тези</h3>
                                    <div className="dr-mat-formatted">{formatText(material.notes || material.desc)}</div>
                                </div>
                            </div>
                        )}

                        {isAudio && (
                            <div className="dr-mat-media-section">
                                <div className="dr-mat-audio-player-card">
                                    <div className={`dr-mat-viz ${isPlaying ? 'active' : ''}`}>
                                        {[...Array(15)].map((_, i) => <div key={i} className="dr-mat-v-bar" />)}
                                    </div>
                                    <audio ref={audioRef} src={material.url || material.content} onPlay={handleAudioPlay} onPause={handleAudioPause} />
                                    <button className="dr-trainer-btn dr-mat-audio-btn" onClick={isPlaying ? handleAudioPause : handleAudioPlay}>
                                        {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
                                        {isPlaying ? "Пауза" : "Слухати практику"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="dr-mat-text-area">
                            {formatText(material.fullText || material.content)}
                        </div>
                    </div>

                    <div className="dr-mat-action-zone">
                        {!showFeedback ? (
                            <button className="dr-trainer-btn dr-mat-finish-btn" onClick={() => setShowFeedback(true)}>
                                <CheckCircle size={20} /> Завершити ознайомлення
                            </button>
                        ) : (
                            <div className="dr-mat-feedback-box">
                                <p>Як змінився ваш стан?</p>
                                <div className="dr-mat-feedback-row">
                                    <button className="dr-choice-btn" onClick={() => handleComplete(5)}>😊 Покращився</button>
                                    <button className="dr-show-all-btn" onClick={() => handleComplete(2)}>😐 Без змін</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <CharacterCompanion context="content" position="bottom-right" />
            <button className="dr-sos-btn" onClick={() => navigate('/sos')}>
                <LifeBuoy size={24} />
                <span className="dr-sos-label">SOS</span>
            </button>
        </div>
    );
}