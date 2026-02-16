import mongoose, { Schema } from 'mongoose';
import { ISessionVariable } from '../types';

const SessionVariableSchema = new Schema<ISessionVariable>(
    {
        sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
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

SessionVariableSchema.index({ sessionId: 1, variableName: 1 }, { unique: true });

export default mongoose.model<ISessionVariable>('SessionVariable', SessionVariableSchema);
