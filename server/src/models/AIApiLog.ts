import mongoose, { Schema } from 'mongoose';
import { IAIApiLog } from '../types';

const AIApiLogSchema = new Schema<IAIApiLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
        sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
        nodeId: { type: String, required: true },
        nodeLabel: { type: String, default: '' },
        aiProviderId: { type: Schema.Types.ObjectId, ref: 'AIProvider' },
        providerName: { type: String, default: '' },
        provider: { type: String, default: '' },
        modelName: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: ['SUCCESS', 'ERROR'],
        },
        // Token usage
        promptTokens: { type: Number, default: 0 },
        completionTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
        // Error details
        errorMessage: { type: String, default: null },
        errorCode: { type: String, default: null },
        // Performance
        responseTimeMs: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Indexes for efficient queries
AIApiLogSchema.index({ userId: 1, createdAt: -1 });
AIApiLogSchema.index({ botId: 1, createdAt: -1 });
AIApiLogSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IAIApiLog>('AIApiLog', AIApiLogSchema);
