import * as libraryService from '../services/library.service.js';

export const createLibrary = async (req, res, next) => {
  try {
    const library = await libraryService.createLibrary(req.body);
    res.status(201).json(library);
  } catch (error) {
    next(error);
  }
};

export const getLibraries = async (req, res, next) => {
  try {
    const libraries = await libraryService.getAllLibraries(req.query);
    res.json(libraries);
  } catch (error) {
    next(error);
  }
};

export const getLibraryById = async (req, res, next) => {
  try {
    const library = await libraryService.getLibraryById(req.params.id);
    if (!library) return res.status(404).json({ message: 'Library not found' });
    res.json(library);
  } catch (error) {
    next(error);
  }
};

export const updateLibrary = async (req, res, next) => {
  try {
    const library = await libraryService.updateLibrary(req.params.id, req.body);
    res.json(library);
  } catch (error) {
    next(error);
  }
};

export const deleteLibrary = async (req, res, next) => {
  try {
    await libraryService.deleteLibrary(req.params.id);
    res.json({ message: 'Library deleted successfully' });
  } catch (error) {
    next(error);
  }
};
