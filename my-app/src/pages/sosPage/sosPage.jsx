import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getDiagnosticResult } from '../../diagnosticLogic';

export default function SosPage() {
    const { answers } = useParams();
    const location = useLocation();
    
    // Check if answers come from state or params
    const activeAnswers = answers || location.state?.answers;
    const View = getDiagnosticResult(activeAnswers);

    return (
        <div className="min-h-screen bg-[#070a12]">
            <View answers={activeAnswers} />
        </div>
    );
}