// FILE: server/middleware/roleCheck.js

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

const memberOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'member') {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }
  next();
};

module.exports = { adminOnly, memberOrAdmin };
