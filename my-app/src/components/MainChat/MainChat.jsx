import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import CharacterCompanion from '../../components/characterCompanion/CharacterCompanion';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import './mainChat.css';

export default function MainChat({ onBack, username, resilience }) {
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
    const [scenario, setScenario] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState(null);
    const [history, setHistory] = useState([]);
    const [isChatMode, setIsChatMode] = useState('ai'); // 'ai' или 'scenario'
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
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
            const userId = localStorage.getItem("userId");
            if (userId) {
                await api.saveChatMessage(userId, userMessage.text);
            }
        } catch (error) {
            console.error('Error saving chat message:', error);
        }

        // Ответы AI ассистента
        setTimeout(() => {
            const botResponses = [
                "Це чудово, що ти звертаєш увагу до свого ментального здоров'я. Розуміння це перший крок до змін.",
                "Я радий допомогти тобі! Давай розглянемо твої почуття детальніше. Що саме тебе турбує?",
                "Пам'ятай, що психологічна підтримка - це ознака сили, а не слабкості. Ти на правильному шляху!",
                "Чудово! Твої слова показують, що ти готовий до роботи над собою. Продовжуй в тому ж дусі!",
                "Дякую, що поділився. Це важливо - говорити про свої почуття. Хочеш спробувати вправу для заспокоєння?"
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

    const startScenarioChat = async () => {
        setLoading(true);
        setIsChatMode('scenario');
        
        try {
            // Загружаем случайный сценарий для чата
            const scenarios = await api.getScenarios();
            const chatScenarios = scenarios.filter(s => s.category === 'general' || s.category === 'anxiety');
            
            if (chatScenarios.length > 0) {
                const randomScenario = chatScenarios[Math.floor(Math.random() * chatScenarios.length)];
                const scenarioData = await api.getScenarioById(randomScenario._id);
                
                if (scenarioData && scenarioData.nodes) {
                    setScenario(scenarioData);
                    const startId = scenarioData.nodes["start"] ? "start" : Object.keys(scenarioData.nodes)[0];
                    setCurrentNodeId(startId);
                    setHistory([{ role: "bot", text: scenarioData.nodes[startId].text }]);
                    
                    setMessages(prev => [...prev, {
                        id: prev.length + 1,
                        text: `🎯 Починаємо вправу: ${scenarioData.name}\n\n${scenarioData.nodes[startId].text}`,
                        sender: 'bot',
                        timestamp: new Date(),
                        isScenario: true
                    }]);
                }
            }
        } catch (error) {
            console.error('Error loading scenario:', error);
            setIsChatMode('ai');
        } finally {
            setLoading(false);
        }
    };

    const handleScenarioOption = (option) => {
        const userMessage = {
            id: messages.length + 1,
            text: option.text,
            sender: 'user',
            timestamp: new Date(),
            isScenario: true
        };

        setMessages(prev => [...prev, userMessage]);

        const nextId = option.next;
        const weight = option.weight || 0;

        if (weight < 0) {
            const userId = localStorage.getItem("userId");
            if (userId) api.updateResilience(userId, weight, "wrong_answer", scenario.name);
        }

        if (!nextId || !scenario.nodes[nextId]) {
            const finalMessage = {
                id: messages.length + 2,
                text: "🌟 Вправу завершено! Дякую за практику. Твій рівень стійкості оновлено.",
                sender: 'bot',
                timestamp: new Date(),
                isScenario: true
            };
            setMessages(prev => [...prev, finalMessage]);
            setIsChatMode('ai');
            
            const userId = localStorage.getItem("userId");
            if (userId) {
                const finalImpact = Math.round((weight || 5) * 2);
                api.updateResilience(userId, finalImpact, "exercise", scenario.name);
                api.completeScenario(scenario._id, finalImpact);
            }
            return;
        }

        const nextNode = scenario.nodes[nextId];
        setHistory(prev => [...prev, { role: "bot", text: nextNode.text }]);
        setCurrentNodeId(nextId);

        const botMessage = {
            id: messages.length + 2,
            text: nextNode.text,
            sender: 'bot',
            timestamp: new Date(),
            isScenario: true
        };

        setTimeout(() => {
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <div className="dr-main-chat">
            {/* Header чата */}
            <header className="dr-chat-header">
                <div className="dr-chat-header-content">
                    <div className="dr-chat-title-section">
                        <div className="dr-chat-icon">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="dr-chat-title">AI-помічник</h2>
                            <p className="dr-chat-subtitle">Психологічна підтримка 24/7</p>
                        </div>
                    </div>
                    
                    <div className="dr-chat-controls">
                        <button 
                            className="dr-scenario-btn"
                            onClick={startScenarioChat}
                            disabled={loading || isChatMode === 'scenario'}
                        >
                            {isChatMode === 'scenario' ? 'Вправа активна' : 'Спробувати вправу'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Сообщения чата */}
            <div className="dr-chat-messages">
                <div className="dr-messages-container">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`dr-message ${message.sender === 'user' ? 'user' : 'bot'} ${message.isScenario ? 'scenario' : ''}`}
                        >
                            <div className="dr-message-content">
                                <div className="dr-message-header">
                                    {message.sender === 'bot' && (
                                        <Bot size={16} className="dr-message-icon" />
                                    )}
                                    {message.sender === 'user' && (
                                        <User size={16} className="dr-message-icon" />
                                    )}
                                    <span className="dr-message-sender">
                                        {message.sender === 'user' ? username : 'AI'}
                                    </span>
                                    <span className="dr-message-time">
                                        {new Date(message.timestamp).toLocaleTimeString('uk-UA', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <div className="dr-message-text">
                                    {message.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Индикатор набора текста */}
                    {isTyping && (
                        <div className="dr-message bot">
                            <div className="dr-message-content">
                                <div className="dr-message-header">
                                    <Bot size={16} className="dr-message-icon" />
                                    <span className="dr-message-sender">AI</span>
                                </div>
                                <div className="dr-typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Варианты ответа для сценария */}
                    {isChatMode === 'scenario' && scenario && scenario.nodes[currentNodeId]?.options && (
                        <div className="dr-scenario-options">
                            {scenario.nodes[currentNodeId].options.map((option, index) => (
                                <button
                                    key={index}
                                    className="dr-option-btn"
                                    onClick={() => handleScenarioOption(option)}
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Поле ввода */}
            {isChatMode === 'ai' && (
                <div className="dr-chat-input">
                    <div className="dr-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Напиши своє повідомлення..."
                            className="dr-message-input"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="dr-send-btn"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Character Companion */}
            <CharacterCompanion
                context="chat"
                position="bottom-right"
                resilience={resilience}
            />
        </div>
    );
}
