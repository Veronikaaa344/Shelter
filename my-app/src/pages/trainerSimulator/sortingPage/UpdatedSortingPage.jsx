import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import { ArrowLeft, Target, Sparkles, Grid3X3 } from 'lucide-react';
import "./updatedSortingPage.css";

export default function UpdatedSortingPage({ isEmbedded, embeddedId, onBack }) {
    const params = useParams();
    const id = isEmbedded ? embeddedId : params.id;
    const navigate = useNavigate();
    
    const handleClose = () => {
        if (isEmbedded && onBack) {
            onBack();
        } else {
            navigate("/exercises");
        }
    };

    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [sortedCount, setSortedCount] = useState(0);
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState({});
    const [showCompanion, setShowCompanion] = useState(false);
    const [score, setScore] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const companionRef = useRef(null);
    const sessionStartTime = useRef(Date.now());

    const colors = [
        { name: 'Тривога', color: '#3B82F6', bg: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' },
        { name: 'Стрес', color: '#10B981', bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' },
        { name: 'Апатія', color: '#F59E0B', bg: 'linear-gradient(135deg, #FED7AA, #FDBA74)' },
        { name: 'Спокій', color: '#8B5CF6', bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }
    ];

    const generateItems = () => {
        const newItems = [];
        for (let i = 0; i < 16; i++) {
            const colorIndex = Math.floor(Math.random() * colors.length);
            newItems.push({
                id: i,
                colorIndex,
                color: colors[colorIndex],
                x: Math.random() * 60 + 20,
                y: Math.random() * 40 + 15,
                scale: 1,
                rotation: Math.random() * 30 - 15
            });
        }
        return newItems;
    };

    const generateBoxes = () => {
        return colors.map((color, index) => ({
            id: index,
            ...color,
            items: [],
            isHighlighted: false
        }));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - sessionStartTime.current) / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (id === 'chaos-unloading') {
            setScenario({ 
                name: 'Розвантаження хаосу', 
                description: 'Сортуйте емоційні стани за категоріями. Перетягніть кожен елемент у відповідну коробку.',
                category: 'general',
                difficulty: 2
            });
            setItems(generateItems());
            setBoxes(generateBoxes());
            setLoading(false);
        } else {
            api.getScenarioById(id).then((data) => {
                if (data) {
                    setScenario(data);
                    setItems(generateItems());
                    setBoxes(generateBoxes());
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id]);

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        setTimeout(() => {
            e.target.classList.add('dragging');
            setItems(prev => prev.map(i => 
                i.id === item.id ? { ...i, scale: 1.1, rotation: 5 } : i
            ));
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setItems(prev => prev.map(item => 
            item.id === draggedItem?.id ? { ...item, scale: 1, rotation: item.rotation } : item
        ));
        setDraggedItem(null);
    };

    const handleGlobalDrop = (e) => {
        e.preventDefault();
        if (!draggedItem) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setItems(prev => prev.map(item => 
            item.id === draggedItem.id 
                ? { ...item, x: Math.max(5, Math.min(90, x - 2)), y: Math.max(5, Math.min(90, y - 2)) } 
                : item
        ));
    };

    const handleBoxDrop = (e, boxId) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (!draggedItem) return;

        const targetBox = boxes.find(b => b.id === boxId);
        if (draggedItem.colorIndex === boxId) {
            // Правильное сопоставление
            setBoxes(prev => prev.map(b => 
                b.id === boxId ? { ...b, items: [...b.items, draggedItem] } : b
            ));
            setItems(prev => prev.filter(item => item.id !== draggedItem.id));
            setSortedCount(prev => prev + 1);
            setScore(prev => prev + 10);
            
            // Анимация успеха
            setBoxes(prev => prev.map(b => 
                b.id === boxId ? { ...b, isHighlighted: true } : b
            ));
            setTimeout(() => {
                setBoxes(prev => prev.map(b => 
                    b.id === boxId ? { ...b, isHighlighted: false } : b
                ));
            }, 500);
            
            if (sortedCount + 1 >= 16) {
                setIsFinished(true);
                const finalScore = score + 10;
                const userId = localStorage.getItem("userId");
                if (userId) {
                    api.updateResilience(userId, Math.min(20, finalScore / 10), "exercise_complete", scenario.name);
                    api.completeScenario(id, Math.min(20, finalScore / 10));
                }
                setTimeout(() => setShowCompletionMenu(true), 1000);
            }
        } else {
            // Неправильное сопоставление
            setHighlightedBox(draggedItem.colorIndex);
            setScore(prev => Math.max(0, prev - 5));
            setTimeout(() => setHighlightedBox(null), 2000);
            
            // Вибрация элемента
            setItems(prev => prev.map(item => 
                item.id === draggedItem.id ? { ...item, rotation: 15 } : item
            ));
            setTimeout(() => {
                setItems(prev => prev.map(item => 
                    item.id === draggedItem.id ? { ...item, rotation: item.rotation } : item
                ));
            }, 300);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="dr-updated-sorting-layout">
            <div className="dr-loading-container">
                <div className="dr-loading-spinner"></div>
                <h2>Завантаження...</h2>
            </div>
        </div>
    );

    return (
        <div className="dr-updated-sorting-layout">
            {/* Header */}
            <header className="dr-sorting-header">
                <div className="dr-header-content">
                    <button className="dr-back-btn" onClick={handleClose}>
                        <ArrowLeft size={20} />
                        <span>До вправ</span>
                    </button>
                    
                    <div className="dr-header-info">
                        <h1 className="dr-scenario-title">{scenario?.name}</h1>
                        <p className="dr-scenario-desc">{scenario?.description}</p>
                    </div>
                    
                    <div className="dr-header-stats">
                        <div className="dr-stat-item">
                            <Target size={16} />
                            <span>{sortedCount}/16</span>
                        </div>
                        <div className="dr-stat-item">
                            <Sparkles size={16} />
                            <span>{score}</span>
                        </div>
                        <div className="dr-stat-item">
                            <Grid3X3 size={16} />
                            <span>{formatTime(sessionTime)}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <main className="dr-game-main">
                {/* Sorting Area */}
                <div className="dr-sorting-area" onDragOver={(e) => e.preventDefault()} onDrop={handleGlobalDrop}>
                    <div className="dr-items-layer">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`dr-sorting-item ${highlightedBox === item.colorIndex ? 'shake' : ''}`}
                                style={{
                                    backgroundColor: item.color.color,
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
                                    boxShadow: `0 8px 24px ${item.color.color}40`
                                }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="dr-item-glow"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sorting Dock */}
                <div className="dr-sorting-dock">
                    <div className="dr-dock-title">
                        <Grid3X3 size={20} />
                        <span>Сортуйте за категоріями</span>
                    </div>
                    <div className="dr-dock-grid">
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className={`dr-sorting-box ${highlightedBox === box.id ? 'highlight-wrong' : ''} ${box.isHighlighted ? 'highlight-correct' : ''}`}
                                style={{
                                    borderColor: box.color,
                                    background: box.bg,
                                    boxShadow: box.isHighlighted ? `0 0 24px ${box.color}60` : `0 4px 12px ${box.color}20`
                                }}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                                onDrop={(e) => handleBoxDrop(e, box.id)}
                            >
                                <div className="dr-box-header">
                                    <div className="dr-box-label" style={{ backgroundColor: box.color }}>
                                        {box.name}
                                    </div>
                                    <div className="dr-box-count">
                                        {box.items.length}/4
                                    </div>
                                </div>
                                <div className="dr-box-content">
                                    {box.items.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="dr-sorted-item" 
                                            style={{ backgroundColor: item.color.color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Character Companion */}
            <CharacterCompanion 
                ref={companionRef}
                context="exercise" 
                position="bottom-right" 
                delay={4000} 
            />

            {/* Completion Menu */}
            {showCompletionMenu && (
                <div className="dr-completion-overlay">
                    <div className="dr-completion-card">
                        <div className="dr-completion-header">
                            <div className="dr-completion-icon">🎉</div>
                            <h2>Чудово виконано!</h2>
                        </div>
                        <div className="dr-completion-stats">
                            <div className="dr-stat-row">
                                <span>Час:</span>
                                <span>{formatTime(sessionTime)}</span>
                            </div>
                            <div className="dr-stat-row">
                                <span>Результат:</span>
                                <span>{score} очок</span>
                            </div>
                            <div className="dr-stat-row">
                                <span>Точність:</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="dr-completion-actions">
                            <button className="dr-completion-btn primary" onClick={handleClose}>
                                До списку вправ
                            </button>
                            <button className="dr-completion-btn secondary" onClick={() => window.location.reload()}>
                                Спробувати ще раз
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
