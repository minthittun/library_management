import * as saleService from '../services/sale.service.js';

export const sellBook = async (req, res, next) => {
  try {
    const { bookCopyId, soldBy } = req.body;
    const transaction = await saleService.sellBook(bookCopyId, soldBy);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const sales = await saleService.getAllSales(req.query);
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const checkoutSale = async (req, res, next) => {
  try {
    const result = await saleService.checkoutSale(req.body);
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
