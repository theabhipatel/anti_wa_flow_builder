import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IJwtPayload, TUserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

export const authorize = (...roles: TUserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};
