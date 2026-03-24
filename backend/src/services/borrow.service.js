import mongoose from 'mongoose';
import BorrowTransaction from '../models/BorrowTransaction.js';
import BookCopy from '../models/BookCopy.js';
import Member from '../models/Member.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const borrowBook = async (memberId, bookCopyId, libraryId) => {
  if (!libraryId) throw new Error('Library ID is required');
  
  const member = await Member.findById(memberId);
  if (!member) throw new Error('Member not found');
  
  if (member.status !== 'active') {
    throw new Error('Membership is not active');
  }
  
  if (new Date(member.membershipExpiryDate) < new Date()) {
    throw new Error('Membership expired');
  }
  
  const bookCopy = await BookCopy.findById(bookCopyId);
  if (!bookCopy) throw new Error('Book copy not found');
  
  if (bookCopy.library.toString() !== libraryId) {
    throw new Error('Book copy does not belong to your library');
  }
  
  if (bookCopy.type !== 'borrow') {
    throw new Error('This copy is not available for borrowing');
  }
  
  if (bookCopy.status !== 'available') {
    throw new Error('Book copy is not available');
  }
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  
  const transaction = new BorrowTransaction({
    member: memberId,
    bookCopy: bookCopyId,
    library: libraryId,
    borrowDate: new Date(),
    dueDate,
    status: 'borrowed'
  });
  
  await transaction.save();
  
  await BookCopy.findByIdAndUpdate(bookCopyId, { status: 'borrowed' });
  
  return transaction;
};

export const returnBook = async (transactionId) => {
  const transaction = await BorrowTransaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');
  
  if (transaction.status === 'returned') {
    throw new Error('Book already returned');
  }
  
  transaction.returnDate = new Date();
  transaction.status = 'returned';
  
  await transaction.save();
  
  await BookCopy.findByIdAndUpdate(transaction.bookCopy, { status: 'available' });
  
  return transaction;
};

export const getAllBorrowTransactions = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const match = {};
  if (params.library) match.library = new mongoose.Types.ObjectId(params.library);
  if (params.status) match.status = params.status;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'member'
      }
    },
    { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'bookcopies',
        localField: 'bookCopy',
        foreignField: '_id',
        as: 'bookCopy'
      }
    },
    { $unwind: { path: '$bookCopy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'books',
        localField: 'bookCopy.book',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
    { $addFields: { 'bookCopy.book': '$book' } },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { 'member.name': searchRegex },
          { 'bookCopy.book.title': searchRegex },
          { 'bookCopy.barcode': searchRegex },
          { status: searchRegex },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { borrowDate: -1 } },
    {
      $project: {
        book: 0,
      }
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
      },
    }
  );

  const [result] = await BorrowTransaction.aggregate(pipeline);
  return buildPaginatedResponse(result.data, page, limit, result.total);
};

export const getBorrowTransactionById = async (id) => {
  return await BorrowTransaction.findById(id)
    .populate('member')
    .populate('bookCopy');
};

export const getMemberBorrowHistory = async (memberId) => {
  return await BorrowTransaction.find({ member: memberId })
    .populate({ 
      path: 'bookCopy',
      populate: { path: 'book' }
    })
    .sort({ borrowDate: -1 });
};
