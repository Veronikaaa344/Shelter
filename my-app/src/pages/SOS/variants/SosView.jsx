import React from 'react';
import { useNavigate } from 'react-router-dom';
import BreathingExercise from '../../../components/BreathingExercise/BreathingExercise';
import { useTranslation } from 'react-i18next';
import { api } from '../../../infrastructure/api/api';

export default function SosView({ answers }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleFinishSession = async (mins, cycles) => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            await api.updateResilience(userId, "sos", {}, t('sos.breathing_exercise'));
        }
        navigate("/main", { state: { fromSOS: true, helped: true } });
    };

    return (
        <div className="fixed inset-0 bg-[#070a12] z-50">
            <BreathingExercise 
                autoStart={false} 
                showControls={true}
                requireCycles={3}
                onFinishSession={handleFinishSession}
                onExit={() => navigate('/main')}
                title={t('sos.title')}
            />
        </div>
    );
}
