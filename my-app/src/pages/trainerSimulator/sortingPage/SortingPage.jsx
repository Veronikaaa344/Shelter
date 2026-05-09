import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import "./sortingPage.css";

export default function SortingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [sortedCount, setSortedCount] = useState(0);
    const [wrongAttempts, setWrongAttempts] = useState({});
    const [showCompanion, setShowCompanion] = useState(false);
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    const companionRef = useRef(null);

    const generateItems = () => {
        const colors = ['#ff4b4b', '#4b4bff', '#4baf4b', '#9b4bff'];
        const newItems = [];
        for (let i = 0; i < 15; i++) {
            newItems.push({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                x: Math.random() * 60 + 20, // Розміщуємо ближче до центру
                y: Math.random() * 40 + 15,
            });
        }
        return newItems;
    };

    const generateBoxes = () => {
        const colors = ['#ff4b4b', '#4b4bff', '#4baf4b', '#9b4bff'];
        return colors.map((color, index) => ({
            id: index,
            color: color,
            items: []
        }));
    };

    useEffect(() => {
        if (id === 'chaos-unloading') {
            setScenario({ name: 'Розвантаження хаосу', description: 'Перетягни квадрати у відповідні коробки або просто пересувай їх по полю' });
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
        setTimeout(() => e.target.classList.add('dr-item-dragging'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dr-item-dragging');
        setDraggedItem(null);
    };

    const handleGlobalDrop = (e) => {
        e.preventDefault();
        if (!draggedItem) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setItems(items.map(item => 
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
        if (draggedItem.color === targetBox.color) {
            setBoxes(boxes.map(b => b.id === boxId ? { ...b, items: [...b.items, draggedItem] } : b));
            setItems(items.filter(item => item.id !== draggedItem.id));
            setSortedCount(prev => prev + 1);
            if (sortedCount + 1 >= 15) {
                setIsFinished(true);
                setTimeout(() => setShowCompletionMenu(true), 1000);
            }
        } else {
            setHighlightedBox(boxes.find(b => b.color === draggedItem.color).id);
            setTimeout(() => setHighlightedBox(null), 2000);
        }
    };

    if (loading) return <div className="dr-new-layout dr-st-center"><h2>Завантаження...</h2></div>;

    return (
        <div className="dr-new-layout dr-sorting-page">
            <button className="dr-show-all-btn dr-sorting-back" onClick={() => navigate("/quests")}>
                ← Повернутися до квестів
            </button>
            
            <div className="dr-sorting-top-counter">
                Залишилось {15 - sortedCount}
            </div>

            <aside className="dr-sorting-sidebar">
                <h2 className="dr-sorting-title">{scenario?.name}</h2>
                <p className="dr-sorting-desc">{scenario?.description}</p>
            </aside>

            <main className="dr-game-area" onDragOver={(e) => e.preventDefault()} onDrop={handleGlobalDrop}>
                <div className="dr-items-layer">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="dr-sorting-item"
                            style={{ backgroundColor: item.color, left: `${item.x}%`, top: `${item.y}%` }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </div>

                <div className="dr-sorting-dock">
                    <div className="dr-dock-tray">
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className={`dr-sorting-box ${highlightedBox === box.id ? 'highlight-correct' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                                onDrop={(e) => handleBoxDrop(e, box.id)}
                            >
                                <div className="dr-box-label" style={{ backgroundColor: box.color }}></div>
                                <div className="dr-box-content">
                                    {box.items.map((item, idx) => (
                                        <div key={idx} className="dr-sorted-mini-item" style={{ backgroundColor: item.color }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {showCompanion && <CharacterCompanion ref={companionRef} context="exercise" position="bottom-right" />}

            {showCompletionMenu && (
                <div className="dr-completion-overlay">
                    <div className="dr-status-card dr-st-empty-card">
                        <div className="dr-card-emoji">🎉</div>
                        <h2 className="dr-status-title">Відмінно!</h2>
                        <button className="dr-trainer-btn" onClick={() => navigate("/exercises")}>Продовжити</button>
                    </div>
                </div>
            )}
        </div>
    );
}