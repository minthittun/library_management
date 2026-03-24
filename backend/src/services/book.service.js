import Book from '../models/Book.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createBook = async (bookData) => {
  const book = new Book(bookData);
  return await book.save();
};

export const getAllBooks = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const query = {};
  if (searchRegex) {
    const orConditions = [
      { title: searchRegex },
      { author: searchRegex },
      { isbn: searchRegex },
      { category: searchRegex },
      { publisher: searchRegex },
    ];
    const numericSearch = Number(params.search);
    if (!Number.isNaN(numericSearch)) {
      orConditions.push({ publishedYear: numericSearch });
    }
    query.$or = orConditions;
  }

  const total = await Book.countDocuments(query);
  const data = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return buildPaginatedResponse(data, page, limit, total);
};

export const getBookById = async (id) => {
  return await Book.findById(id);
};

export const updateBook = async (id, bookData) => {
  return await Book.findByIdAndUpdate(id, bookData, { new: true });
};

export const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};
