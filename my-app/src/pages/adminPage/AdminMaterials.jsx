import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { api } from "../../api/api";
import "./adminPage.css";

export default function AdminMaterials() {
    const navigate = useNavigate();

    const [materials, setMaterials] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [editId, setEditId] = useState(null);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState("");

    const [materialForm, setMaterialForm] = useState({
        title: "",
        desc: "",
        type: "text",
        icon: "📖",
        image: "",
        content: "",
        category: "general",
        duration: "5 хв",
    });

    const cleanHtmlContent = (html) => {
        if (!html) return html;

        return html
            .replace(/\s+data-[^=]*="[^"]*"/g, "")
            .replace(/\s+data-[^=]*='[^']*'/g, "")
            .replace(/\s+data-[^=\s>]*/g, "")
            .replace(/\s+>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    };

    const loadData = useCallback(async () => {
        try {
            console.log("Loading materials data...");
            const data = await api.getMaterials();

            if (Array.isArray(data)) {
                setMaterials(data);
            } else {
                console.error("Invalid data format:", data);
            }
        } catch (error) {
            console.error("Error loading materials:", error);
        }
    }, []);

    const handleEditMaterial = (item) => {
        setEditId(item._id);

        setMaterialForm({
            title: item.title,
            desc: item.desc,
            type: item.type,
            icon: item.icon,
            image: item.image || "",
            content: item.content || item.fullText || item.url || "",
            category: item.category || "general",
            duration: item.duration || "5 хв",
        });

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
            image: "",
            content: "",
            category: "general",
            duration: "5 хв",
        });

        setViewMode("list");
    };

    const handleSaveMaterial = async (e) => {
        e.preventDefault();
        
        console.log("🟢 handleSaveMaterial called");
        console.log("📋 editId:", editId);
        console.log("📋 isJsonMode:", isJsonMode);

        try {
            let payload;

            if (isJsonMode) {
                try {
                    payload = JSON.parse(jsonInput);
                    console.log("📋 JSON payload:", payload);
                } catch {
                    alert("Некоректний JSON");
                    return;
                }
            } else {
                payload = {
                    ...materialForm,
                    content: cleanHtmlContent(materialForm.content),
                };
                console.log("📋 Form payload:", payload);
            }

            console.log("🚀 About to call API...");
            const res = editId
                ? await api.updateMaterial(editId, payload)
                : await api.createMaterial(payload);
            
            console.log("📥 API response:", res);

            if (res && !res.error) {
                alert(
                    editId
                        ? "Матеріал успішно оновлено!"
                        : "Матеріал успішно створено!"
                );

                resetForms();
                loadData();
            } else {
                alert(
                    "Помилка: " +
                        (res?.error ||
                            res?.message ||
                            "Невідома помилка")
                );
            }
        } catch (err) {
            alert("Помилка при збереженні матеріалу");
        }
    };

    const handleDeleteMaterial = async (itemId) => {
        if (
            window.confirm(
                "Ви впевнені, що хочете видалити цей матеріал?"
            )
        ) {
            try {
                const res = await api.deleteMaterial(itemId);

                if (res && !res.error) {
                    alert("Матеріал успішно видалено!");
                    loadData();
                } else {
                    alert(
                        "Помилка: " +
                            (res?.error ||
                                res?.message ||
                                "Невідома помилка")
                    );
                }
            } catch {
                alert("Помилка при видаленні матеріалу");
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
                                navigate("/admin");
                                resetForms();
                            }}
                        >
                            📚 Матеріали
                        </button>

                        <button
                            onClick={() =>
                                navigate("/admin/scenarios")
                            }
                        >
                            🎭 Сценарії
                        </button>
                    </nav>
                </aside>

                <main className="dr-admin-main">
                    <div className="dr-admin-header">
                        <h1>Управління матеріалами</h1>

                        <div className="dr-admin-actions">
                            <button
                                className="dr-create-btn"
                                onClick={() =>
                                    setViewMode("create")
                                }
                            >
                                ➕ Створити матеріал
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

                            {materials.map((item) => (
                                <div
                                    key={item._id}
                                    className="dr-table-row"
                                >
                                    <div className="dr-table-cell">
                                        {item.title}
                                    </div>

                                    <div className="dr-table-cell">
                                        {item.type}
                                    </div>

                                    <div className="dr-table-cell">
                                        {item.category || "general"}
                                    </div>

                                    <div className="dr-table-cell">
                                        {item.duration || "5 хв"}
                                    </div>

                                    <div className="dr-table-cell dr-actions">
                                        <button
                                            className="dr-edit-btn"
                                            onClick={() =>
                                                handleEditMaterial(
                                                    item
                                                )
                                            }
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="dr-delete-btn"
                                            onClick={() =>
                                                handleDeleteMaterial(
                                                    item._id
                                                )
                                            }
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
                            onClick={() =>
                                navigate("/admin/scenarios")
                            }
                        >
                            🎭 Сценарії
                        </button>
                    </nav>
                </aside>

                <main className="dr-admin-main">
                    <div className="dr-admin-header">
                        <h1>
                            {editId
                                ? "Редагувати матеріал"
                                : "Створити матеріал"}
                        </h1>

                        <div className="dr-admin-actions">
                            <button
                                className="dr-back-btn"
                                onClick={() => {
                                    setViewMode("list");
                                    resetForms();
                                }}
                            >
                                ↩️ Назад
                            </button>

                            <div className="dr-mode-toggle">
                                <button
                                    className={
                                        !isJsonMode ? "active" : ""
                                    }
                                    onClick={() =>
                                        setIsJsonMode(false)
                                    }
                                >
                                    📝 Форма
                                </button>

                                <button
                                    className={
                                        isJsonMode ? "active" : ""
                                    }
                                    onClick={() =>
                                        setIsJsonMode(true)
                                    }
                                >
                                    {"}"} JSON
                                </button>
                            </div>
                        </div>
                    </div>

                    {!isJsonMode ? (
                        <form
                            onSubmit={handleSaveMaterial}
                            className="dr-material-form"
                        >
                            <div className="dr-form-grid">
                                <div className="dr-input-group">
                                    <label>Назва</label>

                                    <input
                                        type="text"
                                        value={materialForm.title}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                title:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="dr-input-group">
                                    <label>Опис</label>

                                    <textarea
                                        className="dr-form-textarea"
                                        value={materialForm.desc}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                desc:
                                                    e.target.value,
                                            })
                                        }
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="dr-input-group">
                                    <label>Тип</label>

                                    <select
                                        value={materialForm.type}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                type:
                                                    e.target.value,
                                            })
                                        }
                                    >
                                        <option value="text">
                                            Текст
                                        </option>

                                        <option value="video">
                                            Відео
                                        </option>

                                        <option value="audio">
                                            Аудіо
                                        </option>
                                    </select>
                                </div>

                                <div className="dr-input-group">
                                    <label>Іконка</label>

                                    <input
                                        type="text"
                                        value={materialForm.icon}
                                        onChange={(e) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                icon:
                                                    e.target.value,
                                            })
                                        }
                                        maxLength={2}
                                    />
                                </div>

                                <div className="dr-input-group full">
                                    <label>Контент</label>

                                    <Editor
                                        apiKey="no-api-key"
                                        value={materialForm.content}
                                        onEditorChange={(content) =>
                                            setMaterialForm({
                                                ...materialForm,
                                                content: content,
                                            })
                                        }
                                        init={{
                                            height: 400,
                                            menubar: false,
                                            plugins: [
                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                            ],
                                            toolbar: 'undo redo | blocks | ' +
                                                'bold italic forecolor | alignleft aligncenter ' +
                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                'removeformat | help',
                                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="dr-save-btn"
                            >
                                {editId
                                    ? "Оновити"
                                    : "Створити"}
                            </button>
                        </form>
                    ) : (
                        <div className="dr-json-editor">
                            <textarea
                                className="dr-json-area"
                                value={jsonInput}
                                onChange={(e) =>
                                    setJsonInput(e.target.value)
                                }
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