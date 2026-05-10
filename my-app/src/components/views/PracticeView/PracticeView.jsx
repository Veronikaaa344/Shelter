import React from 'react';
import BreathingExercise from '../../BreathingExercise/BreathingExercise';
import { api } from '../../../api/api';

const PracticeView = ({ userId, navigateTo }) => {
    const handleFinishSession = (mins, cycles) => {
        if (userId && mins > 0) {
            api.recordBreathingSession(userId, mins)
                .catch((err) => console.error('Error saving breathing session:', err));
        }
    };

    return (
        <BreathingExercise 
            onExit={() => navigateTo('home')}
            onFinishSession={handleFinishSession}
            title="Техніка дихання"
            showControls={true}
        />
    );
};

export default PracticeView;
