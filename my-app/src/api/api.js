const getBaseUrl = () => {
	if (window.location.hostname === "localhost") {
		return "http://localhost:5000/api";
	}
	return "https://shelter-api-service.onrender.com/api";
};

const API_URL = getBaseUrl();

const getHeaders = () => ({
	"Content-Type": "application/json",
	"x-auth-token": localStorage.getItem("dr_token"),
});

const isValidId = (id) => id && id !== "null" && id !== "undefined";

export const api = {
	loginAsGuest: () =>
		fetch(`${API_URL}/auth/guest`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		}).then((res) => res.json()),

	login: (data) =>
		fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		}).then((res) => res.json()),

	register: (data) =>
		fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
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

	updateUserProgress: (userId, itemId, type) => {
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/update-progress`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ userId, itemId, type }),
		}).then((res) => res.json());
	},

	getUserStats: (userId) => {
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/${userId}/stats`, {
			headers: getHeaders(),
		}).then((res) => res.json());
	},

	updateResilience: (userId, amount, type, name) => {
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/update-resilience`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({ userId, amount, type, name }),
		}).then((res) => res.json());
	},

	getVolumeStats: (userId) => {
		if (!isValidId(userId)) return Promise.reject("Invalid ID");
		return fetch(`${API_URL}/users/${userId}/stats-volume`, {
			headers: getHeaders(),
		}).then((res) => res.json());
	},
};
