import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { IJwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRATION = '24h';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, error: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
            return;
        }

        const payload: IJwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, error: 'Email and password are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ success: false, error: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            role: 'USER',
        });

        const payload: IJwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};
