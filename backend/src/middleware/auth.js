import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'library_secret_key');
    req.user = decoded;
    
    if (decoded.role === 'admin') {
      const user = await User.findById(decoded.id).populate('library');
      if (user?.library) {
        req.user.library = user.library._id.toString();
        req.user.libraryDetails = { id: user.library._id.toString(), name: user.library.name };
      } else {
        req.user.library = null;
        req.user.libraryDetails = null;
      }
    } else {
      req.user.library = null;
      req.user.libraryDetails = null;
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Super Admin access required' });
    }
    req.user.library = null;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    if (!req.user.library) {
      return res.status(403).json({ message: 'No library assigned' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied' });
  }
};

export const requireLibraryAccess = (req, res, next) => {
  const libraryId = req.query.library || req.body.library || req.params.library;
  
  if (!libraryId) {
    return res.status(400).json({ message: 'Library ID is required' });
  }
  
  if (req.user.role === 'superadmin') {
    return next();
  }
  
  if (req.user.library !== libraryId) {
    return res.status(403).json({ message: 'You do not have access to this library' });
  }
  
  next();
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'library_secret_key',
    { expiresIn: '24h' }
  );
};
