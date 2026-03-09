import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import "./simulatorPage.css";

export default function SimulatorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const chatEndRef = useRef(null);
	const [scenario, setScenario] = useState(null);
	const [history, setHistory] = useState([]);
	const [currentNodeId, setCurrentNodeId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isFinished, setIsFinished] = useState(false);
	const [progress, setProgress] = useState(5);

	// Новые стейты для подсчета
	const [sessionScore, setSessionScore] = useState(0);
	const [choicesCount, setChoicesCount] = useState(0);

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		api
			.getScenarioById(id)
			.then((data) => {
				if (data && data.nodes) {
					setScenario(data);
					const startId = data.nodes["start"]
						? "start"
						: Object.keys(data.nodes)[0];
					setCurrentNodeId(startId);
					setHistory([{ role: "bot", text: data.nodes[startId].text }]);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [id]);

	useEffect(() => {
		scrollToBottom();
	}, [history, isFinished]);

	const recordCompletion = async (finalImpact) => {
		const userId = localStorage.getItem("userId");
		if (userId) {
			await api.updateResilience(
				userId,
				finalImpact,
				"exercise",
				scenario.name,
			);
		}
	};

	const handleOption = (option) => {
		const nextId = option.next;
		const newHistory = [...history, { role: "user", text: option.text }];

		// Считаем баллы за текущий выбор
		const weight = option.weight || 0;
		const currentTotalScore = sessionScore + weight;
		const currentTotalChoices = choicesCount + 1;

		setSessionScore(currentTotalScore);
		setChoicesCount(currentTotalChoices);

		if (!nextId || !scenario.nodes[nextId]) {
			finishSession(newHistory, currentTotalScore, currentTotalChoices);
			return;
		}

		const nextNode = scenario.nodes[nextId];
		setHistory([...newHistory, { role: "bot", text: nextNode.text }]);
		setCurrentNodeId(nextId);

		if (nextNode.isFinal) {
			finishSession(
				[...newHistory, { role: "bot", text: nextNode.text }],
				currentTotalScore,
				currentTotalChoices,
			);
		} else {
			setProgress((prev) => Math.min(prev + 15, 90));
		}
	};

	const finishSession = (finalHistory, totalPoints, totalChoices) => {
		setHistory(finalHistory);
		setIsFinished(true);
		setProgress(100);

		// НОРМАЛИЗАЦИЯ: (Средний балл) * 20. Максимум +20, Минимум -20.
		const avg = totalPoints / totalChoices;
		const normalized = Math.round(avg * 20);

		// Даем минимум +5 за старание, если результат не ушел в минус
		const finalImpact = normalized < 0 ? normalized : Math.max(normalized, 5);

		recordCompletion(finalImpact);
	};

	const handleSosClick = async () => {
		const userId = localStorage.getItem("userId");
		if (userId) await api.updateResilience(userId, 5, "sos", "Кнопка SOS");
		navigate("/sos");
	};

	if (loading) return <div className="dr-sim-loader">Загрузка...</div>;
	if (!scenario || !currentNodeId)
		return <div className="dr-sim-loader">Сценарий не найден</div>;

	const currentNode = scenario.nodes[currentNodeId];

	return (
		<div className="dr-trainer-layout">
			<div className="dr-trainer-progress-track">
				<div
					className="dr-trainer-progress-fill"
					style={{ width: `${progress}%` }}
				></div>
			</div>

			<header className="dr-trainer-header">
				<button className="dr-back-btn" onClick={() => navigate("/exercises")}>
					← Выйти
				</button>
				<span className="dr-trainer-title">{scenario.name}</span>
				<div style={{ width: "80px" }}></div>
			</header>

			<main className="dr-chat-area">
				<div className="dr-message-column">
					{history.map((msg, idx) => (
						<div key={idx} className={`dr-bubble ${msg.role}`}>
							{msg.text}
						</div>
					))}
					{isFinished && (
						<div className="dr-feedback-block">
							<div className="dr-feedback-icon">🌟</div>
							<h3>Вправа завершена!</h3>
							<p>Дякую за практику. Твій рівень стійкості оновлено.</p>
						</div>
					)}
					<div ref={chatEndRef} />
				</div>
			</main>

			<footer className="dr-choice-panel">
				<div className="dr-options-stack">
					{isFinished ? (
						<button
							className="dr-final-btn"
							onClick={() => navigate("/exercises")}
						>
							Повернутись до списку
						</button>
					) : (
						currentNode?.options?.map((opt, idx) => (
							<button
								key={idx}
								className="dr-choice-btn"
								onClick={() => handleOption(opt)}
							>
								{opt.text}
							</button>
						))
					)}
				</div>
			</footer>

			<button className="dr-sos-fab-trainer" onClick={handleSosClick}>
				SOS
			</button>
		</div>
	);
}
