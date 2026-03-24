import mongoose from 'mongoose';

const librarySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Library = mongoose.model('Library', librarySchema);
export default Library;
