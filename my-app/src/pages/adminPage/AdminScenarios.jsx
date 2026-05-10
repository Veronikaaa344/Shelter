import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./adminPage.css";

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

export default function AdminScenarios() {
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [editId, setEditId] = useState(null);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    
    const [scenarioTitle, setScenarioTitle] = useState("");
    const [scenarioSlug, setScenarioSlug] = useState("");
    const [scenarioCategory, setScenarioCategory] = useState("general");
    const [scenarioDuration, setScenarioDuration] = useState("5 хв");
    const [scenarioDifficulty, setScenarioDifficulty] = useState(50);
    const [scenarioType, setScenarioType] = useState("dialogue");
    const [nodes, setNodes] = useState([
        {
            id: "start",
            text: "",
            isFinal: false,
            options: [{ text: "", next: "", weight: 0 }],
        },
    ]);

    const loadData = useCallback(async () => {
        try {
            console.log("Loading scenarios data...");
            const data = await api.getScenarios();
            console.log("Loaded scenarios data:", data);
            
            if (Array.isArray(data)) {
                setScenarios(data);
                console.log("Set scenarios data:", data.length, "items");
            } else {
                console.error("Invalid data format for scenarios:", data);
            }
        } catch (error) {
            console.error("Error loading scenarios:", error);
        }
    }, []);

    const handleEditScenario = (item) => {
        setEditId(item._id);
        setScenarioTitle(item.name);
        setScenarioSlug(item.scenarioId);
        setScenarioCategory(item.category || "general");
        setScenarioDuration(item.duration || "5 хв");
        setScenarioDifficulty(item.difficulty || 50);
        setScenarioType(item.type || "dialogue");

        if (item.type === "find-differences") {
            setNodes([
                {
                    id: "start",
                    text: "",
                    isFinal: false,
                    options: [{ text: "", next: "", weight: 0 }],
                },
            ]);
        } else if (item.type === "video") {
            setNodes([
                {
                    id: "start",
                    text: "",
                    isFinal: false,
                    options: [{ text: "", next: "", weight: 0 }],
                },
            ]);
        } else if (item.type === "audio") {
            setNodes([
                {
                    id: "start",
                    text: "",
                    isFinal: false,
                    options: [{ text: "", next: "", weight: 0 }],
                },
            ]);
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

    const handleSaveScenario = async (e, customPayload = null) => {
        e.preventDefault();

        let payload;

        try {
            if (customPayload) {
                payload = customPayload;
            } else if (isJsonMode) {
                try {
                    payload = JSON.parse(jsonInput);
                } catch (e) {
                    alert("Некоректный формат JSON");
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

            const res = editId
                ? await api.updateScenario(editId, payload)
                : await api.createScenario(payload);

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
            alert("Помилка збереження: " + (err.message || "Невідома помилка"));
        }
    };

    const updateNode = (index, field, value) => {
        const newNodes = [...nodes];
        newNodes[index][field] = value;
        setNodes(newNodes);
    };

    const handleDeleteScenario = async (itemId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей сценарій?")) {
            try {
                const res = await api.deleteScenario(itemId);
                if (res && !res.error) {
                    alert("Сценарій успішно видалено!");
                    loadData();
                } else {
                    alert("Помилка: " + (res?.error || res?.message || "Невідома помилка"));
                }
            } catch (err) {
                alert("Помилка при видаленні сценарію");
            }
        }
    };

    if (viewMode === "list") {
        return (
            <div className="dr-admin-layout">
                <aside className="dr-admin-sidebar">
                    <div className="dr-admin-logo">Admin</div>
                    <nav className="dr-admin-nav">
                        <button
                            className="active"
                            onClick={() => {
                                navigate("/admin/materials");
                                resetForms();
                            }}
                        >
                            📚 Матеріали
                        </button>
                        <button
                            className="active"
                            onClick={() => {
                                navigate("/admin/scenarios");
                                resetForms();
                            }}
                        >
                            🎭 Сценарії
                        </button>
                    </nav>
                </aside>

                <main className="dr-admin-main">
                    <div className="dr-admin-header">
                        <h1>Управління сценаріями</h1>
                        <div className="dr-admin-actions">
                            <button 
                                className="dr-create-btn"
                                onClick={() => setViewMode("create")}
                            >
                                ➕ Створити сценарій
                            </button>
                        </div>
                    </div>

                    <div className="dr-admin-content">
                        <div className="dr-admin-table">
                            <div className="dr-table-header">
                                <div>Назва</div>
                                <div>Тип</div>
                                <div>Категорія</div>
                                <div>Тривалість</div>
                                <div>Дії</div>
                            </div>
                            
                            {scenarios.map((item) => (
                                <div key={item._id} className="dr-table-row">
                                    <div className="dr-table-cell">{item.name}</div>
                                    <div className="dr-table-cell">{item.type}</div>
                                    <div className="dr-table-cell">{item.category || "general"}</div>
                                    <div className="dr-table-cell">{item.duration || "5 хв"}</div>
                                    <div className="dr-table-cell dr-actions">
                                        <button 
                                            className="dr-edit-btn"
                                            onClick={() => handleEditScenario(item)}
                                        >
                                            ✏️️
                                        </button>
                                        <button 
                                            className="dr-delete-btn"
                                            onClick={() => handleDeleteScenario(item._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (viewMode === "create") {
        return (
            <div className="dr-admin-layout">
                <aside className="dr-admin-sidebar">
                    <div className="dr-admin-logo">Admin</div>
                    <nav className="dr-admin-nav">
                        <button
                            onClick={() => {
                                setViewMode("list");
                                resetForms();
                            }}
                        >
                            📚 Матеріали
                        </button>
                        <button
                            className="active"
                            onClick={() => {
                                navigate("/admin/scenarios");
                                resetForms();
                            }}
                        >
                            🎭 Сценарії
                        </button>
                    </nav>
                </aside>

                <main className="dr-admin-main">
                    <div className="dr-admin-header">
                        <h1>{editId ? "Редагувати сценарій" : "Створити сценарій"}</h1>
                        <div className="dr-admin-actions">
                            <button 
                                className="dr-back-btn"
                                onClick={() => {
                                    setViewMode("list");
                                    resetForms();
                                }}
                            >
                                ↩️️ Назад
                            </button>
                            <div className="dr-mode-toggle">
                                <button 
                                    className={!isJsonMode ? "active" : ""}
                                    onClick={() => setIsJsonMode(false)}
                                >
                                    📝 Форма
                                </button>
                                <button 
                                    className={isJsonMode ? "active" : ""}
                                    onClick={() => setIsJsonMode(true)}
                                >
                                    {"}"} JSON
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {!isJsonMode ? (
                        <form onSubmit={handleSaveScenario} className="dr-scenario-form">
                            <div className="dr-form-grid">
                                <div className="dr-input-group">
                                    <label>
                                        <span>Назва сценарію</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioTitle}
                                        onChange={(e) => setScenarioTitle(e.target.value)}
                                        placeholder="Введіть назву сценарію"
                                        required
                                    />
                                </div>
                                
                                <div className="dr-input-group">
                                    <label>
                                        <span>ID сценарію</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scenarioSlug}
                                        onChange={(e) => setScenarioSlug(e.target.value)}
                                        placeholder="my-scenario"
                                        required
                                    />
                                </div>
                                
                                <div className="dr-input-group">
                                    <label>
                                        <span>Категорія</span>
                                    </label>
                                    <select
                                        value={scenarioCategory}
                                        onChange={(e) => setScenarioCategory(e.target.value)}
                                    >
                                        <option value="general">Загальне</option>
                                        <option value="anxiety">Тривога</option>
                                        <option value="stress">Стрес</option>
                                        <option value="apathy">Апатія</option>
                                    </select>
                                </div>
                                
                                <div className="dr-input-group">
                                    <label>
                                        <span>Тривалість сценарію</span>
                                    </label>
                                    <select
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
                                
                                <div className="dr-input-group">
                                    <label>
                                        <span>Складність</span>
                                    </label>
                                    <select
                                        value={scenarioDifficulty}
                                        onChange={(e) => setScenarioDifficulty(e.target.value)}
                                    >
                                        <option value="30">Легко</option>
                                        <option value="50">Середньо</option>
                                        <option value="70">Складно</option>
                                    </select>
                                </div>

                                <div className="dr-input-group">
                                    <label>
                                        <span>Тип сценарію</span>
                                    </label>
                                    <div className="dr-type-selector">
                                        <button
                                            className={scenarioType === "dialogue" ? "active" : ""}
                                            onClick={() => {
                                                setScenarioType("dialogue");
                                                setShowTypeSelector(false);
                                            }}
                                        >
                                            Діалог
                                        </button>
                                        <button
                                            className={scenarioType === "find-differences" ? "active" : ""}
                                            onClick={() => {
                                                setScenarioType("find-differences");
                                                setShowTypeSelector(false);
                                            }}
                                        >
                                            Знайди відмінності
                                        </button>
                                        <button
                                            className={scenarioType === "video" ? "active" : ""}
                                            onClick={() => {
                                                setScenarioType("video");
                                                setShowTypeSelector(false);
                                            }}
                                        >
                                            Відео
                                        </button>
                                        <button
                                            className={scenarioType === "audio" ? "active" : ""}
                                            onClick={() => {
                                                setScenarioType("audio");
                                                setShowTypeSelector(false);
                                            }}
                                        >
                                            Аудіо
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="dr-save-btn">
                                {editId ? "Оновити" : "Створити"}
                            </button>
                        </form>
                    ) : (
                        <div className="dr-json-editor">
                            <textarea
                                className="dr-json-area"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Введіть JSON сценарію..."
                                rows={15}
                            />
                        </div>
                    )}
                </main>
            </div>
        );
    }

    return null;
}
