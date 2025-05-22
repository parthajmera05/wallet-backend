import jwt from 'jsonwebtoken';

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.adminId) return res.status(403).json({ message: 'Not an admin token' });

    req.admin = { id: decoded.adminId };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired admin token' });
  }
}
