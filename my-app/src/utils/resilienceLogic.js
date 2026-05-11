/**
 * ResilienceLogic - Строга система розрахунку ментальної стійкості.
 * Система розроблена так, щоб бути реалістичною: прогрес здобувається важко, 
 * але втрачається швидко при ігноруванні практик або деструктивних діях.
 */

export const SCORING_RULES = {
    // Вправи та Симулятори
    EXERCISE_COMPLETE_EXCELLENT: 8,  // Високий бал у симуляторі
    EXERCISE_COMPLETE_GOOD: 4,       // Середній бал
    EXERCISE_COMPLETE_POOR: -5,      // Низький бал (помилкові рішення)
    
    // Взаємодія в симуляторі (за кожен крок)
    SIMULATOR_POSITIVE_CHOICE: 2,
    SIMULATOR_NEGATIVE_CHOICE: -6,
    SIMULATOR_NEUTRAL_CHOICE: 0,

    // Контент
    MATERIAL_READ: 2,               // Прочитана стаття
    VIDEO_WATCHED: 3,               // Переглянуте відео (вимагає більше фокусу)

    // Щоденник та емоції
    DIARY_ENTRY_POSITIVE: 2,        // Позитивний запис
    DIARY_ENTRY_NEGATIVE: 1,        // Робота з негативом (плюс за те, що виписав)
    MOOD_TRACK_ANXIETY: -2,         // Фіксація тривоги (потребує уваги)
    MOOD_TRACK_CALM: 3,             // Фіксація спокою

    // Дисципліна
    STREAK_BONUS_DAILY: 2,          // Бонус за кожен день стріку
    INACTIVITY_PENALTY_1_DAY: -3,   // Штраф за пропуск 1 дня
    INACTIVITY_PENALTY_3_DAYS: -15, // Штраф за пропуск 3 днів
    INACTIVITY_PENALTY_WEEK: -40,   // Майже повне обнулення прогресу
};

/**
 * Розраховує зміну резильєнтності на основі типу події
 * @param {string} eventType - Тип події (напр. 'exercise_complete')
 * @param {object} metadata - Додаткові дані (бал, тривалість тощо)
 * @returns {number} - Значення зміни (позитивне або негативне)
 */
export const calculateResilienceChange = (eventType, metadata = {}) => {
    let change = 0;

    switch (eventType) {
        case 'simulator_choice':
            if (metadata.weight > 0) change = SCORING_RULES.SIMULATOR_POSITIVE_CHOICE;
            else if (metadata.weight < 0) change = SCORING_RULES.SIMULATOR_NEGATIVE_CHOICE;
            break;

        case 'exercise_finish':
            if (metadata.score > 80) change = SCORING_RULES.EXERCISE_COMPLETE_EXCELLENT;
            else if (metadata.score > 50) change = SCORING_RULES.EXERCISE_COMPLETE_GOOD;
            else change = SCORING_RULES.EXERCISE_COMPLETE_POOR;
            break;

        case 'material_view':
            change = metadata.type === 'video' ? SCORING_RULES.VIDEO_WATCHED : SCORING_RULES.MATERIAL_READ;
            break;

        case 'mood_select':
            if (['anxiety', 'stress', 'anger'].includes(metadata.mood)) change = SCORING_RULES.MOOD_TRACK_ANXIETY;
            else if (['calm', 'happy'].includes(metadata.mood)) change = SCORING_RULES.MOOD_TRACK_CALM;
            break;

        case 'diary_add':
            change = metadata.mood === 'positive' ? SCORING_RULES.DIARY_ENTRY_POSITIVE : SCORING_RULES.DIARY_ENTRY_NEGATIVE;
            break;

        case 'inactivity':
            if (metadata.days >= 7) change = SCORING_RULES.INACTIVITY_PENALTY_WEEK;
            else if (metadata.days >= 3) change = SCORING_RULES.INACTIVITY_PENALTY_3_DAYS;
            else if (metadata.days >= 1) change = SCORING_RULES.INACTIVITY_PENALTY_1_DAY;
            break;

        default:
            change = 0;
    }

    return change;
};

/**
 * Нормалізація значення (0 - 100)
 */
export const clampResilience = (value) => {
    return Math.max(0, Math.min(100, Math.round(value)));
};
