import mongoose, { Schema } from 'mongoose';
import { IFlowVersion } from '../types';

const FlowVersionSchema = new Schema<IFlowVersion>(
    {
        flowId: { type: Schema.Types.ObjectId, ref: 'Flow', required: true },
        versionNumber: { type: Number, required: true },
        flowData: { type: Schema.Types.Mixed, required: true },
        isDraft: { type: Boolean, default: true },
        isProduction: { type: Boolean, default: false },
        deployedAt: { type: Date },
        deployedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

FlowVersionSchema.index({ flowId: 1, versionNumber: 1 }, { unique: true });
FlowVersionSchema.index({ flowId: 1, isProduction: 1 });
FlowVersionSchema.index({ flowId: 1, isDraft: 1 });

export default mongoose.model<IFlowVersion>('FlowVersion', FlowVersionSchema);
