import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/api";

export default function BlueView({ answers }) {
	const [step, setStep] = useState(0);
	const navigate = useNavigate();

	const tasks = [
		{ text: "Знайдіть 5 синіх предметів", icon: "🔵" },
		{ text: "Знайдіть 4 текстури", icon: "🧱" },
		{ text: "Знайдіть 3 джерела звуку", icon: "👂" },
		{ text: "Знайдіть 2 запахи", icon: "☕" },
		{ text: "Знайдіть 1 річ на смак", icon: "🍕" },
	];

	const progress = (step / (tasks.length - 1)) * 100;

	const handleFinish = async () => {
		const userId = localStorage.getItem("userId");
		if (userId) {
			await api.updateResilience(
				userId,
				20,
				"sos",
				"Стабілізація (Заземлення)",
			);
		}
		navigate("/main", { state: { answers } });
	};

	return (
		<main className="sos-immersive-layout grounding-mode">
			<button
				className="exit-btn"
				onClick={() => navigate("/main", { state: { answers } })}
			>
				Вийти
			</button>
			<header className="header">
				<p className="progress-text">{step + 1} / 5</p>
				<div className="progress-track">
					<div className="progress-fill" style={{ width: `${progress}%` }} />
				</div>
			</header>
			<section className="action-zone">
				<span className="sticker-large">{tasks[step].icon}</span>
				<h1 className="task">{tasks[step].text}</h1>
				<footer className="action-trigger-area">
					{step < tasks.length - 1 ? (
						<button className="btn-confirm" onClick={() => setStep(step + 1)}>
							Я знайшов
						</button>
					) : (
						<button className="btn-confirm" onClick={handleFinish}>
							Стан стабілізовано
						</button>
					)}
				</footer>
			</section>
		</main>
	);
}
