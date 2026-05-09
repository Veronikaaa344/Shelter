import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './authPage.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let data;
        
        if (isLogin) {
            data = await api.login(formData);
        } else {
            const wasGuest = localStorage.getItem("dr_token") === "guest_mode";
            if (wasGuest) {
                data = await api.migrateGuest(formData);
            } else {
                data = await api.register(formData);
            }
        }
        
        if (data.user) {
            localStorage.setItem("dr_token", data.token);
            localStorage.setItem("userId", data.user.id);
            navigate('/main');
        } else {
            alert(data.message || "Помилка авторизації");
        }
    };

    const handleGuestLogin = async () => {
        try {
            const data = await api.loginAsGuest();
            if (data.user) {
                localStorage.setItem("dr_token", "guest_mode");
                localStorage.setItem("userId", data.user.id);
                navigate('/main');
            } else {
                alert(data.message || "Помилка входу як гість");
            }
        } catch (err) {
            alert("Помилка входу як гість");
        }
    };

    const handleSosClick = async () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            await api.updateResilience(userId, -15, "sos", "Нажата кнопка SOS");
        }
        navigate('/sos');
    };

    return (
        <div className="dr-new-layout dr-auth-layout">
            <div className="dr-cloud dr-cloud-1">☁️</div>
            <div className="dr-cloud dr-cloud-2">☁️</div>
            
            <button className="dr-show-all-btn dr-auth-back" onClick={() => navigate('/main')}>
                ← На головну
            </button>

            <main className="dr-new-main dr-auth-main">
                <div className="dr-status-card dr-auth-card">
                    <div className="dr-logo-icon-box dr-auth-logo">
                        🛡️
                    </div>
                    <h1 className="dr-status-title">{isLogin ? 'Вхід' : 'Реєстрація'}</h1>
                    
                    <form className="dr-auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="dr-input-group">
                                <input 
                                    className="dr-auth-input"
                                    type="text" 
                                    placeholder="Ім'я" 
                                    onChange={e => setFormData({...formData, username: e.target.value})} 
                                    required 
                                />
                            </div>
                        )}
                        <div className="dr-input-group">
                            <input 
                                className="dr-auth-input"
                                type="email" 
                                placeholder="Email" 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="dr-input-group">
                            <input 
                                className="dr-auth-input"
                                type="password" 
                                placeholder="Пароль" 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <button type="submit" className="dr-trainer-btn dr-auth-submit">
                            {isLogin ? 'Увійти' : 'Створити акаунт'}
                        </button>
                    </form>

                    <button className="dr-nav-link dr-auth-toggle" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
                    </button>

                    <div className="dr-auth-divider">
                        <span>або</span>
                    </div>

                    <button className="dr-show-all-btn dr-guest-action" onClick={handleGuestLogin}>
                        Увійти як гість
                    </button>
                </div>
            </main>

            <button className="dr-sos-btn" onClick={handleSosClick}>
                <span className="dr-sos-label">SOS</span>
            </button>
        </div>
    );
}