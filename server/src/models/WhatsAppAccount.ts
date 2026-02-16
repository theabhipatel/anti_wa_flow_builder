import mongoose, { Schema } from 'mongoose';
import { IWhatsAppAccount } from '../types';

const WhatsAppAccountSchema = new Schema<IWhatsAppAccount>(
    {
        botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true, unique: true },
        phoneNumberId: { type: String, required: true, unique: true },
        businessAccountId: { type: String, required: true },
        accessToken: { type: String, required: true }, // Encrypted with AES-256
        phoneNumber: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

WhatsAppAccountSchema.index({ phoneNumber: 1 });
WhatsAppAccountSchema.index({ phoneNumberId: 1 });

export default mongoose.model<IWhatsAppAccount>('WhatsAppAccount', WhatsAppAccountSchema);
