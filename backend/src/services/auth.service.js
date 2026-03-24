import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Library from "../models/Library.js";
import { generateToken } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

const normalizeLibraryInput = (data) => {
  if (data?.library) {
    return typeof data.library === "object"
      ? data.library._id || data.library.id || data.library
      : data.library;
  }

  if (data?.libraries) {
    if (Array.isArray(data.libraries)) {
      const first = data.libraries[0];
      return typeof first === "object" ? first._id || first.id || first : first;
    }
    return typeof data.libraries === "object"
      ? data.libraries._id || data.libraries.id || data.libraries
      : data.libraries;
  }

  return null;
};

const enforceAdminLibrary = (role, library) => {
  if (role !== "admin") return;
  if (!library) {
    throw new Error("Admin must be assigned to exactly one library");
  }
};

export const login = async (username, password) => {
  const user = await User.findOne({ username, isActive: true }).populate(
    "library",
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
      library: user.library,
    },
  };
};

export const registerUser = async (data) => {
  const existing = await User.findOne({ username: data.username });
  if (existing) {
    throw new Error("Username already exists");
  }

  const role = data.role || "admin";
  const library = normalizeLibraryInput(data);
  enforceAdminLibrary(role, library);

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({ ...data, role, library, password: hashedPassword });
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
    .populate("library");
};

export const getUserById = async (id) => {
  return await User.findById(id).select("-password").populate("library");
};

export const createUser = async (data) => {
  const existing = await User.findOne({ username: data.username });
  if (existing) {
    throw new Error("Username already exists");
  }

  const role = data.role || "admin";
  const library = normalizeLibraryInput(data);
  enforceAdminLibrary(role, library);

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({ ...data, role, library, password: hashedPassword });
  await user.save();
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
};

export const updateUser = async (id, data) => {
  const existing = await User.findById(id);
  if (!existing) {
    throw new Error("User not found");
  }

  const role = data.role ?? existing.role;
  if (data.library !== undefined || data.libraries !== undefined) {
    const library = normalizeLibraryInput(data);
    enforceAdminLibrary(role, library);
    data.library = library;
    delete data.libraries;
  } else if (data.role === "admin") {
    enforceAdminLibrary(role, existing.library);
  }

  const user = await User.findByIdAndUpdate(id, data, { new: true })
    .select("-password")
    .populate("library");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};
