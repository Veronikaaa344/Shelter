import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";
import "./videoScenarioPage.css";

export default function VideoScenarioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    const [sessionScore, setSessionScore] = useState(0);
    
    useEffect(() => {
        api.getScenarioById(id)
            .then((data) => {
                if (data) {
                    setScenario(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVideoProgress = () => {
        if (videoRef.current) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        setShowCompletionMenu(true);
    };

    const handleComplete = (score) => {
        setSessionScore(score);
        api.completeScenario(id, score)
            .then(() => {
                navigate('/trainer');
            })
            .catch(() => {
                navigate('/trainer');
            });
    };

    if (loading) return <div className="dr-new-layout dr-st-center"><h2>Завантаження...</h2></div>;

    return (
        <div className="dr-new-layout dr-video-scenario-page">
            <header className="dr-new-header">
                <div className="dr-header-container">
                    <div className="dr-header-inner">
                        <div className="dr-new-logo" onClick={() => navigate("/trainer")}>
                            <div className="dr-logo-icon-box"></div>
                            <h1 className="dr-logo-text">Тренажер</h1>
                        </div>
                        <button className="dr-nav-link" onClick={() => navigate('/trainer')}>
                            <ArrowLeft size={18} /> До тренажерів
                        </button>
                    </div>
                </div>
            </header>

            <main className="dr-new-main dr-video-main">
                <div className="dr-video-container">
                    <div className="dr-video-header">
                        <h1 className="dr-video-title">{scenario?.name}</h1>
                        <div className="dr-video-meta">
                            <span className="dr-video-category">{scenario?.category}</span>
                            <span className="dr-video-duration">⏱️ {scenario?.duration}</span>
                        </div>
                    </div>

                    <div className="dr-video-player-wrapper">
                        <video
                            ref={videoRef}
                            className="dr-video-player"
                            src={scenario?.videoUrl}
                            onTimeUpdate={handleVideoProgress}
                            onEnded={handleVideoEnd}
                            onClick={toggleVideo}
                        />
                        
                        {!isPlaying && (
                            <button className="dr-video-play-btn" onClick={toggleVideo}>
                                <Play fill="white" size={60} />
                            </button>
                        )}
                        
                        <div className="dr-video-controls">
                            <button className="dr-video-control-btn" onClick={toggleVideo}>
                                {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
                            </button>
                            <div className="dr-video-progress">
                                <div 
                                    className="dr-video-progress-bar" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <button className="dr-video-control-btn">
                                <Volume2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="dr-video-content">
                        <div className="dr-video-description">
                            <h3>Опис сценарію</h3>
                            <p>{scenario?.description || "Перегляньте відео та дотримуйтесь інструкцій"}</p>
                        </div>

                        <div className="dr-transcript-section">
                            <button 
                                className="dr-transcript-toggle"
                                onClick={() => setShowTranscript(!showTranscript)}
                            >
                                {showTranscript ? "Приховати транскрипцію" : "Показати транскрипцію"}
                            </button>
                            
                            {showTranscript && (
                                <div className="dr-transcript-content">
                                    <h3>Транскрипція відео</h3>
                                    <div 
                                        className="dr-transcript-text"
                                        dangerouslySetInnerHTML={{ __html: scenario?.videoTranscript || '' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <CharacterCompanion context="scenario" position="bottom-right" />

            {showCompletionMenu && (
                <div className="dr-completion-modal">
                    <div className="dr-completion-content">
                        <h2>Відео завершено!</h2>
                        <p>Як ви оцінюєте свою ефективність після цього тренування?</p>
                        <div className="dr-completion-choices">
                            <button 
                                className="dr-choice-btn" 
                                onClick={() => handleComplete(5)}
                            >
                                😊 Дуже ефективно
                            </button>
                            <button 
                                className="dr-choice-btn" 
                                onClick={() => handleComplete(3)}
                            >
                                😐 Середньо
                            </button>
                            <button 
                                className="dr-choice-btn" 
                                onClick={() => handleComplete(1)}
                            >
                                😔 Мало ефективно
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
