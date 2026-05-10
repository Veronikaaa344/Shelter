import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FileText,
  Headphones,
  Layout,
  Lightbulb,
  LogOut,
  PenLine,
  Search,
  ShieldCheck,
  Video,
  X
} from 'lucide-react';
import BreathingExercise from './BreathingExercise/BreathingExercise';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index-tailwind.css';
import { api } from '../api/api';
import UpdatedFindDifferencesPage from '../pages/trainerSimulator/findDifferencesPage/UpdatedFindDifferencesPage';
import SimulatorPage from '../pages/trainerSimulator/simulatorPage/SimulatorPage';
import '../pages/trainerSimulator/simulatorPage/simulatorPage.css';
import UpdatedSortingPage from '../pages/trainerSimulator/sortingPage/UpdatedSortingPage';
import MainChat from './MainChat/MainChat';

// Views
import HomeView from './views/HomeView/HomeView';
import LibraryView from './views/LibraryView/LibraryView';
import TestingView from './views/TestingView/TestingView';
import AdviceView from './views/AdviceView/AdviceView';
import DiaryView from './views/DiaryView/DiaryView';
import StatsView from './views/StatsView/StatsView';
import PracticeView from './views/PracticeView/PracticeView';

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
          className={`flex items-center gap-4 p-4 robust-rounded-20 cursor-pointer transition-all duration-300 ${isActive
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
          className={`flex items-center gap-4 p-4 robust-rounded-20 transition-all duration-300 w-full ${isDashboard
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
  const isGuest = localStorage.getItem("dr_token") === "guest_mode";
  const [currentView, setCurrentView] = useState('home');
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [isFindDifferencesMode, setIsFindDifferencesMode] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('Всі');


  const [testStep, setTestStep] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Simulator states
  const [simulatorScenarioId, setSimulatorScenarioId] = useState(null);
  const [simulatorScenariosList, setSimulatorScenariosList] = useState([]);

  // Данные из API
  const [mediaLibraryData, setMediaLibraryData] = useState([]);
  const [resilience, setResilience] = useState(50);
  const [userStats, setUserStats] = useState(null);
  
  // Перевірка на "null" або "undefined" як рядки
  const rawUserId = localStorage.getItem("userId");
  const initialUserId = (rawUserId === "null" || rawUserId === "undefined") ? null : rawUserId;
  const [userId, setUserId] = useState(initialUserId);

  const initialUsername = localStorage.getItem("username") || "Гість";
  const [username, setUsername] = useState(initialUsername);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem("userId"));
      setUsername(localStorage.getItem("username") || "Гість");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Завантаження медіатеки та іншого...
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
            icon: m.type === 'text' ? <FileText size={20} /> : m.type === 'video' ? <Video size={20} /> : <Headphones size={20} />,
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
    console.log('👤 Спроба завантажити профіль для ID:', userId, 'Гість:', api.isGuest());
    if (userId || (api.isGuest && api.isGuest())) {
      api.getProfile()
        .then((profile) => {
          console.log('✅ Профіль отримано:', profile);
          if (profile && profile.username) {
            setUsername(profile.username);
          }
        })
        .catch((err) => { 
          console.error('❌ Помилка завантаження профілю:', err);
        });
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
      api.updateStreak(userId).catch(() => { });
    }

    // Загрузка сценариев для кубиков
    api.getScenarios()
      .then((data) => {
        if (Array.isArray(data)) {
          setSimulatorScenariosList(data);
        }
      })
      .catch((err) => console.error('Error loading scenarios:', err));
  }, [userId]);





  const navigateTo = (id) => {
    if (id === 'chat') {
      setIsChatMode(true);
      setIsSimulatorMode(false);
    } else {
      setCurrentView(id);
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

  // Редірект на /auth якщо немає токену
  const token = localStorage.getItem("dr_token");
  if (!token) {
    navigate('/auth', { replace: true });
    return null;
  }

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
            <FlipSidebarItem id="home" icon={<Layout size={22} />} label="Дашборд" isDashboard={true} index={0} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="testing" icon={<ClipboardList size={22} />} label="Діагностика" index={1} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="library" icon={<BookOpen size={22} />} label="Медіатека" index={2} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="advice" icon={<Lightbulb size={22} />} label="Поради" index={3} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="diary" icon={<PenLine size={22} />} label="Щоденник" index={4} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
            <FlipSidebarItem id="stats" icon={<BarChart3 size={22} />} label="Прогрес" index={5} isSpecialMode={isSpecialMode} currentView={currentView} navigateTo={navigateTo} handleChatBack={handleChatBack} />
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
          {isGuest ? (
            <div className="hidden lg:flex flex-col gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-[16px] bg-emerald-500 text-[#0b0f1a] font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all"
              >
                Зареєструватись
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-[16px] text-slate-500 border border-slate-800 font-bold text-xs uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all"
              >
                Увійти
              </button>
            </div>
          ) : (
            <button onClick={() => { api.logout(); navigate('/auth'); }} className="w-full flex items-center gap-4 p-4 rounded-[20px] text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs uppercase tracking-widest text-left">
              <LogOut size={18} /> <span className="hidden lg:block">Вийти</span>
            </button>
          )}
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
              <button onClick={() => setIsFindDifferencesMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
              <UpdatedFindDifferencesPage
                isEmbedded={true}
                embeddedId={simulatorScenarioId}
                onBack={() => setIsFindDifferencesMode(false)}
              />
            </div>
          ) : isSortingMode ? (
            <div className="relative h-full w-full bg-[#0b0f1a]">
              <button onClick={() => setIsSortingMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
              <UpdatedSortingPage
                isEmbedded={true}
                embeddedId={simulatorScenarioId}
                onBack={() => setIsSortingMode(false)}
              />
            </div>
          ) : (
            <>
              {currentView === 'home' && <HomeView
                searchTerm={searchTerm}
                navigateTo={navigateTo}
                simulatorScenariosList={simulatorScenariosList}
                setSimulatorScenarioId={setSimulatorScenarioId}
                setIsFindDifferencesMode={setIsFindDifferencesMode}
                setIsSortingMode={setIsSortingMode}
                setIsSimulatorMode={setIsSimulatorMode}
              />}
              {currentView === 'library' && <LibraryView
                mediaLibraryData={mediaLibraryData}
                libraryFilter={libraryFilter}
                setLibraryFilter={setLibraryFilter}
                searchTerm={searchTerm}
                userId={userId}
                userStats={userStats}
                setUserStats={setUserStats}
              />}
              {currentView === 'testing' && <TestingView
                testStep={testStep}
                setTestStep={setTestStep}
                testAnswers={testAnswers}
                setTestAnswers={setTestAnswers}
                isTestFinished={isTestFinished}
                setIsTestFinished={setIsTestFinished}
                userId={userId}
                setResilience={setResilience}
                userStats={userStats}
                setUserStats={setUserStats}
                navigateTo={navigateTo}
              />}
              {currentView === 'stats' && <StatsView />}
              {currentView === 'practice' && <PracticeView
                userId={userId}
                navigateTo={navigateTo}
              />}
              {currentView === 'advice' && <AdviceView />}
              {currentView === 'diary' && <DiaryView userId={userId} />}
            </>
          )}
        </div>
      </main>

      {showSOS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setShowSOS(false)}></div>
          <div className="relative bg-slate-900 border border-white/10 p-16 robust-rounded-64 w-full max-w-2xl text-center shadow-2xl">
            <div className="w-24 h-24 bg-rose-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse"><AlertCircle size={48} className="text-white" /></div>
            <h2 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter leading-none">Дихайте.</h2>
            <p className="text-slate-400 mb-10 text-xl italic">Ви у безпеці. Давайте разом відновимо спокій.</p>
            <button onClick={() => { setShowSOS(false); navigateTo('practice'); }} className="w-full bg-white text-black py-6 rounded-[28px] font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-widest">Почати практику</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterAppComplete;
