import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const secret = process.env.JWT_SECRET || 'oilsync_enterprise_jwt_secret_key_2026_raghul_secure';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded.sub).select('-password');
    if (!user && decoded.email) {
      // Also look up by email in case token payload contains email
      const userByEmail = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
      if (userByEmail) {
        req.user = userByEmail;
        return next();
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'Administrator') {
      return next(); // Administrators have global access
    }

    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

export default { authenticateToken, requireRole };
