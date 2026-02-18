import { Request, Response } from 'express';
import { AIProvider } from '../models';
import { encrypt, decrypt } from '../utils/encryption';
import { validateApiKey, PROVIDER_PRESETS } from '../services/aiService';

// ─── Create Provider ────────────────────────────────────────────
export const createProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { name, provider, baseUrl, apiKey, defaultModel } = req.body;

        if (!name || !provider || !apiKey) {
            res.status(400).json({ success: false, error: 'Name, provider, and API key are required' });
            return;
        }

        const resolvedBaseUrl = provider === 'CUSTOM'
            ? baseUrl
            : (PROVIDER_PRESETS[provider] || baseUrl);

        if (!resolvedBaseUrl) {
            res.status(400).json({ success: false, error: 'Base URL is required for custom providers' });
            return;
        }

        const encryptedKey = encrypt(apiKey);

        const newProvider = await AIProvider.create({
            userId,
            name,
            provider,
            baseUrl: resolvedBaseUrl,
            apiKey: encryptedKey,
            defaultModel: defaultModel || '',
            isActive: true,
        });

        res.json({
            success: true,
            data: {
                _id: newProvider._id,
                name: newProvider.name,
                provider: newProvider.provider,
                baseUrl: newProvider.baseUrl,
                defaultModel: newProvider.defaultModel,
                isActive: newProvider.isActive,
                hasApiKey: true,
            },
        });
    } catch (error) {
        console.error('[AI Provider] Create error:', error);
        res.status(500).json({ success: false, error: 'Failed to create provider' });
    }
};

// ─── List Providers ─────────────────────────────────────────────
export const listProviders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const providers = await AIProvider.find({ userId }).sort({ createdAt: -1 });

        const masked = providers.map((p) => ({
            _id: p._id,
            name: p.name,
            provider: p.provider,
            baseUrl: p.baseUrl,
            defaultModel: p.defaultModel,
            isActive: p.isActive,
            maskedKey: maskApiKey(decrypt(p.apiKey)),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));

        res.json({ success: true, data: masked });
    } catch (error) {
        console.error('[AI Provider] List error:', error);
        res.status(500).json({ success: false, error: 'Failed to list providers' });
    }
};

// ─── Update Provider ────────────────────────────────────────────
export const updateProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const { name, provider, baseUrl, apiKey, defaultModel, isActive } = req.body;

        const existing = await AIProvider.findOne({ _id: id, userId });
        if (!existing) {
            res.status(404).json({ success: false, error: 'Provider not found' });
            return;
        }

        if (name !== undefined) existing.name = name;
        if (provider !== undefined) {
            existing.provider = provider;
            if (provider !== 'CUSTOM' && PROVIDER_PRESETS[provider]) {
                existing.baseUrl = PROVIDER_PRESETS[provider];
            }
        }
        if (baseUrl !== undefined) existing.baseUrl = baseUrl;
        if (apiKey) existing.apiKey = encrypt(apiKey);
        if (defaultModel !== undefined) existing.defaultModel = defaultModel;
        if (isActive !== undefined) existing.isActive = isActive;

        await existing.save();

        res.json({
            success: true,
            data: {
                _id: existing._id,
                name: existing.name,
                provider: existing.provider,
                baseUrl: existing.baseUrl,
                defaultModel: existing.defaultModel,
                isActive: existing.isActive,
                maskedKey: maskApiKey(decrypt(existing.apiKey)),
            },
        });
    } catch (error) {
        console.error('[AI Provider] Update error:', error);
        res.status(500).json({ success: false, error: 'Failed to update provider' });
    }
};

// ─── Delete Provider ────────────────────────────────────────────
export const deleteProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const result = await AIProvider.findOneAndDelete({ _id: id, userId });
        if (!result) {
            res.status(404).json({ success: false, error: 'Provider not found' });
            return;
        }

        res.json({ success: true, message: 'Provider deleted' });
    } catch (error) {
        console.error('[AI Provider] Delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete provider' });
    }
};

// ─── Test Provider Connection ───────────────────────────────────
export const testProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const provider = await AIProvider.findOne({ _id: id, userId });
        if (!provider) {
            res.status(404).json({ success: false, error: 'Provider not found' });
            return;
        }

        const apiKey = decrypt(provider.apiKey);
        const isValid = await validateApiKey(provider.baseUrl, apiKey);

        res.json({
            success: true,
            data: { isValid, provider: provider.provider, baseUrl: provider.baseUrl },
        });
    } catch (error) {
        console.error('[AI Provider] Test error:', error);
        res.status(500).json({ success: false, error: 'Failed to test provider' });
    }
};

// ─── Helper: Mask API key ───────────────────────────────────────
function maskApiKey(key: string): string {
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}
