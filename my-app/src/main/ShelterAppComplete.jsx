import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle, BarChart3, Bell, BookOpen, ChevronLeft, ClipboardList,
  FileText, Headphones, Layout, Lightbulb, LogOut, PenLine, Search,
  ShieldCheck, TrendingUp, Trophy, Video, Wind, X
} from 'lucide-react';

import '../infrastructure/assets/styles/index-tailwind.css';
import '../pages/Simulator/simulatorPage.css';
import { api } from '../infrastructure/api/api';
import { calculateResilienceChange, clampResilience } from '../infrastructure/utils/resilienceLogic';

// Core Components
import MainSidebar from '../components/MainSidebar/MainSidebar';
import MainHeader from '../components/MainHeader/MainHeader';
import HoldSOSButton from '../components/HoldSOSButton/HoldSOSButton';
import HomeView from '../components/views/HomeView/HomeView';
import MainChat from '../components/MainChat/MainChat';
import CharacterCompanion from '../components/characterCompanion/CharacterCompanion';

// Heavy View Components (Lazy)
const LibraryView = React.lazy(() => import('../components/views/LibraryView/LibraryView'));
const QuestsView = React.lazy(() => import('../components/views/QuestsView/QuestsView'));
const TestingView = React.lazy(() => import('../components/views/TestingView/TestingView'));
const StatsView = React.lazy(() => import('../components/views/StatsView/StatsView'));
const PracticeView = React.lazy(() => import('../components/views/PracticeView/PracticeView'));
const AdviceView = React.lazy(() => import('../components/views/AdviceView/AdviceView'));
const DiaryView = React.lazy(() => import('../components/views/DiaryView/DiaryView'));

// Simulator Components (Lazy)
const SimulatorPage = React.lazy(() => import('../pages/Simulator/SimulatorPage'));
const UpdatedFindDifferencesPage = React.lazy(() => import('../pages/Simulator/UpdatedFindDifferencesPage'));
const UpdatedSortingPage = React.lazy(() => import('../pages/Simulator/UpdatedSortingPage'));

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
  const location = useLocation();
  const isGuest = localStorage.getItem("dr_token") === "guest_mode";
  const [currentView, setCurrentView] = useState('home');
  const [visitedViews, setVisitedViews] = useState(['home']);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [isFindDifferencesMode, setIsFindDifferencesMode] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [showSOS, setShowSOS] = useState(location.state?.showSOS || false);
  const [showSOSPhones, setShowSOSPhones] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('Всі');


  const [testStep, setTestStep] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Simulator states
  const [simulatorScenarioId, setSimulatorScenarioId] = useState(null);
  const [simulatorScenariosList, setSimulatorScenariosList] = useState([]);

  // Дані з API
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
    // Показуємо підказку лише якщо рівень стійкості низький ТА обрано негативний настрій
    const isNegativeMood = ['anxiety', 'stress', 'exhausted', 'anger'].includes(currentMood);
    if (resilience > 0 && resilience < 35 && isNegativeMood) {
      setShowStabilizationHint(true);
    } else {
      setShowStabilizationHint(false);
    }
  }, [resilience, currentMood]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Тестові клавіші: 1 - зменшити, 2 - збільшити
      if (e.key === '1') {
        setResilience(prev => Math.max(0, prev - 10));
        console.log("📉 Тест: Стійкість зменшена");
      }
      if (e.key === '2') {
        setResilience(prev => Math.min(100, prev + 10));
        console.log("📈 Тест: Стійкість збільшена");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem("userId"));
      setUsername(localStorage.getItem("username") || "Гість");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (location.state?.showSOS) {
      // Clear the state so SOS doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Завантаження медіатеки та іншого...
    api.getMaterials()
      .then((data) => {
        console.log('📊 Завантажені матеріали з API:', data);
        console.log('📏 Кількість матеріалів:', data?.length || 0);

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

          console.log('🔄 Перетворені матеріали для відображення:', mappedData);
          console.log('📋 Список матеріалів:');
          mappedData.forEach((material, index) => {
            console.log(`${index + 1}. ${material.title} (${material.type}) - ${material.cat}`);
          });

          setMediaLibraryData(mappedData);
        } else {
          console.log('❌ Дані не є масивом:', data);
        }
      })
      .catch((err) => console.error('Error loading materials:', err));

    // Завантаження профілю
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

    // Завантаження статистики
    refreshStats();

    // Завантаження сценаріїв для кубиків
    api.getScenarios()
      .then((data) => {
        if (Array.isArray(data)) {
          setSimulatorScenariosList(data);
        }
      })
      .catch((err) => console.error('Error loading scenarios:', err));

    // Завантаження профілю для реальних даних
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
    const isGuest = api.isGuest();
    const finalUserId = userId || localStorage.getItem("userId");
    
    if (finalUserId || isGuest) {
      api.getUserStats(finalUserId)
        .then((stats) => {
          console.log('📈 Статистика оновлена:', stats);
          setUserStats(stats);
          if (stats?.resilience?.current !== undefined) {
            setResilience(stats.resilience.current);
          } else if (stats?.allTime?.resilience !== undefined) {
            setResilience(stats.allTime.resilience);
          } else if (typeof stats?.resilience === 'number') {
            setResilience(stats.resilience);
          }
          if (stats?.streak !== undefined) {
            setStreak(stats.streak);
          }
        })
        .catch((err) => console.error('Error loading user stats:', err));

      if (finalUserId && !isGuest) {
        api.updateStreak(finalUserId)
          .then((data) => {
            if (data && data.streak !== undefined) {
              setStreak(data.streak);
            }
          })
          .catch(() => { });
      }
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
      if (!visitedViews.includes(id)) {
        setVisitedViews(prev => [...prev, id]);
      }
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
      if (userId) {
        api.updateResilience(userId, change, type, metadata.name || type)
          .then(() => refreshStats());
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
      <main className={`flex-1 flex flex-col overflow-y-auto bg-[#0b0f1a] transition-opacity duration-500 will-change-[opacity] ${showSOS ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <MainHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowSOS={setShowSOS}
        />

        <div className="flex-1 relative">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {/* Special Modes - Mount/Unmount as before to free memory, as they are heavy */}
            {isChatMode && (
              <div className="absolute inset-0 z-10 bg-[#0b0f1a]">
                <MainChat
                  onBack={handleChatBack}
                  username={username}
                  resilience={resilience}
                />
              </div>
            )}
            {isSimulatorMode && simulatorScenarioId && (
              <div className="absolute inset-0 z-10 bg-[#0b0f1a]">
                <SimulatorPage
                  isEmbedded={true}
                  embeddedId={simulatorScenarioId}
                  onBack={() => { setIsSimulatorMode(false); refreshStats(); }}
                  applyResilienceChange={applyResilienceChange}
                />
              </div>
            )}
            {isFindDifferencesMode && (
              <div className="absolute inset-0 z-10 bg-[#0b0f1a]">
                <button onClick={() => setIsFindDifferencesMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
                <UpdatedFindDifferencesPage
                  isEmbedded={true}
                  embeddedId={simulatorScenarioId}
                  onBack={() => { setIsFindDifferencesMode(false); refreshStats(); }}
                  applyResilienceChange={applyResilienceChange}
                />
              </div>
            )}
            {isSortingMode && (
              <div className="absolute inset-0 z-10 bg-[#0b0f1a]">
                <button onClick={() => setIsSortingMode(false)} className="absolute top-6 left-6 z-50 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 text-white shadow-xl backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
                <UpdatedSortingPage
                  isEmbedded={true}
                  embeddedId={simulatorScenarioId}
                  onBack={() => { setIsSortingMode(false); refreshStats(); }}
                  applyResilienceChange={applyResilienceChange}
                />
              </div>
            )}

            {/* Standard Views - Kept in memory once loaded to prevent re-renders */}
            <div className={`relative h-full w-full ${(isChatMode || isSimulatorMode || isFindDifferencesMode || isSortingMode) ? 'hidden' : 'block'}`}>
                {visitedViews.includes('home') && (
                  <div className={`h-full w-full ${currentView === 'home' ? 'block' : 'hidden'}`}>
                    <HomeView 
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
                      setCurrentMood={handleMoodSelect}
                      mediaLibraryData={mediaLibraryData}
                      showStabilizationHint={showStabilizationHint}
                    />
                  </div>
                )}
                {visitedViews.includes('library') && (
                  <div className={`h-full w-full ${currentView === 'library' ? 'block' : 'hidden'}`}>
                    <LibraryView
                      mediaLibraryData={mediaLibraryData}
                      libraryFilter={libraryFilter}
                      setLibraryFilter={setLibraryFilter}
                      searchTerm={searchTerm}
                      userId={userId}
                      userStats={userStats}
                      setUserStats={setUserStats}
                    />
                  </div>
                )}
                {visitedViews.includes('quests') && (
                  <div className={`h-full w-full ${currentView === 'quests' ? 'block' : 'hidden'}`}>
                    <QuestsView
                      navigateTo={navigateTo}
                      resilience={resilience}
                      setSimulatorScenarioId={setSimulatorScenarioId}
                      setIsSimulatorMode={setIsSimulatorMode}
                      setIsFindDifferencesMode={setIsFindDifferencesMode}
                      setIsSortingMode={setIsSortingMode}
                      simulatorScenariosList={simulatorScenariosList}
                    />
                  </div>
                )}
                {visitedViews.includes('testing') && (
                  <div className={`h-full w-full ${currentView === 'testing' ? 'block' : 'hidden'}`}>
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
                  </div>
                )}
                {visitedViews.includes('stats') && (
                  <div className={`h-full w-full ${currentView === 'stats' ? 'block' : 'hidden'}`}>
                    <StatsView
                      userStats={userStats}
                      resilience={resilience}
                      completedCount={completedScenariosCount + completedMaterialsCount}
                    />
                  </div>
                )}
                {visitedViews.includes('practice') && (
                  <div className={`h-full w-full ${currentView === 'practice' ? 'block' : 'hidden'}`}>
                    <PracticeView 
                      userId={userId} 
                      navigateTo={navigateTo} 
                      onFinish={() => refreshStats()}
                    />
                  </div>
                )}
                {visitedViews.includes('advice') && (
                  <div className={`h-full w-full ${currentView === 'advice' ? 'block' : 'hidden'}`}>
                    <AdviceView />
                  </div>
                )}
                {visitedViews.includes('diary') && (
                  <div className={`h-full w-full ${currentView === 'diary' ? 'block' : 'hidden'}`}>
                    <DiaryView userId={userId} />
                  </div>
                )}
            </div>
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

      {/* Character Companion - Adaptive Support Module (Temporarily disabled)
      <CharacterCompanion
        resilience={resilience}
        auraColor={resilience < 35 ? 'rose' : resilience < 60 ? 'amber' : 'emerald'}
        context={currentView}
        forceSpeakMode={showStabilizationHint ? 'main-hints' : null}
        onAction={(action) => {
          if (action === 'breathing') navigateTo('practice');
          if (action === 'sorting') { setSimulatorScenarioId('chaos-unloading'); setIsSortingMode(true); }
          if (action === 'sos') setShowSOS(true);
        }}
      />
      */}

      {showSOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowSOS(false); setTimeout(() => setShowSOSPhones(false), 300); }}></div>
          <div className="relative bg-[#0f1423] p-8 sm:p-10 rounded-[36px] w-full max-w-lg shadow-[0_0_80px_rgba(225,29,72,0.15)] text-left animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-rose-500/15 rounded-[20px] flex items-center justify-center">
                <AlertCircle size={32} className="text-rose-500" />
              </div>
              <button onClick={() => { setShowSOS(false); setTimeout(() => setShowSOSPhones(false), 300); }} className="text-slate-500 hover:text-white transition-colors p-2 -mr-2 -mt-2">
                <X size={28} />
              </button>
            </div>

            {!showSOSPhones ? (
                <>
                    <h2 className="text-3xl sm:text-[32px] font-black text-white uppercase mb-4 tracking-tight">Екстрена допомога</h2>
                    <p className="text-slate-400 mb-10 text-[17px] leading-relaxed font-medium">
                        Зараз ми проведемо коротку практику «Квадратне дихання». Це допоможе вашій нервовій системі повернутися до стану спокою.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => { setShowSOS(false); setTimeout(() => setShowSOSPhones(false), 300); navigateTo('practice'); }} 
                        className="w-full bg-white text-black py-5 rounded-[20px] font-bold text-[17px] hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                        <Wind size={22} />
                        Почати дихання (4-4-4)
                    </button>
                    <button 
                        onClick={() => setShowSOSPhones(true)}
                        className="w-full bg-[#1b2336] text-white py-5 rounded-[20px] font-bold text-[17px] hover:bg-[#252f48] transition-all"
                    >
                        Зв'язатися з фахівцем
                    </button>
                    </div>
                </>
            ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4 -mt-4">
                        <button onClick={() => setShowSOSPhones(false)} className="text-slate-500 hover:text-white transition-colors -ml-2 p-2">
                            <ChevronLeft size={28} />
                        </button>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Гарячі лінії</h2>
                    </div>
                    <p className="text-slate-400 mb-8 text-[15px] leading-relaxed font-medium">
                        Ці служби працюють безкоштовно та анонімно. Оберіть потрібну лінію:
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <a href="tel:7333" className="w-full bg-[#1b2336] border border-slate-800 text-white p-5 rounded-[20px] hover:bg-[#252f48] transition-all flex justify-between items-center group">
                            <div>
                                <p className="font-bold text-[17px] mb-1">Lifeline Ukraine</p>
                                <p className="text-slate-400 text-sm">Психологічна підтримка</p>
                            </div>
                            <span className="bg-rose-500/10 text-rose-500 font-black px-4 py-2 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">7333</span>
                        </a>
                        <a href="tel:1558" className="w-full bg-[#1b2336] border border-slate-800 text-white p-5 rounded-[20px] hover:bg-[#252f48] transition-all flex justify-between items-center group">
                            <div>
                                <p className="font-bold text-[17px] mb-1">Лінія підтримки</p>
                                <p className="text-slate-400 text-sm">Ветеран Хаб</p>
                            </div>
                            <span className="bg-rose-500/10 text-rose-500 font-black px-4 py-2 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">1558</span>
                        </a>
                        <a href="tel:0800501701" className="w-full bg-[#1b2336] border border-slate-800 text-white p-5 rounded-[20px] hover:bg-[#252f48] transition-all flex justify-between items-center group">
                            <div>
                                <p className="font-bold text-[17px] mb-1">Телефон довіри</p>
                                <p className="text-slate-400 text-sm">Всеукраїнська лінія</p>
                            </div>
                            <span className="bg-rose-500/10 text-rose-500 font-black px-4 py-2 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">0 800 501 701</span>
                        </a>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterAppComplete;
