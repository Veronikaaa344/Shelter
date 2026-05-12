import { compare, genSalt, hash } from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import Account from "../models/Account.js";
import User from "../models/User.js";
import Scenario from "../models/Scenario.js";
import mongoose from "mongoose";

const router = Router();

const sendTokenResponse = (user, statusCode, res) => {
	const token = jwt.sign(
		{ id: user._id },
		process.env.JWT_SECRET || "secret_key",
		{
			expiresIn: "7d",
		},
	);

	res
		.status(statusCode)
		.cookie("dr_token", token, {
			httpOnly: true,
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		})
		.json({
			token,
			user: { id: user._id, username: user.username },
		});
};

router.post("/register", async (req, res) => {
	try {
		const { email, password, username } = req.body;
		
		// Валідація вхідних даних
		if (!email || !password || !username) {
			return res.status(400).json({ 
				message: "Всі поля обов'язкові",
				field: "all",
				type: "validation"
			});
		}

		// Валідація email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ 
				message: "Введіть коректний email адресу",
				field: "email",
				type: "validation"
			});
		}

		// Валідація пароля
		if (password.length < 6) {
			return res.status(400).json({ 
				message: "Пароль має містити мінімум 6 символів",
				field: "password",
				type: "validation"
			});
		}

		// Валідація імені
		if (username.length < 2) {
			return res.status(400).json({ 
				message: "Ім'я має містити мінімум 2 символи",
				field: "username",
				type: "validation"
			});
		}

		// Перевірка чи існує акаунт
		const accountExists = await Account.findOne({ email });
		if (accountExists) {
			return res.status(400).json({ 
				message: "Цей email вже використовується. Спробуйте інший або увійдіть",
				field: "email",
				type: "exists"
			});
		}

		// Створення профілю користувача
		const userProfile = new User({ username });
		const savedUser = await userProfile.save();

		// Хешування пароля
		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);

		// Створення акаунту
		const newAccount = new Account({
			email,
			password: hashedPassword,
			userId: savedUser._id,
		});
		await newAccount.save();

		sendTokenResponse(savedUser, 201, res);
	} catch (err) {
		console.error('Registration error:', err);
		
		// Обробка специфічних помилок MongoDB
		if (err.code === 11000) {
			const field = Object.keys(err.keyPattern)[0];
			const fieldNames = {
				email: 'email',
				username: 'ім\'я'
			};
			return res.status(400).json({ 
				message: `Цей ${fieldNames[field] || field} вже використовується`,
				field: field,
				type: "duplicate"
			});
		}

		// Валідація помилок Mongoose
		if (err.name === 'ValidationError') {
			const errors = Object.values(err.errors).map(e => e.message);
			return res.status(400).json({ 
				message: errors[0] || "Помилка валідації даних",
				field: "validation",
				type: "validation",
				details: errors
			});
		}

		res.status(500).json({ 
			message: "Помилка сервера. Спробуйте пізніше",
			type: "server"
		});
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		
		// Валідація вхідних даних
		if (!email || !password) {
			return res.status(400).json({ 
				message: "Email та пароль обов'язкові",
				field: "all",
				type: "validation"
			});
		}

		// Валідація email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ 
				message: "Введіть коректний email адресу",
				field: "email",
				type: "validation"
			});
		}

		// Пошук акаунту
		const account = await Account.findOne({ email }).populate("userId");
		if (!account) {
			return res.status(400).json({ 
				message: "Користувача з таким email не знайдено. Перевірте email або зареєструйтесь",
				field: "email",
				type: "not_found"
			});
		}

		// Перевірка пароля
		const isMatch = await compare(password, account.password);
		if (!isMatch) {
			return res.status(400).json({ 
				message: "Неправильний пароль. Спробуйте ще раз",
				field: "password",
				type: "invalid"
			});
		}

		sendTokenResponse(account.userId, 200, res);
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ 
			message: "Помилка сервера. Спробуйте пізніше",
			type: "server"
		});
	}
});

router.post("/guest", async (req, res) => {
	try {
		// Check if guest cookie already exists
		const existingCookie = req.cookies?.dr_guest;
		if (existingCookie) {
			const existingData = JSON.parse(existingCookie);
			// Refresh cookie expiration
			res
				.status(200)
				.cookie("dr_guest", existingCookie, {
					expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					path: "/",
				})
				.json({
					user: { id: existingData.id, username: existingData.username, isGuest: true },
				});
			return;
		}

		// Create new guest if no existing cookie
		const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
		const guestData = {
			id: guestId,
			username: "Гість",
			isGuest: true,
			diagnostic: {
				answers: [],
				completedAt: null,
			},
			stats: {
				resilience: 50,
				stabilityDays: 0,
			},
			history: [],
		};

		const guestDataToSave = {
			...guestData
		};

		res
			.status(200)
			.cookie("dr_guest", JSON.stringify(guestDataToSave), {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
			})
			.json({
				id: guestData.id,
				username: guestData.username,
				isGuest: true,
			});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/guest/me", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		const guestData = JSON.parse(guestCookie);
		res.json(guestData);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/guest/update", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		const currentData = JSON.parse(guestCookie);
		const updatedData = { ...currentData, ...req.body };
		
		// Якщо оновлюються статси (наприклад діагностика), додаємо в історію
		if (req.body.stats && req.body.stats.resilience !== undefined) {
			const score = req.body.stats.resilience;
			let resilienceChange = 0;
			if (score >= 60) resilienceChange = 2;
			else if (score <= 40) resilienceChange = -2;

			if (!updatedData.history) updatedData.history = [];
			updatedData.history.unshift({
				activityType: 'diagnostic',
				activityName: 'Діагностика стану',
				change: resilienceChange,
				newScore: score,
				date: new Date()
			});
		}

		// Сохраняем в куки только записи, кроме wrong_answer (промежуточные ответы в тестах)
		const updatedDataToSave = {
			...updatedData,
			history: (updatedData.history || []).filter(h => h.activityType !== "wrong_answer").slice(0, 10),
		};

		res
			.cookie("dr_guest", JSON.stringify(updatedDataToSave), {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
			})
			.json(updatedData);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/guest/stats", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		const guestData = JSON.parse(guestCookie);
		res.json(guestData.stats || { resilience: 50, stabilityDays: 0 });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/guest/stats-volume", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		console.log('📊 GUEST BACKEND: stats-volume request. Cookie length:', guestCookie ? guestCookie.length : 0);
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		const guestData = JSON.parse(guestCookie);
		const history = guestData.history || [];
		const now = new Date();
		const getStats = (days) => {
			const cutoff = new Date();
			cutoff.setDate(now.getDate() - days);
			const filtered = history.filter((h) => new Date(h.date) >= cutoff);
			const plus = filtered
				.filter((h) => h.change > 0)
				.reduce((acc, curr) => acc + curr.change, 0);
			const minus = filtered
				.filter((h) => h.change < 0)
				.reduce((acc, curr) => acc + curr.change, 0);
			return { plus, minus, total: plus + minus };
		};

		res.json({
			today: getStats(1),
			week: getStats(7),
			allTime: guestData.stats || { resilience: 50, stabilityDays: 0 },
			history: history,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/guest/update-resilience", (req, res) => {
	try {
		const { amount, type, name, itemId } = req.body;
		
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		
		const guestData = JSON.parse(guestCookie);

		// Track completion if itemId and type provided
		if (itemId && type) {
			if (type === 'material') {
				if (!guestData.completedMaterials) guestData.completedMaterials = [];
				if (!guestData.completedMaterials.includes(itemId)) {
					guestData.completedMaterials.push(itemId);
				}
			} else if (type === 'scenario') {
				if (!guestData.completedScenarios) guestData.completedScenarios = [];
				if (!guestData.completedScenarios.find(s => s.scenarioId === itemId)) {
					guestData.completedScenarios.push({ scenarioId: itemId, date: new Date() });
				}
			}
		}

		let currentRes = (guestData.stats?.resilience || 50) + amount;
		if (currentRes > 100) currentRes = 100;
		if (currentRes < 0) currentRes = 0;

		if (!guestData.stats) guestData.stats = {};
		guestData.stats.resilience = currentRes;

		if (!guestData.history) guestData.history = [];
		const historyEntry = {
			activityType: type,
			activityName: name,
			change: amount,
			newScore: currentRes,
			date: new Date(),
		};
		guestData.history.unshift(historyEntry);

		if (guestData.history.length > 10) {
			guestData.history = guestData.history.slice(0, 10);
		}

		const guestDataToSave = {
			...guestData,
			history: (guestData.history || []).filter(h => h.activityType !== "wrong_answer").slice(0, 10),
		};

		const cookieString = JSON.stringify(guestDataToSave);
		
		res
			.cookie("dr_guest", cookieString, {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				secure: false, // For localhost development
				sameSite: "lax",
				path: "/",
			})
			.json(guestData);
	} catch (err) {
		console.error('❌ GUEST BACKEND ERROR:', err);
		res.status(500).json({ message: err.message });
	}
});

// Додати запис у щоденник (гість)
router.post("/guest/diary", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.status(404).json({ message: "Guest not found" });
		}
		const { mood, content, tags = [] } = req.body;
		const guestData = JSON.parse(guestCookie);

		if (!guestData.diaryEntries) guestData.diaryEntries = [];

		const newEntry = {
			_id: `guest_diary_${Date.now()}`,
			mood,
			content,
			tags,
			date: new Date().toISOString(),
		};

		guestData.diaryEntries.unshift(newEntry);

		// Ограничиваем до 20 записей чтобы не переполнить куки
		if (guestData.diaryEntries.length > 20) {
			guestData.diaryEntries = guestData.diaryEntries.slice(0, 20);
		}

		res
			.cookie("dr_guest", JSON.stringify(guestData), {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
			})
			.json({ success: true, entry: newEntry });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Отримати записи щоденника (гість)
router.get("/guest/diary", (req, res) => {
	try {
		const guestCookie = req.cookies?.dr_guest;
		if (!guestCookie) {
			return res.json({ entries: [], total: 0 });
		}
		const guestData = JSON.parse(guestCookie);
		const entries = guestData.diaryEntries || [];
		res.json({ entries, total: entries.length });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});



router.post("/migrate-guest", async (req, res) => {
	try {
		const { email, password, username } = req.body;
		const guestCookie = req.cookies?.dr_guest;
		
		// Валідація вхідних даних
		if (!email || !password || !username) {
			return res.status(400).json({ 
				message: "Всі поля обов'язкові",
				field: "all",
				type: "validation"
			});
		}

		// Валідація email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ 
				message: "Введіть коректний email адресу",
				field: "email",
				type: "validation"
			});
		}

		// Валідація пароля
		if (password.length < 6) {
			return res.status(400).json({ 
				message: "Пароль має містити мінімум 6 символів",
				field: "password",
				type: "validation"
			});
		}

		// Валідація імені
		if (username.length < 2) {
			return res.status(400).json({ 
				message: "Ім'я має містити мінімум 2 символи",
				field: "username",
				type: "validation"
			});
		}

		// Check if email is taken
		const accountExists = await Account.findOne({ email });
		if (accountExists) {
			return res.status(400).json({ 
				message: "Цей email вже використовується. Спробуйте інший або увійдіть",
				field: "email",
				type: "exists"
			});
		}

		// Get guest data if exists
		let guestData = null;
		if (guestCookie) {
			guestData = JSON.parse(guestCookie);
		}

		// Create user with guest data if available, or fresh data
		const userProfile = new User({
			username,
			stats: guestData?.stats || { resilience: 50, stabilityDays: 0 },
			history: guestData?.history || [],
			diagnostic: guestData?.diagnostic || { answers: [], completedAt: null },
			completedScenarios: guestData?.completedScenarios || [],
			completedMaterials: guestData?.completedMaterials || [],
		});
		const savedUser = await userProfile.save();

		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);

		const newAccount = new Account({
			email,
			password: hashedPassword,
			userId: savedUser._id,
		});
		await newAccount.save();

		// Clear guest cookie
		res.clearCookie("dr_guest");

		// Send token response
		sendTokenResponse(savedUser, 201, res);
	} catch (err) {
		
		// Обробка специфічних помилок MongoDB
		if (err.code === 11000) {
			const field = Object.keys(err.keyPattern)[0];
			const fieldNames = {
				email: 'email',
				username: 'ім\'я'
			};
			return res.status(400).json({ 
				message: `Цей ${fieldNames[field] || field} вже використовується`,
				field: field,
				type: "duplicate"
			});
		}

		// Валідація помилок Mongoose
		if (err.name === 'ValidationError') {
			const errors = Object.values(err.errors).map(e => e.message);
			return res.status(400).json({ 
				message: errors[0] || "Помилка валідації даних",
				field: "validation",
				type: "validation",
				details: errors
			});
		}

		res.status(500).json({ 
			message: "Помилка сервера. Спробуйте пізніше",
			type: "server"
		});
	}
});

// Get user profile with gamification data
router.get("/profile", async (req, res) => {
	try {
		const token = req.cookies?.dr_token;
		if (!token) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			id: user._id,
			username: user.username,
			email: user.email,
			isGuest: user.isGuest,
			stats: user.stats,
			badges: user.badges || [],
			completedScenarios: user.completedScenarios || [],
			completedMaterials: user.completedMaterials || [],
			unlockedScenarios: user.unlockedScenarios || [],
			diagnostic: user.diagnostic,
			history: user.history || [],
			diaryEntries: user.diaryEntries || [],
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update streak and check for badges
router.post("/activity", async (req, res) => {
	try {
		const token = req.cookies?.dr_token;
		if (!token) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const lastActive = user.stats.lastActiveDate;
		let newStreak = user.stats.streak || 0;

		if (lastActive) {
			const lastDate = new Date(lastActive);
			lastDate.setHours(0, 0, 0, 0);

			const diffTime = today - lastDate;
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				newStreak += 1;
				// Бонус +6 за 2+ дні поспіль
				if (newStreak >= 2) {
					user.stats.resilience = Math.min(100, (user.stats.resilience || 50) + 6);
					user.history.unshift({
						activityType: 'streak_bonus',
						activityName: `${newStreak} дні поспіль`,
						change: 6,
						newScore: user.stats.resilience,
						date: new Date()
					});
				}
			} else if (diffDays > 1) {
				newStreak = 1;
			}
		} else {
			newStreak = 1;
		}

		user.stats.streak = newStreak;
		user.stats.lastActiveDate = new Date();

		if (newStreak > (user.stats.longestStreak || 0)) {
			user.stats.longestStreak = newStreak;
		}

		// Check for streak badges
		const newBadges = [];
		const streakBadges = [
			{ days: 3, id: "streak_3", name: "3 дні стабільності", icon: "🔥", description: "3 дні активності поспіль" },
			{ days: 7, id: "streak_7", name: "Тиждень стабільності", icon: "🌟", description: "7 днів активності поспіль" },
			{ days: 30, id: "streak_30", name: "Місяць стабільності", icon: "👑", description: "30 днів активності поспіль" },
		];

		for (const badge of streakBadges) {
			if (newStreak >= badge.days && !user.badges.find(b => b.id === badge.id)) {
				user.badges.push(badge);
				newBadges.push(badge);
			}
		}

		await user.save();

		res.json({
			streak: newStreak,
			longestStreak: user.stats.longestStreak,
			newBadges,
			allBadges: user.badges,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Complete scenario and unlock next
router.post("/complete-scenario", async (req, res) => {
	try {
        const token = req.cookies?.dr_token || req.header("x-auth-token");
        const guestCookie = req.cookies?.dr_guest;
        const { scenarioId, score } = req.body;

		// Handle Guest User FIRST
		if (guestCookie && (!token || token === 'guest_mode')) {
			const guestData = JSON.parse(guestCookie);

			if (!guestData.completedScenarios) {
				guestData.completedScenarios = [];
			}

			const alreadyCompleted = guestData.completedScenarios.find(s => s.scenarioId === scenarioId);
			if (!alreadyCompleted) {
				guestData.completedScenarios.push({ scenarioId, score, date: new Date() });
				
				// Also update resilience history
				let scenario;
				if (mongoose.Types.ObjectId.isValid(scenarioId)) {
					scenario = await Scenario.findById(scenarioId);
				} else {
					scenario = await Scenario.findOne({ scenarioId: scenarioId });
				}
				const resilienceChange = score >= 50 ? 4 : -4;
				if (!guestData.stats) guestData.stats = { resilience: 50 };
				const oldResilience = guestData.stats.resilience || 50;
				guestData.stats.resilience = Math.max(0, Math.min(100, oldResilience + resilienceChange));

				if (!guestData.history) guestData.history = [];
				guestData.history.unshift({
					activityType: 'exercise_finish',
					activityName: `Тренажер: ${scenario ? scenario.name : ''}`,
					change: resilienceChange,
					newScore: guestData.stats.resilience,
					date: new Date()
				});
			}
			
			res.cookie("dr_guest", JSON.stringify(guestData), {
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
			});

			return res.json({
				completedScenarios: guestData.completedScenarios,
			});
		}
		
		// Handle Registered User
		if (token) {
			const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
			const user = await User.findById(decoded.id);
	
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
	
			// Add to completed
			const alreadyCompleted = user.completedScenarios.find(s => s.scenarioId.toString() === scenarioId);
			if (!alreadyCompleted) {
				user.completedScenarios.push({ scenarioId, score, date: new Date() });
			}
	
			// Sync with UserStats model for consistency in history/charts
			try {
				const UserStats = (await import('../models/UserStats.js')).default;
				let userStats = await UserStats.findOne({ userId: user._id });
				if (!userStats) userStats = new UserStats({ userId: user._id });
				
				const resilienceChange = score >= 50 ? 4 : -4;
				let scenario;
				if (mongoose.Types.ObjectId.isValid(scenarioId)) {
					scenario = await Scenario.findById(scenarioId);
				} else {
					scenario = await Scenario.findOne({ scenarioId: scenarioId });
				}
				
				userStats.resilience.current = Math.max(0, Math.min(100, userStats.resilience.current + resilienceChange));
				userStats.resilience.history.push({ value: userStats.resilience.current, date: new Date() });
				userStats.activities.push({
					type: 'exercise_finish',
					name: `Тренажер: ${scenario ? scenario.name : 'Вправа'}`,
					change: resilienceChange,
					date: new Date()
				});
				await userStats.save();
				
				// Also update resilience in User model stats for getProfile() consistency
				user.stats.resilience = userStats.resilience.current;
			} catch (statsErr) {
				console.error("Failed to sync UserStats during scenario completion:", statsErr);
			}

			// Check for completion badges
			const newBadges = [];
			const completedCount = user.completedScenarios.length;
	
			if (completedCount === 1 && !user.badges.find(b => b.id === "first_scenario")) {
				user.badges.push({
					id: "first_scenario",
					name: "Перша перемога",
					icon: "🎯",
					description: "Завершено перший сценарій",
				});
				newBadges.push(user.badges[user.badges.length - 1]);
			}
	
			if (completedCount === 5 && !user.badges.find(b => b.id === "expert_5")) {
				user.badges.push({
					id: "expert_5",
					name: "Експерт",
					icon: "🏆",
					description: "Завершено 5 сценаріїв",
				});
				newBadges.push(user.badges[user.badges.length - 1]);
			}
	
			// Progressive unlocking - unlock next scenario based on category
			const scenario = await Scenario.findById(scenarioId);
			if (scenario && scenario.nextUnlock) {
				if (!user.unlockedScenarios.includes(scenario.nextUnlock)) {
					user.unlockedScenarios.push(scenario.nextUnlock);
				}
			}
	
			await user.save();
	
			return res.json({
				completedScenarios: user.completedScenarios,
				unlockedScenarios: user.unlockedScenarios,
				newBadges,
			});
		}

		return res.status(401).json({ message: "Not authenticated" });

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
