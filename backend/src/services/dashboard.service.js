import SaleTransaction from '../models/SaleTransaction.js';
import BorrowTransaction from '../models/BorrowTransaction.js';
import BookCopy from '../models/BookCopy.js';
import Member from '../models/Member.js';
import Book from '../models/Book.js';

export const getDashboardStats = async () => {
  const totalBooks = await Book.countDocuments();
  const totalCopies = await BookCopy.countDocuments();
  const borrowedBooks = await BookCopy.countDocuments({ type: 'borrow', status: 'borrowed' });
  const soldBooks = await BookCopy.countDocuments({ type: 'sell', status: 'sold' });
  const availableBorrowBooks = await BookCopy.countDocuments({ type: 'borrow', status: 'available' });
  const availableSellBooks = await BookCopy.countDocuments({ type: 'sell', status: 'available' });
  const activeMembers = await Member.countDocuments({ status: 'active' });

  const now = new Date();
  const expiredMembers = await Member.countDocuments({
    status: 'active',
    membershipExpiryDate: { $lt: now }
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const dailySales = await SaleTransaction.aggregate([
    {
      $match: {
        soldDate: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: { $dayOfMonth: '$soldDate' },
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const dailyBorrows = await BorrowTransaction.aggregate([
    {
      $match: {
        borrowDate: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: { $dayOfMonth: '$borrowDate' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const overdueBorrows = await BorrowTransaction.find({
    status: 'borrowed',
    dueDate: { $lt: now }
  })
    .populate('member')
    .populate({ path: 'bookCopy', populate: { path: 'book' } })
    .sort({ dueDate: 1 })
    .limit(10);

  const recentSales = await SaleTransaction.find()
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
