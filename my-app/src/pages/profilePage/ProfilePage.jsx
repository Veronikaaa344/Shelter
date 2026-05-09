import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {api} from '../../api/api';
import './profilePage.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(false);
    const [newBadges, setNewBadges] = useState([]);

    useEffect(() => {
        api.getUserProfile()
            .then(data => {
                if(data.message) setError(true);
                else {
                    setUserData(data);
                    // Record activity for streak tracking
                    api.recordActivity().then(activity => {
                        if (activity.newBadges?.length > 0) {
                            setNewBadges(activity.newBadges);
                        }
                    }).catch(() => {});
                }
            })
            .catch(() => setError(true));
    }, []);

    const handleSosClick = async () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            await api.updateResilience(userId, -15, "sos", "Натиснута кнопка SOS");
        }
        navigate('/sos');
    };

    const dismissBadges = () => setNewBadges([]);

    if (error) return (
        <div className="dr-profile-layout">
            <button className="dr-back-btn" onClick={() => navigate('/main')}>← Назад</button>
            <div className="dr-error">Помилка завантаження. Спробуйте ввійти знову.</div>
            <button onClick={() => navigate('/auth')} className="dr-auth-submit-btn">Увійти</button>
            <button className="dr-sos-fab" onClick={handleSosClick}><span className="dr-sos-text">SOS</span></button>
        </div>
    );

    if (!userData) return <div className="dr-loader">Завантаження...</div>;

    const stats = userData.stats || {};
    const badges = userData.badges || [];
    const streak = stats.streak || 0;
    const longestStreak = stats.longestStreak || 0;

    return (
        <div className="dr-profile-layout">
            {/* New Badge Notification */}
            {newBadges.length > 0 && (
                <div className="dr-badge-notification-overlay" onClick={dismissBadges}>
                    <div className="dr-badge-notification">
                        <span className="dr-badge-icon">🎉</span>
                        <h3>Нові досягнення!</h3>
                        {newBadges.map(badge => (
                            <div key={badge.id} className="dr-new-badge">
                                <span className="dr-badge-emoji">{badge.icon}</span>
                                <div>
                                    <strong>{badge.name}</strong>
                                    <p>{badge.description}</p>
                                </div>
                            </div>
                        ))}
                        <button onClick={dismissBadges} className="dr-badge-dismiss">Чудово!</button>
                    </div>
                </div>
            )}

            <header className="dr-header">
                <div className="dr-logo" onClick={() => navigate('/main')}>🛡️ Прихисток</div>
                <button className="dr-back-btn" onClick={() => navigate('/main')}>← Назад</button>
            </header>
            <main className="dr-profile-content">
                <div className="dr-profile-card">
                    <h1>{userData.username}</h1>
                    {userData.email && <p>{userData.email}</p>}
                    {userData.isGuest && <p className="dr-guest-badge">Гість</p>}

                    {/* Streak Section */}
                    <div className="dr-streak-section">
                        <div className="dr-streak-display">
                            <span className="dr-streak-icon">🔥</span>
                            <div className="dr-streak-info">
                                <span className="dr-streak-count">{streak} днів</span>
                                <span className="dr-streak-label">поспіль</span>
                            </div>
                        </div>
                        {longestStreak > streak && (
                            <div className="dr-longest-streak">
                                Рекорд: {longestStreak} днів
                            </div>
                        )}
                    </div>

                    <div className="dr-stats-grid">
                        <div className="dr-stat-card">
                            <span>Резильєнтність</span>
                            <h2>{stats.resilience || 50}%</h2>
                        </div>
                        <div className="dr-stat-card">
                            <span>Завершено сценаріїв</span>
                            <h2>{userData.completedScenarios?.length || 0}</h2>
                        </div>
                    </div>

                    {/* Badges Collection */}
                    {badges.length > 0 && (
                        <div className="dr-badges-section">
                            <h3>🏆 Мої досягнення</h3>
                            <div className="dr-badges-grid">
                                {badges.map(badge => (
                                    <div key={badge.id} className="dr-badge-card" title={badge.description}>
                                        <span className="dr-badge-icon">{badge.icon}</span>
                                        <span className="dr-badge-name">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={() => navigate('/main')} className="dr-logout-btn">
                        Назад
                    </button>
                </div>
            </main>
            <button className="dr-sos-fab" onClick={handleSosClick}>
                <span className="dr-sos-text">SOS</span>
            </button>
        </div>
    );
}