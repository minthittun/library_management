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
  library: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Library' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.path("library").validate(function validateLibrary(value) {
  if (this.role !== "admin") return true;
  return !!value;
}, "Admin must be assigned to exactly one library");

const User = mongoose.model('User', userSchema);
export default User;
