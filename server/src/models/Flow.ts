import mongoose, { Schema } from 'mongoose';
import { IFlow } from '../types';

const FlowSchema = new Schema<IFlow>(
    {
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        isMainFlow: { type: Boolean, default: false },
    },
    { timestamps: true }
);

FlowSchema.index({ botId: 1, name: 1 }, { unique: true });

export default mongoose.model<IFlow>('Flow', FlowSchema);
