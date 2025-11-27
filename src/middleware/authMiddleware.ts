import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try{
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  const data = decoded as { id: string; email: string; role: string };
  const userDB = await User.findById(data.id).select("-password");
  if(userDB) (req as any).user = userDB;
  next();
  } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
