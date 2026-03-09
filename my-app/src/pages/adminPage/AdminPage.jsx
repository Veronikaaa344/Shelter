import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./adminPage.css";

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
	});

	const [scenarioTitle, setScenarioTitle] = useState("");
	const [scenarioSlug, setScenarioSlug] = useState("");
	const [scenarioCategory, setScenarioCategory] = useState("general");
	const [nodes, setNodes] = useState([
		{
			id: "start",
			text: "",
			isFinal: false,
			options: [{ text: "", next: "", weight: 0 }],
		},
	]);

	useEffect(() => {
		loadData();
	}, [activeTab]);

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
		});
		setViewMode("create");
	};

	const handleEditScenario = (item) => {
		setEditId(item._id);
		setScenarioTitle(item.name);
		setScenarioSlug(item.scenarioId);
		setScenarioCategory(item.category || "general");
		const transformedNodes = Object.entries(item.nodes).map(([id, data]) => ({
			id,
			...data,
			options:
				data.options?.map((opt) => ({ ...opt, weight: opt.weight || 0 })) || [],
		}));
		setNodes(transformedNodes);
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
		});
		setScenarioTitle("");
		setScenarioSlug("");
		setScenarioCategory("general");
		setNodes([
			{
				id: "start",
				text: "",
				isFinal: false,
				options: [{ text: "", next: "", weight: 0 }],
			},
		]);
		setViewMode("list");
	};

	const handleSaveMaterial = async (e) => {
		e.preventDefault();
		try {
			const res = editId
				? await api.updateMaterial(editId, materialForm)
				: await api.createMaterial(materialForm);
			if (res) {
				resetForms();
				loadData();
			}
		} catch (err) {
			alert("Ошибка при сохранении материала");
		}
	};

	const handleSaveScenario = async () => {
		let payload;
		if (isJsonMode) {
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
				nodes: nodesObject,
			};
		}

		try {
			const res = editId
				? await api.updateScenario(editId, payload)
				: await api.createScenario(payload);
			if (res) {
				resetForms();
				loadData();
			}
		} catch (err) {
			alert("Ошибка сохранения.");
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
				<div className="dr-admin-logo">🛡️ Shelter Admin</div>
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
						🎮 Сценарии
					</button>
				</nav>
				<button className="dr-admin-exit" onClick={() => navigate("/main")}>
					Выход
				</button>
			</aside>

			<main className="dr-admin-main">
				<header className="dr-admin-top-bar">
					<h1>{activeTab === "content" ? "Библиотека знаний" : "Тренажеры"}</h1>
					<div className="dr-top-actions">
						{activeTab === "scenarios" && viewMode === "create" && (
							<button
								className={`dr-mode-toggle ${isJsonMode ? "active" : ""}`}
								onClick={() => setIsJsonMode(!isJsonMode)}
							>
								{isJsonMode ? "📝 Текстовый Режим" : "📄 JSON Режим"}
							</button>
						)}
						<button
							className="dr-add-new-btn"
							onClick={() =>
								viewMode === "list" ? setViewMode("create") : resetForms()
							}
						>
							{viewMode === "list" ? "+ Создать" : "Отмена"}
						</button>
					</div>
				</header>

				<div className="dr-admin-container">
					{viewMode === "list" ? (
						<div className="dr-admin-list">
							{(activeTab === "content" ? materials : scenarios).map((item) => (
								<div key={item._id} className="dr-list-item">
									<div className="dr-item-info">
										<span className="dr-item-icon">{item.icon || "⚙️"}</span>
										<div>
											<h3>{item.title || item.name}</h3>
											<p>
												{item.type || "Сценарий"} • {item.category || "general"}
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
											Редактировать
										</button>
										<button
											className="dr-delete-btn"
											onClick={async () => {
												if (window.confirm("Удалить?")) {
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
					) : activeTab === "content" ? (
						<form onSubmit={handleSaveMaterial} className="dr-content-form">
							<div className="dr-form-grid">
								<div className="dr-input-group full">
									<label>
										<span>Заголовок материала</span>
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
										<span>Тип контента</span>
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
										<span>Категория</span>
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
													? "Общее"
													: c === "anxiety"
														? "Тревога"
														: c === "stress"
															? "Стресс"
															: "Апатия"}
											</button>
										))}
									</div>
								</div>
								<div className="dr-input-group full">
									<label>
										<span>Описание</span>
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
									<textarea
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
								{editId ? "Обновить" : "Опубликовать"}
							</button>
						</form>
					) : isJsonMode ? (
						<div className="dr-json-editor">
							<textarea
								className="dr-json-area"
								value={jsonInput}
								onChange={(e) => setJsonInput(e.target.value)}
							/>
							<button className="dr-save-btn" onClick={handleSaveScenario}>
								{editId ? "Обновить из JSON" : "Сохранить JSON"}
							</button>
						</div>
					) : (
						<div className="dr-scenario-builder">
							<div className="dr-scenario-meta">
								<div className="dr-input-group">
									<label>
										<span>Название сценария</span>
									</label>
									<input
										type="text"
										value={scenarioTitle}
										onChange={(e) => setScenarioTitle(e.target.value)}
									/>
								</div>
								<div className="dr-input-group">
									<label>
										<span>Технический ID</span>
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
									<span>Целевое состояние</span>
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
												? "🌐 Общее"
												: c === "anxiety"
													? "😰 Тревога"
													: c === "stress"
														? "😫 Стресс"
														: "😐 Апатия"}
										</button>
									))}
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
												<span>Финал</span>
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
													Варианты ответов:
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
																placeholder="ID блока"
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
													+ Добавить вариант
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
									+ Добавить блок
								</button>
								<button
									type="button"
									className="dr-save-btn"
									onClick={handleSaveScenario}
								>
									{editId ? "Обновить сценарий" : "Сохранить сценарий"}
								</button>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
