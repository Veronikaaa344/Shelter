import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import { ArrowLeft, Target, Sparkles, Clock, LayoutGrid } from 'lucide-react';
import "./updatedSortingPage.css";

export default function UpdatedSortingPage({ isEmbedded, embeddedId, onBack }) {
    const params = useParams();
    const id = isEmbedded ? embeddedId : params.id;
    const navigate = useNavigate();
    
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [sortedCount, setSortedCount] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    const [score, setScore] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const sessionStartTime = useRef(Date.now());

    const handleClose = () => {
        if (isEmbedded && onBack) {
            onBack();
        } else {
            navigate("/exercises");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - sessionStartTime.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadScenario = async () => {
            try {
                const data = await api.getScenarioById(id);
                if (data) {
                    setScenario(data);
                    
                    // Use categories and items from DB or fallback
                    const dbBoxes = (data.categories || [
                        { id: 0, name: 'Корисні', color: '#10b981' },
                        { id: 1, name: 'Шкідливі', color: '#ef4444' }
                    ]).map(b => ({ ...b, items: [], isHighlighted: false }));
                    
                    const dbItems = (data.items || [
                        { text: "Я впораюся", categoryId: 0 },
                        { text: "Це занадто складно", categoryId: 1 },
                        { text: "Я маю право на помилку", categoryId: 0 },
                        { text: "Нічого не вийде", categoryId: 1 }
                    ]).map((item, index) => ({
                        ...item,
                        id: index,
                        scale: 1,
                        rotation: Math.random() * 10 - 5
                    }));

                    setBoxes(dbBoxes);
                    setItems(dbItems);
                    setTotalItems(dbItems.length);
                }
            } catch (err) {
                console.error('Error loading sorting scenario:', err);
            } finally {
                setLoading(false);
            }
        };

        loadScenario();
    }, [id]);

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleBoxDrop = (e, boxId) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (!draggedItem) return;

        if (draggedItem.categoryId === boxId) {
            // Correct
            setBoxes(prev => prev.map(b => 
                b.id === boxId ? { ...b, items: [...b.items, draggedItem], isHighlighted: true } : b
            ));
            setItems(prev => prev.filter(item => item.id !== draggedItem.id));
            setSortedCount(prev => prev + 1);
            setScore(prev => prev + 10);
            
            setTimeout(() => {
                setBoxes(prev => prev.map(b => 
                    b.id === boxId ? { ...b, isHighlighted: false } : b
                ));
            }, 500);

            if (sortedCount + 1 >= totalItems) {
                const userId = localStorage.getItem("userId");
                if (userId) {
                    api.updateResilience(userId, 15, "exercise_complete", scenario?.name || "Сортування");
                }
                setTimeout(() => setShowCompletionMenu(true), 800);
            }
        } else {
            // Wrong
            setHighlightedBox(boxId);
            setScore(prev => Math.max(0, prev - 5));
            setTimeout(() => setHighlightedBox(null), 500);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="dr-updated-sorting-layout items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="dr-updated-sorting-layout">
            <header className="dr-sorting-header">
                <div className="dr-header-content">
                    <button className="dr-back-btn" onClick={handleClose}>
                        <ArrowLeft size={18} />
                        <span>Назад</span>
                    </button>
                    
                    <h1 className="dr-scenario-title">{scenario?.name || "Сортування"}</h1>
                    
                    <div className="dr-header-stats">
                        <div className="dr-stat-item">
                            <Target size={16} />
                            <span>{sortedCount}/{totalItems}</span>
                        </div>
                        <div className="dr-stat-item">
                            <Sparkles size={16} />
                            <span>{score}</span>
                        </div>
                        <div className="dr-stat-item">
                            <Clock size={16} />
                            <span>{formatTime(sessionTime)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dr-game-main">
                <div className="dr-sorting-area">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`dr-sorting-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                        >
                            {item.text}
                        </div>
                    ))}
                    {items.length === 0 && sortedCount < totalItems && (
                        <div className="flex items-center justify-center h-full opacity-20 italic">
                            Всі елементи на місцях...
                        </div>
                    )}
                </div>

                <div className="dr-sorting-dock">
                    {boxes.map((box) => (
                        <div
                            key={box.id}
                            className={`dr-sorting-box ${highlightedBox === box.id ? 'highlight-wrong' : ''} ${box.isHighlighted ? 'highlight-correct' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                            onDrop={(e) => handleBoxDrop(e, box.id)}
                        >
                            <div className="dr-box-header">
                                <div className="dr-box-label" style={{ backgroundColor: box.color }}>
                                    {box.name}
                                </div>
                                <div className="dr-box-count">
                                    {box.items.length}
                                </div>
                            </div>
                            <div className="dr-box-content">
                                {box.items.map((_, idx) => (
                                    <div key={idx} className="dr-sorted-mini-item" style={{ backgroundColor: box.color }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showCompletionMenu && (
                <div className="dr-completion-overlay">
                    <div className="dr-completion-card">
                        <div className="dr-completion-icon">🏆</div>
                        <h2>Вправа завершена!</h2>
                        <div className="dr-completion-stats">
                            <div className="dr-stat-row">
                                <span>Час:</span>
                                <span>{formatTime(sessionTime)}</span>
                            </div>
                            <div className="dr-stat-row">
                                <span>Рахунок:</span>
                                <span>{score}</span>
                            </div>
                        </div>
                        <button className="dr-completion-btn primary" onClick={handleClose}>
                            Завершити
                        </button>
                        <button className="dr-completion-btn secondary" onClick={() => window.location.reload()}>
                            Ще раз
                        </button>
                    </div>
                </div>
            )}

            <CharacterCompanion context="exercise" position="bottom-right" resilience={score / 10} />
        </div>
    );
}
