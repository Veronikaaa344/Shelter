import React, { useState, useRef } from 'react';
import './focusMode.css';

export default function FocusMode({ content, onClose, onSos }) {
	const [showFeedback, setShowFeedback] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef(null);
	const audioRef = useRef(null);

	if (!content) return null;

	// Підтримка обох форматів типів (кирилиця/латиниця) для стабільності
	const type = content.type?.toLowerCase();
	const isVideo = type === 'video' || type === 'відео';
	const isAudio = type === 'audio' || type === 'аудіо';
	const isText = type === 'text' || type === 'текст';

	const toggleVideo = () => {
		if (videoRef.current.paused) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
		}
	};

	const toggleAudio = () => {
		if (audioRef.current.paused) {
			audioRef.current.play();
			setIsPlaying(true);
		} else {
			audioRef.current.pause();
			setIsPlaying(false);
		}
	};

	return (
		<div className="dr-focus-layout">
			<header className="dr-focus-header">
				<button className="dr-focus-close-btn" onClick={onClose}>
					✕ Закрити
				</button>
			</header>

			<main className="dr-focus-content-area">
				<h1 className="dr-focus-main-title">{content.title}</h1>

				{isVideo && (
					<div className="dr-focus-video-wrapper">
						<div className="dr-focus-video-container">
							<video
								ref={videoRef}
								className="dr-real-video-player"
								src={content.url || content.content}
								onClick={toggleVideo}
							/>
							{!isPlaying && (
								<div className="dr-video-overlay-play" onClick={toggleVideo}>
									<button className="dr-play-huge">▶</button>
								</div>
							)}
						</div>
						<div className="dr-focus-text-box">
							<h3>Ключові тези</h3>
							<p>{content.notes || content.desc}</p>
						</div>
					</div>
				)}

				{isAudio && (
					<div className="dr-focus-audio-wrapper">
						<div className="dr-audio-card">
							<div
								className={`dr-focus-visualizer ${isPlaying ? 'active' : ''}`}>
								{[...Array(12)].map((_, i) => (
									<div key={i} className="dr-focus-bar"></div>
								))}
							</div>
							<audio
								ref={audioRef}
								src={content.url || content.content}
								onPlay={() => setIsPlaying(true)}
								onPause={() => setIsPlaying(false)}
							/>
							<button className="dr-play-circle-real" onClick={toggleAudio}>
								{isPlaying ? '⏸' : '▶'}
							</button>
						</div>
					</div>
				)}

				{isText && (
					<article className="dr-focus-reader-mode">
						<div className="dr-focus-article-body">
							{content.fullText || content.content}
						</div>
					</article>
				)}

				<footer className="dr-focus-footer">
					{!showFeedback ? (
						<button
							className="dr-focus-finish-btn"
							onClick={() => setShowFeedback(true)}>
							Завершити вивчення
						</button>
					) : (
						<div className="dr-focus-feedback-card">
							<p>Як змінився ваш стан після цього матеріалу?</p>
							<div className="dr-focus-feedback-group">
								<button className="dr-focus-feedback-btn" onClick={onClose}>
									Покращився
								</button>
								<button className="dr-focus-feedback-btn" onClick={onClose}>
									Без змін
								</button>
							</div>
						</div>
					)}
				</footer>
			</main>

			<button className="dr-sos-fab" onClick={onSos}>
				<span className="dr-sos-text">SOS</span>
			</button>
		</div>
	);
}
