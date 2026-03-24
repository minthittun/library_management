import mongoose from 'mongoose';
import SaleTransaction from '../models/SaleTransaction.js';
import BorrowTransaction from '../models/BorrowTransaction.js';
import BookCopy from '../models/BookCopy.js';
import Member from '../models/Member.js';
import Book from '../models/Book.js';

export const getDashboardStats = async (params = {}) => {
  const match = {};
  if (params.library) match.library = new mongoose.Types.ObjectId(params.library);

  const totalBooks = await Book.countDocuments(match);
  const totalCopies = await BookCopy.countDocuments(match);
  const borrowedBooks = await BookCopy.countDocuments({ ...match, type: 'borrow', status: 'borrowed' });
  const soldBooks = await BookCopy.countDocuments({ ...match, type: 'sell', status: 'sold' });
  const availableBorrowBooks = await BookCopy.countDocuments({ ...match, type: 'borrow', status: 'available' });
  const availableSellBooks = await BookCopy.countDocuments({ ...match, type: 'sell', status: 'available' });
  const activeMembers = await Member.countDocuments({ ...match, status: 'active' });

  const now = new Date();
  const expiredMembers = await Member.countDocuments({
    ...match,
    status: 'active',
    membershipExpiryDate: { $lt: now }
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const salesMatch = { ...match, soldDate: { $gte: startOfMonth, $lte: endOfMonth } };
  const dailySales = await SaleTransaction.aggregate([
    { $match: salesMatch },
    {
      $group: {
        _id: { $dayOfMonth: '$soldDate' },
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const borrowMatch = { ...match, borrowDate: { $gte: startOfMonth, $lte: endOfMonth } };
  const dailyBorrows = await BorrowTransaction.aggregate([
    { $match: borrowMatch },
    {
      $group: {
        _id: { $dayOfMonth: '$borrowDate' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const overdueMatch = { ...match, status: 'borrowed', dueDate: { $lt: now } };
  const overdueBorrows = await BorrowTransaction.find(overdueMatch)
    .populate('member')
    .populate({ path: 'bookCopy', populate: { path: 'book' } })
    .sort({ dueDate: 1 })
    .limit(10);

  const recentSales = await SaleTransaction.find(match)
    .populate({ path: 'bookCopy', populate: { path: 'book' } })
    .sort({ soldDate: -1 })
    .limit(5);

  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const salesData = fillMissingDays(dailySales, daysInMonth, 'sales');
  const borrowsData = fillMissingDays(dailyBorrows, daysInMonth, 'borrows');

  return {
    totalBooks,
    totalCopies,
    borrowedBooks,
    soldBooks,
    availableBorrowBooks,
    availableSellBooks,
    activeMembers,
    expiredMembers,
    currentMonthName,
    daysInMonth,
    dailySales: salesData,
    dailyBorrows: borrowsData,
    overdueBorrows,
    recentSales
  };
};

const fillMissingDays = (data, daysInMonth, type) => {
  const days = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const found = data.find(d => d._id === i);
    
    days.push({
      day: i,
      count: found ? found.count : 0,
      revenue: found ? found.revenue : 0
    });
  }
  
  return days;
};
