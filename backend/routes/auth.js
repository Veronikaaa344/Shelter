import { compare, genSalt, hash } from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import Account from "../models/Account.js";
import User from "../models/User.js";

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
		const accountExists = await Account.findOne({ email });
		if (accountExists)
			return res.status(400).json({ message: "Емейл зайнятий" });

		const userProfile = new User({ username });
		const savedUser = await userProfile.save();

		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);

		const newAccount = new Account({
			email,
			password: hashedPassword,
			userId: savedUser._id,
		});
		await newAccount.save();

		sendTokenResponse(savedUser, 201, res);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const account = await Account.findOne({ email }).populate("userId");
		if (!account) return res.status(400).json({ message: "Не знайдено" });

		const isMatch = await compare(password, account.password);
		if (!isMatch) return res.status(400).json({ message: "Помилка" });

		sendTokenResponse(account.userId, 200, res);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/guest", async (req, res) => {
	try {
		const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
		const userProfile = new User({ username: "Гість" });
		const savedUser = await userProfile.save();
		const newAccount = new Account({
			email: `${guestId}@shalter.com`,
			password: await hash("guest_pass", 10),
			userId: savedUser._id,
		});
		await newAccount.save();
		sendTokenResponse(savedUser, 200, res);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
