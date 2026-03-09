import { useState } from "react";
import { useNavigate } from "react-router-dom";
import quizData from "../../quizData.json";
import "./startPage.css";

export default function StartPage() {
	const [currentQuestion, setCurrentQuestion] = useState(1);
	const [currentlevel, setCurrentLevel] = useState(1);
	const [answers, setAnswers] = useState([]);
	const navigate = useNavigate();

	const data = quizData.diagnosticTree[String(currentlevel)];
	const dataFind = data.find((q) => q.id === currentQuestion);

	const totalLevels = 3;
	const progress = (currentlevel / totalLevels) * 100;

	const handleAnswerClick = (nextId, optionId) => {
		const newAnswers = [...answers, optionId];

		if (nextId) {
			setCurrentQuestion(nextId);
			setCurrentLevel((level) => level + 1);
			setAnswers(newAnswers);
		} else {
			const hours = 4;
			const expiryTime = Date.now() + hours * 60 * 60 * 1000;

			const testData = {
				answers: newAnswers,
				expiry: expiryTime,
			};

			localStorage.setItem("dr_test_results", JSON.stringify(testData));
			setAnswers(newAnswers);
			navigate("/main");
		}
	};

	const handleSosClick = () => {
		navigate(`/sos/${answers.join(",")}`);
	};

	return (
		<div className="start-page-container">
			<div className="dr-trainer-progress-track">
				<div
					className="dr-trainer-progress-fill"
					style={{ width: `${progress}%` }}
				></div>
			</div>

			<main className="start-content-wrap">
				<div className="step-counter">
					Питання {currentlevel} / {totalLevels}
				</div>
				<h1 className="question">{dataFind.text}</h1>

				<div className="answers-container">
					{dataFind.options.map((option) => (
						<button
							key={option.id}
							className="answer-button"
							onClick={() => handleAnswerClick(option.nextId, option.id)}
						>
							{option.text}
						</button>
					))}
				</div>

				<button className="SOS-button-large" onClick={handleSosClick}>
					<span className="SOS-text">ПОТРІБНА ДОПОМОГА (SOS)</span>
				</button>
			</main>
		</div>
	);
}
