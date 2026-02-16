import mongoose, { Schema } from 'mongoose';
import { IBotVariable } from '../types';

const BotVariableSchema = new Schema<IBotVariable>(
    {
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
        variableName: { type: String, required: true },
        variableValue: { type: Schema.Types.Mixed },
        variableType: {
            type: String,
            enum: ['STRING', 'NUMBER', 'BOOLEAN', 'OBJECT', 'ARRAY'],
            default: 'STRING',
        },
    },
    { timestamps: true }
);

BotVariableSchema.index({ botId: 1, variableName: 1 }, { unique: true });

export default mongoose.model<IBotVariable>('BotVariable', BotVariableSchema);
