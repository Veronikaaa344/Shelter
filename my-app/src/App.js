import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api/api";
import PageTransition from "./components/PageTransition/PageTransition";

import AdminPage from "./pages/adminPage/AdminPage";
import AuthPage from "./pages/authPage/AuthPage";
import MainPage from "./pages/mainPage/MainPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import SosPage from "./pages/sosPage/sosPage";
import StartPage from "./pages/startPage/startPage";
import StatsPage from "./pages/statsPage/StatsPage";
import ExercisesPage from "./pages/trainerSimulator/exercisesPage/ExercisesPage";
import SimulatorPage from "./pages/trainerSimulator/simulatorPage/SimulatorPage";
import FindDifferencesPage from "./pages/trainerSimulator/findDifferencesPage/FindDifferencesPage";
import SortingPage from "./pages/trainerSimulator/sortingPage/SortingPage";
import MaterialPage from "./pages/materialPage/MaterialPage";
import QuestsPage from "./pages/QuestsPage/QuestsPage";

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
	const token = localStorage.getItem("dr_token");
	return token && token !== "null" && token !== "undefined" ? (
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

			// If no token at all, create guest
			if (!token || token === "null" || token === "undefined") {
				try {
					const data = await api.loginAsGuest();
					if (data.user) {
						localStorage.setItem("dr_token", "guest_mode");
						localStorage.setItem("userId", data.user.id);
					}
				} catch (e) {
					console.error(e);
				}
			}
			// If guest mode, verify cookie exists
			else if (token === "guest_mode") {
				try {
					const data = await api.getProfile();
					if (data.message) {
						// Cookie expired, create new guest
						const newData = await api.loginAsGuest();
						if (newData.user) {
							localStorage.setItem("dr_token", "guest_mode");
							localStorage.setItem("userId", newData.user.id);
						}
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
						<PageTransition>
							{hasValidTest ? <Navigate to="/main" /> : <Navigate to="/start" />}
						</PageTransition>
					}
				/>
				<Route path="/start" element={<PageTransition><StartPage /></PageTransition>} />
				<Route path="/main" element={<PageTransition><MainPage /></PageTransition>} />
				<Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
				<Route path="/sos" element={<PageTransition><SosPage /></PageTransition>} />
				<Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
				<Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
				<Route path="/exercises" element={<PageTransition><ExercisesPage /></PageTransition>} />
				<Route path="/exercises/:id" element={<PageTransition><SimulatorPage /></PageTransition>} />
				<Route path="/find-differences/:id" element={<PageTransition><FindDifferencesPage /></PageTransition>} />
				<Route path="/trainer/sorting/:id" element={<PageTransition><SortingPage /></PageTransition>} />
				<Route path="/stats" element={<PageTransition><StatsPage /></PageTransition>} />
				<Route path="/material/:id" element={<PageTransition><MaterialPage /></PageTransition>} />
				<Route path="*" element={<PageTransition><Navigate to="/" replace /></PageTransition>} />
				<Route path="/quests" element={<PageTransition><QuestsPage /></PageTransition>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
