import { Request, Response, NextFunction } from 'express';
import { Bot, Flow, FlowVersion, Session, Message } from '../models';
import * as executionService from '../services/executionService';
import * as sessionService from '../services/sessionService';

export const sendSimulatorMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { botId, flowId, phoneNumber, message, buttonId } = req.body;

        // Verify ownership
        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        // Get latest draft version
        const draftVersion = await FlowVersion.findOne({ flowId, isDraft: true })
            .sort({ versionNumber: -1 });

        if (!draftVersion) {
            res.status(404).json({ success: false, error: 'No draft version found' });
            return;
        }

        const testPhone = phoneNumber || '+1000000000';

        // Find or create test session
        let session = await sessionService.findOrCreateSession(
            bot._id,
            testPhone,
            draftVersion._id,
            true
        );

        // Handle keywords and fallback before executing flow
        const keywordResult = await executionService.handleIncomingMessageWithKeywords(
            session,
            message,
            buttonId,
            true
        );

        let result;
        if (keywordResult.handled) {
            result = { responses: keywordResult.responses || [] };
            if (keywordResult.newSession) {
                session = keywordResult.newSession;
            }
        } else {
            // Normal flow execution
            result = await executionService.executeFlow(session, message, buttonId, true);
        }

        // Get updated session info
        const updatedSession = await Session.findById(session._id);
        const sessionVars = await import('../models').then((m) =>
            m.SessionVariable.find({ sessionId: session._id })
        );

        res.json({
            success: true,
            data: {
                responses: result.responses,
                session: {
                    id: updatedSession?._id,
                    status: updatedSession?.status,
                    currentNodeId: updatedSession?.currentNodeId,
                },
                variables: sessionVars.map((v) => ({
                    name: v.variableName,
                    value: v.variableValue,
                    type: v.variableType,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const resetSimulatorSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { botId, phoneNumber } = req.body;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        const testPhone = phoneNumber || '+1000000000';

        // Close all active sessions for this test
        await Session.updateMany(
            { botId, userPhoneNumber: testPhone, isTest: true, status: { $in: ['ACTIVE', 'PAUSED'] } },
            { status: 'CLOSED', closedAt: new Date() }
        );

        res.json({ success: true, message: 'Simulator session reset' });
    } catch (error) {
        next(error);
    }
};

export const getSimulatorLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { sessionId } = req.params;

        // Load execution logs for the session
        const executionLogs = await import('../models').then((m) =>
            m.ExecutionLog.find({ sessionId }).sort({ executedAt: 1 })
        );

        const messages = await Message.find({ sessionId }).sort({ sentAt: 1 });

        res.json({
            success: true,
            data: {
                executionLogs,
                messages,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Poll for new simulator messages (used after DELAY nodes resume)
 * The frontend calls this periodically when the session is paused with a delay
 */
export const pollSimulatorMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { botId, since } = req.query;

        if (!botId) {
            res.status(400).json({ success: false, error: 'botId is required' });
            return;
        }

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        const testPhone = '+1000000000';

        // Find the current test session
        const session = await Session.findOne({
            botId,
            userPhoneNumber: testPhone,
            isTest: true,
            status: { $in: ['ACTIVE', 'PAUSED'] },
        }).sort({ createdAt: -1 });

        if (!session) {
            res.json({
                success: true,
                data: { messages: [], sessionStatus: null, isWaiting: false },
            });
            return;
        }

        // Get new messages since the given timestamp
        const sinceDate = since ? new Date(since as string) : new Date(0);
        const newMessages = await Message.find({
            sessionId: session._id,
            sender: 'BOT',
            sentAt: { $gt: sinceDate },
        }).sort({ sentAt: 1 });

        // Format messages for the simulator
        const responses = newMessages.map((msg) => ({
            type: (msg.messageType === 'BUTTON' || msg.messageType === 'LIST') ? 'button' : 'text',
            content: msg.messageContent || '',
            sentAt: msg.sentAt,
        }));

        res.json({
            success: true,
            data: {
                messages: responses,
                sessionStatus: session.status,
                isWaiting: session.status === 'PAUSED' && !!session.resumeAt,
                resumeAt: session.resumeAt,
            },
        });
    } catch (error) {
        next(error);
    }
};
