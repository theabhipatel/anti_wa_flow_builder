import mongoose, { Schema } from 'mongoose';
import { IAIProvider } from '../types';

const AIProviderSchema = new Schema<IAIProvider>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        provider: {
            type: String,
            required: true,
            enum: ['OPENAI', 'GEMINI', 'GROQ', 'MISTRAL', 'OPENROUTER', 'CUSTOM'],
        },
        baseUrl: { type: String, required: true },
        apiKey: { type: String, required: true }, // Encrypted with AES-256
        defaultModel: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Index for per-user queries
AIProviderSchema.index({ userId: 1 });

export default mongoose.model<IAIProvider>('AIProvider', AIProviderSchema);
