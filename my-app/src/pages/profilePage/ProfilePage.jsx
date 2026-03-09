import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {api} from '../../api/api';
import './profilePage.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        api.getProfile()
            .then(data => {
                if(data.message) setError(true);
                else setUserData(data);
            })
            .catch(() => setError(true));
    }, []);

    const handleLogout = () => {
        api.logout().then(() => {
            navigate('/main');
        });
    };

    if (error) return (
        <div className="dr-profile-layout">
            <button className="dr-back-btn" onClick={() => navigate('/main')}>← Назад</button>
            <div className="dr-error">Помилка завантаження. Спробуйте ввійти знову.</div>
            <button onClick={() => navigate('/auth')} className="dr-auth-submit-btn">Увійти</button> {} 
            <button className="dr-sos-fab" onClick={() => navigate('/sos')}><span className="dr-sos-text">SOS</span></button>
        </div>
    );

    if (!userData) return <div className="dr-loader">Завантаження...</div>;

    return (
        <div className="dr-profile-layout">
            <header className="dr-header">
                <div className="dr-logo" onClick={() => navigate('/main')}>🛡️ Прихисток</div>
                <button className="dr-back-btn" onClick={() => navigate('/main')}>← Назад</button>
            </header>
            <main className="dr-profile-content">
                <div className="dr-profile-card">
                    <h1>{userData.username}</h1>
                    <p>{userData.email}</p>
                    <div className="dr-stats-grid">
                        <div className="dr-stat-card">
                            <span>Стійкість</span>
                            <h2>{userData.stats?.resilience}%</h2>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="dr-logout-btn">Вийти</button>
                </div>
            </main>
            <button className="dr-sos-fab" onClick={() => navigate('/sos')}>
                <span className="dr-sos-text">SOS</span>
            </button>
        </div>
    );
}