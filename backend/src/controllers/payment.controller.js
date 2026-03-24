import * as paymentService from '../services/payment.service.js';

const getLibraryId = (req) => {
  if (req.user.role === 'superadmin') {
    return req.body.library || req.query.library || null;
  }
  return req.user.library || null;
};

export const createPayment = async (req, res, next) => {
  try {
    const { memberId, amount, monthsExtended } = req.body;
    const libraryId = getLibraryId(req);
    if (!libraryId) {
      return res.status(400).json({ message: 'No library assigned. Please contact admin.' });
    }
    const result = await paymentService.createPayment(memberId, amount, monthsExtended, libraryId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const libraryId = getLibraryId(req);
    const payments = await paymentService.getAllPayments({ ...req.query, library: libraryId });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const getMemberPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getMemberPayments(req.params.memberId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
};
