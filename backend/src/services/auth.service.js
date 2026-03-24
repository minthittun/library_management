import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Library from "../models/Library.js";
import { generateToken } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export const login = async (username, password) => {
  const user = await User.findOne({ username, isActive: true }).populate(
    "libraries",
  );
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      libraries: user.libraries,
    },
  };
};

export const registerUser = async (data) => {
  const existing = await User.findOne({ username: data.username });
  if (existing) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({ ...data, password: hashedPassword });
  await user.save();
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
};

export const getUsers = async () => {
  return await User.find({ role: "admin" })
    .select("-password")
    .populate("libraries");
};

export const getUserById = async (id) => {
  return await User.findById(id).select("-password").populate("libraries");
};

export const createUser = async (data) => {
  const existing = await User.findOne({ username: data.username });
  if (existing) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({ ...data, password: hashedPassword });
  await user.save();
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
};

export const updateUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true })
    .select("-password")
    .populate("libraries");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};
