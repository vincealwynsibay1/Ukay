import ExpressError from "../utils/ExpressError";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// authenticate user
const authenticate = async (userCredentials: any) => {
	const { email, password } = userCredentials;
	const user = await User.findOne({ email: email });
	if (!user) {
		throw new ExpressError("User not found", 404);
	}

	const isValid = await bcrypt.compare(password, user.password);

	if (isValid) {
		throw new ExpressError("Invalid password", 400);
	}

	const token = await jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
		expiresIn: "7d",
	});

	return { user, token };
};

// register user
const register = async (userCredentials: any) => {
	const { username, email, password } = userCredentials;
	if (await User.findOne({ username }))
		throw new ExpressError(
			"Username " + username + " is already taken",
			400
		);
	if (await User.findOne({ email }))
		throw new ExpressError("Email " + email + " is already taken", 400);

	const passwordHash = await bcrypt.hash(password, 10);

	if (!userCredentials.middleName) {
		userCredentials.middleName = "";
	}

	const user = new User({ ...userCredentials, password: passwordHash });
	await user.save();

	return user;
};

// get user by id
const getById = async (id: string) => {
	const user = await User.findById(id);
	return user;
};

// get all users
const getAll = async () => {
	const users = await User.find();
	return users;
};

// get user by username
const getByUsername = async (username: string) => {
	const user = await User.findOne({ username: username });
	return user;
};

// get user by email
const getByEmail = async (email: string) => {
	const user = await User.findOne({ email: email });
	return user;
};

// update user
const update = async (id: string, userCredentials: any) => {
	const user = await User.findById(id);

	if (!user) {
		throw new ExpressError(`User ${id} not found`, 404);
	}

	if (user.username !== userCredentials.username) {
		if (await User.findOne({ username: userCredentials.username })) {
			throw new ExpressError(
				"Username " + userCredentials.username + " is already taken",
				400
			);
		}
	}

	Object.assign(user, userCredentials);

	await user.save();
	return user;
};

// delete user
const _delete = async (id: string) => {
	const user = await User.findByIdAndDelete(id);
	return;
};

export default {
	authenticate,
	register,
	getById,
	getAll,
	getByUsername,
	getByEmail,
	update,
	delete: _delete,
};
