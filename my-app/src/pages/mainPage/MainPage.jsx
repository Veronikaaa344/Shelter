import { useState, useEffect, useRef } from "react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api/api";
import CharacterCompanion from "../../components/characterCompanion/CharacterCompanion";
import { getDiagnosticConfig } from "../../diagnosticLogic";
import { LifeBuoy, Phone, Target, Shield, Sparkles, Heart, TrendingUp, Video, BookOpen, Headphones, ArrowRight, Unlock } from 'lucide-react';
import "./mainPage.css";

const typeIcons = {
  video: Video,
  text: BookOpen,
  audio: Headphones
};

const getIllustration = (type, index) => {
  const illustrations = {
    video: ['🎬', '📺', '🎥'],
    text: ['📖', '📚', '📄'],
    audio: ['🎧', '🎵', '🎙️']
  };
  const typeIllustrations = illustrations[type] || ['📄'];
  return typeIllustrations[index % typeIllustrations.length];
};

const getCardStyle = (category) => {
  const gradients = {
    anxiety: { background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' },
    stress: { background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' },
    apathy: { background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)' },
    general: { background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }
  };
  return gradients[category] || gradients.general;
};

const getBadgeStyle = (category) => {
  const colors = {
    anxiety: { backgroundColor: '#90CAF9' },
    stress: { backgroundColor: '#A5D6A7' },
    apathy: { backgroundColor: '#F48FB1' },
    general: { backgroundColor: '#CE93D8' }
  };
  return colors[category] || colors.general;
};

const MaterialCard = React.memo(({ material, index, navigate, getCardStyle, getBadgeStyle, getIllustration, typeIcons, BookOpen, ArrowRight }) => {
  const TypeIcon = typeIcons[material.type] || BookOpen;
  const illustration = getIllustration(material.type, index);

  return (
    <div
      className="dr-content-card"
      onClick={() => navigate(`/material/${material._id}`)}
    >
      <div className="dr-card-visual" style={getCardStyle(material.category || 'general')}>
        <div className="dr-card-emoji">{illustration}</div>
        <div className="dr-type-badge" style={getBadgeStyle(material.category || 'general')}>
          <TypeIcon className="dr-icon-small" strokeWidth={2} />
        </div>
      </div>

      <div className="dr-card-info">
        <span className="dr-type-label">{material.type}</span>
        <h3 className="dr-card-headline">{material.title}</h3>
        <p className="dr-card-description">{material.desc}</p>

        <div className="dr-card-action">
          <span>Переглянути</span>
          <ArrowRight className="dr-icon-arrow" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
});

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allMaterials, setAllMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageType, setPageType] = useState("default");
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [resilience, setResilience] = useState(50);
  const [username, setUsername] = useState("Гість");
  const [isGuest, setIsGuest] = useState(false);
  const [showSosHint, setShowSosHint] = useState(false);
  const [showSosDropdown, setShowSosDropdown] = useState(false);
  const sosDropdownRef = useRef(null);

  const chartPoints = [
    { x: 0, y: 60 },
    { x: 20, y: 45 },
    { x: 40, y: 70 },
    { x: 60, y: 55 },
    { x: 80, y: Math.min(80, resilience) },
    { x: 100, y: Math.min(85, resilience + 10) }
  ];

  const pathData = chartPoints.map((point, i) =>
    `${i === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y}`
  ).join(' ');

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("dr_test_results"));
    const answers = location.state?.answers || savedData?.answers;
    const config = getDiagnosticConfig(answers);
    setPageType(config.type);

    if (location.state?.fromSOS) {
      setShowSosHint(true);
    }

    const userId = localStorage.getItem("userId");

    api.getMaterials()
      .then((data) => {
        if (Array.isArray(data)) setAllMaterials(data);
      })
      .catch((err) => console.error(err));

    if (userId || (api.isGuest && api.isGuest())) {
      api.getUserStats(userId)
        .then((stats) => {
          if (stats) {
            setResilience(stats.resilience || 50);
          }
        })
        .catch((err) => console.error("Stats fetch error:", err));

      if (api.isGuest && api.isGuest()) {
        setIsGuest(true);
        api.getProfile()
          .then((profile) => {
            if (profile && profile.username) {
              setUsername(profile.username);
            }
          })
          .catch(() => {});
      } else {
        setIsGuest(false);
        setUsername("Профіль");
      }

      if (userId) {
        api.getUserStats(userId)
          .then((stats) => {
            if (stats?.resilience) setResilience(stats.resilience);
          })
          .catch(() => {});
      }
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sosDropdownRef.current && !sosDropdownRef.current.contains(event.target)) {
        setShowSosDropdown(false);
      }
    };

    const handlePhoneClick = (event) => {
      // Prevent dropdown from closing when clicking the phone button
      event.stopPropagation();
      event.preventDefault();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handlePhoneClick);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handlePhoneClick);
    };
  }, []);

  useEffect(() => {
    let list = [...allMaterials];
    if (isPersonalized) {
      list = list.filter((m) => {
        const category = m.category?.toLowerCase();
        const currentType = pageType?.toLowerCase();
        if (currentType === "default")
          return category === "general" || !category;
        return category === currentType || category === "general";
      });
    }
    if (activeFilter !== "all") {
      list = list.filter((m) => m.type === activeFilter);
    }
    setFilteredMaterials(list);
  }, [allMaterials, isPersonalized, activeFilter, pageType]);

  
  const getStateLabel = () => {
    switch(pageType) {
      case "anxiety": return "Тривога";
      case "apathy": return "Апатія";
      case "stress": return "Стрес";
      default: return "Норма";
    }
  };

  
  const getFilterLabel = (f) => {
    const labels = { all: "Усі", text: "Статті", video: "Відео", audio: "Аудіо" };
    return labels[f] || f;
  };

  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    switch(pageType) {
      case "anxiety":
        recommendations.push(
          {
            title: "Дихальні техніки для заспокоєння",
            description: "Прості та ефективні вправи для зниження рівня тривоги та відновлення спокою",
            emoji: "🫁",
            type: "текст",
            category: "anxiety",
            action: "Почати практику"
          },
          {
            title: "4-7-8 дихання",
            description: "Техніка швидкого заспокоєння, яку можна використовувати будь-де",
            emoji: "🌬️",
            type: "відео",
            category: "anxiety",
            action: "Дивитись"
          }
        );
        break;
        
      case "stress":
        recommendations.push(
          {
            title: "Прогресивна м'язова релаксація",
            description: "Покрокова інструкція для зняття фізичної та ментальної напруги",
            emoji: "💆‍♂️",
            type: "аудіо",
            category: "stress",
            action: "Слухати"
          },
          {
            title: "Менеджмент стресу на роботі",
            description: "Стратегії подолання професійного вигорання та хронічного стресу",
            emoji: "💼",
            type: "текст",
            category: "stress",
            action: "Читати",
            materialId: "69ff5bcf9d4412f106947def"
          }
        );
        break;
        
      case "apathy":
        recommendations.push(
          {
            title: "Активізація мотивації",
            description: "Практичні кроки для повернення енергії та інтересу до життя",
            emoji: "🔋",
            type: "текст",
            category: "apathy",
            action: "Почати"
          },
          {
            title: "Мала поведінка для великих змін",
            description: "Як tiny habits можуть повернути радість та сенс у повсякденне життя",
            emoji: "🌱",
            type: "відео",
            category: "apathy",
            action: "Дивитись"
          }
        );
        break;
        
      default:
        recommendations.push(
          {
            title: "Щоденна практика усвідомленості",
            description: "Основи медитації для підтримки ментального балансу",
            emoji: "🧘",
            type: "аудіо",
            category: "general",
            action: "Слухати"
          },
          {
            title: "Побудова емоційної стійкості",
            description: "Науково обґрунтовані методи підвищення психологічної витривалості",
            emoji: "🛡️",
            type: "текст",
            category: "general",
            action: "Дізнатись"
          }
        );
    }
    
    return recommendations;
  };

  return (
    <div className="dr-new-layout">
      <div className="dr-cloud dr-cloud-1">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M18.5 12A5.5 5.5 0 0 1 18.5 23H5.5A5.5 5.5 0 0 1 5.5 12H7a4 4 0 1 1 7.5-1.5a5.5 5.5 0 0 1 4 1.5z"/>
        </svg>
      </div>
      <div className="dr-cloud dr-cloud-2">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M18.5 12A5.5 5.5 0 0 1 18.5 23H5.5A5.5 5.5 0 0 1 5.5 12H7a4 4 0 1 1 7.5-1.5a5.5 5.5 0 0 1 4 1.5z"/>
        </svg>
      </div>
      <div className="dr-cloud dr-cloud-3">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M18.5 12A5.5 5.5 0 0 1 18.5 23H5.5A5.5 5.5 0 0 1 5.5 12H7a4 4 0 1 1 7.5-1.5a5.5 5.5 0 0 1 4 1.5z"/>
        </svg>
      </div>

      <header className="dr-new-header">
        <div className="dr-header-container">
          <div className="dr-header-inner">
            <div className="dr-new-logo" onClick={() => navigate("/start")}>
              <div className="dr-logo-icon-box">
                <Shield className="dr-logo-icon" strokeWidth={2.5} />
              </div>
              <h1 className="dr-logo-text">Броня для розуму</h1>
            </div>

            <nav className="dr-new-nav">
              {[
                { id: 'home', label: 'Головна' },
                { id: 'exercises', label: 'Вправи' },
                { id: 'stats', label: 'Статистика' },
                { id: 'quests', label: 'Квест' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.id !== 'home' && navigate(`/${tab.id}`)}
                  className={`dr-nav-link ${tab.id === 'home' ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="dr-user-section">
              <div className="dr-state-badge">
                Стан: <span className="dr-state-value">{getStateLabel()}</span>
              </div>
              <button 
                className="dr-user-profile-btn" 
                onClick={() => isGuest ? navigate("/auth") : navigate("/profile")}
              >
                {username}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dr-new-main">
        <div className="dr-hero-section">
          <div className="dr-deco sparkles"><Sparkles className="w-8 h-8" /></div>
          <div className="dr-deco heart"><Heart className="w-10 h-10" /></div>

          <div className="dr-hero-grid">
            <div className="dr-status-card">
              <div className="dr-card-header">
                <div className="dr-card-icon">
                  <TrendingUp className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="dr-card-info">
                  <h2 className="dr-status-title">Мій прогрес</h2>
                  <p className="dr-status-subtitle">Твій рівень стійкості сьогодні</p>
                </div>
              </div>

              <div className="dr-chart-container">
                <div className="dr-chart-box">
                  <svg viewBox="0 0 100 100" className="dr-chart-svg">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#42A5F5" />
                        <stop offset="100%" stopColor="#29B6F6" />
                      </linearGradient>
                    </defs>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {chartPoints.map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={100 - point.y}
                        r="2.5"
                        fill="#42A5F5"
                      />
                    ))}
                  </svg>
                </div>

                <div className="dr-chart-stats">
                  <div className="dr-stat">
                    <span className="dr-stat-value">{resilience}%</span>
                    <span className="dr-stat-label">Поточний рівень</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dr-action-card">
              <div className="dr-card-header">
                <div className="dr-card-icon">
                  <Target className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="dr-card-info">
                  <h2 className="dr-status-title">Наступний крок</h2>
                  <p className="dr-status-subtitle">Твій персональний шлях до стійкості</p>
                </div>
              </div>

              <div className="dr-action-content">
                <p className="dr-action-desc">
                  Ніякого складного вибору і зайвих думок. Переходь до свого персонального квесту, де ми вже підготували наступний крок.
                </p>
                <button 
                  className={`dr-trainer-btn ${showSosHint ? 'pulse' : ''}`}
                  onClick={() => navigate('/quests')}
                >
                  <Target className="w-6 h-6" strokeWidth={2} />
                  Розпочати мій шлях
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="dr-recommendations-section">
          <div className="dr-recommendations-header">
            <div className="dr-recommendations-title-wrapper">
              <div className="dr-recommendations-icon">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="dr-recommendations-title">Рекомендовано саме вам</h2>
                <p className="dr-recommendations-subtitle">Персоналізовані матеріали на основі вашого стану</p>
              </div>
            </div>
          </div>

          <div className="dr-recommendations-grid">
            {getPersonalizedRecommendations().map((item, index) => (
              <div key={index} className="dr-recommendation-card" onClick={() => item.materialId && navigate(`/material/${item.materialId}`)}>
                <div className="dr-recommendation-visual" style={getCardStyle(item.category)}>
                  <div className="dr-recommendation-emoji">{item.emoji}</div>
                  <div className="dr-recommendation-badge" style={getBadgeStyle(item.category)}>
                    {typeIcons[item.type] ? React.createElement(typeIcons[item.type], { className: "dr-icon-small", strokeWidth: 2 }) : <BookOpen className="dr-icon-small" strokeWidth={2} />}
                  </div>
                </div>
                <div className="dr-recommendation-info">
                  <span className="dr-recommendation-type">{item.type}</span>
                  <h3 className="dr-recommendation-title">{item.title}</h3>
                  <p className="dr-recommendation-desc">{item.description}</p>
                  <div className="dr-recommendation-action">
                    <span>{item.action}</span>
                    <ArrowRight className="dr-icon-arrow" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dr-library-section">
          <div className="dr-library-header">
            <div>
              <h2 className="dr-library-title">Бібліотека знань</h2>
              <p className="dr-library-subtitle">Досліджуйте матеріали для підтримки ментального здоров'я</p>
            </div>
            <button 
              className="dr-show-all-btn"
              onClick={() => setIsPersonalized(!isPersonalized)}
            >
              <Unlock className="w-5 h-5" />
              {isPersonalized ? "Показати всі" : "Тільки підходящі"}
            </button>
          </div>

          <div className="dr-filter-bar">
            {["all", "text", "video", "audio"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`dr-filter-pill ${activeFilter === filter ? 'active' : ''}`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>

          <div className="dr-content-grid">
            {filteredMaterials.map((m, index) => (
              <MaterialCard
                key={m._id}
                material={m}
                index={index}
                navigate={navigate}
                getCardStyle={getCardStyle}
                getBadgeStyle={getBadgeStyle}
                getIllustration={getIllustration}
                typeIcons={typeIcons}
                BookOpen={BookOpen}
                ArrowRight={ArrowRight}
              />
            ))}
          </div>
        </div>
      </main>

      {showSosHint && (
        <div className="dr-sos-hint-new">
          <div className="dr-sos-hint-box">
            <span className="dr-hint-icon">👉</span>
            <span className="dr-hint-text">Тепер спробуй наш тренажер</span>
            <button className="dr-hint-close" onClick={() => setShowSosHint(false)}>×</button>
          </div>
        </div>
      )}

      <div className="dr-sos-section">
        {/* Кнопка SOS для психологічної допомоги */}
        <button 
          className="dr-sos-btn-main"
          onClick={() => navigate("/sos")}
        >
          <LifeBuoy className="w-7 h-7" strokeWidth={2.5} />
          <span className="dr-btn-text">SOS</span>
        </button>

        {/* Кнопка телефонів для екстрених служб */}
        <div className="dr-phone-container" ref={sosDropdownRef}>
          <button 
            className="dr-phone-btn"
            onClick={() => setShowSosDropdown(!showSosDropdown)}
          >
            <Phone className="w-7 h-7" strokeWidth={2.5} />
            <span className="dr-btn-text">📞</span>
          </button>

          {showSosDropdown && (
            <div className="dr-sos-dropdown">
              <div className="dr-sos-header">
                <Phone className="w-5 h-5" strokeWidth={2} />
                <div>
                  <h4>Гарячі лінії допомоги</h4>
                  <p>Психологічна допомога в Україні</p>
                </div>
              </div>
              
              <div className="dr-sos-list">
                <a href="tel:7333" className="dr-sos-item">
                  <div className="dr-sos-number">7333</div>
                  <div className="dr-sos-label">Національна гаряча лінія</div>
                </a>
                <a href="tel:116123" className="dr-sos-item">
                  <div className="dr-sos-number">116 123</div>
                  <div className="dr-sos-label">Для дорослих та сімей</div>
                </a>
                <a href="tel:1547" className="dr-sos-item">
                  <div className="dr-sos-number">1547</div>
                  <div className="dr-sos-label">Для дітей та підлітків</div>
                </a>
                <a href="tel:0800500501" className="dr-sos-item">
                  <div className="dr-sos-number">0 800 500 501</div>
                  <div className="dr-sos-label">БЕЗКОШТОВНО для дітей та батьків</div>
                </a>
                <a href="tel:116111" className="dr-sos-item">
                  <div className="dr-sos-number">116 111</div>
                  <div className="dr-sos-label">Цілодобово для дорослих</div>
                </a>
                <a href="tel:116123" className="dr-sos-item">
                  <div className="dr-sos-number">116 123</div>
                  <div className="dr-sos-label">Цілодобово для дітей</div>
                </a>
                <a href="tel:1545" className="dr-sos-item">
                  <div className="dr-sos-number">1545</div>
                  <div className="dr-sos-label">Мобільна екстрена допомога</div>
                </a>
                <a href="tel:112" className="dr-sos-item">
                  <div className="dr-sos-number">112</div>
                  <div className="dr-sos-label">Цілодобово (усі послуги)</div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <CharacterCompanion context="main-hints" position="bottom-left" resilience={resilience} pageType={pageType} />
    </div>
  );
}