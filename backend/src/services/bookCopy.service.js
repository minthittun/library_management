import BookCopy from '../models/BookCopy.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const createBookCopy = async (copyData) => {
  if (copyData.quantity && copyData.quantity > 1) {
    const copies = [];
    for (let i = 0; i < copyData.quantity; i++) {
      copies.push({
        book: copyData.book,
        type: copyData.type,
        barcode: generateBarcode(),
        status: 'available',
        price: copyData.price,
      });
    }
    return await BookCopy.insertMany(copies);
  }
  const copy = new BookCopy({
    ...copyData,
    barcode: copyData.barcode || generateBarcode(),
  });
  return await copy.save();
};

const generateBarcode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BK-${timestamp}-${random}`;
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

export const bulkUpdateBookCopies = async (ids, updateData) => {
  return await BookCopy.updateMany(
    { _id: { $in: ids } },
    { $set: updateData },
    { new: true }
  );
};

export const deleteBulkBookCopies = async (ids) => {
  return await BookCopy.deleteMany({ _id: { $in: ids } });
};
