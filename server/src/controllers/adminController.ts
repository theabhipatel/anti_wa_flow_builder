import { Request, Response, NextFunction } from 'express';
import { User, Bot, Flow, Session } from '../models';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const botCount = await Bot.countDocuments({ userId: user._id });
                return {
                    ...user.toObject(),
                    botCount,
                };
            })
        );

        res.json({ success: true, data: usersWithStats });
    } catch (error) {
        next(error);
    }
};

export const getAllBots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const bots = await Bot.find().populate('userId', 'email').sort({ createdAt: -1 });

        const botsWithStats = await Promise.all(
            bots.map(async (bot) => {
                const flowCount = await Flow.countDocuments({ botId: bot._id });
                const sessionCount = await Session.countDocuments({ botId: bot._id });

                return {
                    ...bot.toObject(),
                    flowCount,
                    sessionCount,
                };
            })
        );

        res.json({ success: true, data: botsWithStats });
    } catch (error) {
        next(error);
    }
};
