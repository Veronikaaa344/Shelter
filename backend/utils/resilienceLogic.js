const SCORING_RULES = {
    
    EXERCISE_COMPLETE_EXCELLENT: 8,
    EXERCISE_COMPLETE_GOOD: 4,
    EXERCISE_COMPLETE_POOR: -5,
    
    
    SIMULATOR_POSITIVE_CHOICE: 2,
    SIMULATOR_NEGATIVE_CHOICE: -6,
    SIMULATOR_NEUTRAL_CHOICE: 0,

    
    MATERIAL_READ: 2,
    VIDEO_WATCHED: 3,

    
    DIARY_ENTRY_POSITIVE: 2,
    DIARY_ENTRY_NEGATIVE: 1,
    MOOD_TRACK_ANXIETY: -2,
    MOOD_TRACK_CALM: 3,

    
    STREAK_BONUS_DAILY: 2,
    INACTIVITY_PENALTY_1_DAY: -3,
    INACTIVITY_PENALTY_3_DAYS: -15,
    INACTIVITY_PENALTY_WEEK: -40,

    
    SOS_BUTTON: 15,
    SOS_BUTTON_PRESSED_PANIC: -15,
    LEVEL_COMPLETE: 10,
    DIFFERENCE_FOUND: 3,
    CHAT_FINISH: 4,
    BREATHING: 4,
    MATERIAL_FEEDBACK: 2
};

const calculateResilienceChange = (eventType, metadata = {}) => {
    let change = 0;

    switch (eventType) {
        case 'simulator_choice':
            if (metadata.weight > 0) change = SCORING_RULES.SIMULATOR_POSITIVE_CHOICE;
            else if (metadata.weight < 0) change = SCORING_RULES.SIMULATOR_NEGATIVE_CHOICE;
            break;

        case 'exercise_finish':
        case 'exercise':
        case 'exercise_complete':
            if (metadata.score !== undefined) {
                if (metadata.score > 80) change = SCORING_RULES.EXERCISE_COMPLETE_EXCELLENT;
                else if (metadata.score > 50) change = SCORING_RULES.EXERCISE_COMPLETE_GOOD;
                else change = SCORING_RULES.EXERCISE_COMPLETE_POOR;
            } else {
                change = SCORING_RULES.EXERCISE_COMPLETE_GOOD; 
            }
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

        
        case 'sos':
            if (metadata.panic) change = SCORING_RULES.SOS_BUTTON_PRESSED_PANIC;
            else change = SCORING_RULES.SOS_BUTTON;
            break;
            
        case 'video_complete':
            if (metadata.score !== undefined) change = Math.min(20, metadata.score / 5);
            else change = 10;
            break;
            
        case 'difference_found':
            change = metadata.points || SCORING_RULES.DIFFERENCE_FOUND;
            break;
            
        case 'level_complete':
            change = SCORING_RULES.LEVEL_COMPLETE;
            break;
            
        case 'wrong_answer':
            change = metadata.weight || -2;
            break;
            
        case 'material_feedback':
            change = metadata.delta || SCORING_RULES.MATERIAL_FEEDBACK;
            break;

        case 'chat_finish':
            change = SCORING_RULES.CHAT_FINISH;
            break;
            
        case 'breathing':
            change = SCORING_RULES.BREATHING;
            break;
            
        case 'complete_material':
        case 'complete_scenario':
            change = 2;
            break;

        default:
            change = 0;
            break;
    }

    
    if (isNaN(change)) {
        change = 0;
    }

    
    if (change > 15) {
        change = 15;
    }

    return change;
};

const clampResilience = (value) => {
    if (isNaN(value)) return 50;
    return Math.max(0, Math.min(100, Math.round(value)));
};

export {
    SCORING_RULES,
    calculateResilienceChange,
    clampResilience
};
