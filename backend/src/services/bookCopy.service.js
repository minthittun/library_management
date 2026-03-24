import BookCopy from '../models/BookCopy.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createBookCopy = async (copyData) => {
  const copy = new BookCopy(copyData);
  return await copy.save();
};

export const getAllBookCopies = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);

  const match = {};
  if (params.type) match.type = params.type;
  if (params.status) match.status = params.status;
  if (params.bookId) match.book = params.bookId;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { barcode: searchRegex },
          { type: searchRegex },
          { status: searchRegex },
          { 'book.title': searchRegex },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
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

  const [result] = await BookCopy.aggregate(pipeline);
  return buildPaginatedResponse(result.data, page, limit, result.total);
};

export const getBookCopyById = async (id) => {
  return await BookCopy.findById(id).populate('book');
};

export const getAvailableBorrowCopies = async (bookId) => {
  return await BookCopy.find({ 
    book: bookId, 
    type: 'borrow', 
    status: 'available' 
  }).populate('book');
};

export const getAvailableSellCopies = async (bookId) => {
  return await BookCopy.find({ 
    book: bookId, 
    type: 'sell', 
    status: 'available' 
  }).populate('book');
};

export const getAllAvailableCopies = async () => {
  return await BookCopy.find({ status: 'available' })
    .populate('book')
    .sort({ createdAt: -1 });
};

export const updateBookCopyStatus = async (id, status) => {
  return await BookCopy.findByIdAndUpdate(id, { status }, { new: true });
};
