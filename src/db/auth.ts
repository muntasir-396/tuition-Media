import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'tutorlink-secret-key-for-jwt-2026';
// In a real Supabase setup, JWT_SECRET would be your Supabase project JWT secret.

export const generateToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Support both cookie (current) and Bearer token (Supabase standard)
  let token = req.cookies?.tutorlink_auth_token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Supabase stores user ID in decoded.sub, fallback to decoded.id
  (req as any).user = decoded;
  if (typeof decoded !== "string") { (req as any).user.id = decoded.sub || decoded.id; }
  
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  // If integrating with admin_profiles, we would query DB here
  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

export const requireTutor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'tutor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
