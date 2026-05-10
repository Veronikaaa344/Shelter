import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/api";
import AdminPage from "./pages/adminPage/AdminPage";
import AuthPage from "./pages/authPage/AuthPage";
import ProfilePage from "./pages/profilePage/ProfilePage";
import SosPage from "./pages/sosPage/sosPage";
import ShelterAppComplete from "./components/ShelterAppComplete";
import StatsPage from "./pages/statsPage/StatsPage";
import ExercisesPage from "./pages/trainerSimulator/exercisesPage/ExercisesPage";
import SimulatorPage from "./pages/trainerSimulator/simulatorPage/SimulatorPage";
import MaterialPage from "./pages/materialPage/MaterialPage";
import ChatTrainingPage from "./pages/chatTraining/ChatTrainingPage";
import UpdatedSortingPage from "./pages/trainerSimulator/sortingPage/UpdatedSortingPage";
import UpdatedFindDifferencesPage from "./pages/trainerSimulator/findDifferencesPage/UpdatedFindDifferencesPage";
import UpdatedVideoScenarioPage from "./pages/trainerSimulator/videoScenarioPage/UpdatedVideoScenarioPage";

function App() {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const initSession = async () => {
			const token = localStorage.getItem("dr_token");
			const userId = localStorage.getItem("userId");

			// Якщо є нормальний токен — нічого не робимо, просто показуємо додаток
			const hasValidSession =
				token &&
				token !== "guest_mode" &&
				userId &&
				userId !== "null" &&
				userId !== "undefined";

			const isGuestMode = token === "guest_mode";

			if (!hasValidSession && !isGuestMode) {
				// Немає сесії — автоматично входимо як гість
				localStorage.removeItem("dr_token");
				localStorage.removeItem("userId");
				try {
					const data = await api.loginAsGuest();
					// Гостева сесія в куках, локально позначаємо
					if (data.id || data.user) {
						localStorage.setItem("dr_token", "guest_mode");
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
				<Route path="/" element={<Navigate to="/main" replace />} />
				<Route path="/main" element={<ShelterAppComplete />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/sos" element={<SosPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/admin" element={<AdminPage />} />
				<Route path="/exercises" element={<ExercisesPage />} />
				<Route path="/exercises/:id" element={<SimulatorPage />} />
				<Route path="/material/:id" element={<MaterialPage />} />
				<Route path="/chat" element={<ChatTrainingPage />} />
				<Route path="/stats" element={<StatsPage />} />
				<Route path="/sorting/:id" element={<UpdatedSortingPage />} />
				<Route path="/find-differences/:id" element={<UpdatedFindDifferencesPage />} />
				<Route path="/video-scenario/:id" element={<UpdatedVideoScenarioPage />} />
				<Route path="*" element={<Navigate to="/main" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
