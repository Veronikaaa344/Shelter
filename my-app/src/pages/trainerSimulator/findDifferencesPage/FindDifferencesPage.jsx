import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import CharacterCompanion from "../../../components/characterCompanion/CharacterCompanion";
import "./findDifferencesPage.css";

export default function FindDifferencesPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [scenario, setScenario] = useState(null);
	const [loading, setLoading] = useState(true);
	const [foundDifferences, setFoundDifferences] = useState([]);
	const [isFinished, setIsFinished] = useState(false);
	const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
	const [imageZoom, setImageZoom] = useState(1);
	const imageRef = useRef(null);
	const companionRef = useRef(null);

	useEffect(() => {
		api
			.getScenarioById(id)
			.then((data) => {
				console.log('FindDifferencesPage - scenario data:', data);
				if (data) {
					console.log('FindDifferencesPage - levels:', data.levels);
					console.log('FindDifferencesPage - current level:', data.levels?.[0]);
					setScenario(data);
					setFoundDifferences([]);
					setCurrentLevelIndex(0);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error('FindDifferencesPage - error:', err);
				setLoading(false);
			});
	}, [id]);

	const handleImageClick = (e) => {
		if (isFinished || !imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const scaleX = imageRef.current.naturalWidth / rect.width;
		const scaleY = imageRef.current.naturalHeight / rect.height;

		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		const currentLevel = scenario.levels?.[currentLevelIndex];
		if (!currentLevel) return;

		const differences = currentLevel.differences || [];
		const clickedDifference = differences.find(diff => {
			const dx = x - diff.x;
			const dy = y - diff.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance <= diff.radius;
		});

		if (clickedDifference) {
			const diffId = `${currentLevelIndex}-${clickedDifference.x}-${clickedDifference.y}`;
			if (!foundDifferences.includes(diffId)) {
				const updatedFound = [...foundDifferences, diffId];
				setFoundDifferences(updatedFound);

				const userId = localStorage.getItem("userId");
				if (userId) api.updateResilience(userId, 3, "difference_found", scenario.name);

				if (updatedFound.filter(fid => fid.startsWith(`${currentLevelIndex}-`)).length >= differences.length) {
					setIsFinished(true);
					if (userId) api.updateResilience(userId, 10, "level_complete", scenario.name);
					api.completeScenario(id, 10);
					
					// Trigger achievement praise from companion
					if (companionRef.current && companionRef.current.speakAchievement) {
						companionRef.current.speakAchievement();
					}
				}
			}
		}
	};

	const handleWheel = (e) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		setImageZoom(prev => Math.max(1, Math.min(5, prev + delta)));
	};

	const handleNextLevel = () => {
		if (currentLevelIndex + 1 < (scenario.levels?.length || 0)) {
			setCurrentLevelIndex(currentLevelIndex + 1);
			setFoundDifferences([]);
			setIsFinished(false);
			setImageZoom(1);
		} else {
			navigate("/exercises");
		}
	};

	const handleSosClick = async () => {
		const userId = localStorage.getItem("userId");
		if (userId) await api.updateResilience(userId, -15, "sos", "Нажата кнопка SOS");
		navigate("/sos");
	};

	if (loading) return <div className="dr-find-loader">Завантаження...</div>;
	if (!scenario) return <div className="dr-find-loader">Сценарій не знайдено</div>;

	const currentLevel = scenario.levels?.[currentLevelIndex];
	console.log('FindDifferencesPage - currentLevel:', currentLevel);
	
	if (!currentLevel) {
		console.error('FindDifferencesPage - No current level found');
		return <div className="dr-find-loader">Рівень не знайдено</div>;
	}
	
	if (!currentLevel.image) {
		console.error('FindDifferencesPage - No image found in current level:', currentLevel);
		return <div className="dr-find-loader">Зображення не знайдено</div>;
	}
	
	const differences = currentLevel?.differences || [];
	const foundCount = foundDifferences.filter(id => id.startsWith(`${currentLevelIndex}-`)).length;

	return (
		<div className="dr-find-layout">
			<header className="dr-find-header">
				<button className="dr-back-btn" onClick={() => navigate("/exercises")}>← Вийти</button>
				<span className="dr-find-title">{scenario.name}</span>
			</header>

			<main className="dr-find-main">
				{isFinished ? (
					<div className="dr-completion-overlay">
						<div className="dr-completion-menu">
							<div className="dr-complete-icon">🎉</div>
							<h2>Рівень завершено!</h2>
							<p>Ти знайшов всі відмінності!</p>
							<div className="dr-completion-buttons">
								{currentLevelIndex + 1 < (scenario.levels?.length || 0) ? (
									<button className="dr-completion-btn primary pulse" onClick={handleNextLevel}>
										Наступний рівень →
									</button>
								) : (
									<button className="dr-completion-btn primary pulse" onClick={() => navigate("/exercises")}>
										До списку вправ
									</button>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="dr-images-container">
						<div className="dr-image-wrapper">
							<div className="dr-find-counter-overlay">Знайдено: {foundCount} / {differences.length}</div>

							<div className="dr-find-image-container">
								<img
									ref={imageRef}
									src={currentLevel.image}
									alt="Find Differences"
									className="dr-find-image"
									style={{
										maxWidth: '100%',
										maxHeight: '75vh',
										objectFit: 'contain',
										transform: `scale(${imageZoom})`,
										transformOrigin: 'center center',
										transition: 'transform 0.1s ease-out'
									}}
									onClick={handleImageClick}
									onWheel={handleWheel}
								/>
								{differences.map((diff, idx) => {
									const diffId = `${currentLevelIndex}-${diff.x}-${diff.y}`;
									if (!foundDifferences.includes(diffId)) return null;
									const img = imageRef.current;
									if (!img) return null;
									const rect = img.getBoundingClientRect();
									const scaleX = rect.width / img.naturalWidth;
									const scaleY = rect.height / img.naturalHeight;
									return (
										<div
											key={idx}
											className="dr-difference-marker found"
											style={{
												left: diff.x * scaleX - diff.radius * scaleX,
												top: diff.y * scaleY - diff.radius * scaleY,
												width: diff.radius * 2 * scaleX,
												height: diff.radius * 2 * scaleY,
												transform: `scale(${imageZoom})`,
												transformOrigin: 'center center'
											}}
										>
											<div className="dr-marker-check">✓</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</main>

			<button className="dr-sos-fab-trainer" onClick={handleSosClick}>SOS</button>
			<CharacterCompanion 
				ref={companionRef}
				context="exercise" 
				position="bottom-left" 
				delay={4000} 
			/>
		</div>
	);
}