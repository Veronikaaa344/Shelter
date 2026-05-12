import { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import "./characterCompanion.css";

import capybara1 from "../../infrastructure/assets/images/capybara/1111111111111111.png";
import capybara2 from "../../infrastructure/assets/images/capybara/222222222.png";
import capybara3 from "../../infrastructure/assets/images/capybara/33333333.png";

const characters = [
	{ image: capybara1, type: 'distant' },
	{ image: capybara2, type: 'supportive' },
	{ image: capybara3, type: 'supportive' }
];

// Phrases for each character
const characterPhrases = {
	// Distant characters - funny and detached capybara phrases
	distant: [
		"Опа! Дивись, як я вмію розслаблятися. Головне — знайти уявне гаряче джерело!",
		"Тиць! Ой, вибач, я просто жував травинку і випадково тицьнув носом в екран",
		"А ти знав, що капібари — найбільші гризуни у світі? А ще ми дуже любимо обійматися!",
		"Вау, я щойно бачив мандаринку. Її можна покласти мені на голову для максимального дзену",
		"Хвилинка статистики: я можу не рухатися три години. Ефектно, правда?",
		"Якби я був справжнім, я б обов'язково подрімав поруч із тобою. Але я цифровий, тому просто кліпаю",
		"Сьогодні така гарна погода... Хотів би я поплавати, але я застряг у твоєму екрані!",
		"Як гадаєш, капібарам більше личить мандаринка на голові чи квіточка? Я схиляюся до мандаринки",
		"Я щойно намагався порахувати всі травинки на твоєму робочому столі. Збився на одинадцятій, піду посплю",
		"Дивись, я роблю вигляд, що я — камінь біля ставка... Оп, не втримався, вушко зачесалося!",
		"А де тут у вас налаштування на \"басейн з теплою водою\"? Не можу знайти в меню",
		"Якщо до мене підійде крокодил, я просто подивлюся на нього з осудом і продовжу спати. Будь як я!",
		"Ого, який у тебе курсор швидкий! Я краще просто посиджу тут і подивлюся, бігати дуже ліньки",
		"Знаєш, бути цифровою капібарою зручно — шерсть завжди суха і не треба шукати калюжу",
		"Я щойно чув, як твій процесор гудить. Звучить майже як муркотіння моїх родичів біля річки"
	],
	// Supportive characters - inspiring and supportive phrases with capybara chill
	supportive: [
		"Пам'ятай: навіть найменший крок сьогодні — це вже величезний рух уперед. А лежати — це теж рух, тільки внутрішній",
		"Ти сьогодні молодець вже тому, що просто знайшов сили зайти сюди. Я тобою пишаюся!",
		"Просто видихни. Весь цей величезний світ може зачекати одну хвилину, поки ми відпочиваємо",
		"Я вірю в тебе навіть тоді, коли ти сам у собі трохи сумніваєшся. Я знаю — ти впораєшся",
		"Твоя стійкість — це твоя суперсила. Ти міцніший за будь-якого крокодила!",
		"Навіть після найтемнішої та найхолоднішої ночі завжди приходить теплий світанок з теплою водою",
		"Ти не один у цьому штормі. Я поруч, і ми разом спокійно перечекаємо його на бережку",
		"Дозволь собі помилятися. Це не поразка, а просто частина твого крутого шляху",
		"Сьогодні — ідеальний день, щоб нарешті бути добрим до самого себе",
		"Ти робиш неймовірну роботу щодня. Зупинись на хвилинку і похвали себе!",
		"Кожна хмара має світлий край. А кожна річка — свій затишний бережок. Ми його знайдемо!",
		"Твій спокій — це твій дім. Повертайся до нього частіше, а я повартую біля входу",
		"Ти вартий того, щоб піклуватися про себе. Прямо зараз, без жодних \"але\"",
		"Не порівнюй свій початок з чиїмось фінішем. Ти на своєму місці, і це абсолютно правильно",
		"Все велике завжди починається з маленького і несміливого \"я спробую ще раз\"",
		"Ти — автор своєї історії. І сьогодні ми можемо написати дуже світлу та спокійну главу",
		"Відчуй свою внутрішню силу. Вона там є, просто дай їй трохи простору та часу",
		"Твоя енергія дуже цінна. Не витрачай її на те, що ти не в силах змінити",
		"Я щиро пишаюся тим, як ти тримаєшся. Ти справжній боєць, хоч і дуже добрий у душі",
		"Завтра обов'язково буде новий день і нові можливості. А поки — просто дихай і уяви себе в теплому озерці"
	],
	// Achievement phrases - when user completes scenario successfully
	achievement: [
		"Вау! Ти просто неймовірний! Я аж підстрибнув (хоча зазвичай я цього не роблю)! 🎉",
		"Я знав, що ти впораєшся! Ти справжній майстер! 🔍",
		"Це була фантастична робота! 100 балів тобі і мандаринка! ⭐",
		"Капібара-стайл! Ти переміг! Я пишаюся тобою! 🏆",
		"Неймовірно! Твоя увага просто вражає! 💫",
		"Ти зробив це! Тепер можна спокійно йти відпочивати! 🎊",
		"Я так радий за тебе! Ти справжній молодець! 🌟",
		"Фантастика! Ти не пропустив жодної деталі! ✨",
		"Ти просто геній! Навіть я б так не зміг! 🎯",
		"Браво! Твоя наполегливість принесла результат! 🏅",
		"Ти все розв'язав! Це справжнє мистецтво спокою! 🎨",
		"Вітаю! Ти пройшов завдання на відмінно! 🎪",
		"Ти переміг! Я аплодую тобі стоячи (що для мене подвиг)! 👏",
		"Це було неймовірно! Ти справжній профі! 🚀",
		"Ти зробив неможливе! Всі перешкоди подолано! 🌈",
		"Ти просто супергерой! Завдання виконано ідеально! 🦸",
		"Я в захваті! Ми з тобою чудова команда! 💎",
		"Чудова робота! Час розслабитися і святкувати! 🎭",
		"Феноменально! Твоя спостережливість бездоганна! 🔬",
		"Ти зробив це! Ти справжній чемпіон! 🏆"
	]
};

// Encouraging phrases by context and user state (legacy, for compatibility)
const phrases = {
	calm: characterPhrases.supportive,
	anxiety: characterPhrases.supportive,
	stress: characterPhrases.supportive,
	apathy: characterPhrases.supportive,
	test: [
		"Ти робиш чудово! Продовжуй! 🌟",
		"Кожна відповідь наближає тебе до мети! 💪",
		"Вір у себе, ти на правильному шляху! ✨",
	],
	'main-hints': [
		"💡 Спробуй вправи в тренажері — це розслабить",
		"📚 Порада: переглянь освітній контент про стрес",
		"🎯 Натисни SOS якщо потрібна швидка допомога",
		"🧘 Дихальні вправи допоможуть заспокоїтися",
	],
	exercise: [
		"Ти герой! Відпрацьовуй навички! 🦸",
		"Практика робить майстром! Продовжуй! 💪",
	],
	content: [
		"Чудово, що ти навчаєшся! 📚",
		"Знання — це сила! Продовжуй! 💡",
	],
	default: [
		"Привіт! Я тут, щоб підтримати тебе! 👋",
		"Сьогодні чудовий день для прогресу! ☀️",
	],
};



// Determine user state based on resilience and answers
const getUserState = (resilience, stressCount = 0, pageType = 'default') => {
	// If user has high stress answers, prioritize stress state
	if (stressCount >= 2) return 'stress';
	// Based on resilience level
	if (resilience < 30) return 'anxiety';
	if (resilience < 45) return 'stress';
	if (resilience > 70) return 'calm';
	// Based on page type
	if (pageType === 'apathy') return 'apathy';
	if (pageType === 'anxiety') return 'anxiety';
	if (pageType === 'stress') return 'stress';
	return 'calm';
};

const CharacterCompanion = forwardRef(({ 
	context = "default", 
	position = "bottom-right",
	resilience = 50,
	stressCount = 0,
	pageType = 'default',
	auraColor = 'emerald', // emerald, amber, rose, blue, purple
	isBreathing = false,
	forceSpeakMode = null,
	onAction
}, ref) => {
	// Expose method to trigger achievement praise
	useImperativeHandle(ref, () => ({
		speakAchievement: () => {
			setIsVisible(true);
			speak('achievement');
		}
	}));
	const [isVisible, setIsVisible] = useState(false);
	const [currentPhrase, setCurrentPhrase] = useState("");
	const [currentCharacter, setCurrentCharacter] = useState(0);
	const [isSpeaking, setIsSpeaking] = useState(false);

	const userState = getUserState(resilience, stressCount, pageType);

	const getRandomPhrase = useCallback((phraseType = 'normal') => {
		if (phraseType === 'achievement') {
			const arr = characterPhrases.achievement;
			return arr[Math.floor(Math.random() * arr.length)];
		} else {
			const character = characters[currentCharacter];
			const arr = character.type === 'distant' ? characterPhrases.distant : characterPhrases.supportive;
			return arr[Math.floor(Math.random() * arr.length)];
		}
	}, [currentCharacter]);

	const speak = useCallback((phraseType = 'normal') => {
		if (isSpeaking) return;
		
		setIsSpeaking(true);
		// Directly show the phrase without attention phase
		setCurrentPhrase(getRandomPhrase(phraseType));
		
		// Speak for 10 seconds to give time to read
		setTimeout(() => {
			setIsSpeaking(false);
			setIsVisible(false);
		}, 10000);
	}, [getRandomPhrase, isSpeaking]);

	// Handle forced speech (e.g. after completing a task)
	useEffect(() => {
		if (forceSpeakMode) {
			setIsVisible(true);
			speak(forceSpeakMode);
		}
	}, [forceSpeakMode, speak]);

	useEffect(() => {
		// Initial delay 5 seconds
		const initialDelay = 5000;
		const initialTimer = setTimeout(() => {
			setIsVisible(true);
			speak();
		}, initialDelay);

		// Exactly 2 minutes interval between appearances
		const scheduleNext = () => {
			const delay = 120000; // 2 minutes
			return setTimeout(() => {
				if (!isSpeaking) {
					setIsVisible(true);
					speak();
				}
				scheduleNext(); // Reschedule for next appearance
			}, delay);
		};

		let nextTimer;
		const startScheduling = setTimeout(() => {
			nextTimer = scheduleNext();
		}, initialDelay + 10000); // Start after first appearance

		return () => {
			clearTimeout(initialTimer);
			clearTimeout(startScheduling);
			if (nextTimer) clearTimeout(nextTimer);
		};
	}, [speak, isSpeaking]);

	// Change character image periodically (only when not speaking)
	useEffect(() => {
		const charInterval = setInterval(() => {
			if (!isSpeaking) {
				setCurrentCharacter((prev) => (prev + 1) % characters.length);
			}
		}, 8000);
		return () => clearInterval(charInterval);
	}, [isSpeaking]);

	if (!isVisible) return null;

	return (
		<div className={`character-companion ${position} ${isSpeaking ? 'speaking' : ''} ${isBreathing ? 'breathing-sync' : ''}`}>
			<div className="character-bubble">
				<p className="character-text">{currentPhrase}</p>
				
				{/* Personalized exercises block when resilience is low */}
				{(resilience < 35 || forceSpeakMode === 'main-hints') && (
					<div className="character-quick-actions">
						<button onClick={() => onAction && onAction('breathing')} className="qa-btn">🫁 Дихання</button>
						<button onClick={() => onAction && onAction('sorting')} className="qa-btn">🧩 Сортування</button>
						<button onClick={() => onAction && onAction('sos')} className="qa-btn sos">🆘 SOS</button>
					</div>
				)}
			</div>
			<div className={`character-avatar aura-${auraColor}`}>
				<img
					src={characters[currentCharacter].image}
					alt="Character companion"
					className="character-image"
				/>
			</div>
		</div>
	);
});

export default CharacterCompanion;

// Hook to trigger character manually
export function useCharacterTrigger() {
	const [trigger, setTrigger] = useState(0);
	
	const triggerCharacter = useCallback(() => {
		setTrigger(prev => prev + 1);
	}, []);

	return { trigger, triggerCharacter };
}
