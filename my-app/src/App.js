import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api/api";

import AdminPage from "./pages/adminPage/AdminPage";
import AuthPage from "./pages/authPage/AuthPage";
import MainPage from "./pages/mainPage/MainPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import SosPage from "./pages/sosPage/sosPage";
import StartPage from "./pages/startPage/startPage";
import StatsPage from "./pages/statsPage/StatsPage";
import ExercisesPage from "./pages/trainerSimulator/exercisesPage/ExercisesPage";
import SimulatorPage from "./pages/trainerSimulator/simulatorPage/SimulatorPage";

const checkTestStatus = () => {
	const saved = localStorage.getItem("dr_test_results");
	if (!saved) return false;
	try {
		const { expiry } = JSON.parse(saved);
		if (Date.now() < expiry) return true;
		localStorage.removeItem("dr_test_results");
		return false;
	} catch (e) {
		return false;
	}
};

const ProtectedRoute = ({ children }) => {
	return localStorage.getItem("dr_token") ? (
		children
	) : (
		<Navigate to="/auth" replace />
	);
};

function App() {
	const [isReady, setIsReady] = useState(false);
	const hasValidTest = checkTestStatus();

	useEffect(() => {
		const initSession = async () => {
			const token = localStorage.getItem("dr_token");
			const userId = localStorage.getItem("userId");

			if (
				!token ||
				token === "guest_mode" ||
				!userId ||
				userId === "null" ||
				userId === "undefined"
			) {
				localStorage.removeItem("dr_token");
				localStorage.removeItem("userId");
				try {
					const data = await api.loginAsGuest();
					if (data.user && data.token) {
						localStorage.setItem("dr_token", data.token);
						localStorage.setItem("userId", data.user.id);
					}
				} catch (e) {
					console.error(e);
				}
			}
			setIsReady(true);
		};
		initSession();
	}, []);

	if (!isReady) return null;

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						hasValidTest ? <Navigate to="/main" /> : <Navigate to="/start" />
					}
				/>
				<Route path="/start" element={<StartPage />} />
				<Route path="/main" element={<MainPage />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/sos" element={<SosPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/admin" element={<AdminPage />} />
				<Route path="/exercises" element={<ExercisesPage />} />
				<Route path="/exercises/:id" element={<SimulatorPage />} />
				<Route path="/stats" element={<StatsPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
