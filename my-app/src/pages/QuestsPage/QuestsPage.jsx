import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { getDiagnosticConfig } from "../../diagnosticLogic";
import CharacterCompanion from "../../components/characterCompanion/CharacterCompanion";
import { Shield, ArrowLeft, Check, Lock, Play, MapPin, Grid3X3 } from 'lucide-react';
import "./quests.css";

export default function QuestsPage() {
    const navigate = useNavigate();
    const [pageType, setPageType] = useState("default");
    const [username, setUsername] = useState("Гість");
    const [isGuest, setIsGuest] = useState(true);
    const [allScenarios, setAllScenarios] = useState([]);
    const [allMaterials, setAllMaterials] = useState([]);
    const [completedScenarios, setCompletedScenarios] = useState([]);
    const [completedMaterials, setCompletedMaterials] = useState([]);
    const [userResilience, setUserResilience] = useState(50);
    const [currentDay, setCurrentDay] = useState(1);
    const [quests, setQuests] = useState([]);

    const thoughts = [
        "Кожна велика подорож починається з одного вдиху.",
        "Коли світ хитається, шукай опору під ногами.",
        "Емоції — це хвилі. Ти не можеш їх зупинити, але можеш навчитися серфити.",
        "Фокусуйся лише на тому, що можеш контролювати.",
        "Навіть у найтемніші дні є місце для світла.",
        "Ти сильніший, ніж думаєш.",
        "Кожен крок, навіть маленький, — це прогрес.",
        "Дозволь собі бути неідеальним.",
        "Сьогоднішні зусилля — це завтрашній результат.",
        "Ти не самотній у цій подорожі."
    ];

    const createMixedQuests = (scenarios, materials) => {
        const quests = [];
        let dayCounter = 1;
        
        // Фільтруємо матеріали за типом сторінки якщо потрібно
        const filteredMaterials = materials.filter(m => {
            if (pageType === "default") return m.category === "general";
            return m.category === pageType || m.category === "general";
        });

        // Створюємо попарні квести: вправа + матеріал
        const maxLength = Math.max(scenarios.length, filteredMaterials.length);
        
        for (let i = 0; i < maxLength; i++) {
            // Додаємо вправу
            if (i < scenarios.length) {
                if (dayCounter === 1) {
                    // Перше завдання - сортування
                    quests.push({
                        id: `sorting-day-1`,
                        day: dayCounter++,
                        title: "Сортування емоцій",
                        thought: "Емоції — це хвилі. Ти не можеш їх зупинити, але можеш навчитися серфити.",
                        task: "5 хв",
                        scenarioId: "chaos-unloading",
                        type: "sorting",
                        questType: "sorting",
                        status: "current"
                    });
                } else {
                    const scenario = scenarios[i];
                    quests.push({
                        id: `exercise-${scenario._id || i}`,
                        day: dayCounter++,
                        title: scenario.name || `Вправа дня ${dayCounter}`,
                        thought: thoughts[(dayCounter - 2) % thoughts.length],
                        task: `${scenario.duration || "5"} хв`,
                        scenarioId: scenario.scenarioId,
                        type: scenario.type,
                        questType: "exercise",
                        status: "locked"
                    });
                }
            }
            
            // Додаємо матеріал
            if (i < filteredMaterials.length) {
                const material = filteredMaterials[i];
                quests.push({
                    id: `material-${material._id || i}`,
                    day: dayCounter++,
                    title: material.title || `Матеріал дня ${dayCounter}`,
                    thought: thoughts[(dayCounter - 2) % thoughts.length],
                    task: `${material.type || "стаття"} • ${material.duration || "5 хв"}`,
                    materialId: material._id,
                    questType: "material",
                    status: "locked"
                });
            }
        }
        
        return quests;
    };

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
        const config = getDiagnosticConfig(savedData?.answers);
        setPageType(config?.type || "default");

        // Завантажуємо всі вправи та матеріали
        Promise.all([
            api.getScenarios().catch(() => []),
            api.getMaterials().catch(() => [])
        ]).then(([scenariosData, materialsData]) => {
            const withDifficulty = scenariosData.map(s => ({
                ...s,
                difficulty: s.difficulty || 50
            }));
            setAllScenarios(withDifficulty);
            setAllMaterials(materialsData);
            
            // Створюємо змішані квести (вправа + матеріал)
            const mixedQuests = createMixedQuests(withDifficulty, materialsData);
            setQuests(mixedQuests);
        }).catch(() => {
            // Якщо API недоступне, використовуємо заглушки
            const fallbackQuests = [
                { id: 1, day: 1, title: "Фундамент спокою", thought: thoughts[0], task: "Дихальна вправа (3 хв)", status: "locked", questType: "exercise" },
                { id: 2, day: 2, title: "Мистецтво заземлення", thought: thoughts[1], task: "Стаття про техніки заземлення", status: "locked", questType: "material" },
                { id: 3, day: 3, title: "Прийняття емоцій", thought: thoughts[2], task: "Вправа 'Емоційний компас'", status: "locked", questType: "exercise" },
                { id: 4, day: 4, title: "Сила вдячності", thought: thoughts[3], task: "Матеріал про практику вдячності", status: "locked", questType: "material" },
                { id: 5, day: 5, title: "Коло впливу", thought: thoughts[4], task: "Вправа 'Сортувальник турбот'", status: "locked", questType: "exercise" }
            ];
            setQuests(fallbackQuests);
        });

        loadUserProfile();
    }, [createMixedQuests, loadUserProfile, thoughts]);

    // Оновлюємо статуси квестів при кожному поверненні на сторінку
    useEffect(() => {
        const handleFocus = () => {
            loadUserProfile();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [loadUserProfile]);

    const loadUserProfile = () => {
        const userId = localStorage.getItem("userId");
        if (userId || (api.isGuest && api.isGuest())) {
            // Завантажуємо профіль користувача
            api.getUserProfile().then((profile) => {
                if (profile) {
                    setCompletedScenarios(profile.completedScenarios || []);
                    setCompletedMaterials(profile.completedMaterials || []);
                    setUserResilience(profile.stats?.resilience || 50);
                    
                    // Оновлюємо статуси квестів на основі завершених вправ і матеріалів
                    updateQuestStatuses(profile.completedScenarios || [], profile.completedMaterials || []);
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
    };

    const updateQuestStatuses = (completedScenarios, completedMaterials) => {
        setQuests(prevQuests => {
            const updatedQuests = [...prevQuests];
            let foundCurrent = false;
            
            updatedQuests.forEach((quest, index) => {
                let isCompleted = false;
                
                if (quest.questType === "exercise" && quest.scenarioId) {
                    isCompleted = completedScenarios.some(c => c.scenarioId === quest.scenarioId);
                } else if (quest.questType === "material" && quest.materialId) {
                    isCompleted = completedMaterials.some(m => m.materialId === quest.materialId);
                }
                
                if (isCompleted) {
                    quest.status = "completed";
                } else if (!foundCurrent) {
                    quest.status = "current";
                    foundCurrent = true;
                    setCurrentDay(index + 1);
                } else {
                    quest.status = "locked";
                }
            });
            
            return updatedQuests;
        });
    };

    const getStateLabel = () => {
        switch(pageType) {
            case "anxiety": return "Тривога";
            case "apathy": return "Апатія";
            case "stress": return "Стрес";
            default: return "Норма";
        }
    };

    const handleQuestAction = (quest) => {
        if (quest.questType === "sorting") {
            navigate('/trainer/sorting/chaos-unloading', { state: { from: 'quests' } });
        } else if (quest.questType === "exercise") {
            if (quest.scenarioId) {
                if (quest.type === "find-differences") {
                    navigate(`/find-differences/${quest.scenarioId}`, { state: { from: 'quests' } });
                } else {
                    navigate(`/exercises/${quest.scenarioId}`, { state: { from: 'quests' } });
                }
            } else {
                // Заглушка для демо-вправ
                navigate('/exercises', { state: { from: 'quests' } });
            }
        } else if (quest.questType === "material") {
            if (quest.materialId) {
                navigate(`/material/${quest.materialId}`, { state: { from: 'quests' } });
            } else {
                // Заглушка для демо-матеріалів
                navigate('/main', { state: { from: 'quests' } });
            }
        }
    };

    return (
        <div className={`dr-quest-layout theme-${pageType}`}>
            <header className="dr-quest-header">
                <div className="dr-quest-header-container">
                    <div className="dr-quest-header-inner">
                        <div className="dr-quest-logo" onClick={() => navigate("/start")}>
                            <div className="dr-quest-logo-icon-box">
                                <Shield className="dr-quest-logo-icon" strokeWidth={2.5} />
                            </div>
                            <h1 className="dr-quest-logo-text">Броня для розуму</h1>
                        </div>

                        <nav className="dr-quest-nav-center">
                            <button className="dr-quest-nav-link" onClick={() => navigate("/main")}>
                                <ArrowLeft className="dr-quest-icon-sm" /> <span>На головну</span>
                            </button>
                        </nav>

                        <div className="dr-quest-user-section">
                            <div className="dr-quest-state-badge">
                                Стан: <span className="dr-quest-state-value">{getStateLabel()}</span>
                            </div>
                            <button 
                                className="dr-quest-profile-btn" 
                                onClick={() => isGuest ? navigate("/auth") : navigate("/profile")}
                            >
                                {username}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dr-quest-main">
                <div className="dr-quest-page-header">
                    <h1 className="dr-quest-page-title">Квести стійкості</h1>
                    <p className="dr-quest-page-subtitle">Твій шлях. Один день — один маленький крок.</p>
                </div>

                <div className="dr-quest-timeline">
                    {quests.map((quest) => (
                        <div key={quest.id} className={`dr-quest-step ${quest.status}`}>
                            <div className="dr-quest-marker-wrapper">
                                {quest.status === "current" && (
                                    <div className="dr-quest-fox">🦊</div>
                                )}
                                <div className={`dr-quest-marker ${quest.status}`}>
                                    {quest.status === "completed" && <Check className="w-5 h-5" strokeWidth={3} />}
                                    {quest.status === "current" && quest.questType === "sorting" && <Grid3X3 className="w-5 h-5" strokeWidth={2.5} />}
                                    {quest.status === "current" && quest.questType !== "sorting" && <MapPin className="w-5 h-5" strokeWidth={2.5} />}
                                    {quest.status === "locked" && <Lock className="w-4 h-4" strokeWidth={2.5} />}
                                </div>
                            </div>
                            
                            <div className={`dr-quest-card ${quest.status}`}>
                                <div className="dr-quest-card-header">
                                    <span className="dr-quest-day">День {quest.day}</span>
                                    <h3 className="dr-quest-card-title">{quest.title}</h3>
                                </div>
                                <div className="dr-quest-card-body">
                                    <p className="dr-quest-thought">"{quest.thought}"</p>
                                    
                                    {quest.status !== "locked" && (
                                        <button 
                                            className={`dr-quest-action-btn ${quest.status}`}
                                            onClick={() => handleQuestAction(quest)}
                                        >
                                            {quest.questType === "sorting" ? (
                                                <Grid3X3 className="w-4 h-4 mr-2" fill="currentColor" />
                                            ) : (
                                                <Play className="w-4 h-4 mr-2" fill={quest.status === "current" ? "currentColor" : "none"} />
                                            )}
                                            {quest.questType === "sorting" ? "Сортувати емоції" : (quest.status === "completed" ? "Повторити" : "Почати сьогодні")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="dr-quest-companion-layer">
                <CharacterCompanion context="quest" position="bottom-right" delay={2000} />
            </div>
        </div>
    );
}