import { create } from 'zustand';
import { bookAPI, memberAPI, borrowAPI, saleAPI, paymentAPI } from '../api';

const useStore = create((set, get) => ({
  books: [],
  bookCopies: [],
  members: [],
  borrowRecords: [],
  sales: [],
  payments: [],
  booksMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  bookCopiesMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  membersMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  borrowMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  salesMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  paymentsMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchBooks: async (params) => {
    set({ loading: true });
    try {
      const res = await bookAPI.getBooks(params);
      set({
        books: res.data.data,
        booksMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBookCopies: async (params) => {
    set({ loading: true });
    try {
      const res = await bookAPI.getBookCopies(params);
      set({
        bookCopies: res.data.data,
        bookCopiesMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchAvailableCopies: async (params) => {
    try {
      const res = await bookAPI.getAvailableCopies(params);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addBook: async (data) => {
    try {
      const res = await bookAPI.createBook(data);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addBookCopy: async (data) => {
    try {
      const res = await bookAPI.createBookCopy(data);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchMembers: async (params) => {
    set({ loading: true });
    try {
      const res = await memberAPI.getMembers(params);
      set({
        members: res.data.data,
        membersMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addMember: async (data) => {
    try {
      const res = await memberAPI.createMember(data);
      set((state) => ({ members: [res.data, ...state.members] }));
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchBorrowRecords: async (params) => {
    set({ loading: true });
    try {
      const res = await borrowAPI.getBorrowRecords(params);
      set({
        borrowRecords: res.data.data,
        borrowMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBorrowOptions: async (params) => {
    try {
      const res = await borrowAPI.getBorrowRecords(params);
      return res.data.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  borrowBook: async (data) => {
    try {
      const res = await borrowAPI.borrowBook(data);
      set((state) => ({ borrowRecords: [res.data, ...state.borrowRecords] }));
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  returnBook: async (id) => {
    try {
      const res = await borrowAPI.returnBook(id);
      set((state) => ({
        borrowRecords: state.borrowRecords.map((r) =>
          r._id === id ? res.data : r
        )
      }));
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchSales: async (params) => {
    set({ loading: true });
    try {
      const res = await saleAPI.getSales(params);
      set({
        sales: res.data.data,
        salesMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sellBook: async (data) => {
    try {
      const res = await saleAPI.sellBook(data);
      set((state) => ({ sales: [res.data, ...state.sales] }));
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  checkoutSale: async (data) => {
    try {
      const res = await saleAPI.checkout(data);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchPayments: async (params) => {
    set({ loading: true });
    try {
      const res = await paymentAPI.getPayments(params);
      set({
        payments: res.data.data,
        paymentsMeta: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
        loading: false,
      });
      return res.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createPayment: async (data) => {
    try {
      const res = await paymentAPI.createPayment(data);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getStats: async () => {
    try {
      const [booksRes, activeMembersRes, borrowedRes, salesRes] = await Promise.all([
        bookAPI.getBooks({ page: 1, limit: 1 }),
        memberAPI.getMembers({ page: 1, limit: 1, status: 'active' }),
        borrowAPI.getBorrowRecords({ page: 1, limit: 1, status: 'borrowed' }),
        saleAPI.getSales({ page: 1, limit: 1 })
      ]);

      const totalBooks = booksRes.data.total || 0;
      const borrowedBooks = borrowedRes.data.total || 0;
      const soldBooks = salesRes.data.total || 0;
      const activeMembers = activeMembersRes.data.total || 0;

      return { totalBooks, borrowedBooks, soldBooks, activeMembers };
    } catch (error) {
      set({ error: error.message });
      return { totalBooks: 0, borrowedBooks: 0, soldBooks: 0, activeMembers: 0 };
    }
  }
}));

export default useStore;
