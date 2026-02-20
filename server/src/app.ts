import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';
import { apiLimiter } from './middlewares/rateLimiter';

// Routes
import authRoutes from './routes/authRoutes';
import botRoutes from './routes/botRoutes';
import flowRoutes from './routes/flowRoutes';
import webhookRoutes from './routes/webhookRoutes';
import aiProviderRoutes from './routes/aiProviderRoutes';
import aiLogRoutes from './routes/aiLogRoutes';
import simulatorRoutes from './routes/simulatorRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import conversationRoutes from './routes/conversationRoutes';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Webhook routes (BEFORE rate limiting — Meta needs unrestricted access for verification)
// Webhook routes have their own dedicated rate limiter (webhookLimiter)
app.use('/api/webhook', webhookRoutes);

// Rate limiting (applied to all /api routes EXCEPT webhooks which are already mounted above)
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/bots', flowRoutes); // Nested under /api/bots/:botId/flows
app.use('/api/ai-providers', aiProviderRoutes);
app.use('/api/ai-logs', aiLogRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
