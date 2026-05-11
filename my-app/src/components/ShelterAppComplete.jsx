import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, BarChart3, Bell, BookOpen, ChevronLeft, ClipboardList,
  FileText, Headphones, Layout, Lightbulb, LogOut, PenLine, Search,
  ShieldCheck, TrendingUp, Trophy, Video, Wind, X
} from 'lucide-react';

import '../index-tailwind.css';
import '../pages/trainerSimulator/simulatorPage/simulatorPage.css';
import { api } from '../api/api';
import { calculateResilienceChange, clampResilience } from '../utils/resilienceLogic';

// Core Components
import MainSidebar from './MainSidebar/MainSidebar';
import MainHeader from './MainHeader/MainHeader';
import HoldSOSButton from './HoldSOSButton/HoldSOSButton';
import HomeView from './views/HomeView/HomeView';
import MainChat from './MainChat/MainChat';
import CharacterCompanion from './characterCompanion/CharacterCompanion';

// Heavy View Components (Lazy)
const LibraryView = React.lazy(() => import('./views/LibraryView/LibraryView'));
const QuestsView = React.lazy(() => import('./views/QuestsView/QuestsView'));
const TestingView = React.lazy(() => import('./views/TestingView/TestingView'));
const StatsView = React.lazy(() => import('./views/StatsView/StatsView'));
const PracticeView = React.lazy(() => import('./views/PracticeView/PracticeView'));
const AdviceView = React.lazy(() => import('./views/AdviceView/AdviceView'));
const DiaryView = React.lazy(() => import('./views/DiaryView/DiaryView'));

// Simulator Components (Lazy)
const SimulatorPage = React.lazy(() => import('../pages/trainerSimulator/simulatorPage/SimulatorPage'));
const UpdatedFindDifferencesPage = React.lazy(() => import('../pages/trainerSimulator/findDifferencesPage/UpdatedFindDifferencesPage'));
const UpdatedSortingPage = React.lazy(() => import('../pages/trainerSimulator/sortingPage/UpdatedSortingPage'));

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
  const [resilience, setResilience] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [currentMood, setCurrentMood] = useState(null);
  
  // Перевірка на "null" або "undefined" як рядки
  const rawUserId = localStorage.getItem("userId");
  const initialUserId = (rawUserId === "null" || rawUserId === "undefined") ? null : rawUserId;
  const [userId, setUserId] = useState(initialUserId);

  const initialUsername = localStorage.getItem("username") || "Гість";
  const [username, setUsername] = useState(initialUsername);
  const [showStabilizationHint, setShowStabilizationHint] = useState(false);

  useEffect(() => {
    if (resilience > 0 && resilience < 40) {
      setShowStabilizationHint(true);
    } else {
      setShowStabilizationHint(false);
    }
  }, [resilience]);
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
          const adviceTitles = [
            "Гігієна сну в стресі",
            "Емоційний інтелект",
            "Медітація для новачків",
            "Як працює кортизол"
          ];

          const mappedData = data
            .filter(m => !adviceTitles.includes(m.title)) // Прибираємо поради з медіатеки
            .map(m => ({
              id: m._id,
              title: m.title,
              type: m.type === 'text' ? 'Стаття' : m.type === 'video' ? 'Відео' : 'Аудіо',
              cat: m.category || 'Загальне',
              duration: m.duration || '10 хв',
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
    refreshStats();

    // Загрузка сценариев для кубиков
    api.getScenarios()
      .then((data) => {
        if (Array.isArray(data)) {
          setSimulatorScenariosList(data);
        }
      })
      .catch((err) => console.error('Error loading scenarios:', err));

    // Загрузка профиля для реальных данных
    api.getProfile()
      .then((profile) => {
        if (profile) {
          setCompletedScenariosCount(profile.completedScenarios?.length || 0);
          setCompletedMaterialsCount(profile.completedMaterials?.length || 0);
          if (profile.username) setUsername(profile.username);
        }
      })
      .catch(() => {});
  }, [userId]);

  const [completedScenariosCount, setCompletedScenariosCount] = useState(0);
  const [completedMaterialsCount, setCompletedMaterialsCount] = useState(0);

  const refreshStats = () => {
    if (userId) {
      api.getUserStats(userId)
        .then((stats) => {
          console.log('📈 Статистика оновлена:', stats);
          setUserStats(stats);
          if (stats?.resilience?.current !== undefined) {
            setResilience(stats.resilience.current);
          }
          if (stats?.streak !== undefined) {
            setStreak(stats.streak);
          }
        })
        .catch((err) => console.error('Error loading user stats:', err));

      // Обновляем streak и получаем актуальное значение
      api.updateStreak(userId)
        .then((data) => {
          if (data && data.streak !== undefined) {
            setStreak(data.streak);
          }
        })
        .catch(() => { });
    }
  };

  useEffect(() => {
    if (userId) {
      refreshStats();
    }
  }, [userId, currentView]); // Refresh when view changes or user changes





  const navigateTo = (id, materialId = null) => {
    if (materialId) {
      navigate(`/material/${materialId}`);
      return;
    }
    
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

  const applyResilienceChange = (type, metadata = {}) => {
    const change = calculateResilienceChange(type, metadata);
    const newResilience = clampResilience(resilience + change);
    
    if (newResilience !== resilience) {
      setResilience(newResilience);
      if (userId && !isGuest) {
        api.updateResilience(userId, change, type, metadata.name || type);
      }
    }
    return change;
  };

  const handleMoodSelect = (moodId) => {
    setCurrentMood(moodId);
    applyResilienceChange('mood_select', { mood: moodId });
    
    // Візуальний зворотний зв'язок
    const message = moodId === 'anxiety' || moodId === 'stress' 
      ? "Ваш стан зафіксовано. Це вимагає додаткових зусиль для відновлення." 
      : "Чудово! Ваша стійкість зростає.";
    
    console.log(message);
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
    <div className={`flex h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-hidden`}>
      {/* Digital Isolation Overlay (Simpler for FPS) */}
      {showSOS && <div className="fixed inset-0 z-[100] bg-[#0b0f1a]/80 animate-in fade-in duration-300"></div>}

      <MainSidebar 
        username={username}
        resilience={resilience}
        currentView={currentView}
        isGuest={isGuest}
        isSpecialMode={isSpecialMode}
        navigateTo={navigateTo}
        handleChatBack={handleChatBack}
        showSOS={showSOS}
        logout={() => { api.logout(); navigate('/auth'); }}
      />
      <main className={`flex-1 flex flex-col overflow-y-auto bg-[#0b0f1a] transition-opacity duration-500 ${showSOS ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <MainHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowSOS={setShowSOS}
        />

        <div className="flex-1">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
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
                applyResilienceChange={applyResilienceChange}
              />
            ) : isFindDifferencesMode ? (
              <div className="relative h-full w-full bg-[#0b0f1a]">
                <button onClick={() => setIsFindDifferencesMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
                <UpdatedFindDifferencesPage
                  isEmbedded={true}
                  embeddedId={simulatorScenarioId}
                  onBack={() => setIsFindDifferencesMode(false)}
                  applyResilienceChange={applyResilienceChange}
                />
              </div>
            ) : isSortingMode ? (
              <div className="relative h-full w-full bg-[#0b0f1a]">
                <button onClick={() => setIsSortingMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
                <UpdatedSortingPage
                  isEmbedded={true}
                  embeddedId={simulatorScenarioId}
                  onBack={() => setIsSortingMode(false)}
                  applyResilienceChange={applyResilienceChange}
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
                  username={username}
                  resilience={resilience}
                  setResilience={setResilience}
                  streak={streak}
                  setStreak={setStreak}
                  currentMood={currentMood}
                  setCurrentMood={setCurrentMood}
                  mediaLibraryData={mediaLibraryData}
                  showStabilizationHint={showStabilizationHint}
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
                {currentView === 'quests' && <QuestsView
                  navigateTo={navigateTo}
                  resilience={resilience}
                  setSimulatorScenarioId={setSimulatorScenarioId}
                  setIsSimulatorMode={setIsSimulatorMode}
                  setIsFindDifferencesMode={setIsFindDifferencesMode}
                  setIsSortingMode={setIsSortingMode}
                  simulatorScenariosList={simulatorScenariosList}
                />}
                {currentView === 'testing' && (
                  <TestingView 
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
                    onFinish={() => refreshStats()}
                  />
                )}
                {currentView === 'stats' && <StatsView
                  userStats={userStats}
                  resilience={resilience}
                />}{currentView === 'practice' && (
                  <PracticeView 
                    userId={userId} 
                    navigateTo={navigateTo} 
                    onFinish={() => refreshStats()}
                  />
                )}
                {currentView === 'advice' && <AdviceView />}
                {currentView === 'diary' && <DiaryView userId={userId} />}
              </>
            )}
          </React.Suspense>
        </div>
        <footer className="h-16 px-8 flex items-center justify-between border-t border-slate-900/50 text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-[#0b0f1a]">
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition-colors" onClick={() => setShowSOS(true)}>SOS Допомога</span>
            <span className="hidden md:inline opacity-30">|</span>
            <span className="hidden md:inline">Система Shelter не є заміною професійної терапії</span>
          </div>
          <div>© 2026 Shelter App</div>
        </footer>
      </main>

      {/* Character Companion */}
      <CharacterCompanion
        resilience={resilience}
        auraColor={resilience > 70 ? 'emerald' : resilience > 40 ? 'amber' : 'rose'}
        context={currentView}
      />

      {showSOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0" onClick={() => setShowSOS(false)}></div>
          <div className="relative bg-slate-900/90 border border-white/10 p-16 rounded-[64px] w-full max-w-2xl text-center shadow-[0_0_100px_rgba(225,29,72,0.3)] backdrop-blur-3xl">
            <div className="w-24 h-24 bg-rose-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse"><AlertCircle size={48} className="text-white" /></div>
            <h2 className="text-6xl font-black text-white italic uppercase mb-6 tracking-tighter leading-none">Дихайте.</h2>
            <p className="text-slate-400 mb-12 text-xl italic font-medium">Ви у безпеці. Давайте разом відновимо спокій через практику «Квадратного дихання».</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setShowSOS(false); navigateTo('practice'); }} 
                className="w-full bg-white text-black py-8 rounded-[32px] font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl"
              >
                <Wind size={28} />
                Почати дихання (4-4-4)
              </button>
              <button 
                onClick={() => window.open('tel:103')}
                className="w-full bg-slate-800/80 text-white py-6 rounded-[28px] font-black text-xs hover:bg-slate-700 transition-all uppercase tracking-widest border border-slate-700"
              >
                Зв'язатися з фахівцем
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterAppComplete;
