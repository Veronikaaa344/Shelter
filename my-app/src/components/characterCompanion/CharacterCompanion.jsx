import { useEffect, useState, useCallback, useRef, useImperativeHandle } from "react";
import "./characterCompanion.css";

// Character images - capybara
import capybara1 from "../../images/capybara/1.png";
import capybara2 from "../../images/capybara/2.png";
import capybara3 from "../../images/capybara/3.png";
import capybara4 from "../../images/capybara/4.png";
import capybara5 from "../../images/capybara/5.png";
import capybara6 from "../../images/capybara/6.png";
import capybara7 from "../../images/capybara/7.png";

const characters = [
	{ image: capybara1, type: 'distant' },
	{ image: capybara2, type: 'distant' },
	{ image: capybara3, type: 'distant' },
	{ image: capybara4, type: 'supportive' },
	{ image: capybara5, type: 'supportive' },
	{ image: capybara6, type: 'supportive' },
	{ image: capybara7, type: 'supportive' }
];

// Phrases for each character
const characterPhrases = {
	// Distant characters (1, 2, 3) - funny and detached phrases
	distant: [
		[
			"Опа! Дивись, як я вмію робити перекид у повітрі! Хоп!",
			"Тиць! Ой, вибач, я просто перевіряв, чи ти не заснув перед екраном",
			"А ти знав, що лисиці не вміють друкувати? А я вмію, хоч у мене і лапки!",
			"Вау, я щойно бачив піксельну хмаринку. На смак як зефір, чесно",
			"Хвилинка статистики: я моргаю рівно нуль разів на хвилину. Ефектно, правда?"
		],
		[
			"Якби я був справжнім, я б обов'язково вкрав твій бутерброд. Але я цифровий, тому просто милуюся",
			"Мій хвіст сьогодні такий пухнастий, що я в ньому мало не заплутався. Ледь вибрався!",
			"Як гадаєш, лисицям більше личить краватка чи бантик? Я схиляюся до бантика",
			"Я щойно намагався порахувати всі крапки на твоєму екрані. Збився на одинадцяти, надто складно",
			"Дивись, я роблю вигляд, що я — статуя... Оп, не втримався, хвіст зачесався!"
		],
		[
			"А де тут у вас налаштування на \"безлімітні обійми\"? Не можу знайти в меню",
			"Якщо я почну крутитися дзиґою, обіцяй, що у тебе не запаморочиться в голові!",
			"Ого, який у тебе курсор швидкий! Ледь встигаю за ним очима, наче за мухою",
			"Знаєш, бути цифровим лисом зручно — зовсім не треба чистити зуби зранку",
			"Я щойно чув, як твій процесор щось прошепотів. Здається, він теж хоче у відпустку"
		]
	],
	// Supportive characters (4, 5, 6, 7) - inspiring and supportive phrases
	supportive: [
		[
			"Пам'ятай: навіть найменший крок сьогодні — це вже величезний рух уперед",
			"Ти сьогодні молодець вже тому, що просто знайшов сили зайти сюди",
			"Просто видихни. Весь цей величезний світ може зачекати одну хвилину",
			"Я вірю в тебе навіть тоді, коли ти сам у собі трохи сумніваєшся. Я знаю — ти впораєшся",
			"Твоя стійкість — це твоя суперсила. Ти набагато міцніший, ніж тобі зараз здається"
		],
		[
			"Навіть після найтемнішої та найхолоднішої ночі завжди приходить теплий світанок",
			"Ти не один у цьому штормі. Я поруч, і ми разом з усім цим розберемося",
			"Дозволь собі помилятися. Це не поразка, а просто частина твого крутого шляху",
			"Сьогодні — ідеальний день, щоб нарешті бути добрим до самого себе",
			"Ти робиш неймовірну роботу щодня, навіть якщо зараз ти цього зовсім не відчуваєш"
		],
		[
			"Кожна хмара має світлий край. Давай спробуємо знайти його разом?",
			"Твій спокій — це твій дім. Повертайся до нього частіше, а я повартую біля входу",
			"Ти вартий того, щоб піклуватися про себе. Прямо зараз, без жодних \"але\"",
			"Не порівнюй свій початок з чиїмось фінішем. Ти на своєму місці, і це правильно",
			"Все велике завжди починається з маленького і несміливого \"я спробую ще раз\""
		],
		[
			"Ти — автор своєї історії. І сьогодні ми можемо написати дуже світлу главу",
			"Відчуй свою внутрішню силу. Вона там є, просто дай їй трохи простору та часу",
			"Твоя енергія дуже цінна. Не витрачай її на те, що ти не в силах змінити",
			"Я щиро пишаюся тим, як ти тримаєшся. Ти справжній боєць, хоч і без обладунків",
			"Завтра обов'язково буде новий день і нові можливості. А поки — просто дихай і відпочивай"
		]
	],
	// Achievement phrases - when user completes scenario successfully
	achievement: [
		[
			"Вау! Ти просто неймовірний! Всі відмінності знайдено! 🎉",
			"Я знав, що ти впораєшся! Ти справжній детектив! 🔍",
			"Це була фантастична робота! Ти знайшов їх усі! ⭐",
			"Татаке! Ти переміг! Я пишаюся тобою! 🏆",
			"Неймовірно! Твоя увага до деталей просто вражає! 💫"
		],
		[
			"Ти зробив це! Всі відмінності тепер знайдені! 🎊",
			"Я так радий за тебе! Ти справжній майстер пошуку! 🌟",
			"Фантастика! Ти не пропустив жодної деталі! ✨",
			"Ти просто геній пошуку відмінностей! 🎯",
			"Браво! Твоя наполегливість принесла результат! 🏅"
		],
		[
			"Ти знайшов їх усі! Це справжнє мистецтво! 🎨",
			"Вітаю! Ти пройшов завдання на відмінно! 🎪",
			"Ти переміг! Я аплодую тобі стоячи! 👏",
			"Це було неймовірно! Ти справжній профі! 🚀",
			"Ти зробив неможливе! Всі відмінності знайдено! 🌈"
		],
		[
			"Ти просто супергерой пошуку! Всі знайдено! 🦸",
			"Я в захваті! Ти пройшов це завдання ідеально! 💎",
			"Ти знайшов їх усі! Це просто чудово! 🎭",
			"Феноменально! Твоя спостережливість бездоганна! 🔬",
			"Ти зробив це! Ти справжній чемпіон! 🏆"
		]
	]
};

// Encouraging phrases by context and user state (legacy, for compatibility)
const phrases = {
	calm: characterPhrases.supportive[0],
	anxiety: characterPhrases.supportive[1],
	stress: characterPhrases.supportive[2],
	apathy: characterPhrases.supportive[3],
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

export default function CharacterCompanion({ 
	context = "default", 
	position = "bottom-right",
	resilience = 50,
	stressCount = 0,
	pageType = 'default',
	auraColor = 'emerald', // emerald, amber, rose, blue, purple
	isBreathing = false
}) {
	const ref = useRef(null);

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
			// Use achievement phrases when user completes scenario
			const character = characters[currentCharacter];
			if (character.type === 'distant') {
				const distantIndex = currentCharacter; // 0, 1, or 2
				const achievementPhrases = characterPhrases.achievement[distantIndex];
				return achievementPhrases[Math.floor(Math.random() * achievementPhrases.length)];
			} else {
				const supportiveIndex = currentCharacter - 3; // 0, 1, 2, or 3
				const achievementPhrases = characterPhrases.achievement[supportiveIndex];
				return achievementPhrases[Math.floor(Math.random() * achievementPhrases.length)];
			}
		} else {
			// Normal phrases (default behavior)
			const character = characters[currentCharacter];
			if (character.type === 'distant') {
				// Distant characters (0, 1, 2) use distant phrases
				const distantIndex = currentCharacter; // 0, 1, or 2
				const distantPhrases = characterPhrases.distant[distantIndex];
				return distantPhrases[Math.floor(Math.random() * distantPhrases.length)];
			} else {
				// Supportive characters (3, 4, 5, 6) use supportive phrases
				const supportiveIndex = currentCharacter - 3; // 0, 1, 2, or 3
				const supportivePhrases = characterPhrases.supportive[supportiveIndex];
				return supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)];
			}
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

	useEffect(() => {
		// Random initial delay (2-8 seconds)
		const initialDelay = 2000 + Math.random() * 6000;
		const initialTimer = setTimeout(() => {
			setIsVisible(true);
			speak();
		}, initialDelay);

		// Random interval between appearances (20-90 seconds)
		// More unpredictable, not annoying but visible enough
		const scheduleNext = () => {
			const randomDelay = 20000 + Math.random() * 70000; // 20-90 seconds
			return setTimeout(() => {
				if (!isSpeaking) {
					setIsVisible(true);
					speak();
				}
				scheduleNext(); // Reschedule for next appearance
			}, randomDelay);
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
}

// Hook to trigger character manually
export function useCharacterTrigger() {
	const [trigger, setTrigger] = useState(0);
	
	const triggerCharacter = useCallback(() => {
		setTrigger(prev => prev + 1);
	}, []);

	return { trigger, triggerCharacter };
}
