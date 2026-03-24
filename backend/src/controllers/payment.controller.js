import * as paymentService from '../services/payment.service.js';

export const createPayment = async (req, res, next) => {
  try {
    const { memberId, amount, monthsExtended } = req.body;
    const result = await paymentService.createPayment(memberId, amount, monthsExtended);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments(req.query);
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
