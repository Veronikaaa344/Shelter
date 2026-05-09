import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./adminPage.css";

const SAMPLE_MATERIAL_JSON = JSON.stringify({
    title: "Назва матеріалу",
    desc: "Короткий опис про що цей контент",
    type: "text",
    icon: "📖",
    category: "general",
    duration: "5 хв",
    content: "Тут розміщується основний контент матеріалу..."
}, null, 2);

const SAMPLE_SCENARIO_JSON = JSON.stringify({
    scenarioId: "my-scenario",
    name: "Назва сценарію",
    category: "general",
    duration: "5 хв",
    difficulty: 50,
    nodes: {
        start: {
            text: "Привіт! Як ти себе почуваєш сьогодні?",
            isFinal: false,
            options: [
                { text: "Чудово!", next: "good", weight: 1 },
                { text: "Не дуже", next: "bad", weight: -1 }
            ]
        },
        good: {
            text: "Супер! Продовжуй в тому ж дусі! 🌟",
            isFinal: true,
            options: []
        },
        bad: {
            text: "Я поруч. Зроби глибокий вдих... 🫁",
            isFinal: true,
            options: []
        }
    }
}, null, 2);

const SAMPLE_FIND_DIFFERENCES_JSON = JSON.stringify({
    type: "find-differences",
    name: "Знайди відмінності: Приклад",
    scenarioId: "find-differences-sample",
    category: "general",
    duration: "10 хв",
    difficulty: 60,
    levels: [
        {
            image: "/images/find/039516a68526e8db5506bd47cf8c211b.jpg",
            differences: [
                { x: 100, y: 150, radius: 30 },
                { x: 300, y: 200, radius: 40 },
            ],
        },
    ],
}, null, 2);

export default function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("content");
    const [viewMode, setViewMode] = useState("list");
    const [editId, setEditId] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [scenarios, setScenarios] = useState([]);

    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState("");

    const [materialForm, setMaterialForm] = useState({
        title: "",
        desc: "",
        type: "text",
        icon: "📖",
        content: "",
        category: "general",
        duration: "5 хв",
    });

    const [scenarioTitle, setScenarioTitle] = useState("");
    const [scenarioSlug, setScenarioSlug] = useState("");
    const [scenarioCategory, setScenarioCategory] = useState("general");
    const [scenarioDuration, setScenarioDuration] = useState("5 хв");
    const [scenarioDifficulty, setScenarioDifficulty] = useState(50);
    const [scenarioType, setScenarioType] = useState("dialogue");
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [nodes, setNodes] = useState([
        {
            id: "start",
            text: "",
            isFinal: false,
            options: [{ text: "", next: "", weight: 0 }],
        },
    ]);

    const [findImage2, setFindImage2] = useState("");
    const [differences, setDifferences] = useState([]);
    const [differenceRadius, setDifferenceRadius] = useState(30);
    const [imageZoom, setImageZoom] = useState(1);
    const [draggingMarker, setDraggingMarker] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (draggingMarker !== null) {
                const container = document.querySelector('.dr-find-image-container');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / imageZoom;
                    const y = (e.clientY - rect.top) / imageZoom;
                    const newDifferences = [...differences];
                    newDifferences[draggingMarker] = {
                        ...newDifferences[draggingMarker],
                        x: x,
                        y: y,
                    };
                    setDifferences(newDifferences);
                }
            }
        };

        const handleMouseUp = () => {
            setDraggingMarker(null);
        };

        if (draggingMarker !== null) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingMarker, differences, imageZoom]);

    const loadData = async () => {
        const data =
            activeTab === "content"
                ? await api.getMaterials()
                : await api.getScenarios();
        if (Array.isArray(data)) {
            activeTab === "content" ? setMaterials(data) : setScenarios(data);
        }
    };

    const handleEditMaterial = (item) => {
        setEditId(item._id);
        setMaterialForm({
            title: item.title,
            desc: item.desc,
            type: item.type,
            icon: item.icon,
            content: item.content || item.fullText || item.url,
            category: item.category || "general",
            duration: item.duration || "5 хв",
        });
        setJsonInput(JSON.stringify(item, null, 4));
        setViewMode("create");
    };

    const handleEditScenario = (item) => {
        setEditId(item._id);
        setScenarioTitle(item.name);
        setScenarioSlug(item.scenarioId);
        setScenarioCategory(item.category || "general");
        setScenarioDuration(item.duration || "5 хв");
        setScenarioDifficulty(item.difficulty || 50);

        setScenarioType(item.type || "dialogue");

        if (item.type === "find-differences") {
            setFindImage2(item.levels?.[0]?.image || "");
            setDifferences(item.levels?.[0]?.differences || []);
        } else {
            const transformedNodes = item.nodes ? Object.entries(item.nodes).map(([id, data]) => ({
                id,
                ...data,
                options:
                    data.options?.map((opt) => ({ ...opt, weight: opt.weight || 0 })) || [],
            })) : [];
            setNodes(transformedNodes);
        }

        setJsonInput(JSON.stringify(item, null, 4));
        setViewMode("create");
    };

    const resetForms = () => {
        setEditId(null);
        setIsJsonMode(false);
        setJsonInput("");
        setMaterialForm({
            title: "",
            desc: "",
            type: "text",
            icon: "📖",
            content: "",
            category: "general",
            duration: "5 хв",
        });
        setScenarioTitle("");
        setScenarioSlug("");
        setScenarioCategory("general");
        setScenarioDuration("5 хв");
        setScenarioDifficulty(50);
        setNodes([
            {
                id: "start",
                text: "",
                isFinal: false,
                options: [{ text: "", next: "", weight: 0 }],
            },
        ]);
        setJsonInput(SAMPLE_SCENARIO_JSON);
        setViewMode("list");
    };

    const insertFormat = (formatType, value = "") => {
        const textarea = document.getElementById("dr-content-textarea");
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = materialForm.content;
        const selectedText = text.substring(start, end);

        let formattedText = "";
        if (formatType === "bold") {
            formattedText = `<b>${selectedText || "Текст"}</b>`;
        } else if (formatType === "size") {
            formattedText = `<span style="font-size: ${value}">${selectedText || "Текст"}</span>`;
        }

        const newContent = text.substring(0, start) + formattedText + text.substring(end);
        setMaterialForm({ ...materialForm, content: newContent });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + formattedText.length);
        }, 0);
    };

    const handleSaveMaterial = async (e) => {
        e.preventDefault();
        try {
            let payload;
            if (isJsonMode) {
                try {
                    payload = JSON.parse(jsonInput);
                } catch (e) {
                    alert("Некорректный формат JSON");
                    return;
                }
            } else {
                payload = materialForm;
            }
            const res = editId
                ? await api.updateMaterial(editId, payload)
                : await api.createMaterial(payload);
            if (res) {
                resetForms();
                loadData();
            }
        } catch (err) {
            alert("Помилка при збереженні матеріалу");
        }
    };

    const handleSaveScenario = async (e, customPayload = null) => {
        let payload;
        if (customPayload) {
            payload = customPayload;
        } else if (isJsonMode) {
            try {
                payload = JSON.parse(jsonInput);
            } catch (e) {
                alert("Некорректный формат JSON");
                return;
            }
        } else {
            const nodesObject = nodes.reduce((acc, node) => {
                if (node.id.trim()) {
                    acc[node.id] = {
                        text: node.text,
                        isFinal: node.isFinal,
                        options: node.isFinal
                            ? []
                            : node.options
                                    .filter((opt) => opt.text.trim() !== "")
                                    .map((opt) => ({
                                        text: opt.text,
                                        next: opt.next.trim() || null,
                                        weight: parseInt(opt.weight) || 0,
                                    })),
                    };
                }
                return acc;
            }, {});

            payload = {
                scenarioId: scenarioSlug,
                name: scenarioTitle,
                category: scenarioCategory,
                duration: scenarioDuration,
                difficulty: scenarioDifficulty,
                nodes: nodesObject,
            };
        }

        console.log("handleSaveScenario - payload:", payload);
        console.log("handleSaveScenario - editId:", editId);

        try {
            const res = editId
                ? await api.updateScenario(editId, payload)
                : await api.createScenario(payload);
            console.log("handleSaveScenario - response:", res);
            if (res) {
                if (res.error || res.message) {
                    alert("Помилка сервера: " + (res.error || res.message));
                } else {
                    resetForms();
                    loadData();
                }
            } else {
                alert("Помилка: сервер не повернув відповідь");
            }
        } catch (err) {
            console.error("handleSaveScenario - error:", err);
            alert("Помилка збереження: " + (err.message || "Невідома помилка"));
        }
    };

    const updateNode = (index, field, value) => {
        const newNodes = [...nodes];
        newNodes[index][field] = value;
        setNodes(newNodes);
    };

    return (
        <div className="dr-admin-layout">
            <aside className="dr-admin-sidebar">
                <div className="dr-admin-logo">Admin</div>
                <nav className="dr-admin-nav">
                    <button
                        className={activeTab === "content" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("content");
                            resetForms();
                        }}
                    >
                        📚 Контент
                    </button>
                    <button
                        className={activeTab === "scenarios" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("scenarios");
                            resetForms();
                        }}
                    >
                        🎮 Сценарії
                    </button>
                </nav>
                <button className="dr-admin-exit" onClick={() => navigate("/main")}>
                    Вихід
                </button>
            </aside>

            <main className="dr-admin-main">
                <header className="dr-admin-top-bar">
                    <h1>{activeTab === "content" ? "Бібліотека знань" : "Тренажери"}</h1>
                    <div className="dr-top-actions">
                        {viewMode === "create" && (
                            <button
                                className={`dr-mode-toggle ${isJsonMode ? "active" : ""}`}
                                onClick={() => {
                                    if (!isJsonMode) {
                                        if (activeTab === "content") {
                                            setJsonInput(SAMPLE_MATERIAL_JSON);
                                        } else {
                                            setJsonInput(SAMPLE_SCENARIO_JSON);
                                        }
                                    } else {
                                        setJsonInput("");
                                    }
                                    setIsJsonMode(!isJsonMode);
                                }}
                            >
                                {isJsonMode ? "📝 Текстовий Режим" : "📄 JSON Режим"}
                            </button>
                        )}
                        <button
                            className="dr-add-new-btn"
                            onClick={() => {
                                if (viewMode === "list") {
                                    if (activeTab === "scenarios") {
                                        setShowTypeSelector(true);
                                    } else {
                                        setViewMode("create");
                                    }
                                } else {
                                    resetForms();
                                }
                            }}
                        >
                            {viewMode === "list" ? "+ Створити" : "Скасувати"}
                        </button>
                    </div>
                </header>

                <div className="dr-admin-container">
                    {viewMode === "list" ? (
                        <div className="dr-admin-list">
                            {(activeTab === "content" ? materials : scenarios).map((item) => (
                                <div key={item._id} className="dr-list-item">
                                    <div className="dr-item-info">
                                        <span className="dr-item-icon">
                                            {item.type === "find-differences" ? "🔍" : item.icon || "⚙️"}
                                        </span>
                                        <div>
                                            <h3>{item.title || item.name}</h3>
                                            <p>
                                                {item.type === "find-differences" ? "Знайди відмінності" : item.type || "Сценарій"} • {item.category || "general"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="dr-item-actions">
                                        <button
                                            className="dr-edit-btn"
                                            onClick={() =>
                                                activeTab === "content"
                                                    ? handleEditMaterial(item)
                                                    : handleEditScenario(item)
                                            }
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            className="dr-delete-btn"
                                            onClick={async () => {
                                                if (window.confirm("Видалити?")) {
                                                    activeTab === "content"
                                                        ? await api.deleteMaterial(item._id)
                                                        : await api.deleteScenario(item._id);
                                                    loadData();
                                                }
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isJsonMode ? (
                        <div className="dr-json-editor">
                            <textarea
                                className="dr-json-area"
                                value={jsonInput}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    const sample = activeTab === "content" ? SAMPLE_MATERIAL_JSON : SAMPLE_SCENARIO_JSON;
                                    if (jsonInput === sample && newValue !== sample) {
                                        setJsonInput("");
                                    } else {
                                        setJsonInput(newValue);
                                    }
                                }}
                                placeholder="Встав свій JSON або редагуй приклад..."
                            />
                            <button
                                className="dr-save-btn"
                                onClick={activeTab === "content" ? handleSaveMaterial : handleSaveScenario}
                            >
                                {editId ? "Обновити з JSON" : "Зберегти JSON"}
                            </button>
                        </div>
                    ) : activeTab === "content" ? (
                        <form onSubmit={handleSaveMaterial} className="dr-content-form">
                            <div className="dr-form-grid">
                                <div className="dr-input-group full">
                                    <label>
                                        <span>Заголовок матеріалу</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={materialForm.title}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                title: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="dr-input-group">
                                    <label>
                                        <span>Тип контенту</span>
                                    </label>
                                    <div className="dr-type-selector">
                                        {["text", "video", "audio"].map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`dr-type-btn ${materialForm.type === t ? "active" : ""}`}
                                                onClick={() =>
                                                    setMaterialForm({ ...materialForm, type: t })
                                                }
                                            >
                                                {t === "text"
                                                    ? "📄 Текст"
                                                    : t === "video"
                                                        ? "🎥 Видео"
                                                        : "🎵 Аудио"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="dr-input-group">
                                    <label>
                                        <span>Категорія</span>
                                    </label>
                                    <div className="dr-category-grid">
                                        {["general", "anxiety", "stress", "apathy"].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`dr-cat-card ${materialForm.category === c ? "active" : ""}`}
                                                onClick={() =>
                                                    setMaterialForm({ ...materialForm, category: c })
                                                }
                                            >
                                                {c === "general"
                                                    ? "Загальне"
                                                    : c === "anxiety"
                                                        ? "Тривога"
                                                        : c === "stress"
                                                            ? "Стрес"
                                                            : "Апатія"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="dr-input-group">
                                    <label>
                                        <span>Тривалість</span>
                                    </label>
                                    <select
                                        className="dr-duration-select"
                                        value={materialForm.duration}
                                        onChange={(e) =>
                                            setMaterialForm({ ...materialForm, duration: e.target.value })
                                        }
                                    >
                                        <option value="3 хв">3 хвилини</option>
                                        <option value="5 хв">5 хвилин</option>
                                        <option value="10 хв">10 хвилин</option>
                                        <option value="15 хв">15 хвилин</option>
                                        <option value="20 хв">20 хвилин</option>
                                    </select>
                                </div>
                                <div className="dr-input-group full">
                                    <label>
                                        <span>Опис</span>
                                    </label>
                                    <textarea
                                        value={materialForm.desc}
                                        onChange={(e) =>
                                            setMaterialForm({ ...materialForm, desc: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="dr-input-group full">
                                    <label>
                                        <span>Контент</span>
                                    </label>
                                    <div className="dr-format-toolbar">
                                        <button
                                            type="button"
                                            className="dr-format-btn"
                                            onClick={() => insertFormat("bold")}
                                        >
                                            Жирний
                                        </button>
                                        <select
                                            className="dr-format-select"
                                            onChange={(e) => {
                                                insertFormat("size", e.target.value);
                                                e.target.value = "";
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Розмір тексту</option>
                                            <option value="12px">Маленький (12px)</option>
                                            <option value="16px">Звичайний (16px)</option>
                                            <option value="20px">Великий (20px)</option>
                                            <option value="24px">Дуже великий (24px)</option>
                                        </select>
                                    </div>
                                    <textarea
                                        id="dr-content-textarea"
                                        className="dr-tall-text"
                                        value={materialForm.content}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                content: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="dr-save-btn">
                                {editId ? "Обновить" : "Опублікувати"}
                            </button>
                        </form>
                    ) : (
                        scenarioType === "find-differences" ? (
                            <div className="dr-find-differences-builder">
                            <div className="dr-scenario-meta">
                                <div className="dr-input-group">
                                    <label>
                                        <span>Назва сценарію</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioTitle}
                                        onChange={(e) => setScenarioTitle(e.target.value)}
                                    />
                                </div>
                                <div className="dr-input-group">
                                    <label>
                                        <span>Технічний ID</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioSlug}
                                        onChange={(e) => setScenarioSlug(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div
                                className="dr-input-group full"
                                style={{ marginBottom: "30px" }}
                            >
                                <label>
                                    <span>Цільовий стан</span>
                                </label>
                                <div className="dr-category-grid">
                                    {["general", "anxiety", "stress", "apathy"].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`dr-cat-card ${scenarioCategory === c ? "active" : ""}`}
                                            onClick={() => setScenarioCategory(c)}
                                        >
                                            {c === "general"
                                                ? "🌐 Загальне"
                                                : c === "anxiety"
                                                    ? "😰 Тривога"
                                                    : c === "stress"
                                                        ? "😫 Стрес"
                                                        : "😐 Апатія"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="dr-input-group">
                                <label>
                                    <span>Тривалість сценарію</span>
                                </label>
                                <select
                                    className="dr-duration-select"
                                    value={scenarioDuration}
                                    onChange={(e) => setScenarioDuration(e.target.value)}
                                >
                                    <option value="3 хв">3 хвилини</option>
                                    <option value="5 хв">5 хвилин</option>
                                    <option value="10 хв">10 хвилин</option>
                                    <option value="15 хв">15 хвилин</option>
                                    <option value="20 хв">20 хвилин</option>
                                </select>
                            </div>
                            <div className="dr-input-group full">
                                <label>
                                    <span>Складність сценарію</span>
                                    <span className="dr-difficulty-value">{scenarioDifficulty}% — {scenarioDifficulty <= 20 ? 'Дуже легкий' : scenarioDifficulty <= 40 ? 'Легкий' : scenarioDifficulty <= 60 ? 'Середній' : scenarioDifficulty <= 80 ? 'Складний' : 'Експерт'}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scenarioDifficulty}
                                    onChange={(e) => setScenarioDifficulty(parseInt(e.target.value))}
                                    className="dr-difficulty-slider"
                                />
                                <div className="dr-difficulty-scale">
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty <= 20 ? '#22c55e' : '#e5e7eb' }}></div>
                                        <span>0-20%<br/>Дуже легкий</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 20 && scenarioDifficulty <= 40 ? '#84cc16' : '#e5e7eb' }}></div>
                                        <span>21-40%<br/>Легкий</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 40 && scenarioDifficulty <= 60 ? '#eab308' : '#e5e7eb' }}></div>
                                        <span>41-60%<br/>Середній</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 60 && scenarioDifficulty <= 80 ? '#f59e0b' : '#e5e7eb' }}></div>
                                        <span>61-80%<br/>Складний</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 80 ? '#ef4444' : '#e5e7eb' }}></div>
                                        <span>81-100%<br/>Експерт</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dr-input-group full">
                                <label>
                                    <span>Зображення</span>
                                </label>
                                <select
                                    value={findImage2}
                                    onChange={(e) => setFindImage2(e.target.value)}
                                >
                                    <option value="">Виберіть зображення...</option>
                                    <option value="/images/find/039516a68526e8db5506bd47cf8c211b.jpg">039516a68526e8db5506bd47cf8c211b.jpg</option>
                                    <option value="/images/find/0e6d0cc4e87a8abcd51a717b56c5a118.jpg">0e6d0cc4e87a8abcd51a717b56c5a118.jpg</option>
                                    <option value="/images/find/8bbb7288c8019e09454be10515454fd3.jpg">8bbb7288c8019e09454be10515454fd3.jpg</option>
                                    <option value="/images/find/b10699c924572e604f00ae41944fe9e9.jpg">b10699c924572e604f00ae41944fe9e9.jpg</option>
                                    <option value="/images/find/b9ad2c569c9ff8c143ecb92d5cb0b379.jpg">b9ad2c569c9ff8c143ecb92d5cb0b379.jpg</option>
                                    <option value="/images/find/bf67f4d6b024c9730fff0a2f2e53a5dc.jpg">bf67f4d6b024c9730fff0a2f2e53a5dc.jpg</option>
                                </select>
                            </div>
                            <div className="dr-input-group full">
                                <label>
                                    <span>Радіус області натискання: {differenceRadius}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="80"
                                    value={differenceRadius}
                                    onChange={(e) => setDifferenceRadius(parseInt(e.target.value))}
                                    className="dr-difficulty-slider"
                                />
                            </div>
                            <div className="dr-input-group full">
                                <label>
                                    <span>Масштаб зображення: {Math.round(imageZoom * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={imageZoom}
                                    onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                                    className="dr-difficulty-slider"
                                />
                            </div>
                            {findImage2 && (
                                <div className="dr-find-preview">
                                    <div className="dr-find-image-wrapper">
                                        <div className="dr-find-image-container">
                                            <img
                                                src={findImage2}
                                                alt="Зображення"
                                                className="dr-find-preview-img clickable"
                                                style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top left' }}
                                                onClick={(e) => {
                                                    const img = e.target;
                                                    const rect = img.getBoundingClientRect();
                                                    const scaleX = img.naturalWidth / rect.width;
                                                    const scaleY = img.naturalHeight / rect.height;
                                                    const x = (e.clientX - rect.left) * scaleX;
                                                    const y = (e.clientY - rect.top) * scaleY;
                                                    console.log("Координати натискання:", { x, y, rectWidth: rect.width, rectHeight: rect.height, scaleX, scaleY });
                                                    setDifferences([...differences, { x, y, radius: differenceRadius }]);
                                                }}
                                                onError={(e) => {
                                                    console.error("Помилка завантаження зображення:", findImage2);
                                                }}
                                                onLoad={(e) => {
                                                    console.log("Зображення завантажено:", findImage2);
                                                }}
                                            />
                                            {differences.map((diff, idx) => {
                                                const img = document.querySelector('.dr-find-preview-img');
                                                if (!img) return null;
                                                const rect = img.getBoundingClientRect();
                                                const scaleX = rect.width / img.naturalWidth;
                                                const scaleY = rect.height / img.naturalHeight;
                                                return (
                                                <div
                                                    key={idx}
                                                    className="dr-difference-marker"
                                                    style={{
                                                        left: diff.x * scaleX - diff.radius * scaleX,
                                                        top: diff.y * scaleY - diff.radius * scaleY,
                                                        width: diff.radius * 2 * scaleX,
                                                        height: diff.radius * 2 * scaleY,
                                                        cursor: draggingMarker === idx ? 'grabbing' : 'grab',
                                                        transform: `scale(${imageZoom})`,
                                                        transformOrigin: 'top left'
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setDraggingMarker(idx);
                                                        const rect = e.target.getBoundingClientRect();
                                                        setDragOffset({
                                                            x: e.clientX - rect.left,
                                                            y: e.clientY - rect.top,
                                                        });
                                                    }}
                                                >
                                                    <button
                                                        className="dr-difference-remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDifferences(differences.filter((_, i) => i !== idx));
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                );
                                            })}
                                        </div>
                                        <div className="dr-find-image-label">Натисни для додавання відмінності, перетягуй маркери для переміщення</div>
                                    </div>
                                </div>
                            )}
                            <div className="dr-differences-list">
                                <h3>Додані відмінності: {differences.length}</h3>
                                {differences.map((diff, idx) => (
                                    <div key={idx} className="dr-difference-item">
                                        <span>#{idx + 1}: x={Math.round(diff.x)}, y={Math.round(diff.y)}, r={diff.radius}</span>
                                        <button
                                            onClick={() => setDifferences(differences.filter((_, i) => i !== idx))}
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="dr-save-btn"
                                onClick={() => {
                                    if (!scenarioTitle.trim()) {
                                        alert("Введіть назву сценарію");
                                        return;
                                    }
                                    if (!scenarioSlug.trim()) {
                                        alert("Введіть технічний ID");
                                        return;
                                    }
                                    if (!findImage2) {
                                        alert("Виберіть зображення");
                                        return;
                                    }
                                    if (differences.length === 0) {
                                        alert("Додайте хоча б одну відмінність");
                                        return;
                                    }

                                    const payload = {
                                        type: "find-differences",
                                        name: scenarioTitle,
                                        scenarioId: scenarioSlug,
                                        category: scenarioCategory,
                                        duration: scenarioDuration,
                                        difficulty: scenarioDifficulty,
                                        levels: [
                                            {
                                                image: findImage2,
                                                differences: differences,
                                            },
                                        ],
                                    };
                                    console.log("Збереження сценарію:", payload);
                                    handleSaveScenario({ preventDefault: () => {} }, payload);
                                }}
                            >
                                {editId ? "Оновити сценарій" : "Зберегти сценарій"}
                            </button>
                        </div>
                        ) : (
                            <div className="dr-scenario-builder">
                            <div className="dr-scenario-meta">
                                <div className="dr-input-group">
                                    <label>
                                        <span>Назва сценарію</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioTitle}
                                        onChange={(e) => setScenarioTitle(e.target.value)}
                                    />
                                </div>
                                <div className="dr-input-group">
                                    <label>
                                        <span>Технічний ID</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioSlug}
                                        onChange={(e) => setScenarioSlug(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div
                                className="dr-input-group full"
                                style={{ marginBottom: "30px" }}
                            >
                                <label>
                                    <span>Цільовий стан</span>
                                </label>
                                <div className="dr-category-grid">
                                    {["general", "anxiety", "stress", "apathy"].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`dr-cat-card ${scenarioCategory === c ? "active" : ""}`}
                                            onClick={() => setScenarioCategory(c)}
                                        >
                                            {c === "general"
                                                ? "🌐 Загальне"
                                                : c === "anxiety"
                                                    ? "😰 Тривога"
                                                    : c === "stress"
                                                        ? "😫 Стрес"
                                                        : "😐 Апатія"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="dr-input-group">
                                <label>
                                    <span>Тривалість сценарію</span>
                                </label>
                                <select
                                    className="dr-duration-select"
                                    value={scenarioDuration}
                                    onChange={(e) => setScenarioDuration(e.target.value)}
                                >
                                    <option value="3 хв">3 хвилини</option>
                                    <option value="5 хв">5 хвилин</option>
                                    <option value="10 хв">10 хвилин</option>
                                    <option value="15 хв">15 хвилин</option>
                                    <option value="20 хв">20 хвилин</option>
                                </select>
                            </div>
                            <div className="dr-input-group full">
                                <label>
                                    <span>Складність сценарію</span>
                                    <span className="dr-difficulty-value">{scenarioDifficulty}% — {scenarioDifficulty <= 20 ? 'Дуже легкий' : scenarioDifficulty <= 40 ? 'Легкий' : scenarioDifficulty <= 60 ? 'Середній' : scenarioDifficulty <= 80 ? 'Складний' : 'Експерт'}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scenarioDifficulty}
                                    onChange={(e) => setScenarioDifficulty(parseInt(e.target.value))}
                                    className="dr-difficulty-slider"
                                />
                                <div className="dr-difficulty-scale">
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty <= 20 ? '#22c55e' : '#e5e7eb' }}></div>
                                        <span>0-20%<br/>Дуже легкий</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 20 && scenarioDifficulty <= 40 ? '#84cc16' : '#e5e7eb' }}></div>
                                        <span>21-40%<br/>Легкий</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 40 && scenarioDifficulty <= 60 ? '#eab308' : '#e5e7eb' }}></div>
                                        <span>41-60%<br/>Середній</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 60 && scenarioDifficulty <= 80 ? '#f59e0b' : '#e5e7eb' }}></div>
                                        <span>61-80%<br/>Складний</span>
                                    </div>
                                    <div className="dr-scale-item">
                                        <div className="dr-scale-dot" style={{ background: scenarioDifficulty > 80 ? '#ef4444' : '#e5e7eb' }}></div>
                                        <span>81-100%<br/>Експерт</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dr-nodes-container">
                                {nodes.map((node, nIdx) => (
                                    <div key={nIdx} className="dr-node-card">
                                        <div className="dr-node-header">
                                            <div className="dr-id-badge">
                                                <label>ID:</label>
                                                <input
                                                    type="text"
                                                    value={node.id}
                                                    onChange={(e) =>
                                                        updateNode(nIdx, "id", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <label className="dr-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={node.isFinal}
                                                    onChange={(e) =>
                                                        updateNode(nIdx, "isFinal", e.target.checked)
                                                    }
                                                />
                                                <span>Фінал</span>
                                            </label>
                                        </div>
                                        <div className="dr-input-group full">
                                            <label>
                                                <span>Фраза бота</span>
                                            </label>
                                            <textarea
                                                value={node.text}
                                                onChange={(e) =>
                                                    updateNode(nIdx, "text", e.target.value)
                                                }
                                            />
                                        </div>
                                        {!node.isFinal && (
                                            <div className="dr-options-area">
                                                <label className="dr-sub-label">
                                                    Варіанти відповідей:
                                                </label>
                                                {node.options.map((opt, oIdx) => (
                                                    <div
                                                        key={oIdx}
                                                        className="dr-opt-row admin-score-row"
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Текст кнопки"
                                                            value={opt.text}
                                                            onChange={(e) => {
                                                                const n = [...nodes];
                                                                n[nIdx].options[oIdx].text = e.target.value;
                                                                setNodes(n);
                                                            }}
                                                        />
                                                        <div className="dr-link-input">
                                                            <span>🔗 →</span>
                                                            <input
                                                                type="text"
                                                                placeholder="ID блоку"
                                                                value={opt.next}
                                                                onChange={(e) => {
                                                                    const n = [...nodes];
                                                                    n[nIdx].options[oIdx].next = e.target.value;
                                                                    setNodes(n);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="dr-weight-selector">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    opt.weight === 1 ? "pos active" : "pos"
                                                                }
                                                                onClick={() => {
                                                                    const n = [...nodes];
                                                                    n[nIdx].options[oIdx].weight = 1;
                                                                    setNodes(n);
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={
                                                                    opt.weight === 0 ? "neu active" : "neu"
                                                                }
                                                                onClick={() => {
                                                                    const n = [...nodes];
                                                                    n[nIdx].options[oIdx].weight = 0;
                                                                    setNodes(n);
                                                                }}
                                                            >
                                                                0
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={
                                                                    opt.weight === -1 ? "neg active" : "neg"
                                                                }
                                                                onClick={() => {
                                                                    const n = [...nodes];
                                                                    n[nIdx].options[oIdx].weight = -1;
                                                                    setNodes(n);
                                                                }}
                                                            >
                                                                -
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="dr-remove-opt"
                                                            onClick={() => {
                                                                const n = [...nodes];
                                                                n[nIdx].options.splice(oIdx, 1);
                                                                setNodes(n);
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="dr-add-opt-btn"
                                                    onClick={() => {
                                                        const n = [...nodes];
                                                        n[nIdx].options.push({
                                                            text: "",
                                                            next: "",
                                                            weight: 0,
                                                        });
                                                        setNodes(n);
                                                    }}
                                                >
                                                    + Додати варіант
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="dr-action-bar">
                                <button
                                    type="button"
                                    className="dr-add-node-btn"
                                    onClick={() =>
                                        setNodes([
                                            ...nodes,
                                            {
                                                id: `node_${nodes.length}`,
                                                text: "",
                                                isFinal: false,
                                                options: [{ text: "", next: "", weight: 0 }],
                                            },
                                        ])
                                    }
                                >
                                    + Додати блок
                                </button>
                                <button
                                    type="button"
                                    className="dr-save-btn"
                                    onClick={handleSaveScenario}
                                >
                                    {editId ? "Оновити сценарій" : "Зберегти сценарій"}
                                </button>
                            </div>
                        </div>
                        )
                    )}

                </div>
            </main>

            {showTypeSelector && (
                <div className="dr-type-selector-modal">
                    <div className="dr-type-selector-content">
                        <h2>Виберіть тип сценарію</h2>
                        <div className="dr-type-options">
                            <button
                                className="dr-type-option"
                                onClick={() => {
                                    setScenarioType("dialogue");
                                    setShowTypeSelector(false);
                                    setViewMode("create");
                                }}
                            >
                                <div className="dr-type-icon">💬</div>
                                <h3>Діалог</h3>
                                <p>Текстовий сценарій з варіантами відповідей</p>
                            </button>
                            <button
                                className="dr-type-option"
                                onClick={() => {
                                    setScenarioType("find-differences");
                                    setShowTypeSelector(false);
                                    setViewMode("create");
                                }}
                            >
                                <div className="dr-type-icon">🔍</div>
                                <h3>Знайди відмінності</h3>
                                <p>Гра з пошуку відмінностей на зображеннях</p>
                            </button>
                        </div>
                        <button
                            className="dr-close-modal-btn"
                            onClick={() => setShowTypeSelector(false)}
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}