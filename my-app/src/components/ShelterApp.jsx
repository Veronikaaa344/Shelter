import React, { useState, useEffect } from 'react';
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

const mediaLibraryData = [
  { id: 1, title: "Вечірня релаксація", type: "Аудіо", cat: "Сон", duration: "15 хв", icon: <Mic size={20}/>, color: "bg-blue-500" },
  { id: 2, title: "Дихання при паніці", type: "Відео", cat: "Криза", duration: "5 хв", icon: <Video size={20}/>, color: "bg-rose-500" },
  { id: 3, title: "Як подолати безсоння", type: "Стаття", cat: "Навчання", duration: "10 хв", icon: <FileText size={20}/>, color: "bg-emerald-500" },
  { id: 4, title: "Звуки лісу", type: "Аудіо", cat: "Релакс", duration: "30 хв", icon: <Headphones size={20}/>, color: "bg-teal-500" },
  { id: 5, title: "Ранкова руханка", type: "Відео", cat: "Тіло", duration: "12 хв", icon: <Video size={20}/>, color: "bg-amber-500" },
  { id: 6, title: "Психологія стійкості", type: "Стаття", cat: "Теорія", duration: "15 хв", icon: <BookOpen size={20}/>, color: "bg-indigo-500" },
];

const questions = [
  { q: "Як часто за останній тиждень ви відчували напруження?", options: ["Ніколи", "Рідко", "Часто", "Постійно"], points: [100, 70, 40, 10] },
  { q: "Наскільки легко вам вдається зосередитися?", options: ["Дуже легко", "Важко", "Майже неможливо", "Легко"], points: [100, 40, 15, 80] },
  { q: "Чи відчуваєте ви підтримку від близьких людей?", options: ["Повну", "Часткову", "Мінімальну", "Зовсім ні"], points: [100, 70, 40, 10] },
  { q: "Як оціните якість свого сну?", options: ["Відмінна", "Задовільна", "Погана", "Жахлива"], points: [100, 70, 30, 0] }
];

const ShelterApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentView, setCurrentView] = useState('home'); 
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
    setCurrentView(id);
    setIsActive(false);
    setSearchTerm('');
    setTestStep(0);
    setIsTestFinished(false);
  };

  const SidebarItem = ({ id, icon, label }) => (
    <div 
      onClick={() => navigateTo(id)}
      className={`shelter-nav-item ${currentView === id ? 'active' : ''}`}
    >
      {icon}
      <span style={{ display: 'none' }}>{label}</span>
    </div>
  );

  const LoginView = () => (
    <div className="shelter-login-container">
      <div className="shelter-login-bg"></div>
      <div className="shelter-login-card">
        <div className="shelter-login-header">
          <div className="shelter-logo-icon"><ShieldCheck size={36} /></div>
          <h1 className="shelter-login-title">Shelter</h1>
        </div>
        <form className="shelter-form" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
          <div className="shelter-input-group">
            <label className="shelter-label">Email</label>
            <input type="email" placeholder="користувач@mail.com" className="shelter-input" required />
          </div>
          <div className="shelter-input-group">
            <label className="shelter-label">Пароль</label>
            <input type="password" placeholder="••••••••" className="shelter-input" required />
          </div>
          <button type="submit" className="shelter-button">Увійти</button>
        </form>
      </div>
    </div>
  );

  const HomeView = () => {
    const cards = [
      { title: "Дихання", cat: "Практика", icon: <Wind/>, gradient: "shelter-card-gradient-1", onClick: () => navigateTo('practice') },
      { title: "Діагностика", cat: "Тестування", icon: <Brain/>, gradient: "shelter-card-gradient-2", onClick: () => navigateTo('testing') },
      { title: "Поради", cat: "Освіта", icon: <Lightbulb/>, gradient: "shelter-card-gradient-3", onClick: () => navigateTo('advice') },
      { title: "Щоденник", cat: "Рефлексія", icon: <PenLine/>, gradient: "shelter-card-gradient-4", onClick: () => navigateTo('diary') },
    ].filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="shelter-content">
        <section>
          <h1 className="shelter-title">
            {searchTerm ? `Пошук: "${searchTerm}"` : "Час для спокою"}
          </h1>
          {!searchTerm && <p className="shelter-subtitle">Ваш ментальний баланс сьогодні в нормі. Саме час для невеликих вправ.</p>}
        </section>
        <div className="shelter-cards">
          {cards.map((card, i) => (
            <div key={i} onClick={card.onClick} className={`shelter-card ${card.gradient}`}>
              <div className="shelter-card-content">
                <div className="shelter-card-icon">{card.icon}</div>
                <div>
                  <p className="shelter-card-title">{card.cat}</p>
                  <h4 className="shelter-card-name">{card.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LibraryView = () => {
    const filteredMedia = mediaLibraryData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = libraryFilter === 'Всі' || item.type === libraryFilter;
      return matchesSearch && matchesFilter;
    });

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
            <div key={item.id} className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden text-left">
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
      else setIsTestFinished(true);
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

  const DiaryView = () => (
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
          <button className="bg-emerald-500 text-[#0b0f1a] px-12 py-4 rounded-2xl font-black uppercase text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">Зберегти нотатку</button>
        </div>
      </div>
    </div>
  );

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

  const PracticeView = () => (
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
             <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'bg-white text-black hover:scale-105'}`}>
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
             </button>
             <button onClick={() => {setTimer(4); setBreathStage('Вдих'); setIsActive(false);}} className="w-24 h-24 rounded-[32px] bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all"><RotateCcw size={32} /></button>
          </div>
       </div>
    </div>
  );

  if (!isLoggedIn) return <LoginView />;
  
  return (
    <div className="shelter-app">
      
      <aside className="shelter-sidebar">
        <div className="shelter-logo">
          <div className="shelter-logo-icon"><ShieldCheck size={28} /></div>
          <span className="shelter-logo-text">Shelter</span>
        </div>
        <nav className="shelter-nav">
          <SidebarItem id="home" icon={<Layout size={22}/>} label="Дашборд" />
          <SidebarItem id="testing" icon={<ClipboardList size={22}/>} label="Діагностика" />
          <SidebarItem id="library" icon={<BookOpen size={22}/>} label="Медіатека" />
          <SidebarItem id="advice" icon={<Lightbulb size={22}/>} label="Поради" />
          <SidebarItem id="diary" icon={<PenLine size={22}/>} label="Щоденник" />
          <SidebarItem id="stats" icon={<BarChart3 size={22}/>} label="Прогрес" />
        </nav>
        <div style={{padding: '24px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px'}}>
           <div style={{backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(30, 41, 59, 0.5)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b0f1a', fontWeight: '900', fontSize: '12px'}}>ОА</div>
              <div style={{display: 'none'}}>
                <p style={{fontSize: '12px', fontWeight: '900', color: 'white'}}>О. Антонов</p>
                <p style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em'}}>Resilience: Pro</p>
              </div>
           </div>
           <button onClick={() => setIsLoggedIn(false)} style={{width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '20px', color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', transition: 'all 0.3s ease'}}>
             <LogOut size={18} /> <span style={{display: 'none'}}>Вийти</span>
           </button>
        </div>
      </aside>

      <main className="shelter-main">
        <header className="shelter-header">
          <div className="shelter-search">
            <Search size={18} style={{ color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Пошук..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="shelter-search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="shelter-header-actions">
            <button onClick={() => setShowSOS(true)} className="shelter-sos-button">
              SOS
            </button>
            <div className="shelter-bell">
              <Bell size={22} style={{ color: '#94a3b8' }} />
              <div className="shelter-bell-dot"></div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {currentView === 'home' && <HomeView />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'testing' && <TestingView />}
          {currentView === 'stats' && <StatsView />}
          {currentView === 'practice' && <PracticeView />}
          {currentView === 'advice' && <AdviceView />}
          {currentView === 'diary' && <DiaryView />}
        </div>
      </main>

      {showSOS && (
        <div style={{position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', animation: 'fadeIn 0.3s ease-out'}}>
          <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(32px'}} onClick={() => setShowSOS(false)}></div>
          <div style={{position: 'relative', backgroundColor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '64px', borderRadius: '64px', width: '100%', maxWidth: '672px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
             <div style={{width: '96px', height: '96px', backgroundColor: '#dc2626', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)', animation: 'pulse 2s infinite'}}>
               <AlertCircle size={48} style={{color: 'white'}} />
             </div>
             <h2 style={{fontSize: '48px', fontWeight: '900', color: 'white', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '-0.05em', lineHeight: '1'}}>Дихайте.</h2>
             <p style={{color: '#94a3b8', marginBottom: '40px', fontSize: '20px', fontStyle: 'italic'}}>Ви у безпеці. Давайте разом відновимо спокій.</p>
             <button onClick={() => {setShowSOS(false); navigateTo('practice');}} style={{width: '100%', backgroundColor: 'white', color: 'black', padding: '24px', borderRadius: '28px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', border: 'none', transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
               Почати практику
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterApp;
