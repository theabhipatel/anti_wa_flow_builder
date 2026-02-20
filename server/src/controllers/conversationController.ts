import { Request, Response } from 'express';
import { ConversationMessage, Bot, WhatsAppAccount } from '../models';
import { decrypt } from '../utils/encryption';
import * as whatsappService from '../services/whatsappService';

/**
 * GET /api/conversations/:botId
 * List all conversations (unique phone numbers) for a bot with latest message preview.
 * Query params: ?search=phoneNumber&from=ISODate&to=ISODate
 */
export const getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user?.userId;
        const { search, from, to } = req.query;

        // Verify the bot belongs to this user
        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        // Build match filter
        const matchFilter: Record<string, unknown> = { botId: bot._id };

        if (search) {
            matchFilter.userPhoneNumber = { $regex: String(search), $options: 'i' };
        }

        if (from || to) {
            const dateFilter: Record<string, unknown> = {};
            if (from) dateFilter.$gte = new Date(String(from));
            if (to) dateFilter.$lte = new Date(String(to));
            matchFilter.sentAt = dateFilter;
        }

        // Aggregate: group by phone number, get latest message
        const conversations = await ConversationMessage.aggregate([
            { $match: matchFilter },
            { $sort: { sentAt: -1 } },
            {
                $group: {
                    _id: '$userPhoneNumber',
                    lastMessage: { $first: '$messageContent' },
                    lastMessageAt: { $first: '$sentAt' },
                    lastSender: { $first: '$sender' },
                    messageCount: { $sum: 1 },
                },
            },
            { $sort: { lastMessageAt: -1 } },
        ]);

        const result = conversations.map((c) => ({
            phoneNumber: c._id,
            lastMessage: c.lastMessage || '',
            lastMessageAt: c.lastMessageAt,
            lastSender: c.lastSender,
            messageCount: c.messageCount,
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('[Conversations] Error fetching conversations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
};

/**
 * GET /api/conversations/:botId/:phoneNumber/messages
 * Get all messages for a specific conversation.
 * Query params: ?page=1&limit=50
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { botId, phoneNumber } = req.params;
        const userId = req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        // Verify the bot belongs to this user
        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            ConversationMessage.find({
                botId: bot._id,
                userPhoneNumber: phoneNumber,
            })
                .sort({ sentAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ConversationMessage.countDocuments({
                botId: bot._id,
                userPhoneNumber: phoneNumber,
            }),
        ]);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Conversations] Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

/**
 * POST /api/conversations/:botId/:phoneNumber/send
 * Send a manual message to a user via WhatsApp.
 * Body: { message: string }
 */
export const sendManualMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { botId, phoneNumber } = req.params;
        const userId = req.user?.userId;
        const { message } = req.body;

        if (!message || !message.trim()) {
            res.status(400).json({ success: false, error: 'Message is required' });
            return;
        }

        // Verify the bot belongs to this user
        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        // Get WhatsApp credentials
        const waAccount = await WhatsAppAccount.findOne({ botId: bot._id });
        if (!waAccount) {
            res.status(400).json({ success: false, error: 'No WhatsApp account connected to this bot' });
            return;
        }

        const accessToken = decrypt(waAccount.accessToken);

        // Send via WhatsApp API
        await whatsappService.sendTextMessage(
            waAccount.phoneNumberId,
            accessToken,
            String(phoneNumber),
            message.trim()
        );

        // Save to ConversationMessage
        const conversationMsg = await ConversationMessage.create({
            botId: bot._id,
            userPhoneNumber: phoneNumber,
            sender: 'MANUAL',
            messageType: 'TEXT',
            messageContent: message.trim(),
            sentAt: new Date(),
        });

        res.json({ success: true, data: conversationMsg });
    } catch (error) {
        console.error('[Conversations] Error sending manual message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};
