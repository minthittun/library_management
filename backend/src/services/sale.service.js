import SaleTransaction from '../models/SaleTransaction.js';
import BookCopy from '../models/BookCopy.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const sellBook = async (bookCopyId, soldBy) => {
  const bookCopy = await BookCopy.findById(bookCopyId).populate('book');
  if (!bookCopy) throw new Error('Book copy not found');
  
  if (bookCopy.type !== 'sell') {
    throw new Error('This copy is not available for sale');
  }
  
  if (bookCopy.status !== 'available') {
    throw new Error('Book copy is not available');
  }
  
  const transaction = new SaleTransaction({
    bookCopy: bookCopyId,
    price: bookCopy.price,
    soldDate: new Date(),
    soldBy
  });
  
  await transaction.save();
  
  await BookCopy.findByIdAndUpdate(bookCopyId, { status: 'sold' });
  
  return transaction;
};

export const getAllSales = async (params = {}) => {
  const { page, limit, skip } = normalizePagination(params);
  const searchRegex = buildSearchRegex(params.search);
  const dateMatch = {};
  if (params.from) {
    const fromDate = new Date(params.from);
    if (!Number.isNaN(fromDate.getTime())) {
      dateMatch.$gte = fromDate;
    }
  }
  if (params.to) {
    const toDate = new Date(params.to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      dateMatch.$lte = toDate;
    }
  }

  const pipeline = [];

  if (Object.keys(dateMatch).length > 0) {
    pipeline.push({ $match: { soldDate: dateMatch } });
  }

  pipeline.push(
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
  );

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { 'bookCopy.book.title': searchRegex },
          { soldBy: searchRegex },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { soldDate: -1 } },
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

  const [result] = await SaleTransaction.aggregate(pipeline);
  return buildPaginatedResponse(result.data, page, limit, result.total);
};

export const checkoutSale = async ({
  items,
  soldBy,
  discountPct = 0,
  taxPct = 0,
}) => {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  const normalizedItems = items.map((item) => ({
    bookId: item.bookId,
    quantity: Math.max(parseInt(item.quantity, 10) || 0, 0),
  }));

  for (const item of normalizedItems) {
    if (!item.bookId || item.quantity <= 0) {
      throw new Error("Invalid cart item");
    }
  }

  const sales = [];
  let subtotal = 0;

  for (const item of normalizedItems) {
    const copies = await BookCopy.find({
      book: item.bookId,
      type: "sell",
      status: "available",
    })
      .sort({ createdAt: 1 })
      .limit(item.quantity)
      .populate("book");

    if (copies.length < item.quantity) {
      throw new Error("Not enough available copies for a book");
    }

    const saleDocs = copies.map((copy) => ({
      bookCopy: copy._id,
      price: copy.price,
      soldDate: new Date(),
      soldBy,
    }));

    const created = await SaleTransaction.insertMany(saleDocs);
    sales.push(...created);

    await BookCopy.updateMany(
      { _id: { $in: copies.map((c) => c._id) } },
      { $set: { status: "sold" } },
    );

    subtotal += copies.reduce((sum, c) => sum + (c.price || 0), 0);
  }

  const discountAmount = (subtotal * (Number(discountPct) || 0)) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * (Number(taxPct) || 0)) / 100;
  const total = taxable + taxAmount;

  return {
    sales,
    summary: {
      subtotal,
      discountPct: Number(discountPct) || 0,
      discountAmount,
      taxPct: Number(taxPct) || 0,
      taxAmount,
      total,
    },
  };
};

export const getSaleById = async (id) => {
  return await SaleTransaction.findById(id)
    .populate({ 
      path: 'bookCopy',
      populate: { path: 'book' }
    });
};
