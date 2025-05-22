import jwt from 'jsonwebtoken';

export function generateToken(id, type = 'user'){
    const payload = type === 'admin' ? { adminId: id } : { userId: id };
  
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
}
  
