import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/api";
import { getDiagnosticConfig } from "../../../diagnosticLogic";
import { Check, Lock, Play, MapPin, Grid3X3, Trophy, Sparkles } from 'lucide-react';
import "./QuestsView.css";

const QuestsView = ({ 
    navigateTo, 
    resilience,
    setSimulatorScenarioId,
    setIsSimulatorMode,
    setIsFindDifferencesMode,
    setIsSortingMode,
    simulatorScenariosList
}) => {
    const [pageType, setPageType] = useState("default");
    const [quests, setQuests] = useState([]);
    const [currentDay, setCurrentDay] = useState(1);

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

    const createMixedQuests = useCallback((scenarios, materials) => {
        const questsList = [];
        let dayCounter = 1;
        
        // Фільтруємо матеріали за типом сторінки
        const filteredMaterials = materials.filter(m => {
            if (pageType === "default") return m.category === "general";
            return m.category === pageType || m.category === "general";
        });

        const maxLength = Math.max(scenarios.length, filteredMaterials.length);
        
        for (let i = 0; i < maxLength; i++) {
            // Додаємо вправу
            if (i < scenarios.length) {
                if (dayCounter === 1) {
                    // Перше завдання - сортування
                    questsList.push({
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
                    questsList.push({
                        id: `exercise-${scenario._id || i}`,
                        day: dayCounter++,
                        title: scenario.name || scenario.title || `Вправа дня ${dayCounter}`,
                        thought: thoughts[(dayCounter - 2) % thoughts.length],
                        task: `${scenario.duration || "5"} хв`,
                        scenarioId: scenario.scenarioId || scenario._id,
                        type: scenario.type,
                        questType: "exercise",
                        status: "locked"
                    });
                }
            }
            
            // Додаємо матеріал
            if (i < filteredMaterials.length) {
                const material = filteredMaterials[i];
                questsList.push({
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
        
        return questsList;
    }, [pageType, thoughts]);

    const updateQuestStatuses = useCallback((compScenarios, compMaterials, initialQuests) => {
        const updatedQuests = [...initialQuests];
        let foundCurrent = false;

        updatedQuests.forEach((quest, index) => {
            let isCompleted = false;

            if (quest.questType === "exercise") {
                // Match by scenarioId or _id
                isCompleted = compScenarios.some(c => 
                    (c.scenarioId && c.scenarioId === quest.scenarioId) || 
                    (c.id && c.id === quest.scenarioId) ||
                    (c._id && c._id === quest.scenarioId)
                );
            } else if (quest.questType === "material") {
                // Match by materialId or _id
                isCompleted = compMaterials.some(m => 
                    (m.materialId && m.materialId === quest.materialId) || 
                    (m.id && m.id === quest.materialId) ||
                    (m._id && m._id === quest.materialId)
                );
            } else if (quest.questType === "sorting") {
                isCompleted = compScenarios.some(c => c.type === "sorting" || c.scenarioId === "chaos-unloading");
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
    }, []);

    const loadData = useCallback(() => {
        const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
        const config = getDiagnosticConfig(savedData?.answers);
        setPageType(config?.type || "default");

        Promise.all([
            api.getScenarios().catch(() => []),
            api.getMaterials().catch(() => []),
            api.getProfile().catch(() => ({ completedScenarios: [], completedMaterials: [] }))
        ]).then(([scenariosData, materialsData, profile]) => {
            const mixedQuests = createMixedQuests(scenariosData, materialsData);
            const updated = updateQuestStatuses(
                profile.completedScenarios || [], 
                profile.completedMaterials || [], 
                mixedQuests
            );
            setQuests(updated);
        });
    }, [createMixedQuests, updateQuestStatuses]);

    useEffect(() => {
        loadData();
        
        // Listen for focus to refresh progress
        window.addEventListener('focus', loadData);
        return () => window.removeEventListener('focus', loadData);
    }, [loadData]);

    const handleQuestAction = (quest) => {
        if (quest.questType === "sorting") {
            setSimulatorScenarioId(quest.scenarioId || "chaos-unloading");
            setIsSortingMode(true);
        } else if (quest.questType === "exercise") {
            if (quest.type === "find-differences" || quest.type === "findDifferences") {
                setSimulatorScenarioId(quest.scenarioId);
                setIsFindDifferencesMode(true);
            } else {
                setSimulatorScenarioId(quest.scenarioId);
                setIsSimulatorMode(true);
            }
        } else if (quest.questType === "material") {
            navigateTo('material', quest.materialId);
        }
    };

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
                <div className="inline-flex p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20 mb-4">
                    <Trophy className="text-amber-500" size={40} />
                </div>
                <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">Квести Стійкості</h1>
                <p className="text-slate-500 text-xl italic font-medium">Один день — один маленький крок.</p>
            </div>

            <div className="relative space-y-12 before:absolute before:left-[27px] before:top-8 before:bottom-8 before:w-1 before:bg-slate-800 before:rounded-full">
                {quests.map((quest) => (
                    <div key={quest.id} className={`relative pl-20 transition-all duration-500 ${quest.status === 'locked' ? 'opacity-50' : 'opacity-100'}`}>
                        {/* Fox Marker */}
                        {quest.status === "current" && (
                            <div className="absolute -left-4 -top-8 text-4xl animate-bounce z-20">🦊</div>
                        )}

                        {/* Marker Circle */}
                        <div className={`absolute left-0 top-2 w-14 h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                            quest.status === 'completed' ? 'bg-emerald-500 border-emerald-500/50 text-white' :
                            quest.status === 'current' ? 'bg-blue-600 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' :
                            'bg-slate-900 border-slate-800 text-slate-600'
                        }`}>
                            {quest.status === 'completed' ? <Check size={24} strokeWidth={3} /> : 
                             quest.status === 'current' ? (quest.questType === 'sorting' ? <Grid3X3 size={24} /> : <MapPin size={24} />) : 
                             <Lock size={20} />}
                        </div>

                        {/* Content Card */}
                        <div className={`p-8 rounded-[40px] border transition-all duration-500 ${
                            quest.status === 'current' ? 'bg-slate-900/60 border-blue-500/50 shadow-2xl scale-[1.02]' :
                            'bg-slate-900/40 border-slate-800'
                        }`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">День {quest.day}</span>
                                        {quest.status === 'completed' && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Виконано</span>}
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{quest.title}</h3>
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border-l-4 border-slate-700">
                                        <p className="text-slate-400 italic text-sm">"{quest.thought}"</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                        <Sparkles size={12} className="text-amber-500" />
                                        Завдання: {quest.task}
                                    </div>
                                </div>
                                
                                {quest.status !== 'locked' && (
                                    <button 
                                        onClick={() => handleQuestAction(quest)}
                                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                                            quest.status === 'current' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        <Play size={14} fill="currentColor" />
                                        {quest.status === 'completed' ? 'Повторити' : 'Почати зараз'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestsView;
