import mongoose from 'mongoose';

const borrowTransactionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  bookCopy: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  library: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' }
}, { timestamps: true });

const BorrowTransaction = mongoose.model('BorrowTransaction', borrowTransactionSchema);
export default BorrowTransaction;
