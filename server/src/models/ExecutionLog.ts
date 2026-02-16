import mongoose, { Schema } from 'mongoose';
import { IExecutionLog } from '../types';

const ExecutionLogSchema = new Schema<IExecutionLog>({
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    executionDuration: { type: Number },
    inputVariables: { type: Schema.Types.Mixed },
    outputVariables: { type: Schema.Types.Mixed },
    nextNodeId: { type: String },
    error: { type: String },
    executedAt: { type: Date, default: Date.now },
});

ExecutionLogSchema.index({ sessionId: 1, executedAt: 1 });

export default mongoose.model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);
