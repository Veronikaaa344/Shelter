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
      className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all duration-300 ${
        currentView === id 
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
        : 'hover:bg-slate-800 text-slate-400'
      }`}
    >
      {icon}
      <span className="font-bold text-sm hidden lg:block tracking-wide">{label}</span>
    </div>
  );

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
    const cards = [
      { title: "Дихання", cat: "Практика", icon: <Wind/>, color: "from-emerald-600 to-teal-500", onClick: () => navigateTo('practice') },
      { title: "Діагностика", cat: "Тестування", icon: <Brain/>, color: "from-blue-600 to-indigo-500", onClick: () => navigateTo('testing') },
      { title: "Поради", cat: "Освіта", icon: <Lightbulb/>, color: "from-orange-600 to-amber-500", onClick: () => navigateTo('advice') },
      { title: "Щоденник", cat: "Рефлексія", icon: <PenLine/>, color: "from-purple-600 to-pink-500", onClick: () => navigateTo('diary') },
    ].filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
    <div className="flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden">
      
      <aside className="w-20 lg:w-72 border-r border-slate-800 flex flex-col bg-[#0b0f1a] z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0b0f1a] shadow-xl"><ShieldCheck size={28} /></div>
          <span className="hidden lg:block text-2xl font-black text-white italic uppercase tracking-tighter italic">Shelter</span>
        </div>
        <nav className="flex-1 px-4 space-y-3 mt-6">
          <SidebarItem id="home" icon={<Layout size={22}/>} label="Дашборд" />
          <SidebarItem id="testing" icon={<ClipboardList size={22}/>} label="Діагностика" />
          <SidebarItem id="library" icon={<BookOpen size={22}/>} label="Медіатека" />
          <SidebarItem id="advice" icon={<Lightbulb size={22}/>} label="Поради" />
          <SidebarItem id="diary" icon={<PenLine size={22}/>} label="Щоденник" />
          <SidebarItem id="stats" icon={<BarChart3 size={22}/>} label="Прогрес" />
        </nav>
        <div className="p-6 border-t border-slate-900 space-y-4">
           <div className="bg-slate-900/50 p-4 rounded-[24px] flex items-center gap-3 border border-slate-800/50 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b0f1a] font-black text-xs">ОА</div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-white font-bold">О. Антонов</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resilience: Pro</p>
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

export default ShelterApp;
