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

	useEffect(() => {
		const fetchStats = async () => {
			if (!userId || userId === "null" || userId === "undefined") {
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
	}, [userId]);

	const handleSosClick = async () => {
		if (userId) {
			await api.updateResilience(userId, 5, "sos", "Кнопка SOS");
		}
		navigate("/sos");
	};

	if (loading)
		return <div className="stats-loader">Завантаження статистики...</div>;

	if (!stats)
		return (
			<div className="stats-loader" style={{ color: "#d63031" }}>
				Помилка завантаження даних
			</div>
		);

	const hasHistory = stats.history && stats.history.length > 0;

	if (!hasHistory) {
		return (
			<div className="stats-empty-container">
				<button
					className="stats-back-btn-fixed"
					onClick={() => navigate("/main")}
				>
					← Назад
				</button>
				<div className="stats-empty-card">
					<div className="empty-icon">🌱</div>
					<h2>Твій шлях ще попереду</h2>
					<p>
						Статистика поки що відсутня. Пройдіть перший матеріал або вправу,
						щоб ми могли почати відстежувати вашу ментальну стійкість.
					</p>
					<button
						className="empty-cta-btn"
						onClick={() => navigate("/exercises")}
					>
						Почати шлях
					</button>
				</div>
				<button className="dr-sos-fab" onClick={handleSosClick}>
					<span className="dr-sos-text">SOS</span>
				</button>
			</div>
		);
	}

	return (
		<div className="stats-container">
			<header className="stats-header">
				<div className="stats-header-left">
					<button className="st-back-btn" onClick={() => navigate("/main")}>
						← Назад
					</button>
					<h1>Твоя Стійкість</h1>
				</div>
				<div className="current-resilience-badge">
					<span className="label">Рівень:</span>
					<span className="value">{stats.allTime?.resilience || 50}%</span>
				</div>
			</header>

			<div className="stats-grid">
				<div className="stat-card today">
					<h3>Сьогодні</h3>
					<div className="volume-values">
						<span className="plus">+{stats.today?.plus || 0}</span>
						<span className="minus">{stats.today?.minus || 0}</span>
					</div>
					<div className="total-badge">
						Підсумок:{" "}
						{stats.today?.total > 0
							? `+${stats.today.total}`
							: stats.today?.total || 0}
					</div>
				</div>

				<div className="stat-card week">
					<h3>За тиждень</h3>
					<div className="volume-values">
						<span className="plus">+{stats.week?.plus || 0}</span>
						<span className="minus">{stats.week?.minus || 0}</span>
					</div>
					<div className="total-badge">
						Прогрес:{" "}
						{stats.week?.total > 0
							? `+${stats.week.total}`
							: stats.week?.total || 0}
					</div>
				</div>
			</div>

			<section className="chart-section">
				<h3>Динаміка стану</h3>
				<div className="chart-wrapper">
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={[...stats.history].slice(0, 10).reverse()}>
							<defs>
								<linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#eee"
							/>
							<XAxis
								dataKey="date"
								tickFormatter={(str) =>
									new Date(str).toLocaleDateString("uk-UA", {
										day: "numeric",
										month: "short",
									})
								}
								stroke="#999"
							/>
							<YAxis domain={[0, 100]} stroke="#999" />
							<Tooltip
								contentStyle={{
									borderRadius: "12px",
									border: "none",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								}}
							/>
							<Area
								type="monotone"
								dataKey="newScore"
								stroke="#4A90E2"
								fillOpacity={1}
								fill="url(#colorScore)"
								strokeWidth={3}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</section>

			<section className="history-section">
				<h3>Історія активності</h3>
				<div className="history-list">
					{stats.history.map((item, index) => (
						<div key={index} className="history-item">
							<div className="history-info">
								<span className="history-date">
									{new Date(item.date).toLocaleDateString("uk-UA", {
										hour: "2-digit",
										minute: "2-digit",
										day: "numeric",
										month: "short",
									})}
								</span>
								<span className="history-name">{item.activityName}</span>
							</div>
							<div
								className={`history-change ${item.change > 0 ? "pos" : "neg"}`}
							>
								{item.change > 0 ? `+${item.change}` : item.change}
							</div>
						</div>
					))}
				</div>
			</section>

			<button className="dr-sos-fab" onClick={handleSosClick}>
				<span className="dr-sos-text">SOS</span>
			</button>
		</div>
	);
};

export default StatsPage;
