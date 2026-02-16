import { Request, Response, NextFunction } from 'express';
import { OpenAIAccount } from '../models';
import { encrypt, decrypt } from '../utils/encryption';
import * as openaiServiceModule from '../services/openaiService';

export const saveApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { apiKey } = req.body;

        if (!apiKey) {
            res.status(400).json({ success: false, error: 'API key is required' });
            return;
        }

        // Validate the key
        const isValid = await openaiServiceModule.validateApiKey(apiKey);
        if (!isValid) {
            res.status(400).json({ success: false, error: 'Invalid OpenAI API key' });
            return;
        }

        const encryptedKey = encrypt(apiKey);

        await OpenAIAccount.findOneAndUpdate(
            { userId },
            { apiKey: encryptedKey },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'OpenAI API key saved successfully' });
    } catch (error) {
        next(error);
    }
};

export const getApiKeyStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const account = await OpenAIAccount.findOne({ userId });

        res.json({
            success: true,
            data: {
                hasApiKey: !!account,
                lastUpdated: account?.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.userId;
        await OpenAIAccount.deleteOne({ userId });

        res.json({ success: true, message: 'OpenAI API key removed' });
    } catch (error) {
        next(error);
    }
};
