import axios from 'axios';

const GRAPH_API_BASE = 'https://graph.facebook.com/v24.0';

interface IWhatsAppButton {
    type: 'reply';
    reply: {
        id: string;
        title: string;
    };
}

/**
 * Send a text message via WhatsApp Cloud API
 */
export const sendTextMessage = async (
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string
): Promise<void> => {
    const url = `${GRAPH_API_BASE}/${phoneNumberId}/messages`;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to,
                    type: 'text',
                    text: { preview_url: false, body: text },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return;
        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                console.error('[WhatsApp] Failed to send text message after retries:', error);
                throw error;
            }
            await new Promise((r) => setTimeout(r, 1000 * retries)); // Exponential backoff
        }
    }
};

/**
 * Send an interactive button message via WhatsApp Cloud API
 */
export const sendButtonMessage = async (
    phoneNumberId: string,
    accessToken: string,
    to: string,
    bodyText: string,
    buttons: Array<{ buttonId: string; label: string }>
): Promise<void> => {
    const url = `${GRAPH_API_BASE}/${phoneNumberId}/messages`;

    const waButtons: IWhatsAppButton[] = buttons.map((btn) => ({
        type: 'reply',
        reply: {
            id: btn.buttonId,
            title: btn.label,
        },
    }));

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: { text: bodyText },
                        action: { buttons: waButtons },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return;
        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                console.error('[WhatsApp] Failed to send button message after retries:', error);
                throw error;
            }
            await new Promise((r) => setTimeout(r, 1000 * retries));
        }
    }
};

/**
 * Validate WhatsApp credentials by fetching phone number info
 */
export const validateCredentials = async (
    phoneNumberId: string,
    accessToken: string
): Promise<boolean> => {
    try {
        const url = `${GRAPH_API_BASE}/${phoneNumberId}`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return !!response.data?.id;
    } catch (error) {
        console.error('[WhatsApp] Credential validation failed:', error);
        return false;
    }
};
