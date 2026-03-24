import mongoose from 'mongoose';

const saleTransactionSchema = new mongoose.Schema({
  bookCopy: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  library: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  price: { type: Number, required: true },
  payAmount: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  soldDate: { type: Date, default: Date.now },
  soldBy: { type: String, required: true }
}, { timestamps: true });

const SaleTransaction = mongoose.model('SaleTransaction', saleTransactionSchema);
export default SaleTransaction;
