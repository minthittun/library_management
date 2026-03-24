import mongoose from 'mongoose';
import SaleTransaction from '../models/SaleTransaction.js';
import BookCopy from '../models/BookCopy.js';
import { buildPaginatedResponse, normalizePagination } from '../utils/pagination.js';
import { buildSearchRegex } from '../utils/search.js';

export const sellBook = async (bookCopyId, soldBy, libraryId) => {
  if (!libraryId) throw new Error('Library ID is required');
  
  const bookCopy = await BookCopy.findById(bookCopyId).populate('book');
  if (!bookCopy) throw new Error('Book copy not found');
  
  if (bookCopy.library.toString() !== libraryId) {
    throw new Error('Book copy does not belong to your library');
  }
  
  if (bookCopy.type !== 'sell') {
    throw new Error('This copy is not available for sale');
  }
  
  if (bookCopy.status !== 'available') {
    throw new Error('Book copy is not available');
  }
  
  const transaction = new SaleTransaction({
    bookCopy: bookCopyId,
    library: libraryId,
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
  const match = {};
  
  if (params.library) match.library = new mongoose.Types.ObjectId(params.library);
  
  if (params.from) {
    const fromDate = new Date(params.from);
    if (!Number.isNaN(fromDate.getTime())) {
      match.soldDate = { $gte: fromDate };
    }
  }
  if (params.to) {
    const toDate = new Date(params.to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      if (match.soldDate) {
        match.soldDate.$lte = toDate;
      } else {
        match.soldDate = { $lte: toDate };
      }
    }
  }

  const pipeline = [{ $match: match }];

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
  libraryId,
  discountPct = 0,
  taxPct = 0,
  payAmount = 0,
}) => {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  const normalizedItems = items.map((item) => ({
    bookId: item.bookId,
    copyId: item.copyId,
    quantity: Math.max(parseInt(item.quantity, 10) || 0, 0),
  }));

  for (const item of normalizedItems) {
    if (!item.bookId || item.quantity <= 0) {
      throw new Error("Invalid cart item");
    }
  }

  const sales = [];
  let subtotal = 0;

  for (let i = 0; i < normalizedItems.length; i++) {
    const item = normalizedItems[i];
    let copies;

    const baseQuery = {
      type: "sell",
      status: "available",
    };
    if (libraryId) baseQuery.library = libraryId;

    if (item.copyId) {
      copies = await BookCopy.find({
        _id: item.copyId,
        ...baseQuery,
      }).populate("book");
    } else {
      copies = await BookCopy.find({
        book: item.bookId,
        ...baseQuery,
      })
        .sort({ createdAt: 1 })
        .limit(item.quantity)
        .populate("book");
    }

    if (copies.length < item.quantity) {
      throw new Error("Not enough available copies for a book");
    }

    const discountAmount = (subtotal * (Number(discountPct) || 0)) / 100;
    const taxable = subtotal - discountAmount;
    const taxAmount = (taxable * (Number(taxPct) || 0)) / 100;
    const total = taxable + taxAmount;
    const change = Math.max(0, Number(payAmount) - total);

    const saleDocs = copies.map((copy, idx) => ({
      bookCopy: copy._id,
      library: libraryId,
      price: copy.price,
      payAmount: idx === 0 ? Number(payAmount) : 0,
      change: idx === 0 ? change : 0,
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

  const finalSubtotal = subtotal;
  const finalDiscountAmount = (finalSubtotal * (Number(discountPct) || 0)) / 100;
  const finalTaxable = finalSubtotal - finalDiscountAmount;
  const finalTaxAmount = (finalTaxable * (Number(taxPct) || 0)) / 100;
  const total = finalTaxable + finalTaxAmount;
  const finalChange = Math.max(0, Number(payAmount) - total);

  await SaleTransaction.updateMany(
    { _id: { $in: sales.map(s => s._id) } },
    { $set: { payAmount: Number(payAmount), change: finalChange } }
  );

  return {
    sales,
    summary: {
      subtotal: finalSubtotal,
      discountPct: Number(discountPct) || 0,
      discountAmount: finalDiscountAmount,
      taxPct: Number(taxPct) || 0,
      taxAmount: finalTaxAmount,
      total,
      payAmount: Number(payAmount),
      change: finalChange,
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
