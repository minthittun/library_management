import * as saleService from '../services/sale.service.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.body.library || req.query.library || null;
  }
  return req.user.libraries?.[0] || null;
};

export const sellBook = async (req, res, next) => {
  try {
    const { bookCopyId, soldBy } = req.body;
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const transaction = await saleService.sellBook(bookCopyId, soldBy, libraryId);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const sales = await saleService.getAllSales({ ...req.query, library: libraryId });
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const checkoutSale = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const result = await saleService.checkoutSale({ ...req.body, libraryId });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    next(error);
  }
};
