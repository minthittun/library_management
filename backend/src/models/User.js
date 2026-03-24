import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin'], 
    default: 'admin' 
  },
  libraries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Library' 
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
