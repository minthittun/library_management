import * as bookService from '../services/book.service.js';
import * as bookCopyService from '../services/bookCopy.service.js';
import BookCopy from '../models/BookCopy.js';

export const createBook = async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const books = await bookService.getAllBooks(req.query);
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
    const copy = await bookCopyService.createBookCopy(req.body);
    const populatedCopy = await BookCopy.findById(copy._id).populate('book');
    res.status(201).json(populatedCopy);
  } catch (error) {
    next(error);
  }
};

export const getBookCopies = async (req, res, next) => {
  try {
    const copies = await bookCopyService.getAllBookCopies(req.query);
    res.json(copies);
  } catch (error) {
    next(error);
  }
};

export const getAvailableCopies = async (req, res, next) => {
  try {
    const { bookId, type } = req.query;
    let copies;
    if (type === 'borrow') {
      copies = await bookCopyService.getAvailableBorrowCopies(bookId);
    } else if (type === 'sell') {
      copies = await bookCopyService.getAvailableSellCopies(bookId);
    } else {
      copies = await bookCopyService.getAllAvailableCopies();
    }
    res.json(copies);
  } catch (error) {
    next(error);
  }
};
