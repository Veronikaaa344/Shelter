import { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import "./characterCompanion.css";

import { ReactComponent as HappyImg } from "../../infrastructure/assets/images/characterCompanion/happy_v2.svg";
import { ReactComponent as NormalImg } from "../../infrastructure/assets/images/characterCompanion/normal_v2.svg";
import { ReactComponent as SadImg } from "../../infrastructure/assets/images/characterCompanion/sad_v2.svg";

const characterImages = {
	happy: HappyImg,
	normal: NormalImg,
	sad: SadImg
};

const characterPhrases = {
	normal: [
		"Oops! Look how I can relax. The main thing is to find an imaginary hot spring!",
		"Poke! Oh, excuse me, I was just chewing a blade of grass and accidentally poked my nose on the screen.",
		"Did you know I'm always here to support you?",
		"A moment for statistics: I can stay still for three hours. Impressive, right?",
		"If I were real, I'd definitely take a nap next to you.",
		"The weather's so nice today... Even though I'm stuck on your screen!",
		"What do you think, does a tangerine on my head suit me better, or a flower?",
		"I just tried to count all the blades of grass on your desktop. I lost count at eleven.",
		"You know, being a digital assistant is convenient — I can always be by your side.",
		"Wow, your cursor is fast! I'd better just sit here and watch."
	],
	sad: [
		"Remember: even the smallest step today is already a huge move forward. I understand how difficult it can be.",
		"You're doing great today just because you found the strength to come here. I'm with you.",
		"Just breathe out. This whole big world can wait one minute.",
		"I believe in you even when you doubt yourself.",
		"Your resilience is your superpower. Even when it feels like there's no strength left.",
		"You're not alone in this storm. I'm here, and together we'll calmly weather it.",
		"Allow yourself to be sad or make mistakes. It's just part of your journey.",
		"You do amazing work every day. Stop for a moment and breathe.",
		"Every cloud has a silver lining. We'll definitely find it!",
		"Your energy is very valuable. Don't waste it on things beyond your control right now."
	],
	happy: [
		"Wow! You're simply incredible! I literally jumped! 🎉",
		"I knew you'd handle it! You're a true master! 🌟",
		"That was fantastic work! 100 points for you! ⭐",
		"Incredible! You won! I'm proud of you! 🏆",
		"You did it! Now you can relax in peace! 🎊",
		"I'm so happy for you! You're doing great! 🌟",
		"You're a genius! Even I couldn't do that! 🎯",
		"Bravo! Your persistence paid off! 🏅",
		"You solved everything! That's true art of calm! 🎨",
		"Congratulations! You completed the task perfectly! 🎪"
	]
};


const phrases = {
	calm: characterPhrases.normal,
	anxiety: characterPhrases.sad,
	stress: characterPhrases.sad,
	apathy: characterPhrases.sad,
	test: [
		"You're doing great! Keep going! 🌟",
		"Every answer brings you closer to your goal! 💪",
		"Believe in yourself, you're on the right track! ✨",
	],
	'main-hints': [
		"💡 Try the exercises in the simulator — it will relax you",
		"📚 Tip: review educational content about stress",
		"🎯 Press SOS if you need quick help",
		"🧘 Breathing exercises will help you calm down",
	],
	exercise: [
		"You're a hero! Practice your skills! 🦸",
		"Practice makes perfect! Keep going! 💪",
	],
	content: [
		"Great that you're learning! 📚",
		"Knowledge is power! Keep going! 💡",
	],
	default: [
		"Hi! I'm here to support you! 👋",
		"Today is a great day for progress! ☀️",
	],
};






const CharacterCompanion = forwardRef(({ 
	context = "default", 
	position = "bottom-right",
	resilience = 50,
	stressCount = 0,
	pageType = 'default',
	auraColor = 'emerald', 
	isBreathing = false,
	forceSpeakMode = null,
	onAction,
	completedCount = 0,
	isSpecialModeActive = false,
	isTestFinished = false,
	currentView = 'home',
	lastCompletedActivity = null,
	consecutiveDrops = 0,
	tourStep = '0'
}, ref) => {
	
	useImperativeHandle(ref, () => ({
		speakAchievement: () => {
			setIsVisible(true);
			speak('achievement');
		}
	}));
	const { t } = useTranslation();
	const [isVisible, setIsVisible] = useState(false);
	const [currentPhrase, setCurrentPhrase] = useState("");
	const [currentEmotion, setCurrentEmotion] = useState('normal');
	const [isSpeaking, setIsSpeaking] = useState(false);
	const isSpeakingRef = useRef(false);
	const speakTimeoutRef = useRef(null);
	const prevProps = useRef({
		lastCompletedActivity: null,
		isTestFinished: false,
		isSpecialModeActive: false
	});

	const getPhraseAndEmotion = useCallback((phraseType = 'normal') => {
		let emotion = 'normal';
		let arr = phrases.default || characterPhrases.normal;

		if (phraseType === 'achievement') {
			emotion = 'happy';
			arr = characterPhrases.happy;
		} else if (phraseType === 'test' || phraseType === 'exercise' || phraseType === 'content') {
			emotion = 'happy';
			arr = phrases[phraseType];
		} else if (phraseType === 'main-hints') {
			emotion = 'normal';
			arr = [
				t('companion.hint_simulator', "💡 Try the exercises in the simulator — it will relax you"),
				t('companion.hint_library', "📚 Tip: review educational content about stress"),
				t('companion.hint_sos', "🎯 Press SOS if you need quick help"),
				t('companion.hint_breathing', "🧘 Breathing exercises will help you calm down")
			];
		} else if (['anxiety', 'stress', 'apathy'].includes(phraseType)) {
			emotion = 'sad';
			arr = characterPhrases.sad;
		} else if (phraseType === 'default') {
			const randomEmotions = ['normal', 'happy', 'sad'];
			emotion = randomEmotions[Math.floor(Math.random() * randomEmotions.length)];
			arr = characterPhrases[emotion];
		} else if (phraseType === '1_diagnostics' || phraseType.includes('tour')) {
			emotion = 'normal';
		}
		
		return {
			phrase: arr[Math.floor(Math.random() * arr.length)],
			emotion
		};
	}, []);

	const speak = useCallback((phraseType = 'normal', specificPhrase = null) => {
		if (isSpeakingRef.current && !specificPhrase) return;
		
		isSpeakingRef.current = true;
		setIsSpeaking(true);
		
		if (specificPhrase) {
			setCurrentPhrase(specificPhrase);
			setCurrentEmotion('normal'); // default to normal for tour phrases unless specified otherwise
		} else {
			const result = getPhraseAndEmotion(phraseType);
			setCurrentPhrase(result.phrase);
			setCurrentEmotion(result.emotion);
		}
		
		if (speakTimeoutRef.current) {
			clearTimeout(speakTimeoutRef.current);
		}
		
		speakTimeoutRef.current = setTimeout(() => {
			isSpeakingRef.current = false;
			setIsSpeaking(false);
			setIsVisible(false);
		}, 10000);
	}, [getPhraseAndEmotion]);

	
	useEffect(() => {
		if (forceSpeakMode) {
			setIsVisible(true);
			speak(forceSpeakMode);
		}
	}, [forceSpeakMode, speak]);

	useEffect(() => {
		if (!tourStep || tourStep === '0') return;
		let text = "";
		if (tourStep === '1_diagnostics') {
			text = "Hi! 👋 I'm here to give you a little tour. Let's start with Diagnostics! Click on it on the left.";
		} else if (tourStep === '3_quests') {
			text = "Great! You know your level. Now let's move on to Quests, where you'll find exercises. Click on Quests!";
		} else if (tourStep === '4_do_chaos') {
			text = "Try the mini-game 'Sorting Chaos'. It's great for clearing your head!";
		} else if (tourStep === '5_do_chat') {
			text = "Good job! Now try the Chat Simulator. It will teach you how to resolve difficult situations.";
		} else if (tourStep === '6_library') {
			text = "Well done! The last section is the Media Library. Go there to find useful materials.";
		} else if (tourStep === '7_do_library') {
			text = "Choose any material and open it. This will complete our tutorial!";
		} else if (tourStep === '8_finish') {
			text = "Congratulations! You've completed the training and are now ready to use all the tools. Good luck! 🌟";
		}
		if (text) {
			setIsVisible(true);
			speak('tour', text);
			if (tourStep === '8_finish') setCurrentEmotion('happy');
		}
	}, [tourStep, speak]);

	
	useEffect(() => {
		if (tourStep && tourStep !== '0') return;
		if (isSpecialModeActive) {
			setIsVisible(false);
			setIsSpeaking(false);
			isSpeakingRef.current = false;
			if (speakTimeoutRef.current) {
				clearTimeout(speakTimeoutRef.current);
			}
			
			prevProps.current.isSpecialModeActive = isSpecialModeActive;
			return;
		}

		const prev = prevProps.current;
		const now = Date.now();
		const lastSpeak = Number(localStorage.getItem("lastCompanionSpeakTime") || 0);
		const cooldownSatisfied = (now - lastSpeak) > 90000;

		let shouldSpeak = false;
		let phraseCategory = 'normal';

		if (lastCompletedActivity && lastCompletedActivity?.timestamp !== prev.lastCompletedActivity?.timestamp) {
			shouldSpeak = true;
			phraseCategory = 'achievement';
		} else if (!prev.isTestFinished && isTestFinished) {
			shouldSpeak = true;
			phraseCategory = 'achievement';
		} else if (consecutiveDrops >= 2 || resilience < 30) {
			shouldSpeak = true;
			phraseCategory = 'stress';
		}

		if (shouldSpeak && cooldownSatisfied) {
			setIsVisible(true);
			speak(phraseCategory);
			localStorage.setItem("lastCompanionSpeakTime", String(now));
		}

		prevProps.current = {
			lastCompletedActivity,
			isTestFinished,
			isSpecialModeActive
		};
	}, [lastCompletedActivity, isTestFinished, isSpecialModeActive, consecutiveDrops, resilience, speak]);

	useEffect(() => {
		if (tourStep && tourStep !== '0') return;
		if (isSpecialModeActive) return;

		const hintInterval = setInterval(() => {
			const now = Date.now();
			const lastSpeak = Number(localStorage.getItem("lastCompanionSpeakTime") || 0);
			// 60 seconds cooldown for random hints
			if (now - lastSpeak > 60000) {
				// 30% chance to appear every 10 seconds if cooldown is met
				if (Math.random() < 0.3) {
					setIsVisible(true);
					speak('main-hints');
					localStorage.setItem("lastCompanionSpeakTime", String(now));
				}
			}
		}, 10000);

		return () => clearInterval(hintInterval);
	}, [tourStep, isSpecialModeActive, speak]);

	// Remove the random face cycling interval
	// (It used to just change currentCharacter randomly every 8s)
	useEffect(() => {
		return () => {
			if (speakTimeoutRef.current) {
				clearTimeout(speakTimeoutRef.current);
			}
		};
	}, []);

	if (!isVisible || isSpecialModeActive) return null;

	return (
		<div className={`character-companion ${position} ${isSpeaking ? 'speaking' : ''} ${isBreathing ? 'breathing-sync' : ''}`}>
			<div className="character-bubble">
				<p className="character-text">{currentPhrase}</p>
				
				{}
				{(resilience < 35 || forceSpeakMode === 'main-hints') && tourStep === '0' && (
					<div className="character-quick-actions">
						<button onClick={() => onAction && onAction('breathing')} className="qa-btn">🫁 Breathing</button>
						<button onClick={() => onAction && onAction('sorting')} className="qa-btn">🧩 Sorting</button>
						<button onClick={() => onAction && onAction('sos')} className="qa-btn sos">🆘 SOS</button>
					</div>
				)}
				{tourStep !== '0' && (
					<div className="mt-4 flex justify-end">
						<button onClick={() => onAction && onAction('skip_tour')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg">Skip tutorial</button>
					</div>
				)}
			</div>
			<div className={`character-avatar aura-${auraColor}`}>
				{(() => {
					const CurrentImg = characterImages[currentEmotion] || characterImages.normal;
					return <CurrentImg className="character-image" />;
				})()}
			</div>
		</div>
	);
});

export default CharacterCompanion;


export function useCharacterTrigger() {
	const [trigger, setTrigger] = useState(0);
	
	const triggerCharacter = useCallback(() => {
		setTrigger(prev => prev + 1);
	}, []);

	return { trigger, triggerCharacter };
}