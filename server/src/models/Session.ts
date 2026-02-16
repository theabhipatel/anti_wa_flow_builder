import mongoose, { Schema } from 'mongoose';
import { ISession } from '../types';

const SessionSchema = new Schema<ISession>(
    {
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
        flowVersionId: { type: Schema.Types.ObjectId, ref: 'FlowVersion' },
        userPhoneNumber: { type: String, required: true },
        currentNodeId: { type: String },
        subflowCallStack: {
            type: [
                {
                    flowVersionId: { type: String, required: true },
                    returnNodeId: { type: String, required: true },
                },
            ],
            default: [],
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CLOSED', 'FAILED'],
            default: 'ACTIVE',
        },
        resumeAt: { type: Date },
        closedAt: { type: Date },
        isTest: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Partial index for unique active session per bot/user
SessionSchema.index(
    { botId: 1, userPhoneNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ['ACTIVE', 'PAUSED'] } },
    }
);
SessionSchema.index({ resumeAt: 1 }, { sparse: true });
SessionSchema.index({ status: 1 });

export default mongoose.model<ISession>('Session', SessionSchema);
