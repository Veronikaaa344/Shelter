import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { api } from "../../api/api";
import "./statsPage.css";

const StatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const isGuest = api.isGuest();

    useEffect(() => {
        const fetchStats = async () => {
            if (!isGuest && (!userId || userId === "null" || userId === "undefined")) {
                setLoading(false);
                return;
            }
            try {
                const data = await api.getVolumeStats(userId);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Помилка завантаження:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, [userId, isGuest]);

    const handleSosClick = async () => {
        if (userId || isGuest) {
            await api.updateResilience(userId, -15, "sos", "Нажата кнопка SOS");
        }
        navigate("/sos");
    };

    if (loading) {
        return (
            <div className="dr-new-layout dr-st-center">
                <h2 className="dr-status-title">Завантаження статистики...</h2>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="dr-new-layout dr-st-center">
                <h2 className="dr-status-title" style={{ color: "#e53935" }}>
                    Помилка завантаження даних
                </h2>
            </div>
        );
    }

    const hasHistory = stats.history && stats.history.length > 0;

    const Header = () => (
        <header className="dr-new-header">
            <div className="dr-header-container">
                <div className="dr-header-inner">
                    <div className="dr-new-logo" onClick={() => navigate("/main")}>
                        <div className="dr-logo-icon-box">
                            <svg className="dr-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h1 className="dr-logo-text">Броня для розуму</h1>
                    </div>
                    
                    <div className="dr-new-nav">
                        <button className="dr-nav-link" onClick={() => navigate("/main")}>
                            ← Назад
                        </button>
                    </div>

                    <div className="dr-user-section">
                        <div className="dr-state-badge">
                            Стан: <span className="dr-state-value">Стрес</span>
                        </div>
                        <button className="dr-user-profile-btn">Гість</button>
                    </div>
                </div>
            </div>
        </header>
    );

    if (!hasHistory) {
        return (
            <div className="dr-new-layout">
                <Header />
                <main className="dr-new-main dr-st-center" style={{ minHeight: "80vh" }}>
                    <div className="dr-content-card dr-st-empty-card">
                        <div className="dr-card-emoji">🌱</div>
                        <h2 className="dr-status-title">Твій шлях ще попереду</h2>
                        <p className="dr-card-description">
                            Статистика поки що відсутня. Пройдіть перший матеріал або вправу,
                            щоб ми могли почати відстежувати вашу ментальну стійкість.
                        </p>
                        <button
                            className="dr-trainer-btn"
                            onClick={() => navigate("/exercises")}
                            style={{ marginTop: "1rem" }}
                        >
                            Почати шлях
                        </button>
                    </div>
                    <button className="dr-sos-btn" onClick={handleSosClick}>
                        <span className="dr-sos-label">SOS</span>
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="dr-new-layout">
            <Header />
            
            <main className="dr-new-main">
                <div className="dr-library-header" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                    <h1 className="dr-status-title" style={{ margin: 0, fontSize: "2rem" }}>Твоя Стійкість</h1>
                    <div className="dr-state-badge" style={{ fontSize: "1rem" }}>
                        Рівень: <span className="dr-state-value" style={{ color: "#1E88E5", fontSize: "1.2rem" }}>{stats.allTime?.resilience || 50}%</span>
                    </div>
                </div>

                <div className="dr-hero-grid" style={{ marginBottom: "1.5rem" }}>
                    <div className="dr-status-card">
                        <h3 className="dr-card-headline" style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Сьогодні</h3>
                        <div className="dr-st-values">
                            <div className="dr-stat">
                                <span className="dr-stat-value dr-st-text-pos">+{stats.today?.plus || 0}</span>
                            </div>
                            <div className="dr-stat">
                                <span className="dr-stat-value dr-st-text-neg">{stats.today?.minus || 0}</span>
                            </div>
                        </div>
                        <div className="dr-type-label" style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
                            Підсумок: {stats.today?.total > 0 ? `+${stats.today.total}` : stats.today?.total || 0}
                        </div>
                    </div>

                    <div className="dr-status-card">
                        <h3 className="dr-card-headline" style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>За тиждень</h3>
                        <div className="dr-st-values">
                            <div className="dr-stat">
                                <span className="dr-stat-value dr-st-text-pos">+{stats.week?.plus || 0}</span>
                            </div>
                            <div className="dr-stat">
                                <span className="dr-stat-value dr-st-text-neg">{stats.week?.minus || 0}</span>
                            </div>
                        </div>
                        <div className="dr-type-label" style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
                            Прогрес: {stats.week?.total > 0 ? `+${stats.week.total}` : stats.week?.total || 0}
                        </div>
                    </div>
                </div>

                <div className="dr-status-card" style={{ marginBottom: "1.5rem" }}>
                    <h3 className="dr-status-title" style={{ marginBottom: "1.5rem" }}>Динаміка стану</h3>
                    <div className="dr-chart-box" style={{ background: "transparent", padding: 0 }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={[...stats.history].slice(0, 10).reverse()}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) =>
                                        new Date(str).toLocaleDateString("uk-UA", {
                                            day: "numeric",
                                            month: "short",
                                        })
                                    }
                                    stroke="#94a3b8"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "16px",
                                        border: "none",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                        fontWeight: 600,
                                        color: "#1e293b"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="newScore"
                                    stroke="#42A5F5"
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    strokeWidth={4}
                                    activeDot={{ r: 6, fill: "#1E88E5", stroke: "#fff", strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dr-status-card" style={{ marginBottom: "5rem" }}>
                    <h3 className="dr-status-title" style={{ marginBottom: "1.5rem" }}>Історія активності</h3>
                    <div className="dr-st-history-list">
                        {stats.history.map((item, index) => (
                            <div key={index} className="dr-st-history-item">
                                <div className="dr-st-history-info">
                                    <span className="dr-st-history-date">
                                        {new Date(item.date).toLocaleDateString("uk-UA", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                    <span className="dr-st-history-name">{item.activityName}</span>
                                </div>
                                <div className={`dr-st-history-badge ${item.change > 0 ? "pos" : "neg"}`}>
                                    {item.change > 0 ? `+${item.change}` : item.change}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="dr-sos-btn" onClick={handleSosClick}>
                    <span className="dr-sos-label">SOS</span>
                </button>
            </main>
        </div>
    );
};

export default StatsPage;