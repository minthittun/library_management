import * as bookService from '../services/book.service.js';
import * as bookCopyService from '../services/bookCopy.service.js';
import BookCopy from '../models/BookCopy.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.body.library || req.query.library || null;
  }
  return req.user.library || null;
};

export const createBook = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const book = await bookService.createBook({ ...req.body, library: libraryId });
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const books = await bookService.getAllBooks({ ...req.query, library: libraryId });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await bookService.deleteBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createBookCopy = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const result = await bookCopyService.createBookCopy({ ...req.body, library: libraryId });
    const ids = Array.isArray(result) ? result.map(r => r._id) : [result._id];
    const populatedCopies = await BookCopy.find({ _id: { $in: ids } }).populate('book');
    res.status(201).json(Array.isArray(result) ? populatedCopies : populatedCopies[0]);
  } catch (error) {
    next(error);
  }
};

export const getBookCopies = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const copies = await bookCopyService.getAllBookCopies({ ...req.query, library: libraryId });
    res.json(copies);
  } catch (error) {
    next(error);
  }
};

export const getAvailableCopies = async (req, res, next) => {
  try {
    const { bookId, type } = req.query;
    const libraryId = getLibraryId(req);
    let copies;
    if (type === 'borrow') {
      copies = await bookCopyService.getAvailableBorrowCopies(bookId, libraryId);
    } else if (type === 'sell') {
      copies = await bookCopyService.getAvailableSellCopies(bookId, libraryId);
    } else {
      copies = await bookCopyService.getAllAvailableCopies(libraryId);
    }
    res.json(copies);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateBookCopies = async (req, res, next) => {
  try {
    const { ids, ...updates } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' });
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'At least one field to update is required' });
    }
    await bookCopyService.bulkUpdateBookCopies(ids, updates);
    res.json({ message: `${ids.length} copies updated successfully` });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteBookCopies = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' });
    }
    await bookCopyService.deleteBulkBookCopies(ids);
    res.json({ message: `${ids.length} copies deleted successfully` });
  } catch (error) {
    next(error);
  }
};
