import Librarian from '../models/Librarian.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (username, password) => {
  const librarian = await Librarian.findOne({ username });
  if (!librarian) {
    throw new Error('Invalid credentials');
  }

  if (password !== librarian.password) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(librarian);
  return { token, librarian: { id: librarian._id, username: librarian.username, name: librarian.name } };
};

export const registerLibrarian = async (data) => {
  const existing = await Librarian.findOne({ username: data.username });
  if (existing) {
    throw new Error('Username already exists');
  }

  const librarian = new Librarian(data);
  await librarian.save();
  return { id: librarian._id, username: librarian.username, name: librarian.name };
};

export const getLibrarians = async () => {
  return await Librarian.find().select('-password');
};
