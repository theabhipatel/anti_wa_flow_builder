import { Request, Response, NextFunction } from 'express';
import { Bot, Flow, Session, Message, User } from '../models';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const isAdmin = req.user!.role === 'ADMIN';

        const botFilter = isAdmin ? {} : { userId };

        const totalBots = await Bot.countDocuments(botFilter);
        const botIds = (await Bot.find(botFilter).select('_id')).map((b) => b._id);

        const totalFlows = await Flow.countDocuments(isAdmin ? {} : { botId: { $in: botIds } });
        const activeSessions = await Session.countDocuments({
            botId: { $in: botIds },
            status: { $in: ['ACTIVE', 'PAUSED'] },
        });

        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const messagesSent = await Message.countDocuments({
            sessionId: {
                $in: (
                    await Session.find({ botId: { $in: botIds } }).select('_id')
                ).map((s) => s._id),
            },
            sender: 'BOT',
            sentAt: { $gte: last24h },
        });

        const completedSessions = await Session.countDocuments({
            botId: { $in: botIds },
            status: { $in: ['COMPLETED', 'CLOSED'] },
        });
        const totalSessions = await Session.countDocuments({
            botId: { $in: botIds },
        });
        const completionRate = totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                totalBots,
                totalFlows,
                activeSessions,
                messagesSent24h: messagesSent,
                completionRate,
                totalSessions,
            },
        });
    } catch (error) {
        next(error);
    }
};
