import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getUsers: () => api.get("/auth/users"),
  getUser: (id) => api.get(`/auth/users/${id}`),
  createUser: (data) => api.post("/auth/users", data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const libraryAPI = {
  getLibraries: (params) => api.get("/libraries", { params }),
  getLibrary: (id) => api.get(`/libraries/${id}`),
  createLibrary: (data) => api.post("/libraries", data),
  updateLibrary: (id, data) => api.put(`/libraries/${id}`, data),
  deleteLibrary: (id) => api.delete(`/libraries/${id}`),
};

export const bookAPI = {
  getBooks: (params) => api.get("/books", { params }),
  getBook: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post("/books", data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  getBookCopies: (params) => api.get("/book-copies", { params }),
  createBookCopy: (data) => api.post("/book-copies", data),
  getAvailableCopies: (params) => api.get("/available-copies", { params }),
  bulkUpdateBookCopies: (ids, updates) => api.put("/book-copies/bulk", { ids, ...updates }),
  bulkDeleteBookCopies: (ids) => api.delete("/book-copies/bulk", { data: { ids } }),
};

export const memberAPI = {
  getMembers: (params) => api.get("/members", { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post("/members", data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  checkMembership: (id) => api.get(`/members/${id}/check`),
};

export const borrowAPI = {
  getBorrowRecords: (params) => api.get("/borrow", { params }),
  borrowBook: (data) => api.post("/borrow", data),
  returnBook: (id) => api.post(`/return/${id}`),
  getMemberBorrowHistory: (memberId) =>
    api.get(`/member/${memberId}/borrow-history`),
};

export const saleAPI = {
  getSales: (params) => api.get("/sales", { params }),
  sellBook: (data) => api.post("/sales", data),
  checkout: (data) => api.post("/sales/checkout", data),
};

export const paymentAPI = {
  getPayments: (params) => api.get("/payments", { params }),
  createPayment: (data) => api.post("/payments", data),
  getMemberPayments: (memberId) => api.get(`/member/${memberId}/payments`),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard"),
  getSuperAdminStats: () => api.get("/superadmin/dashboard"),
};

export default api;
