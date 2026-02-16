import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>({
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    sender: { type: String, enum: ['USER', 'BOT'], required: true },
    messageType: {
        type: String,
        enum: ['TEXT', 'BUTTON', 'IMAGE', 'DOCUMENT'],
        default: 'TEXT',
    },
    messageContent: { type: String },
    nodeId: { type: String },
    sentAt: { type: Date, default: Date.now },
});

MessageSchema.index({ sessionId: 1, sentAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
