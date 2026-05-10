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
    Sparkles,
    Play,
    Target,
    Clock,
    Zap,
    LayoutGrid,
    Search
} from 'lucide-react';

export default function ChatTrainingPage() {
    const navigate = useNavigate();
    const [view, setView] = useState("selection"); // "selection" or "chat"
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [username, setUsername] = useState("Гість");
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    
    const [scenarios, setScenarios] = useState([]);
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        api.getProfile()
            .then((profile) => {
                if (profile && profile.username) {
                    setUsername(profile.username);
                }
            })
            .catch(() => {});

        api.getScenarios()
            .then((data) => {
                if (Array.isArray(data)) {
                    // Тільки сценарії типу dialogue або без типу (дефолтні)
                    setScenarios(data.filter(s => s.type === 'dialogue' || !s.type));
                }
            })
            .catch(err => console.error('Scenarios fetch error:', err));
    }, []);

    useEffect(() => {
        if (view === "chat") {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, view]);

    const startScenario = (scenario) => {
        setActiveScenario(scenario);
        setIsFinished(false);
        const startId = scenario.nodes["start"] ? "start" : Object.keys(scenario.nodes)[0];
        setCurrentNodeId(startId);
        
        const firstNode = scenario.nodes[startId];
        const botMsg = {
            id: Date.now(),
            text: firstNode.text,
            sender: 'bot',
            timestamp: new Date()
        };
        
        setMessages([
            {
                id: 'system',
                text: `Ви розпочали сценарій: ${scenario.name}`,
                sender: 'bot',
                isSystem: true,
                timestamp: new Date()
            }, 
            botMsg
        ]);
        setView("chat");
    };

    const handleOptionClick = (option) => {
        if (!activeScenario) return;

        const userMsg = {
            id: Date.now() + 1,
            text: option.text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        setTimeout(() => {
            const nextId = option.next;
            if (!nextId || !activeScenario.nodes[nextId]) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    text: "Сценарій завершено. Сподіваюсь, цей досвід був корисним для вас!",
                    sender: 'bot',
                    timestamp: new Date()
                }]);
                setIsFinished(true);
                setIsTyping(false);
                return;
            }

            const nextNode = activeScenario.nodes[nextId];
            setCurrentNodeId(nextId);
            
            const botMsg = {
                id: Date.now() + 2,
                text: nextNode.text,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);

            if (nextNode.isFinal) {
                setIsFinished(true);
            }
        }, 1000);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        setTimeout(() => {
            const botMessage = {
                id: Date.now() + 1,
                text: "Я чую тебе. Давай зосередимось на поточному сценарії або просто продовжимо розмову.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const currentNode = activeScenario?.nodes?.[currentNodeId];

    if (view === "selection") {
        return (
            <div className="min-h-screen bg-[#0b0f1a] text-slate-300 font-sans p-6 lg:p-12">
                <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                    <button onClick={() => navigate("/main")} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
                        <ChevronLeft size={20} /> Головна
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b0f1a] shadow-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="text-xl font-black text-white italic uppercase tracking-tighter">Shelter</span>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 animate-in fade-in slide-in-from-left duration-700">
                            Оберіть тему тренування
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl animate-in fade-in slide-in-from-left duration-700 delay-100">
                            Кожен сценарій розроблений для опрацювання конкретних ситуацій та підвищення вашої психологічної стійкості.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scenarios.map((s, idx) => (
                            <div 
                                key={s._id} 
                                onClick={() => startScenario(s)}
                                className="group relative bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 rounded-[32px] p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom duration-700"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Sparkles size={40} className="text-emerald-500" />
                                </div>
                                
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-[#0b0f1a] transition-colors duration-500">
                                    <MessageSquare size={32} />
                                </div>

                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
                                    {s.name}
                                </h3>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <Clock size={14} /> {s.duration || "5 хв"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <Zap size={14} className="text-amber-500" /> Складність: {s.difficulty || 50}%
                                    </div>
                                </div>

                                <button className="w-full bg-slate-800 group-hover:bg-emerald-500 text-white group-hover:text-[#0b0f1a] py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2">
                                    Почати <Play size={14} fill="currentColor" />
                                </button>
                            </div>
                        ))}

                        {scenarios.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[40px]">
                                <p className="text-slate-500 font-bold uppercase tracking-widest">Завантаження сценаріїв...</p>
                            </div>
                        )}
                    </div>
                </main>

                <CharacterCompanion context="selection" position="bottom-right" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden">
            {/* Боковая панель (згорнута або адаптивна) */}
            <aside className="hidden lg:flex w-72 border-r border-slate-800 flex-col bg-[#0b0f1a] z-20 shadow-2xl">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] shadow-xl">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="text-2xl font-black text-white italic uppercase tracking-tighter">Shelter</span>
                </div>
                
                <div className="px-8 mb-6">
                    <button 
                        onClick={() => setView("selection")}
                        className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 p-4 rounded-2xl flex items-center gap-3 transition-all border border-slate-700/30"
                    >
                        <LayoutGrid size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">Всі сценарії</span>
                    </button>
                </div>

                <div className="px-8 mb-4">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Активний сценарій</h3>
                </div>

                <div className="px-4 flex-1">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <h4 className="text-emerald-400 font-black text-sm uppercase mb-2">{activeScenario?.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                            Проходьте діалог, обираючи найкращі варіанти відповідей.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-900">
                    <div className="bg-slate-900/50 p-4 rounded-[24px] flex items-center gap-3 border border-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b0f1a] font-black text-xs">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-white">{username}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Основной контент чата */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#0b0f1a] to-[#121827]">
                <header className="h-24 px-8 flex items-center justify-between backdrop-blur-xl bg-[#0b0f1a]/60 border-b border-slate-800/50">
                    <button 
                        onClick={() => setView("selection")}
                        className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"
                    >
                        <ChevronLeft size={20} /> До вибору
                    </button>
                    <div className="hidden md:flex items-center gap-4 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeScenario?.name}</span>
                    </div>
                    <button 
                        onClick={() => navigate('/sos')}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/40 transition-all transform hover:scale-105"
                    >
                        SOS
                    </button>
                </header>

                <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
                    <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[40px] p-6 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                        <div className="h-full overflow-y-auto space-y-6 pb-4 pr-2 custom-scrollbar">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-5 py-4 rounded-[24px] ${
                                        message.sender === 'user' 
                                            ? 'bg-emerald-500 text-[#0b0f1a] font-medium' 
                                            : message.isSystem 
                                              ? 'bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-widest mx-auto py-2'
                                              : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 shadow-lg'
                                    } relative`}>
                                        {!message.isSystem && (
                                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                                {message.sender === 'bot' ? <Bot size={14} className="text-emerald-500" /> : <User size={14} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {message.sender === 'user' ? 'Ви' : 'AI'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-slate-800/50 text-slate-400 px-6 py-3 rounded-full border border-slate-700/30 flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {!isFinished && !isTyping && currentNode?.options?.length > 0 && (
                            <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {currentNode.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(opt)}
                                        className="group relative bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-[20px] text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/5 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center gap-2">
                                            <Sparkles size={14} className="opacity-50" />
                                            {opt.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-4 backdrop-blur-xl shadow-2xl group focus-within:border-emerald-500/50 transition-all">
                            <div className="flex gap-3 items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={!isFinished ? "Оберіть варіант вище або напишіть тут..." : "Сценарій завершено"}
                                    className="flex-1 bg-transparent border-none py-4 px-4 text-white placeholder-slate-500 outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isTyping}
                                    className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-[#0b0f1a] w-14 h-14 rounded-[20px] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center"
                                >
                                    <Send size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <CharacterCompanion context="chat" position="bottom-right" />
        </div>
    );
}
