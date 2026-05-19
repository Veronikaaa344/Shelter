import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../infrastructure/api/api';
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
        text: "Коли ми в стресі, мозок переходить у режим виживання, і фокусуватися стає важко. Спробуй розбити великі завдання на дуже маленькі кроки. Хочеш ще порад?",
        options: [
            { text: "Так, давай", next: "advice" },
            { text: "Дякую, цього досить", next: "ok" }
        ]
    },
    ok: {
        text: "Це чудово! Я завжди тут, якщо знадоблюся. Бажаю тобі гарного та спокійного дня!",
        options: []
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
    const [flyingMessage, setFlyingMessage] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Завантаження списку сценаріїв
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
        if (!s || !s.nodes) {
            console.error("Scenario has no nodes:", s);
            return;
        }
        setScenario(s);
        setIsChatMode('scenario');
        const startId = s.nodes["start"] ? "start" : (Object.keys(s.nodes)[0] || 'start');
        setCurrentNodeId(startId);
        setMessages([
            {
                id: 1,
                text: s.nodes[startId]?.text || "Помилка завантаження вмісту сценарію",
                sender: 'bot',
                timestamp: new Date(),
                isScenario: true
            }
        ]);
        setChatView("chat");
    };

    const handleOptionSelect = (option, e) => {
        if (isTyping || flyingMessage) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const targetRect = messagesEndRef.current.getBoundingClientRect();

        const startPos = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };

        const targetPos = {
            top: targetRect.top - 100,
            left: targetRect.right - (rect.width / 2) - 80 // Ціль - права сторона
        };

        setFlyingMessage({
            text: option.text,
            startPos,
            targetPos
        });

        // Пряма анімація "перельоту"
        setTimeout(() => {
            const nextId = option.next;
            const userMessage = {
                id: messages.length + 1,
                text: option.text,
                sender: 'user',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setFlyingMessage(null);
            setIsTyping(true);

            setTimeout(() => {
                setIsTyping(false);
                let nextNode = isChatMode === 'ai' ? baseNodes[nextId] : scenario?.nodes?.[nextId];

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
                    setIsFinished(true);
                    
                    // Бонус +4 за завершення чату
                    const userId = localStorage.getItem("userId");
                    if (userId) {
                        api.updateResilience(userId, "chat_finish", {}, isChatMode === 'ai' ? 'AI Помічник' : scenario?.name)
                            .then(() => {
                                console.log("✅ [DEBUG] Chat progress saved. Current cookies:", document.cookie);
                            })
                            .catch(err => console.error("❌ [DEBUG] Failed to save chat progress:", err));
                    }
                    
                    setTimeout(() => setShowCompletionMenu(true), 1500);
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
        }, 600); // Час "польоту"
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
                {/* <CharacterCompanion context="chat" position="bottom-right" /> */}
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
                        className={`dr-message ${message.sender === 'user' ? 'user' : 'bot'} ${message.isSystem ? 'system' : ''}`}
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
                    {currentNodeId && (isChatMode === 'ai' ? baseNodes[currentNodeId]?.options : scenario?.nodes?.[currentNodeId]?.options)?.map((option, index) => (
                        <button
                            key={index}
                            className="dr-option-btn"
                            onClick={(e) => handleOptionSelect(option, e)}
                            disabled={isTyping || flyingMessage}
                        >
                            {option.text}
                        </button>
                    ))}
                    {isTyping && <div className="h-4" />}
                </div>
            </div>

            {/* <CharacterCompanion context="chat" position="bottom-right" resilience={resilience} /> */}
            
            {flyingMessage && (
                <div 
                    className="dr-flying-element"
                    style={{
                        position: 'fixed',
                        top: flyingMessage.startPos.top,
                        left: flyingMessage.startPos.left,
                        width: flyingMessage.startPos.width,
                        height: flyingMessage.startPos.height,
                        '--target-x': `${flyingMessage.targetPos.left - flyingMessage.startPos.left - (flyingMessage.startPos.width / 2)}px`,
                        '--target-y': `${flyingMessage.targetPos.top - flyingMessage.startPos.top}px`,
                    }}
                >
                    {flyingMessage.text}
                </div>
            )}
            {showCompletionMenu && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-[#0b0f1a]/80 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-slate-900/80 border border-slate-800 p-10 rounded-[48px] max-w-lg w-full text-center shadow-3xl transform animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Чудова розмова!</h2>
                        <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest font-bold">Дякую, що поділилися своїми почуттями.</p>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => {
                                    setShowCompletionMenu(false);
                                    setChatView("selection");
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all"
                            >
                                Вийти
                            </button>
                            <button 
                                onClick={() => onBack()} // Перехід до Home/Dashboard
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                            >
                                До прогресу
                            </button>
                            <button 
                                onClick={() => {
                                    setIsFinished(false);
                                    setShowCompletionMenu(false);
                                    if (isChatMode === 'ai') {
                                        setMessages([{ id: 1, text: baseNodes.start.text, sender: 'bot', timestamp: new Date() }]);
                                        setCurrentNodeId('start');
                                    } else {
                                        selectScenario(scenario);
                                    }
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all"
                            >
                                Почати знову
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
