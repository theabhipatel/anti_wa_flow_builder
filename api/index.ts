/**
 * Vercel serverless function entry point.
 * Wraps the Express app and ensures MongoDB is connected before handling requests.
 * 
 * IMPORTANT: We import from the compiled `server/dist/` (CommonJS) output,
 * NOT from `server/src/` (raw TypeScript). This avoids Vercel's ESM runtime
 * rejecting directory imports like `from '../models'`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../server/dist/utils/connectDB';
import app from '../server/dist/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectDB();
    return app(req, res);
}

