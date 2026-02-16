import { Session, FlowVersion, Message, SessionVariable, BotVariable } from '../models';
import { Types } from 'mongoose';
import { ISession } from '../types';

/**
 * Find or create a session for a bot + user phone number
 */
export const findOrCreateSession = async (
    botId: Types.ObjectId,
    userPhoneNumber: string,
    flowVersionId: Types.ObjectId,
    isTest: boolean = false
): Promise<ISession> => {
    // Look for an existing active/paused session
    let session = await Session.findOne({
        botId,
        userPhoneNumber,
        status: { $in: ['ACTIVE', 'PAUSED'] },
    }).sort({ createdAt: -1 });

    if (session) {
        return session;
    }

    // Create a new session
    const flowVersion = await FlowVersion.findById(flowVersionId);
    if (!flowVersion) {
        throw new Error('Flow version not found');
    }

    // Find the Start node
    const flowData = flowVersion.flowData;
    const startNode = flowData.nodes.find((n) => n.nodeType === 'START');
    if (!startNode) {
        throw new Error('Flow has no Start node');
    }

    session = await Session.create({
        botId,
        flowVersionId,
        userPhoneNumber,
        currentNodeId: startNode.nodeId,
        status: 'ACTIVE',
        isTest,
    });

    return session;
};

/**
 * Update session state
 */
export const updateSessionState = async (
    sessionId: Types.ObjectId,
    update: Partial<{
        currentNodeId: string;
        status: string;
        resumeAt: Date;
        closedAt: Date;
    }>
): Promise<void> => {
    await Session.findByIdAndUpdate(sessionId, {
        ...update,
        updatedAt: new Date(),
    });
};

/**
 * Close a session
 */
export const closeSession = async (sessionId: Types.ObjectId): Promise<void> => {
    await Session.findByIdAndUpdate(sessionId, {
        status: 'CLOSED',
        closedAt: new Date(),
        updatedAt: new Date(),
    });
};

/**
 * Get conversation history for a session (for AI node)
 */
export const getConversationHistory = async (
    sessionId: Types.ObjectId,
    limit: number = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> => {
    const messages = await Message.find({ sessionId })
        .sort({ sentAt: -1 })
        .limit(limit);

    return messages
        .reverse()
        .map((msg) => ({
            role: (msg.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.messageContent || '',
        }));
};
