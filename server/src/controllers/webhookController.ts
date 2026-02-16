import { Request, Response, NextFunction } from 'express';
import { WhatsAppAccount, Bot, Flow, FlowVersion, Session } from '../models';
import { decrypt } from '../utils/encryption';
import * as executionService from '../services/executionService';
import * as sessionService from '../services/sessionService';

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your-verify-token';

/**
 * GET /api/webhook/whatsapp — Webhook verification
 */
export const verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('[Webhook] Verification successful');
        res.status(200).send(challenge);
    } else {
        console.log('[Webhook] Verification failed');
        res.status(403).send('Forbidden');
    }
};

/**
 * POST /api/webhook/whatsapp — Handle incoming messages
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    // Return 200 immediately (async processing)
    res.status(200).send('EVENT_RECEIVED');

    try {
        const body = req.body;

        if (body.object !== 'whatsapp_business_account') return;

        const entries = body.entry;
        if (!entries || !Array.isArray(entries)) return;

        for (const entry of entries) {
            const changes = entry.changes;
            if (!changes || !Array.isArray(changes)) continue;

            for (const change of changes) {
                if (change.field !== 'messages') continue;

                const value = change.value;
                if (!value?.messages || !Array.isArray(value.messages)) continue;

                const recipientPhoneNumberId = value.metadata?.phone_number_id;
                if (!recipientPhoneNumberId) continue;

                for (const message of value.messages) {
                    await processIncomingMessage(recipientPhoneNumberId, message);
                }
            }
        }
    } catch (error) {
        console.error('[Webhook] Error processing webhook:', error);
    }
};

const processIncomingMessage = async (
    phoneNumberId: string,
    message: {
        from: string;
        type: string;
        text?: { body: string };
        interactive?: { type: string; button_reply?: { id: string; title: string } };
        timestamp: string;
    }
): Promise<void> => {
    try {
        // Find WhatsApp account by phone number ID
        const waAccount = await WhatsAppAccount.findOne({ phoneNumberId });
        if (!waAccount) {
            console.error(`[Webhook] No bot found for phone number ID: ${phoneNumberId}`);
            return;
        }

        const botId = waAccount.botId;
        const senderPhone = message.from;

        // Find bot
        const bot = await Bot.findById(botId);
        if (!bot) {
            console.error(`[Webhook] Bot not found: ${botId}`);
            return;
        }

        // Find the main flow for this bot
        const mainFlow = await Flow.findOne({ botId, isMainFlow: true });
        if (!mainFlow) {
            console.error(`[Webhook] No main flow found for bot ${botId}`);
            return;
        }

        // Find production flow version of the main flow
        const prodVersion = await FlowVersion.findOne({
            flowId: mainFlow._id,
            isProduction: true,
        });

        if (!prodVersion) {
            console.error(`[Webhook] No production flow version for main flow ${mainFlow._id}`);
            return;
        }

        // Find or create session
        const session = await sessionService.findOrCreateSession(
            botId,
            senderPhone,
            prodVersion._id,
            false
        );

        // Extract message content
        let incomingText: string | undefined;
        let buttonId: string | undefined;

        if (message.type === 'text' && message.text?.body) {
            incomingText = message.text.body;
        } else if (message.type === 'interactive' && message.interactive?.button_reply) {
            buttonId = message.interactive.button_reply.id;
            incomingText = message.interactive.button_reply.title;
        }

        // Execute flow
        await executionService.executeFlow(session, incomingText, buttonId, false);
    } catch (error) {
        console.error(`[Webhook] Error processing message:`, error);
    }
};
