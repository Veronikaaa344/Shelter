import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import { Bot, User, MessageSquare, Sparkles, ChevronRight, Play, LayoutGrid, ChevronLeft, Clock, Zap, Target } from 'lucide-react';
import './mainChat.css';

const baseNodes = {
    start: {
        text: "Привіт! Я твій AI-помічник для психологічної підтримки. Як ти почуваєшся сьогодні?",
        options: [
            { text: "Відчуваю тривогу", next: "anxiety" },
            { text: "Мені сумно", next: "sadness" },
            { text: "Хочу просто поговорити", next: "talk" },
            { text: "Я в порядку, дякую!", next: "ok" }
        ]
    },
    anxiety: {
        text: "Тривога може бути дуже виснажливою. Пам'ятай, що ти в безпеці зараз. Що саме тебе тривожить?",
        options: [
            { text: "Ситуація навколо", next: "world" },
            { text: "Особисті справи", next: "personal" },
            { text: "Не знаю, просто тривожно", next: "unknown" },
            { text: "Давай зробимо вправу", next: "trigger_exercise" }
        ]
    },
    sadness: {
        text: "Мені шкода, що ти це відчуваєш. Це нормально — давати собі час на сум. Хочеш розповісти більше чи відволіктися?",
        options: [
            { text: "Розповісти більше", next: "talk" },
            { text: "Хочу відволіктися", next: "distract" }
        ]
    },
    talk: {
        text: "Я уважно слухаю. Розмова — це великий крок до зцілення. Що на душі?",
        options: [
            { text: "Важко зосередитися", next: "focus" },
            { text: "Відчуваю втому", next: "fatigue" },
            { text: "Повернутися до початку", next: "start" }
        ]
    },
    world: {
        text: "Світ зараз дуже непередбачуваний. Намагайся обмежувати потік новин та фокусуватися на тому, що ти можеш контролювати. Спробуємо техніку заземлення?",
        options: [
            { text: "Так, давай", next: "trigger_exercise" },
            { text: "Пізніше", next: "start" }
        ]
    },
    focus: {
        text: "Коли мы в стресі, мозок переходить у режим виживання, і фокусуватися стає важко. Спробуй розбити великі завдання на дуже маленькі кроки. Хочеш ще порад?",
        options: [
            { text: "Так, давай", next: "advice" },
            { text: "Дякую, цього досить", next: "ok" }
        ]
    },
    ok: {
        text: "Це чудово! Я завжди тут, якщо знадоблюся. Бажаю тобі гарного та спокійного дня!",
        options: [
            { text: "Почати спочатку", next: "start" }
        ]
    }
};

export default function MainChat({ onBack, username, resilience }) {
    const [chatView, setChatView] = useState("selection"); // "selection" or "chat"
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [scenario, setScenario] = useState(null);
    const [scenariosList, setScenariosList] = useState([]);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [isChatMode, setIsChatMode] = useState('ai'); 
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Загрузка списку сценаріїв
        api.getScenarios().then(data => {
            if (Array.isArray(data)) {
                setScenariosList(data.filter(s => s.type === 'dialogue' || !s.type));
            }
        });
    }, []);

    useEffect(() => {
        if (chatView === "chat") {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, chatView]);

    const selectScenario = (s) => {
        setScenario(s);
        setIsChatMode('scenario');
        const startId = s.nodes["start"] ? "start" : Object.keys(s.nodes)[0];
        setCurrentNodeId(startId);
        setMessages([
            {
                id: 1,
                text: s.nodes[startId].text,
                sender: 'bot',
                timestamp: new Date(),
                isScenario: true
            }
        ]);
        setChatView("chat");
    };

    const handleOptionSelect = (option) => {
        if (isTyping) return;

        const nextId = option.next;
        const userMessage = {
            id: messages.length + 1,
            text: option.text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            
            let nextNode = isChatMode === 'ai' ? baseNodes[nextId] : scenario.nodes[nextId];

            if (!nextNode) {
                const endText = isChatMode === 'scenario' 
                    ? "🌟 Вправу завершено! Дякую за практику." 
                    : "Я завжди тут. Бажаєш ще щось обговорити?";
                
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: endText,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
                return;
            }

            setCurrentNodeId(nextId);
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: nextNode.text,
                sender: 'bot',
                timestamp: new Date(),
                isScenario: isChatMode === 'scenario'
            }]);

        }, 1000);
    };

    if (chatView === "selection") {
        return (
            <div className="dr-main-chat selection-view">
                <header className="dr-chat-header">
                    <div className="dr-chat-header-content">
                        <div className="dr-chat-title-section">
                            <button onClick={onBack} className="mr-4 text-slate-500 hover:text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="dr-chat-icon">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="dr-chat-title">Чат-тренажери</h2>
                                <p className="dr-chat-subtitle">Оберіть тему розмови</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dr-chat-selection-grid p-8 overflow-y-auto max-h-[calc(100vh-150px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Сценарій AI Помічника (дефолтний) */}
                        <div 
                            className="dr-scenario-card ai-card"
                            onClick={() => {
                                setScenario(null);
                                setIsChatMode('ai');
                                setCurrentNodeId('start');
                                setMessages([{ id: 1, text: baseNodes.start.text, sender: 'bot', timestamp: new Date() }]);
                                setChatView("chat");
                            }}
                        >
                            <div className="dr-card-icon"><Sparkles size={24} /></div>
                            <h3>Вільне спілкування</h3>
                            <p>Обговоріть будь-які почуття з нашим AI-асистентом</p>
                            <div className="dr-card-footer">
                                <span className="tag">AI</span>
                                <button className="start-btn">Почати <Play size={14} fill="currentColor" /></button>
                            </div>
                        </div>

                        {/* Сценарії з бази даних */}
                        {scenariosList.map((s) => (
                            <div 
                                key={s._id} 
                                className="dr-scenario-card"
                                onClick={() => selectScenario(s)}
                            >
                                <div className="dr-card-icon"><Target size={24} /></div>
                                <h3>{s.name}</h3>
                                <p>Відпрацюйте конкретну ситуацію: {s.category || 'загальне'}</p>
                                <div className="dr-card-footer">
                                    <span className="tag"><Clock size={12} className="inline mr-1" /> {s.duration || '5 хв'}</span>
                                    <span className="tag"><Zap size={12} className="inline mr-1 text-amber-500" /> {s.difficulty || 50}%</span>
                                    <button className="start-btn">Тренуватись <Play size={14} fill="currentColor" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <CharacterCompanion context="chat" position="bottom-right" />
            </div>
        );
    }

    return (
        <div className="dr-main-chat">
            <header className="dr-chat-header">
                <div className="dr-chat-header-content">
                    <div className="dr-chat-title-section">
                        <button onClick={() => setChatView("selection")} className="mr-4 text-slate-500 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="dr-chat-icon">
                            {isChatMode === 'ai' ? <Sparkles className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="dr-chat-title">{isChatMode === 'ai' ? 'Shelter AI' : scenario?.name}</h2>
                            <p className="dr-chat-subtitle">{isChatMode === 'ai' ? 'Розумний помічник' : 'Сценарій тренування'}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dr-chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`dr-message ${message.sender === 'user' ? 'user' : 'bot'} ${message.isSystem ? 'system' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className="dr-message-header">
                            {message.sender === 'bot' ? (isChatMode === 'ai' ? 'AI Assistant' : 'Помічник') : username}
                        </div>
                        <div className="dr-message-content">
                            {message.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="dr-message bot">
                        <div className="dr-message-header">AI Assistant</div>
                        <div className="dr-message-content">
                            <div className="dr-typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="dr-chat-footer">
                <div className="dr-scenario-options">
                    {currentNodeId && (isChatMode === 'ai' ? baseNodes[currentNodeId]?.options : scenario?.nodes[currentNodeId]?.options)?.map((option, index) => (
                        <button
                            key={index}
                            className="dr-option-btn"
                            onClick={() => handleOptionSelect(option)}
                            disabled={isTyping}
                        >
                            {option.text}
                        </button>
                    ))}
                    {isTyping && (
                        <div className="h-10 flex items-center justify-center opacity-20 italic text-xs text-slate-500">
                            Чекаю на відповідь...
                        </div>
                    )}
                </div>
            </div>

            <CharacterCompanion context="chat" position="bottom-right" resilience={resilience} />
        </div>
    );
}
