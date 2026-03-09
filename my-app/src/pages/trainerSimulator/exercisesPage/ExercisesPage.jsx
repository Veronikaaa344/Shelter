import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import { getDiagnosticConfig } from "../../../diagnosticLogic";
import "./exercises.css";

export default function ExercisesPage() {
	const navigate = useNavigate();
	const [allScenarios, setAllScenarios] = useState([]);
	const [filteredScenarios, setFilteredScenarios] = useState([]);
	const [isPersonalized, setIsPersonalized] = useState(true);
	const [pageType, setPageType] = useState("default");

	useEffect(() => {
		const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
		const config = getDiagnosticConfig(savedData?.answers);
		setPageType(config.type || "default");

		api.getScenarios().then((data) => {
			if (Array.isArray(data)) setAllScenarios(data);
		});
	}, []);

	useEffect(() => {
		let list = [...allScenarios];
		if (isPersonalized) {
			const currentStatus = pageType.toLowerCase();
			list = list.filter((s) => {
				const cat = (s.category || "general").toLowerCase();
				if (currentStatus === "default") return cat === "general";
				return cat === currentStatus || cat === "general";
			});
		}
		setFilteredScenarios(list);
	}, [allScenarios, isPersonalized, pageType]);

	return (
		<div className={`dr-exercises-layout theme-${pageType}`}>
			<header className="dr-header">
				<div className="dr-logo" onClick={() => navigate("/main")}>
					<span className="dr-logo-icon">🛡️</span>
					<span>Прихисток</span>
				</div>
				<button
					className={`dr-unlock-btn ${!isPersonalized ? "active" : ""}`}
					onClick={() => setIsPersonalized(!isPersonalized)}
				>
					{isPersonalized ? "🔓 Показати всі" : "🎯 Тільки для мене"}
				</button>
				<button className="dr-profile-btn" onClick={() => navigate("/main")}>
					Назад
				</button>
			</header>

			<main className="dr-main-content">
				<h1 className="dr-section-title">Психологічні тренажери</h1>
				<div className="dr-exercises-grid">
					{filteredScenarios.map((s) => (
						<div
							key={s._id}
							className={`dr-ex-card cat-${(s.category || "general").toLowerCase()}`}
							onClick={() => navigate(`/exercises/${s.scenarioId}`)}
						>
							<div className="dr-ex-icon">🧩</div>
							<div className="dr-ex-content">
								<div className="dr-ex-meta">
									<span className="dr-ex-tag">Вправа</span>
									<span
										className={`dr-cat-dot ${(s.category || "general").toLowerCase()}`}
									></span>
								</div>
								<h3 className="dr-ex-title">{s.name}</h3>
								<p className="dr-ex-desc">Натисніть, щоб розпочати практику.</p>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
