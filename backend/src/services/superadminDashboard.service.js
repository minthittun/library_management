import SaleTransaction from '../models/SaleTransaction.js';
import BorrowTransaction from '../models/BorrowTransaction.js';
import BookCopy from '../models/BookCopy.js';
import Member from '../models/Member.js';
import Book from '../models/Book.js';
import Library from '../models/Library.js';
import User from '../models/User.js';

export const getSuperAdminDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const libraries = await Library.find();
  const totalLibraries = libraries.length;
  const activeLibraries = await Library.countDocuments({ isActive: true });

  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });

  const totalBooks = await Book.countDocuments();
  const totalCopies = await BookCopy.countDocuments();
  const availableCopies = await BookCopy.countDocuments({ status: 'available' });
  const borrowedCopies = await BookCopy.countDocuments({ type: 'borrow', status: 'borrowed' });
  const soldCopies = await BookCopy.countDocuments({ type: 'sell', status: 'sold' });

  const activeMembers = await Member.countDocuments({ status: 'active' });
  const expiredMembers = await Member.countDocuments({
    status: 'active',
    membershipExpiryDate: { $lt: now }
  });

  const monthlySales = await SaleTransaction.aggregate([
    {
      $match: {
        soldDate: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$price' },
        totalSales: { $sum: 1 }
      }
    }
  ]);

  const monthlyBorrows = await BorrowTransaction.countDocuments({
    borrowDate: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const overdueBorrows = await BorrowTransaction.find({
    status: 'borrowed',
    dueDate: { $lt: now }
  })
    .populate('member')
    .populate({ path: 'bookCopy', populate: { path: 'book' } })
    .sort({ dueDate: 1 })
    .limit(10);

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

  const recentSales = await SaleTransaction.find()
    .populate({ path: 'bookCopy', populate: { path: 'book' } })
    .sort({ soldDate: -1 })
    .limit(5);

  const libraryStats = await Promise.all(
    libraries.map(async (library) => {
      const libraryId = library._id;
      const [bookCount, memberCount, salesCount] = await Promise.all([
        Book.countDocuments({ library: libraryId }),
        Member.countDocuments({ library: libraryId }),
        SaleTransaction.countDocuments({ library: libraryId })
      ]);
      const salesRevenue = await SaleTransaction.aggregate([
        { $match: { library: libraryId } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);
      return {
        library: library.name,
        libraryId: library._id,
        isActive: library.isActive,
        bookCount,
        memberCount,
        salesCount,
        totalRevenue: salesRevenue[0]?.total || 0
      };
    })
  );

  const salesData = fillMissingDays(dailySales, daysInMonth, 'sales');
  const borrowsData = fillMissingDays(dailyBorrows, daysInMonth, 'borrows');

  return {
    summary: {
      totalLibraries,
      activeLibraries,
      totalAdmins,
      activeAdmins,
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      soldCopies,
      activeMembers,
      expiredMembers,
      monthlyRevenue: monthlySales[0]?.totalRevenue || 0,
      monthlySales: monthlySales[0]?.totalSales || 0,
      monthlyBorrows,
      currentMonthName: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    libraryStats,
    dailySales: salesData,
    dailyBorrows: borrowsData,
    overdueBorrows,
    recentSales,
    daysInMonth
  };
};

const fillMissingDays = (data, daysInMonth) => {
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
