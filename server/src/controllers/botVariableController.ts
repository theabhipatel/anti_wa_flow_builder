import { Request, Response, NextFunction } from 'express';
import { BotVariable, Bot } from '../models';

export const getBotVariables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        const variables = await BotVariable.find({ botId }).sort({ variableName: 1 });
        res.json({ success: true, data: variables });
    } catch (error) {
        next(error);
    }
};

export const setBotVariable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId } = req.params;
        const userId = req.user!.userId;
        const { variableName, variableValue, variableType } = req.body;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        if (!variableName) {
            res.status(400).json({ success: false, error: 'Variable name is required' });
            return;
        }

        const variable = await BotVariable.findOneAndUpdate(
            { botId, variableName },
            { variableValue, variableType: variableType || 'STRING' },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: variable });
    } catch (error) {
        next(error);
    }
};

export const deleteBotVariable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { botId, variableName } = req.params;
        const userId = req.user!.userId;

        const bot = await Bot.findOne({ _id: botId, userId });
        if (!bot) {
            res.status(404).json({ success: false, error: 'Bot not found' });
            return;
        }

        await BotVariable.deleteOne({ botId, variableName });
        res.json({ success: true, message: 'Variable deleted' });
    } catch (error) {
        next(error);
    }
};
