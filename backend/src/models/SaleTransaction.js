import mongoose from 'mongoose';

const saleTransactionSchema = new mongoose.Schema({
  bookCopy: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  price: { type: Number, required: true },
  soldDate: { type: Date, default: Date.now },
  soldBy: { type: String, required: true }
}, { timestamps: true });

const SaleTransaction = mongoose.model('SaleTransaction', saleTransactionSchema);
export default SaleTransaction;
