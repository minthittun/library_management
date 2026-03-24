import * as borrowService from '../services/borrow.service.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.body.library || req.query.library || null;
  }
  return req.user.libraries?.[0] || null;
};

export const borrowBook = async (req, res, next) => {
  try {
    const { memberId, bookCopyId } = req.body;
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const transaction = await borrowService.borrowBook(memberId, bookCopyId, libraryId);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const transaction = await borrowService.returnBook(req.params.id);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getBorrowRecords = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const transactions = await borrowService.getAllBorrowTransactions({ ...req.query, library: libraryId });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const getBorrowRecordById = async (req, res, next) => {
  try {
    const transaction = await borrowService.getBorrowTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getMemberBorrowHistory = async (req, res, next) => {
  try {
    const transactions = await borrowService.getMemberBorrowHistory(req.params.memberId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};
