import mongoose, { Schema } from 'mongoose';
import { IConversationMessage } from '../types';

const ConversationMessageSchema = new Schema<IConversationMessage>(
    {
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
        userPhoneNumber: { type: String, required: true },
        sender: { type: String, enum: ['USER', 'BOT', 'MANUAL'], required: true },
        messageType: {
            type: String,
            enum: ['TEXT', 'BUTTON', 'LIST', 'IMAGE', 'DOCUMENT'],
            default: 'TEXT',
        },
        messageContent: { type: String },
        sentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ConversationMessageSchema.index({ botId: 1, userPhoneNumber: 1, sentAt: 1 });
ConversationMessageSchema.index({ botId: 1, sentAt: -1 });

export default mongoose.model<IConversationMessage>('ConversationMessage', ConversationMessageSchema);
