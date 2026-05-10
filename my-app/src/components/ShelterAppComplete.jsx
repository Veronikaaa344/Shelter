import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import MainChat from './MainChat/MainChat';
import SimulatorPage from '../pages/trainerSimulator/simulatorPage/SimulatorPage';
import UpdatedFindDifferencesPage from '../pages/trainerSimulator/findDifferencesPage/UpdatedFindDifferencesPage';
import UpdatedSortingPage from '../pages/trainerSimulator/sortingPage/UpdatedSortingPage';
import '../pages/trainerSimulator/simulatorPage/simulatorPage.css';
import { 
  Heart, Wind, Brain, Activity, User, AlertCircle, 
  ChevronLeft, ChevronRight, TrendingUp, MessageCircle, X, Layout, 
  Settings, Bell, Search, ShieldCheck, Play, Pause, RotateCcw,
  CheckCircle2, BookOpen, Video, Mic, FileText, BarChart3, Filter,
  Lightbulb, PenLine, Smile, Meh, Frown, Plus, SearchX, Mail, Lock, LogOut,
  ClipboardList, PlayCircle, Headphones
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

// --- ІМІТАЦІЯ ДАНИХ (MOCK DATA) ---

const resilienceHistory = [
  { day: 'Пн', val: 45 },
  { day: 'Вт', val: 52 },
  { day: 'Ср', val: 48 },
  { day: 'Чт', val: 70 },
  { day: 'Пт', val: 65 },
  { day: 'Сб', val: 85 },
  { day: 'Нд', val: 78 },
];

const questions = [
  { q: "Як часто за останній тиждень ви відчували напруження?", options: ["Ніколи", "Рідко", "Часто", "Постійно"], points: [100, 70, 40, 10] },
  { q: "Наскільки легко вам вдається зосередитися?", options: ["Дуже легко", "Важко", "Майже неможливо", "Легко"], points: [100, 40, 15, 80] },
  { q: "Чи відчуваєте ви підтримку від близьких людей?", options: ["Повну", "Часткову", "Мінімальну", "Зовсім ні"], points: [100, 70, 40, 10] },
  { q: "Як оціните якість свого сну?", options: ["Відмінна", "Задовільна", "Погана", "Жахлива"], points: [100, 70, 30, 0] }
];

const FlipSidebarItem = ({ id, icon, label, isDashboard = false, index = 0, isSpecialMode, currentView, navigateTo, handleChatBack }) => {
  const isFlipped = isSpecialMode;
  const isActive = currentView === id && !isSpecialMode;
  
  // Stagger the flip animation based on index
  const baseDelay = isFlipped ? index * 0.1 : (5 - index) * 0.1;
  
  const wrapperStyle = {
    perspective: '1200px',
    transition: `height 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.4 : baseDelay}s, opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.3 : baseDelay}s, margin-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.4 : baseDelay}s`,
    height: isFlipped && !isDashboard ? '0px' : '56px',
    opacity: isFlipped && !isDashboard ? 0 : 1,
    marginBottom: isFlipped && !isDashboard ? '0px' : '12px',
    pointerEvents: isFlipped && !isDashboard ? 'none' : 'auto',
    position: 'relative',
    zIndex: 10 - index
  };

  const innerStyle = {
    position: 'absolute',
    width: '100%',
    height: '56px',
    transformStyle: 'preserve-3d',
    transition: `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${baseDelay}s`,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  };

  const faceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  };

  const backFaceStyle = {
    ...faceStyle,
    transform: 'rotateY(180deg)'
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        {/* Front */}
        <div 
          style={faceStyle} 
          className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all duration-300 ${
            isActive 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
            : 'hover:bg-slate-800 text-slate-400'
          }`}
          onClick={() => { if (!isFlipped) navigateTo(id); }}
        >
          {icon}
          <span className="font-bold text-sm hidden lg:block tracking-wide">{label}</span>
        </div>
        
        {/* Back */}
        <div 
          style={backFaceStyle}
          className={`flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 w-full ${
            isDashboard 
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 cursor-pointer' 
            : 'bg-slate-800/40 border border-slate-700/30'
          }`}
          onClick={() => { if (isFlipped && isDashboard) handleChatBack(); }}
        >
          {isDashboard && (
            <>
              <ChevronLeft size={22} />
              <span className="font-bold text-sm hidden lg:block tracking-wide">Назад</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ShelterAppComplete = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Автоматически логиним
  const [currentView, setCurrentView] = useState('home'); 
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [isFindDifferencesMode, setIsFindDifferencesMode] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [libraryFilter, setLibraryFilter] = useState('Всі');

  const [selectedMood, setSelectedMood] = useState(null);
  const [diaryEntry, setDiaryEntry] = useState('');
  
  const [breathStage, setBreathStage] = useState('Вдих');
  const [timer, setTimer] = useState(4);
  const [isActive, setIsActive] = useState(false);

  const [testStep, setTestStep] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Simulator states
  const [simulatorScenarioId, setSimulatorScenarioId] = useState(null);
  const [simulatorScenariosList, setSimulatorScenariosList] = useState([]);

  // Данные из API
  const [mediaLibraryData, setMediaLibraryData] = useState([]);
  const [username, setUsername] = useState("Гість");
  const [resilience, setResilience] = useState(50);
  const [userStats, setUserStats] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  useEffect(() => {
    // Загрузка материалов из API
    api.getMaterials()
      .then((data) => {
        console.log('📊 Загруженные материалы с API:', data);
        console.log('📏 Количество материалов:', data?.length || 0);
        
        if (Array.isArray(data)) {
          const mappedData = data.map(m => ({
            id: m._id,
            title: m.title,
            type: m.type === 'text' ? 'Стаття' : m.type === 'video' ? 'Відео' : 'Аудіо',
            cat: m.category || 'Загальне',
            duration: '10 хв',
            icon: m.type === 'text' ? <FileText size={20}/> : m.type === 'video' ? <Video size={20}/> : <Headphones size={20}/>,
            color: m.category === 'anxiety' ? 'bg-blue-500' : m.category === 'stress' ? 'bg-emerald-500' : m.category === 'apathy' ? 'bg-rose-500' : 'bg-purple-500'
          }));
          
          console.log('🔄 Преобразованные материалы для отображения:', mappedData);
          console.log('📋 Список материалов:');
          mappedData.forEach((material, index) => {
            console.log(`${index + 1}. ${material.title} (${material.type}) - ${material.cat}`);
          });
          
          setMediaLibraryData(mappedData);
        } else {
          console.log('❌ Данные не являются массивом:', data);
        }
      })
      .catch((err) => console.error('Error loading materials:', err));

    // Загрузка профиля
    if (api.isGuest && api.isGuest()) {
      api.getProfile()
        .then((profile) => {
          if (profile && profile.username) {
            setUsername(profile.username);
          }
        })
        .catch(() => {});
    }

    // Загрузка статистики
    if (userId) {
      api.getUserStats(userId)
        .then((stats) => {
          setUserStats(stats);
          if (stats?.resilience?.current) {
            setResilience(stats.resilience.current);
          }
        })
        .catch((err) => console.error('Error loading user stats:', err));
      
      // Обновляем streak
      api.updateStreak(userId).catch(() => {});
    }

    // Загрузка сценариев для кубиков
    api.getScenarios()
      .then((data) => {
        if (Array.isArray(data)) {
          setSimulatorScenariosList(data);
        }
      })
      .catch((err) => console.error('Error loading scenarios:', err));
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (isActive && timer === 0) {
      const stages = { 'Вдих': 'Затримка', 'Затримка': 'Видих', 'Видих': 'Спокій', 'Спокій': 'Вдих' };
      setBreathStage(prev => stages[prev]);
      setTimer(4);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const navigateTo = (id) => {
    if (id === 'chat') {
        setIsChatMode(true);
        setIsSimulatorMode(false);
    } else {
        setCurrentView(id);
        setIsActive(false);
        setSearchTerm('');
        setTestStep(0);
        setIsTestFinished(false);
        setIsChatMode(false);
        setIsSimulatorMode(false);
        setIsFindDifferencesMode(false);
        setIsSortingMode(false);
    }
  };

  const handleChatBack = () => {
    setIsChatMode(false);
    setIsSimulatorMode(false);
    setIsFindDifferencesMode(false);
    setIsSortingMode(false);
    setCurrentView('home');
  };

  const startSimulator = async () => {
    try {
      const scenarios = await api.getScenarios();
      const simulatorScenarios = scenarios.filter(s => s.category === 'general' || s.category === 'anxiety');
      
      if (simulatorScenarios.length > 0) {
        const randomScenario = simulatorScenarios[Math.floor(Math.random() * simulatorScenarios.length)];
        setSimulatorScenarioId(randomScenario._id);
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    }
  };

  

  const isSpecialMode = isChatMode || isSimulatorMode || isFindDifferencesMode || isSortingMode;



  const LoginView = () => (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-6 relative overflow-hidden text-slate-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] mb-6 shadow-xl"><ShieldCheck size={36} /></div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Shelter</h1>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Email</label>
            <input type="email" placeholder="користувач@mail.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl py-4 px-6 text-white outline-none focus:border-emerald-500 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Пароль</label>
            <input type="password" placeholder="••••••••" className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl py-4 px-6 text-white outline-none focus:border-emerald-500 transition-all" required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 text-[#0b0f1a] py-4 rounded-3xl font-black uppercase text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all">Увійти</button>
        </form>
      </div>
    </div>
  );

  const HomeView = () => {
    const baseCards = [
      { title: "Дихання", cat: "Практика", icon: <Wind/>, color: "from-emerald-500 to-emerald-600", onClick: () => navigateTo('practice') },
      { title: "Діагностика", cat: "Тестування", icon: <Brain/>, color: "from-blue-500 to-blue-600", onClick: () => navigateTo('testing') },
      { title: "Поради", cat: "Освіта", icon: <Lightbulb/>, color: "from-orange-500 to-orange-600", onClick: () => navigateTo('advice') },
      { title: "Щоденник", cat: "Рефлексія", icon: <PenLine/>, color: "from-purple-500 to-purple-600", onClick: () => navigateTo('diary') },
      { title: "Чат-тренування", cat: "Практика", icon: <MessageCircle/>, color: "from-rose-500 to-rose-600", onClick: () => navigateTo('chat') },
      { title: "Відмінності", cat: "Практика", icon: <Search/>, color: "from-teal-500 to-teal-600", onClick: () => { 
          const diffScenario = simulatorScenariosList.find(s => s.type === 'findDifferences' || (s.name && s.name.toLowerCase().includes('відмін')));
          if (diffScenario) setSimulatorScenarioId(diffScenario._id);
          setIsFindDifferencesMode(true); 
      } },
      { title: "Сортування", cat: "Практика", icon: <Layout/>, color: "from-amber-500 to-amber-600", onClick: () => { 
          const sortScenario = simulatorScenariosList.find(s => s.type === 'sorting' || (s.name && s.name.toLowerCase().includes('сорт')));
          if (sortScenario) setSimulatorScenarioId(sortScenario._id);
          setIsSortingMode(true); 
      } }
    ];

    const simulatorCards = simulatorScenariosList.map((scenario, i) => {
      const colors = [
        "from-indigo-500 to-indigo-600",
        "from-violet-500 to-violet-600",
        "from-fuchsia-500 to-fuchsia-600",
        "from-cyan-500 to-cyan-600"
      ];
      return {
        title: scenario.title || `Тренажер ${i + 1}`,
        cat: "Симулятор",
        icon: <Activity/>,
        color: colors[i % colors.length],
        onClick: () => {
          setSimulatorScenarioId(scenario._id);
          setIsSimulatorMode(true);
        }
      };
    });

    const cards = [...baseCards, ...simulatorCards].filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700">
        <section>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            {searchTerm ? `Пошук: "${searchTerm}"` : "Час для спокою"}
          </h1>
          {!searchTerm && <p className="text-slate-500 max-w-xl text-xl italic font-medium">Ваш ментальний баланс сьогодні в нормі. Саме час для невеликих вправ.</p>}
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <div key={i} onClick={card.onClick} className="group relative h-80 rounded-[48px] overflow-hidden cursor-pointer shadow-2xl transition-all hover:-translate-y-2">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 transition-all group-hover:scale-110 duration-700`}></div>
              <div className="relative p-10 h-full flex flex-col justify-between text-white">
                  <div className="p-4 bg-white/20 rounded-2xl w-fit backdrop-blur-md shadow-inner">{card.icon}</div>
                  <div><p className="text-[10px] font-black uppercase mb-1 opacity-70 tracking-widest">{card.cat}</p><h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{card.title}</h4></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LibraryView = () => {
    console.log('🔍 LibraryView - все материалы:', mediaLibraryData);
    console.log('🔍 LibraryView - текущий фильтр:', libraryFilter);
    console.log('🔍 LibraryView - текущий поиск:', searchTerm);
    
    const filteredMedia = mediaLibraryData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = libraryFilter === 'Всі' || item.type === libraryFilter;
      return matchesSearch && matchesFilter;
    });
    
    console.log('🔍 LibraryView - отфильтрованные материалы:', filteredMedia);

    const handleMaterialClick = (material) => {
      // Записываем просмотр материала в статистику
      if (userId) {
        api.recordMaterialView(userId, material.id)
          .then(() => {
            console.log(`Material view recorded: ${material.title}`);
            // Обновляем локальную статистику
            if (userStats) {
              setUserStats({
                ...userStats,
                materialsViewed: {
                  ...userStats.materialsViewed,
                  count: (userStats.materialsViewed?.count || 0) + 1
                }
              });
            }
          })
          .catch((err) => console.error('Error recording material view:', err));
      }
      
      // Переходим к материалу
      navigate(`/material/${material.id}`);
    };

    return (
      <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Медіатека</h2>
          <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            {['Всі', 'Аудіо', 'Відео', 'Стаття'].map((f) => (
              <button key={f} onClick={() => setLibraryFilter(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${libraryFilter === f ? 'bg-emerald-500 text-[#0b0f1a]' : 'text-slate-500 hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedia.map((item) => (
            <div key={item.id} onClick={() => handleMaterialClick(item)} className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden text-left">
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg`}>{item.icon}</div>
                <div className="bg-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-400">{item.duration}</div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{item.type}</p>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors uppercase leading-none">{item.title}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mt-6 group-hover:gap-4 transition-all italic">Відкрити контент <ChevronRight size={14} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TestingView = () => {
    const handleAnswer = (points) => {
      const newAnswers = [...testAnswers, points];
      setTestAnswers(newAnswers);
      if (testStep < questions.length - 1) setTestStep(testStep + 1);
      else {
        setIsTestFinished(true);
        // Сохраняем результаты в базу данных
        const score = Math.round(newAnswers.reduce((a, b) => a + b, 0) / questions.length);
        if (userId) {
          api.recordDiagnostic(userId, score, newAnswers)
            .then(() => {
              // Обновляем локальную статистику
              setResilience(score);
              if (userStats) {
                setUserStats({
                  ...userStats,
                  diagnosticsTaken: {
                    ...userStats.diagnosticsTaken,
                    count: (userStats.diagnosticsTaken?.count || 0) + 1,
                    lastScore: score,
                    lastDate: new Date()
                  }
                });
              }
            })
            .catch((err) => console.error('Error saving diagnostic:', err));
        }
      }
    };

    if (isTestFinished) {
      const score = Math.round(testAnswers.reduce((a, b) => a + b, 0) / questions.length);
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500 text-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20"><CheckCircle2 size={48} className="text-[#0b0f1a]" /></div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none text-white">Діагностика завершена</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Індекс стійкості: <span className="text-emerald-400 font-black">{score}%</span>. Продовжуйте працювати над собою!</p>
          <button onClick={() => navigateTo('stats')} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Дивитися динаміку</button>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none text-left">Питання {testStep + 1} / {questions.length}</h2>
          <div className="flex gap-1">{questions.map((_, i) => <div key={i} className={`w-8 h-1.5 rounded-full transition-all ${i <= testStep ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>)}</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-[48px] backdrop-blur-xl shadow-2xl">
           <h3 className="text-2xl font-bold text-white mb-10 leading-tight text-left">{questions[testStep].q}</h3>
           <div className="grid grid-cols-1 gap-4">
              {questions[testStep].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(questions[testStep].points[idx])} className="flex items-center justify-between p-7 bg-slate-800/40 border border-slate-700 rounded-[32px] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left text-slate-300 hover:text-white font-bold group">
                  {opt} <ChevronRight size={18} className="text-slate-700 group-hover:text-emerald-500 transition-all" />
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const AdviceView = () => (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Поради та Знання</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Гігієна сну в стресі", cat: "Фізіологія", color: "border-blue-500/30 bg-blue-500/5" },
          { title: "Емоційний інтелект", cat: "Психологія", color: "border-purple-500/30 bg-purple-500/5" },
          { title: "Медітація для новачків", cat: "Практика", color: "border-emerald-500/30 bg-emerald-500/5" },
          { title: "Як працює кортизол", cat: "Наука", color: "border-orange-500/30 bg-orange-500/5" },
        ].map((advice, i) => (
          <div key={i} className={`p-10 rounded-[48px] border-2 group cursor-pointer transition-all hover:scale-[1.02] ${advice.color} shadow-xl shadow-black/20 text-left`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{advice.cat}</p>
            <h4 className="text-xl font-bold text-white uppercase leading-none tracking-tight">{advice.title}</h4>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-white transition-all italic">Читати статтю <ChevronRight size={14} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const DiaryView = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveDiary = () => {
    if (!diaryEntry.trim() || selectedMood === null) {
      setSaveMessage('Будь ласка, напишіть щось та виберіть настрій');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    if (userId) {
      api.addDiaryEntry(userId, selectedMood, diaryEntry.trim())
        .then(() => {
          setSaveMessage('✅ Нотатку збережено!');
          setDiaryEntry('');
          setSelectedMood(null);
          
          // Обновляем локальную статистику
          if (userStats) {
            setUserStats({
              ...userStats,
              diaryEntries: [
                {
                  date: new Date(),
                  mood: selectedMood,
                  content: diaryEntry.trim(),
                  wordCount: diaryEntry.trim().split(' ').length
                },
                ...(userStats.diaryEntries || [])
              ]
            });
          }
        })
        .catch((err) => {
          console.error('Error saving diary entry:', err);
          setSaveMessage('❌ Помилка збереження');
        })
        .finally(() => {
          setIsSaving(false);
          setTimeout(() => setSaveMessage(''), 3000);
        });
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Щоденник рефлексії</h2>
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl space-y-8 text-left">
        <textarea 
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          placeholder="Опишіть ваші відчуття сьогодні..."
          className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-[24px] p-6 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
        ></textarea>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Мій стан:</span>
            <div className="flex gap-2">
              {[Smile, Meh, Frown].map((Icon, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedMood(idx)} 
                  className={`p-4 rounded-2xl transition-all ${selectedMood === idx ? 'bg-slate-700 scale-110 shadow-lg' : 'bg-slate-800/50 opacity-40 hover:opacity-100'}`}
                >
                  <Icon size={24} className={idx === 0 ? 'text-emerald-500' : idx === 1 ? 'text-amber-500' : 'text-rose-500'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('✅') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {saveMessage}
              </span>
            )}
            <button 
              onClick={handleSaveDiary}
              disabled={isSaving}
              className="bg-emerald-500 text-[#0b0f1a] px-12 py-4 rounded-2xl font-black uppercase text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Збереження...' : 'Зберегти нотатку'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  const StatsView = () => (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Прогрес стійкості</h2>
       <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[48px] shadow-2xl backdrop-blur-xl h-96">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={resilienceHistory}>
                <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}} />
                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
             </AreaChart>
          </ResponsiveContainer>
       </div>
    </div>
  );

  const PracticeView = () => {
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);

  const handleStartSession = () => {
    setIsActive(true);
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  };

  const handleEndSession = () => {
    setIsActive(false);
    if (sessionStartTime) {
      const sessionMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
      setTotalSessionTime(sessionMinutes);
      
      // Сохраняем сессию в базу данных
      if (userId && sessionMinutes > 0) {
        api.recordBreathingSession(userId, sessionMinutes)
          .then(() => {
            console.log(`Breathing session saved: ${sessionMinutes} minutes`);
            // Обновляем локальную статистику
            if (userStats) {
              setUserStats({
                ...userStats,
                breathingSessions: {
                  ...userStats.breathingSessions,
                  count: (userStats.breathingSessions?.count || 0) + 1,
                  totalMinutes: (userStats.breathingSessions?.totalMinutes || 0) + sessionMinutes,
                  lastSession: new Date()
                },
                totalSessions: (userStats.totalSessions || 0) + 1,
                totalMinutes: (userStats.totalMinutes || 0) + sessionMinutes
              });
            }
          })
          .catch((err) => console.error('Error saving breathing session:', err));
      }
      
      setSessionStartTime(null);
    }
  };

  const handleReset = () => {
    setTimer(4);
    setBreathStage('Вдих');
    setIsActive(false);
    setSessionStartTime(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f1a] flex flex-col p-8 animate-in zoom-in duration-500 text-slate-300">
       <div className="flex justify-between items-center mb-12">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-all"><ChevronLeft size={20} /> Вийти</button>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Техніка дихання</span>
       </div>
       <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-20">
             <div className={`absolute inset-0 bg-emerald-500/10 rounded-full transition-all duration-[4000ms] ${isActive && breathStage === 'Вдих' ? 'scale-150' : 'scale-100'}`}></div>
             <div className="w-64 h-64 border-8 border-emerald-500/20 rounded-full flex items-center justify-center relative z-10 transition-all duration-[4000ms] shadow-2xl shadow-emerald-900/5">
                <div>
                   <h2 className="text-7xl font-black text-white italic mb-2 tracking-tighter leading-none">{timer}</h2>
                   <p className="text-xs font-black uppercase text-emerald-500 tracking-[0.2em]">{breathStage}</p>
                </div>
             </div>
          </div>
          <div className="flex gap-6">
             <button onClick={isActive ? handleEndSession : handleStartSession} className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'bg-white text-black hover:scale-105'}`}>
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
             </button>
             <button onClick={handleReset} className="w-24 h-24 rounded-[32px] bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all"><RotateCcw size={32} /></button>
          </div>
          {totalSessionTime > 0 && (
            <div className="mt-8 text-emerald-400 text-sm">
              Сесія завершена: {totalSessionTime} хвилин
            </div>
          )}
       </div>
    </div>
  );
};

  if (!isLoggedIn) return <LoginView />;

  return (
    <div className="flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden">
      
      <aside className="w-20 lg:w-72 border-r border-slate-800 flex flex-col bg-[#0b0f1a] z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] shadow-xl"><ShieldCheck size={28} /></div>
          <span className="hidden lg:block text-2xl font-black text-white italic uppercase tracking-tighter italic">Shelter</span>
        </div>
        
        {/* 3D Flip Navigation (Sidebar) */}
        <nav className="flex-1 px-4 mt-6">
          <div className="space-y-0">
            <FlipSidebarItem id="home" icon={<Layout size={22}/>} label="Дашборд" isDashboard={true} index={0} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="testing" icon={<ClipboardList size={22}/>} label="Діагностика" index={1} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="library" icon={<BookOpen size={22}/>} label="Медіатека" index={2} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="advice" icon={<Lightbulb size={22}/>} label="Поради" index={3} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="diary" icon={<PenLine size={22}/>} label="Щоденник" index={4} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="stats" icon={<BarChart3 size={22}/>} label="Прогрес" index={5} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
          </div>
        </nav>
        
        <div className="p-6 border-t border-slate-900 space-y-4">
           <div className="bg-slate-900/50 p-4 rounded-[24px] flex items-center gap-3 border border-slate-800/50 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b0f1a] font-black text-xs">{username.charAt(0).toUpperCase()}</div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-white font-bold">{username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resilience: {resilience}%</p>
              </div>
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 p-4 rounded-[20px] text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs uppercase tracking-widest text-left"><LogOut size={18} /> <span className="hidden lg:block">Вийти</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-[#0b0f1a] to-[#121827]">
        <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-[#0b0f1a]/60 border-b border-slate-800/50">
          <div className="flex items-center gap-4 bg-slate-900/40 px-6 py-3 rounded-full border border-slate-800 w-full max-md focus-within:border-emerald-500 transition-all group shadow-inner">
            <Search size={18} className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Пошук..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-600 font-medium" 
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowSOS(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/40 transition-all transform hover:scale-105 active:scale-95">SOS</button>
            <div className="relative p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"><Bell size={22} /><div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-[#0b0f1a]"></div></div>
          </div>
        </header>

        <div className="flex-1">
          {isChatMode ? (
            <MainChat 
              onBack={handleChatBack}
              username={username}
              resilience={resilience}
            />
          ) : isSimulatorMode && simulatorScenarioId ? (
            <SimulatorPage 
               isEmbedded={true} 
               embeddedId={simulatorScenarioId} 
               onBack={() => setIsSimulatorMode(false)} 
            />
          ) : isFindDifferencesMode ? (
            <div className="relative h-full w-full bg-[#0b0f1a]">
               <button onClick={() => setIsFindDifferencesMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24}/></button>
               <UpdatedFindDifferencesPage 
                 isEmbedded={true} 
                 embeddedId={simulatorScenarioId} 
                 onBack={() => setIsFindDifferencesMode(false)} 
               />
            </div>
          ) : isSortingMode ? (
            <div className="relative h-full w-full bg-[#0b0f1a]">
               <button onClick={() => setIsSortingMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24}/></button>
               <UpdatedSortingPage 
                 isEmbedded={true} 
                 embeddedId={simulatorScenarioId} 
                 onBack={() => setIsSortingMode(false)} 
               />
            </div>
          ) : (
            <>
              {currentView === 'home' && <HomeView />}
              {currentView === 'library' && <LibraryView />}
              {currentView === 'testing' && <TestingView />}
              {currentView === 'stats' && <StatsView />}
              {currentView === 'practice' && <PracticeView />}
              {currentView === 'advice' && <AdviceView />}
              {currentView === 'diary' && <DiaryView />}
            </>
          )}
        </div>
      </main>

      {showSOS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setShowSOS(false)}></div>
          <div className="relative bg-slate-900 border border-white/10 p-16 rounded-[64px] w-full max-w-2xl text-center shadow-2xl">
             <div className="w-24 h-24 bg-rose-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse"><AlertCircle size={48} className="text-white" /></div>
             <h2 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter leading-none">Дихайте.</h2>
             <p className="text-slate-400 mb-10 text-xl italic">Ви у безпеці. Давайте разом відновимо спокій.</p>
             <button onClick={() => {setShowSOS(false); navigateTo('practice');}} className="w-full bg-white text-black py-6 rounded-[28px] font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-widest">Почати практику</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterAppComplete;
