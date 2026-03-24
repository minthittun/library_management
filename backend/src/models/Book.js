import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  publisher: { type: String, required: true },
  publishedYear: { type: Number, required: true }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
