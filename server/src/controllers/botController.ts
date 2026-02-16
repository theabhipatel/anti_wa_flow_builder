import { Request, Response, NextFunction } from 'express';
import { Bot, WhatsAppAccount, Flow, FlowVersion, Session } from '../models';
import { encrypt, decrypt } from '../utils/encryption';
import * as whatsappServiceModule from '../services/whatsappService';
import { Types } from 'mongoose';

export const createBot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;
        const userId = req.user!.userId;

        if (!name) {
            res.status(400).json({ success: false, error: 'Bot name is required' });
            return;
        }

        const bot = await Bot.create({ userId, name, description });

        // Auto-create a main flow with a Start node
        const mainFlow = await Flow.create({
            botId: bot._id,
            name: 'Main Flow',
            description: 'The main entry flow for this bot',
            isMainFlow: true,
        });

        const startNodeId = `start_${Date.now()}`;
        await FlowVersion.create({
            flowId: mainFlow._id,
            versionNumber: 1,
            flowData: {
                nodes: [
                    {
                        nodeId: startNodeId,
                        nodeType: 'START',
                        label: 'Start',
                        position: { x: 250, y: 50 },
                        config: {},
                    },
                ],
                edges: [],
                viewport: { x: 0, y: 0, zoom: 1 },
            },
            isDraft: true,
        });

        // Set the main flow as active flow
        await Bot.findByIdAndUpdate(bot._id, { activeFlowId: mainFlow._id });

        res.status(201).json({ success: true, data: bot });
    } catch (error) {
        next(error);
    }
};

export const getBots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const bots = await Bot.find({ userId }).sort({ createdAt: -1 });

        // Get WhatsApp connection status for each bot
        const botsWithStatus = await Promise.all(
            bots.map(async (bot) => {
                const waAccount = await WhatsAppAccount.findOne({ botId: bot._id });
                const flowCount = await Flow.countDocuments({ botId: bot._id });
                const activeSessionCount = await Session.countDocuments({
                    botId: bot._id,
                    status: { $in: ['ACTIVE', 'PAUSED'] },
                });

                return {
                    ...bot.toObject(),
                    isWhatsAppConnected: !!waAccount,
                    phoneNumber: waAccount?.phoneNumber,
                    flowCount,
                    activeSessionCount,
                };
            })
        );

        res.json({ success: true, data: botsWithStatus });
    } catch (error) {
        next(error);
    }
};

export const getBot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        const waAccount = await WhatsAppAccount.findOne({ botId: bot._id });

        res.json({
            success: true,
            data: {
                ...bot.toObject(),
                isWhatsAppConnected: !!waAccount,
                whatsapp: waAccount
                    ? {
                        phoneNumberId: waAccount.phoneNumberId,
                        businessAccountId: waAccount.businessAccountId,
                        phoneNumber: waAccount.phoneNumber,
                    }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateBot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;
        const { name, description } = req.body;

        const bot = await Bot.findOneAndUpdate(
            { _id: botId, userId },
            { name, description },
            { new: true }
        );

        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        res.json({ success: true, data: bot });
    } catch (error) {
        next(error);
    }
};

export const deleteBot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;

        const bot = await Bot.findOneAndDelete({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        // Cleanup related data
        await WhatsAppAccount.deleteMany({ botId });
        await Flow.deleteMany({ botId });
        await Session.deleteMany({ botId });

        res.json({ success: true, message: 'Bot deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const connectWhatsApp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;
        const { phoneNumberId, businessAccountId, accessToken, phoneNumber } = req.body;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        if (!phoneNumberId || !businessAccountId || !accessToken || !phoneNumber) {
            res.status(400).json({ success: false, error: 'All WhatsApp fields are required' });
            return;
        }

        // Validate credentials
        const isValid = await whatsappServiceModule.validateCredentials(phoneNumberId, accessToken);
        if (!isValid) {
            res.status(400).json({ success: false, error: 'Invalid WhatsApp credentials' });
            return;
        }

        // Upsert WhatsApp account
        const encryptedToken = encrypt(accessToken);
        const waAccount = await WhatsAppAccount.findOneAndUpdate(
            { botId },
            {
                phoneNumberId,
                businessAccountId,
                accessToken: encryptedToken,
                phoneNumber,
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: {
                phoneNumberId: waAccount.phoneNumberId,
                businessAccountId: waAccount.businessAccountId,
                phoneNumber: waAccount.phoneNumber,
            },
            message: 'WhatsApp connected successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const disconnectWhatsApp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        await WhatsAppAccount.deleteOne({ botId });

        res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error) {
        next(error);
    }
};
