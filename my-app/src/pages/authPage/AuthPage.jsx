import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {api} from '../../api/api';
import './authPage.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = isLogin ? await api.login(formData) : await api.register(formData);
        if (data.user) {
            navigate('/main');
        } else {
            alert(data.message || "Помилка авторизації");
        }
    };

    return (
        <div className="dr-auth-container">
            <button className="dr-back-btn" onClick={() => navigate('/main')}>← На головну</button>
            <div className="dr-auth-card">
                <h1>{isLogin ? 'Вхід' : 'Реєстрація'}</h1>
                <form className="dr-auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input 
                            type="text" 
                            placeholder="Ім'я" 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                            required 
                        />
                    )}
                    <input 
                        type="email" 
                        placeholder="Email" 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Пароль" 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required 
                    />
                    <button type="submit" className="dr-auth-submit-btn">
                        {isLogin ? 'Увійти' : 'Створити акаунт'}
                    </button>
                </form>
                <button className="dr-auth-toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
                </button>
            </div>
            <button className="dr-sos-fab" onClick={() => navigate('/sos')}>
                <span className="dr-sos-text">SOS</span>
            </button>
        </div>
    );
}