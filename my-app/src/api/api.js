const getBaseUrl = () => {
	if (window.location.hostname === "localhost") {
		return "http://localhost:5000/api";
	}
	return "https://shelter-jsv0.onrender.com/api";
};

const API_URL = getBaseUrl();

const getHeaders = () => ({
	"Content-Type": "application/json",
	"x-auth-token": localStorage.getItem("dr_token"),
});

const isValidId = (id) => id && id !== "null" && id !== "undefined";

const isGuest = () => localStorage.getItem("dr_token") === "guest_mode";

export const api = {
	isGuest,

	getProfile: () => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/me`, {
				credentials: "include",
			}).then((res) => res.json());
		}
		const userId = localStorage.getItem("userId");
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/${userId}/stats-volume`, {
			headers: getHeaders(),
		}).then((res) => res.json());
	},

	logout: () => {
		localStorage.removeItem("dr_token");
		localStorage.removeItem("userId");
		return Promise.resolve();
	},
	loginAsGuest: () =>
		fetch(`${API_URL}/auth/guest`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		}).then((res) => res.json()),

	login: (data) =>
		fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	register: (data) =>
		fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	migrateGuest: (data) =>
		fetch(`${API_URL}/auth/migrate-guest`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	getMaterials: () => fetch(`${API_URL}/materials`).then((res) => res.json()),

	createMaterial: (data) =>
		fetch(`${API_URL}/materials`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	updateMaterial: (id, data) =>
		fetch(`${API_URL}/materials/${id}`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	deleteMaterial: (id) =>
		fetch(`${API_URL}/materials/${id}`, {
			method: "DELETE",
			headers: getHeaders(),
		}).then((res) => res.json()),

	getScenarios: () => fetch(`${API_URL}/scenarios`).then((res) => res.json()),

	createScenario: (data) =>
		fetch(`${API_URL}/scenarios`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	updateScenario: (id, data) =>
		fetch(`${API_URL}/scenarios/${id}`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	deleteScenario: (id) =>
		fetch(`${API_URL}/scenarios/${id}`, {
			method: "DELETE",
			headers: getHeaders(),
		}).then((res) => res.json()),

	getScenarioById: (id) =>
		fetch(`${API_URL}/scenarios/${id}`).then((res) => res.json()),

	getMaterialById: (id) =>
		fetch(`${API_URL}/materials/${id}`).then((res) => res.json()),

	// Статистика
	getUserStats: (userId) =>
		fetch(`${API_URL}/stats/user/${userId}`).then((res) => res.json()),

	getDashboardStats: (userId) =>
		fetch(`${API_URL}/stats/dashboard/${userId}`).then((res) => res.json()),

	recordBreathingSession: (userId, minutes) =>
		fetch(`${API_URL}/stats/breathing/${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ minutes })
		}).then((res) => res.json()),

	recordDiagnostic: (userId, score, answers) =>
		fetch(`${API_URL}/stats/diagnostic/${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ score, answers })
		}).then((res) => res.json()),

	recordMaterialView: (userId, materialId, minutes = 0) =>
		fetch(`${API_URL}/stats/material-view/${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ materialId, minutes })
		}).then((res) => res.json()),

	updateStreak: (userId) =>
		fetch(`${API_URL}/stats/streak/${userId}`, {
			method: 'POST'
		}).then((res) => res.json()),

	updateUserProgress: (userId, itemId, type) => {
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/update-progress`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ userId, itemId, type }),
		}).then((res) => res.json());
	},

	getUserStats: (userId) => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/stats`, {
				credentials: "include",
			}).then((res) => res.json());
		}
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/${userId}/stats`, {
			headers: getHeaders(),
		}).then((res) => res.json());
	},

	addDiaryEntry: (userId, mood, content, tags = []) => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/diary`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ mood, content, tags })
			}).then((res) => res.json());
		}
		return fetch(`${API_URL}/stats/diary/${userId}`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({ mood, content, tags })
		}).then((res) => res.json());
	},

	getDiaryEntries: (userId, limit = 10, page = 1) => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/diary`, {
				credentials: 'include'
			}).then((res) => res.json());
		}
		return fetch(`${API_URL}/stats/diary/${userId}?limit=${limit}&page=${page}`, {
			headers: getHeaders()
		}).then((res) => res.json());
	},

	updateResilience: (userId, amount, type, name) => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/update-resilience`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ amount, type, name }),
			}).then((res) => res.json());
		}
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/update-resilience`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ userId, amount, type, name }),
		}).then((res) => res.json());
	},

	getVolumeStats: (userId) => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/stats-volume`, {
				credentials: "include",
			}).then((res) => res.json());
		}
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/${userId}/stats-volume`, {
			headers: getHeaders(),
		}).then((res) => res.json());
	},

	// Gamification APIs
	recordActivity: () => {
		return fetch(`${API_URL}/auth/activity`, {
			method: "POST",
			headers: getHeaders(),
			credentials: "include",
		}).then((res) => res.json());
	},

	completeScenario: (scenarioId, score) => {
		return fetch(`${API_URL}/auth/complete-scenario`, {
			method: "POST",
			headers: getHeaders(),
			credentials: "include",
			body: JSON.stringify({ scenarioId, score }),
		}).then((res) => res.json());
	},

	getUserProfile: () => {
		if (isGuest()) {
			return fetch(`${API_URL}/auth/guest/me`, {
				credentials: "include",
			}).then((res) => res.json());
		}
		return fetch(`${API_URL}/auth/profile`, {
			headers: getHeaders(),
			credentials: "include",
		}).then((res) => res.json());
	},
};

export default api;
