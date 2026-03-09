import React from 'react';
import { useParams } from 'react-router-dom';
import './sosPage.css';
import { getDiagnosticResult } from '../../diagnosticLogic';
export default function SosPage() {
    const {answers} = useParams();
    const View = getDiagnosticResult(answers);
    return (
        <div className="sos-page-container">
            <View 
            answers={answers}
            />
        </div>
    );
}