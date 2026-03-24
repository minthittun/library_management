import mongoose from 'mongoose';

const bookCopySchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  type: { type: String, enum: ['borrow', 'sell'], required: true },
  status: { type: String, enum: ['available', 'borrowed', 'sold', 'damaged'], default: 'available' },
  price: { type: Number },
  barcode: { type: String, required: true, unique: true }
}, { timestamps: true });

const BookCopy = mongoose.model('BookCopy', bookCopySchema);
export default BookCopy;
