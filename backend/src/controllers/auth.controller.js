import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerLibrarian(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLibrarians = async (req, res, next) => {
  try {
    const librarians = await authService.getLibrarians();
    res.json(librarians);
  } catch (error) {
    next(error);
  }
};
