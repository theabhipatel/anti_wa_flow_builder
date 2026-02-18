import { Request, Response } from 'express';
import { AIApiLog, Bot } from '../models';
import { Types } from 'mongoose';

// ─── Get AI API Logs ────────────────────────────────────────────
export const getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const {
            botId,
            status,
            provider,
            page = '1',
            limit = '25',
        } = req.query;

        // Get all bot IDs owned by this user
        const userBots = await Bot.find({ userId }).select('_id name');
        const userBotIds = userBots.map((b) => b._id);

        if (userBotIds.length === 0) {
            res.json({ success: true, data: { logs: [], total: 0, page: 1, totalPages: 0 } });
            return;
        }

        // Build query
        const query: Record<string, unknown> = {
            botId: { $in: userBotIds },
        };

        if (botId) query.botId = new Types.ObjectId(botId as string);
        if (status) query.status = status;
        if (provider) query.provider = provider;

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            AIApiLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            AIApiLog.countDocuments(query),
        ]);

        // Attach bot name to each log
        const botMap = new Map(userBots.map((b) => [b._id.toString(), b.name]));
        const enrichedLogs = logs.map((log) => ({
            ...log,
            botName: botMap.get(log.botId.toString()) || 'Unknown Bot',
        }));

        res.json({
            success: true,
            data: {
                logs: enrichedLogs,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('[AI Log] Get logs error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch logs' });
    }
};

// ─── Get Usage Stats ────────────────────────────────────────────
export const getUsageStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;

        // Get all bot IDs owned by this user
        const userBots = await Bot.find({ userId }).select('_id name');
        const userBotIds = userBots.map((b) => b._id);

        if (userBotIds.length === 0) {
            res.json({
                success: true,
                data: {
                    totalCalls: 0,
                    successCalls: 0,
                    errorCalls: 0,
                    successRate: 0,
                    totalTokens: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    byProvider: [],
                    byBot: [],
                },
            });
            return;
        }

        const match = { botId: { $in: userBotIds } };

        // Overall stats
        const [overallStats] = await AIApiLog.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalCalls: { $sum: 1 },
                    successCalls: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
                    errorCalls: { $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] } },
                    totalTokens: { $sum: '$totalTokens' },
                    promptTokens: { $sum: '$promptTokens' },
                    completionTokens: { $sum: '$completionTokens' },
                },
            },
        ]);

        // Stats by provider
        const byProvider = await AIApiLog.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$provider',
                    totalCalls: { $sum: 1 },
                    successCalls: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
                    errorCalls: { $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] } },
                    totalTokens: { $sum: '$totalTokens' },
                },
            },
            { $sort: { totalCalls: -1 } },
        ]);

        // Stats by bot
        const byBot = await AIApiLog.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$botId',
                    totalCalls: { $sum: 1 },
                    successCalls: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
                    errorCalls: { $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] } },
                    totalTokens: { $sum: '$totalTokens' },
                },
            },
            { $sort: { totalCalls: -1 } },
        ]);

        // Enrich bot names
        const botMap = new Map(userBots.map((b) => [b._id.toString(), b.name]));
        const enrichedByBot = byBot.map((item) => ({
            ...item,
            botName: botMap.get(item._id.toString()) || 'Unknown Bot',
        }));

        const stats = overallStats || {
            totalCalls: 0,
            successCalls: 0,
            errorCalls: 0,
            totalTokens: 0,
            promptTokens: 0,
            completionTokens: 0,
        };

        res.json({
            success: true,
            data: {
                totalCalls: stats.totalCalls,
                successCalls: stats.successCalls,
                errorCalls: stats.errorCalls,
                successRate: stats.totalCalls > 0
                    ? Math.round((stats.successCalls / stats.totalCalls) * 100)
                    : 0,
                totalTokens: stats.totalTokens,
                promptTokens: stats.promptTokens,
                completionTokens: stats.completionTokens,
                byProvider,
                byBot: enrichedByBot,
            },
        });
    } catch (error) {
        console.error('[AI Log] Get stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch usage stats' });
    }
};
