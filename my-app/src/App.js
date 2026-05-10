import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/api";
import PageTransition from "./components/PageTransition/PageTransition";
import ShelterApp from "./components/ShelterApp";

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
import VideoScenarioPage from "./pages/trainerSimulator/videoScenarioPage/VideoScenarioPage";
import MaterialPage from "./pages/materialPage/MaterialPage";
import QuestsPage from "./pages/QuestsPage/QuestsPage";
import safeStorage from "./utils/storage";
import './shelter-styles.css';

const checkTestStatus = () => {
	try {
		const saved = safeStorage.getItem("dr_test_results");
		if (!saved) return false;
		try {
			const { expiry } = JSON.parse(saved);
			if (Date.now() < expiry) return true;
			safeStorage.removeItem("dr_test_results");
			return false;
		} catch (e) {
			return false;
		}
	} catch (e) {
		console.warn('Storage access denied in checkTestStatus:', e);
		return false;
	}
};

const ProtectedRoute = ({ children }) => {
	try {
		const token = safeStorage.getItem("dr_token");
		return token && token !== "null" && token !== "undefined" ? (
			children
		) : (
			<Navigate to="/auth" replace />
		);
	} catch (e) {
		console.warn('Storage access denied in ProtectedRoute:', e);
		return <Navigate to="/auth" replace />;
	}
};

function App() {
	const [isReady, setIsReady] = useState(false);
	const hasValidTest = checkTestStatus();

	useEffect(() => {
		const initSession = async () => {
			try {
				const token = safeStorage.getItem("dr_token");
				const userId = safeStorage.getItem("userId");

				// If no token at all, create guest
				if (!token || token === "null" || token === "undefined") {
					try {
						const data = await api.loginAsGuest();
						if (data.user) {
							safeStorage.setItem("dr_token", "guest_mode");
							safeStorage.setItem("userId", data.user.id);
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
								safeStorage.setItem("dr_token", "guest_mode");
								safeStorage.setItem("userId", newData.user.id);
							}
						}
					} catch (e) {
						console.error(e);
					}
				}
			} catch (e) {
				console.warn('Storage access denied in initSession:', e);
				// Continue without storage - app should still work
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
					element={<ShelterApp />}
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
				<Route path="/trainer/video/:id" element={<PageTransition><VideoScenarioPage /></PageTransition>} />
				<Route path="/stats" element={<PageTransition><StatsPage /></PageTransition>} />
				<Route path="/material/:id" element={<PageTransition><MaterialPage /></PageTransition>} />
				<Route path="*" element={<PageTransition><Navigate to="/" replace /></PageTransition>} />
				<Route path="/quests" element={<PageTransition><QuestsPage /></PageTransition>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
