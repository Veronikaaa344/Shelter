import { useEffect, useState } from "react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../../api/api";
import { getDiagnosticConfig } from "../../../diagnosticLogic";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import { Shield, ArrowLeft, Unlock, Target, Search, Puzzle, Grid3X3, Video } from 'lucide-react';
import "./exercises.css";

const getDifficultyText = (difficultyPercent) => {
    if (difficultyPercent <= 20) return 'Дуже легкий';
    if (difficultyPercent <= 40) return 'Легкий';
    if (difficultyPercent <= 60) return 'Середній';
    if (difficultyPercent <= 80) return 'Складний';
    return 'Експерт';
};

const getDifficultyLevel = (difficultyPercent) => {
    if (difficultyPercent <= 20) return 1;
    if (difficultyPercent <= 40) return 2;
    if (difficultyPercent <= 60) return 3;
    if (difficultyPercent <= 80) return 4;
    return 5;
};

const getRecommendation = (scenario, userResilience, completedScenarios) => {
    const difficultyPercent = scenario.difficulty || 50;
    const difficultyLevel = getDifficultyLevel(difficultyPercent);
    const isCompleted = completedScenarios.find(c => c.scenarioId === scenario.scenarioId);
    const maxRecommended = userResilience < 30 ? 2 : userResilience < 50 ? 3 : userResilience < 70 ? 4 : 5;

    if (isCompleted) return { type: "completed", message: "Пройдено" };
    if (difficultyLevel > maxRecommended) return { 
        type: "warning", 
        message: `${getDifficultyText(difficultyPercent)} — поки складно`,
        difficultyText: getDifficultyText(difficultyPercent)
    };
    if (difficultyLevel <= maxRecommended - 1) return { 
        type: "recommended", 
        message: "Рекомендовано",
        difficultyText: getDifficultyText(difficultyPercent)
    };
    return { 
        type: "normal", 
        message: getDifficultyText(difficultyPercent),
        difficultyText: getDifficultyText(difficultyPercent)
    };
};

const getCardStyle = (category) => {
    const gradients = {
        anxiety: { background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' },
        stress: { background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' },
        apathy: { background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)' },
        general: { background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }
    };
    return gradients[category] || gradients.general;
};

const getBadgeStyle = (category) => {
    const colors = {
        anxiety: { backgroundColor: '#90CAF9', color: '#1565C0' },
        stress: { backgroundColor: '#A5D6A7', color: '#2E7D32' },
        apathy: { backgroundColor: '#F48FB1', color: '#C2185B' },
        general: { backgroundColor: '#CE93D8', color: '#6A1B9A' }
    };
    return colors[category] || colors.general;
};

export default function ExercisesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [allScenarios, setAllScenarios] = useState([]);
    const [filteredScenarios, setFilteredScenarios] = useState([]);
    const [isPersonalized, setIsPersonalized] = useState(true);
    const [pageType, setPageType] = useState("default");
    const [completedScenarios, setCompletedScenarios] = useState([]);
    const [userResilience, setUserResilience] = useState(50);
    const [username, setUsername] = useState("Гість");
    const [isGuest, setIsGuest] = useState(true);

    // Визначаємо звідки прийшов користувач
    const getBackPath = () => {
        const fromState = location.state?.from;
        if (fromState === 'quests') {
            return '/quests';
        }
        return '/main'; // За замовчуванням на головну
    };

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
        const config = getDiagnosticConfig(savedData?.answers);
        setPageType(config.type || "default");

        api.getScenarios().then((data) => {
            if (Array.isArray(data)) {
                const withDifficulty = data.map(s => ({
                    ...s,
                    difficulty: s.difficulty || 50
                }));
                setAllScenarios(withDifficulty);
            }
        });

        const userId = localStorage.getItem("userId");
        if (userId || (api.isGuest && api.isGuest())) {
            api.getUserProfile().then((profile) => {
                if (profile) {
                    setCompletedScenarios(profile.completedScenarios || []);
                    setUserResilience(profile.stats?.resilience || 50);
                }
            }).catch(() => {});

            if (api.isGuest && api.isGuest()) {
                setIsGuest(true);
                setUsername("Гість");
                api.getProfile().then((profile) => {
                    if (profile && profile.username) setUsername(profile.username);
                }).catch(() => {});
            } else {
                setIsGuest(false);
                setUsername("Профіль");
            }

            if (userId) {
                api.getUserStats(userId).then((stats) => {
                    if (stats?.resilience) setUserResilience(stats.resilience);
                }).catch(() => {});
            }
        }
    }, []);

    useEffect(() => {
        let list = [...allScenarios];
        if (isPersonalized) {
            const currentStatus = pageType.toLowerCase();
            list = list.filter((s) => {
                const cat = (s.category || "general").toLowerCase();
                if (currentStatus === "default") return cat === "general";
                return cat === currentStatus || cat === "general";
            });
        }
        setFilteredScenarios(list);
    }, [allScenarios, isPersonalized, pageType]);

    const getStateLabel = () => {
        switch(pageType) {
            case "anxiety": return "Тривога";
            case "apathy": return "Апатія";
            case "stress": return "Стрес";
            default: return "Норма";
        }
    };

    return (
        <div className={`dr-ex-layout theme-${pageType}`}>
            <div className="dr-ex-deco puzzle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dr-ex-svg-full">
                    <path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"></path>
                </svg>
            </div>
            <div className="dr-ex-deco search">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dr-ex-svg-full">
                    <path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle>
                </svg>
            </div>
            <header className="dr-ex-header">
                <div className="dr-ex-header-container">
                    <div className="dr-ex-header-inner">
                        <div className="dr-ex-logo" onClick={() => navigate("/start")}>
                            <div className="dr-ex-logo-icon-box">
                                <Shield className="dr-ex-logo-icon" strokeWidth={2.5} />
                            </div>
                            <h1 className="dr-ex-logo-text">Броня для розуму</h1>
                        </div>

                        <nav className="dr-ex-nav-center">
                            <button className="dr-ex-nav-link" onClick={() => navigate(getBackPath())}>
                                <ArrowLeft className="dr-ex-icon-sm" /> <span>Назад</span>
                            </button>
                        </nav>

                        <div className="dr-ex-user-section">
                            <div className="dr-ex-state-badge">
                                Стан: <span className="dr-ex-state-value">{getStateLabel()}</span>
                            </div>
                            <button 
                                className="dr-ex-profile-btn" 
                                onClick={() => isGuest ? navigate("/auth") : navigate("/profile")}
                            >
                                {username}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dr-ex-main">
                <div className="dr-ex-page-header">
                    <div>
                        <h1 className="dr-ex-page-title">Психологічні тренажери</h1>
                        <p className="dr-ex-page-subtitle">Практичні вправи для підтримки та розвитку стійкості</p>
                    </div>
                    <button
                        className={`dr-ex-filter-toggle ${!isPersonalized ? "active" : ""}`}
                        onClick={() => setIsPersonalized(!isPersonalized)}
                    >
                        <Unlock className="w-5 h-5" />
                        {isPersonalized ? "Показати всі" : "Тільки для мене"}
                    </button>
                </div>

                <div className="dr-ex-grid">
                    {filteredScenarios.map((s) => {
                        const isCompleted = completedScenarios.find(c => c.scenarioId === s.scenarioId);
                        const difficultyPercent = s.difficulty || 50;
                        const difficultyLevel = getDifficultyLevel(difficultyPercent);
                        const rec = getRecommendation(s, userResilience, completedScenarios);
                        const category = (s.category || "general").toLowerCase();

                        return (
                            <div
                                key={s._id}
                                className={`dr-ex-card ${rec.type}`}
                                onClick={() => {
                                    if (s.type === "find-differences") {
                                        navigate(`/find-differences/${s.scenarioId}`);
                                    } else if (s.type === "sorting") {
                                        navigate(`/sorting/${s.scenarioId}`);
                                    } else if (s.type === "video") {
                                        navigate(`/video-scenario/${s.scenarioId}`);
                                    } else {
                                        navigate(`/exercises/${s.scenarioId}`);
                                    }
                                }}
                            >
                                <div className="dr-ex-card-visual" style={getCardStyle(category)}>
                                    <div className="dr-ex-card-emoji">
                                        {isCompleted ? '✅' : s.type === "find-differences" ? '🔍' : s.type === "sorting" ? '🎯' : s.type === "video" ? '🎬' : '🧩'}
                                    </div>
                                    <div className="dr-ex-card-badge" style={getBadgeStyle(category)}>
                                        {s.type === "find-differences" ? <Search className="w-5 h-5" strokeWidth={2.5}/> : 
                                         s.type === "sorting" ? <Grid3X3 className="w-5 h-5" strokeWidth={2.5}/> : 
                                         s.type === "video" ? <Video className="w-5 h-5" strokeWidth={2.5}/> : 
                                         <Puzzle className="w-5 h-5" strokeWidth={2.5}/>}
                                    </div>
                                </div>

                                <div className="dr-ex-card-info">
                                    <div className="dr-ex-card-meta">
                                        <span className={`dr-ex-status-label ${rec.type}`}>
                                            {rec.message}
                                        </span>
                                    </div>
                                    <h3 className="dr-ex-card-headline">{s.name}</h3>
                                    
                                    <div className="dr-ex-card-details">
                                        <span className="dr-ex-duration">⏱ {s.duration || "5 хв"}</span>
                                        <div className="dr-ex-difficulty">
                                            <span className="dr-ex-difficulty-text">Складність:</span>
                                            <div className={`dr-ex-dots level-${difficultyLevel}`}>
                                                {[1, 2, 3, 4, 5].map(level => (
                                                    <span key={level} className={`dr-ex-dot ${level <= difficultyLevel ? 'filled' : 'empty'}`}></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dr-ex-card-action">
                                        <span>{isCompleted ? "Повторити" : "Почати вправу"}</span>
                                        <Target className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <div className="dr-ex-companion-layer">
                <CharacterCompanion context="exercise" position="bottom-right" delay={3500} />
            </div>
        </div>
    );
}