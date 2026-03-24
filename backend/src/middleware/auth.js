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
      const user = await User.findById(decoded.id).populate('libraries');
      if (user) {
        req.user.libraries = user.libraries.map(l => l._id.toString());
        req.user.libraryDetails = user.libraries.map(l => ({ id: l._id.toString(), name: l.name }));
      }
    } else {
      req.user.libraries = [];
      req.user.libraryDetails = [];
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
    req.user.libraries = [];
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
    if (!req.user.libraries || req.user.libraries.length === 0) {
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
  
  if (!req.user.libraries.includes(libraryId)) {
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
