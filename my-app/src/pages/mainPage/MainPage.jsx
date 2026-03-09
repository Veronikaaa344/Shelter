import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { getDiagnosticConfig } from "../../diagnosticLogic";
import FocusMode from "./focusMode/FocusMode";
import "./mainPage.css";

export default function MainPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [allMaterials, setAllMaterials] = useState([]);
	const [filteredMaterials, setFilteredMaterials] = useState([]);
	const [activeFilter, setActiveFilter] = useState("all");
	const [selectedMaterial, setSelectedMaterial] = useState(null);
	const [pageType, setPageType] = useState("default");
	const [isPersonalized, setIsPersonalized] = useState(true);

	const [resilience, setResilience] = useState(50);
	const [history, setHistory] = useState([]);

	useEffect(() => {
		const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
		const answers = location.state?.answers || savedData?.answers;
		const config = getDiagnosticConfig(answers);
		setPageType(config.type);

		const userId = localStorage.getItem("userId");

		api
			.getMaterials()
			.then((data) => {
				if (Array.isArray(data)) setAllMaterials(data);
			})
			.catch((err) => console.error(err));

		if (userId) {
			api
				.getUserStats(userId)
				.then((stats) => {
					if (stats) {
						setResilience(stats.resilience || 50);
					}
				})
				.catch((err) => console.error("Stats fetch error:", err));
		}
	}, [location]);

	useEffect(() => {
		let list = [...allMaterials];
		if (isPersonalized) {
			list = list.filter((m) => {
				const category = m.category?.toLowerCase();
				const currentType = pageType?.toLowerCase();
				if (currentType === "default")
					return category === "general" || !category;
				return category === currentType || category === "general";
			});
		}
		if (activeFilter !== "all") {
			list = list.filter((m) => m.type === activeFilter);
		}
		setFilteredMaterials(list);
	}, [allMaterials, isPersonalized, activeFilter, pageType]);

	const handleSosClick = async () => {
		const userId = localStorage.getItem("userId");
		if (userId) {
			await api.updateResilience(userId, 5, "sos", "Кнопка SOS");
		}
		navigate("/sos");
	};
	const handleCloseMaterial = async () => {
		const userId = localStorage.getItem("userId");
		if (userId && selectedMaterial) {
			await api.updateResilience(userId, 2, "material", selectedMaterial.title);
			api
				.getUserStats(userId)
				.then((stats) => {
					if (stats) setResilience(stats.resilience || 50);
				})
				.catch(() => {});
		}
		setSelectedMaterial(null);
	};

	return (
		<div className={`dr-dashboard-layout theme-${pageType}`}>
			<header className="dr-header">
				<div className="dr-logo" onClick={() => navigate("/start")}>
					<span className="dr-logo-icon">🛡️</span>
					<span>Броня для розуму</span>
				</div>
				<nav className="dr-nav-menu">
					<button className="dr-nav-item active">Головна</button>
					<button
						className="dr-nav-item"
						onClick={() => navigate("/exercises")}
					>
						Вправи
					</button>
					<button className="dr-nav-item" onClick={() => navigate("/stats")}>
						Статистика
					</button>
				</nav>
				<div className="dr-user-status">
					Стан:{" "}
					<strong>
						{pageType === "anxiety"
							? "Тривога"
							: pageType === "apathy"
								? "Апатія"
								: pageType === "stress"
									? "Стрес"
									: "Норма"}
					</strong>
				</div>
				<button className="dr-profile-btn" onClick={() => navigate("/auth")}>
					{localStorage.getItem("dr_token") === "guest_mode"
						? "Увійти"
						: "Профіль"}
				</button>
			</header>

			<main className="dr-main-content">
				<div className="dr-top-row">
					<section className="dr-analytics-widget">
						<h2 className="dr-section-title">Мій стан стійкості</h2>
						<div className="dr-chart-container">
							<div className="dr-mock-chart">
								<svg viewBox="0 0 400 100" className="dr-chart-svg">
									<path
										d={`M0,80 L100,${100 - resilience * 0.5} L200,${100 - resilience * 0.7} L300,${100 - resilience * 0.4} L400,${100 - resilience}`}
										className="dr-chart-line"
									/>
									<circle
										cx="400"
										cy={100 - resilience}
										r="6"
										className="dr-chart-point"
									/>
								</svg>
							</div>
							<div className="dr-chart-stats">
								<div className="dr-stat">
									<span className="dr-stat-value">{resilience}%</span>
									<span className="dr-stat-label">Поточний рівень</span>
								</div>
							</div>
						</div>
					</section>

					<section className="dr-chat-cta-block">
						<h2 className="dr-cta-title">
							{pageType === "anxiety"
								? "Час заспокоїтись"
								: pageType === "apathy"
									? "Знайдемо ресурс?"
									: "Потрібна практика?"}
						</h2>
						<p className="dr-cta-desc">
							Спробуйте наш симулятор для відпрацювання навичок саморегуляції.
						</p>
						<button
							className="dr-cta-btn"
							onClick={() => navigate(`/exercises`)}
						>
							Запустити тренажер
						</button>
					</section>
				</div>

				<section className="dr-education-hub">
					<div className="dr-hub-header">
						<div className="dr-hub-title-group">
							<h2 className="dr-section-title">Бібліотека знань</h2>
							<button
								className={`dr-unlock-btn ${!isPersonalized ? "active" : ""}`}
								onClick={() => setIsPersonalized(!isPersonalized)}
							>
								{isPersonalized ? "🔓 Показати всі" : "🎯 Тільки підходящі"}
							</button>
						</div>
						<div className="dr-filters">
							{["all", "text", "video", "audio"].map((f) => (
								<button
									key={f}
									className={`dr-filter-btn ${activeFilter === f ? "active" : ""}`}
									onClick={() => setActiveFilter(f)}
								>
									{f === "all"
										? "Усі"
										: f === "text"
											? "Статті"
											: f === "video"
												? "Відео"
												: "Аудіо"}
								</button>
							))}
						</div>
					</div>
					<div className="dr-materials-grid">
						{filteredMaterials.map((m) => (
							<div
								key={m._id}
								className={`dr-material-card cat-${m.category || "general"}`}
								onClick={() => setSelectedMaterial(m)}
							>
								<div className="dr-card-icon">{m.icon || "📄"}</div>
								<div className="dr-card-content">
									<div className="dr-card-meta">
										<span className="dr-card-type">{m.type}</span>
										<span
											className={`dr-cat-dot ${m.category || "general"}`}
										></span>
									</div>
									<h3 className="dr-card-title">{m.title}</h3>
									<p className="dr-card-desc">{m.desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>
			</main>
			{selectedMaterial && (
				<FocusMode content={selectedMaterial} onClose={handleCloseMaterial} />
			)}
			<button className="dr-sos-fab" onClick={handleSosClick}>
				<span className="dr-sos-text">SOS</span>
			</button>
		</div>
	);
}
