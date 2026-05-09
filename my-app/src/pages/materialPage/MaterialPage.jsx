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

    // Автоматичний форматер тексту
    const formatText = (text) => {
        if (!text) return null;
        return text.split('\n').map((paragraph, index) => {
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
                const materialsData = await api.getMaterials();
                if (isMounted && Array.isArray(materialsData)) {
                    const found = materialsData.find(m => m._id === id);
                    if (found) setMaterial(found);
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

    const toggleMedia = (ref) => {
        if (!ref.current) return;
        if (ref.current.paused) {
            ref.current.play();
            setIsPlaying(true);
        } else {
            ref.current.pause();
            setIsPlaying(false);
        }
    };

    if (loading) return <div className="dr-new-layout dr-st-center"><h2>Завантаження...</h2></div>;
    if (!material) return <div className="dr-new-layout dr-st-center"><h2>Матеріал не знайдено</h2></div>;

    const type = material.type?.toLowerCase();
    const isVideo = type?.includes('відео') || type?.includes('video');
    const isAudio = type?.includes('аудіо') || type?.includes('audio');
    const isText = !isVideo && !isAudio;

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
                                <div className="dr-mat-video-box">
                                    <video ref={videoRef} className="dr-mat-player" src={material.url || material.content} onClick={() => toggleMedia(videoRef)} />
                                    {!isPlaying && (
                                        <button className="dr-mat-big-play" onClick={() => toggleMedia(videoRef)}>
                                            <Play fill="white" size={40} />
                                        </button>
                                    )}
                                </div>
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
                                    <audio ref={audioRef} src={material.url || material.content} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
                                    <button className="dr-trainer-btn dr-mat-audio-btn" onClick={() => toggleMedia(audioRef)}>
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