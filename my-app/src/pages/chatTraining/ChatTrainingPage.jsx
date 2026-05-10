import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import {
    ChevronLeft,
    Send,
    Bot,
    User,
    MessageSquare,
    ShieldCheck,
    LifeBuoy
} from 'lucide-react';

export default function ChatTrainingPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Привіт! Я твій AI-помічник для психологічної підтримки. Як ти почуваєшся, я готовий допомогти.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [username, setUsername] = useState("Гість");
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Загрузка профиля пользователя
        if (api.isGuest && api.isGuest()) {
            api.getProfile()
                .then((profile) => {
                    if (profile && profile.username) {
                        setUsername(profile.username);
                    }
                })
                .catch((err) => console.error('Profile fetch error:', err));
        } else {
            setUsername("Профіль");
        }

        // Прокрутка к последнему сообщению
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Сохранение сообщения в базу данных
        try {
            if (userId) {
                await api.saveChatMessage(userId, userMessage.text);
            }
        } catch (error) {
            console.error('Error saving chat message:', error);
        }

        // Имитация ответа бота
        setTimeout(() => {
            const botResponses = [
                "Це чудово, що ти звертаєш увагу до свого ментального здоров'я. Розуміння це перший крок до змін.",
                "Я радий допомогти тобі! Давай розглянемо твої почуття детальніше. Що саме тебе турбує?",
                "Пам'ятай, що психологічна підтримка - це ознака сили, а не слабості. Ти на правильному шляху!",
                "Чудово! Твої слова показують, що ти готовий до роботи над собою. Продовжуй в тому ж дусі!"
            ];

            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
            
            const botMessage = {
                id: messages.length + 2,
                text: randomResponse,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden">
            {/* Боковая панель */}
            <aside className="w-20 lg:w-72 border-r border-slate-800 flex flex-col bg-[#0b0f1a] z-20 shadow-2xl">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] shadow-xl">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="hidden lg:block text-2xl font-black text-white italic uppercase tracking-tighter italic">
                        Shelter
                    </span>
                </div>
                <nav className="flex-1 px-4 space-y-3 mt-6">
                    <div className="flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all duration-300 hover:bg-slate-800 text-slate-400">
                        <MessageSquare size={22} />
                        <span className="font-bold text-sm hidden lg:block tracking-wide">Чат-тренування</span>
                    </div>
                </nav>
                <div className="p-6 border-t border-slate-900 space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-[24px] flex items-center gap-3 border border-slate-800/50 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b0f1a] font-black text-xs">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-black text-white font-bold">{username}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resilience: 50%</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Основной контент */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#0b0f1a] to-[#121827]">
                {/* Header */}
                <header className="h-24 px-8 flex items-center justify-between backdrop-blur-xl bg-[#0b0f1a]/60 border-b border-slate-800/50">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"
                    >
                        <ChevronLeft size={20} /> Назад
                    </button>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/sos')}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/40 transition-all transform hover:scale-105 active:scale-95"
                        >
                            SOS
                        </button>
                    </div>
                </header>

                {/* Чат интерфейс */}
                <div className="flex-1 flex flex-col p-6 space-y-4">
                    {/* Заголовок чата */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-6 backdrop-blur-xl shadow-2xl mb-6">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-3">
                            <Bot size={24} className="text-emerald-500" />
                            AI-помічник для психологічної підтримки
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            Я твій персональний AI-асистент, готовий допомогти тобі 24/7. 
                            Тут ти можеш обговорити свої почуття, отримати поради та практичні вправи.
                        </p>
                    </div>

                    {/* Сообщения чата */}
                    <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[40px] p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="h-full overflow-y-auto space-y-4 pb-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in duration-300`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                        message.sender === 'user' 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-slate-800 text-slate-300'
                                    } shadow-lg`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {message.sender === 'bot' && (
                                                <Bot size={16} className="text-emerald-500" />
                                            )}
                                            <span className="text-xs font-black uppercase tracking-widest opacity-70">
                                                {message.sender === 'user' ? 'Ти' : 'AI'}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed">
                                            {message.text}
                                        </p>
                                        <div className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">
                                            {new Date(message.timestamp).toLocaleTimeString('uk-UA', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Индикатор набора текста */}
                            {isTyping && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Bot size={16} className="text-emerald-500" />
                                            <span className="text-sm">AI помічник друкує...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Поле ввода */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-6 backdrop-blur-xl shadow-2xl">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Напиши своє повідомлення..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:bg-slate-800/70 transition-all resize-none"
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-[#0b0f1a] px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Character Companion */}
            <CharacterCompanion
                context="chat"
                position="bottom-right"
            />
        </div>
    );
}
