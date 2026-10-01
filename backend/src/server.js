import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabase } from './config/db.js';
import { createAuthRouter } from './routes/authRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = Number(process.env.PORT || 5000);
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const jwtSecret = process.env.JWT_SECRET;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const refreshTokenDays = Number(process.env.REFRESH_TOKEN_DAYS || 7);

if (!jwtSecret || Buffer.byteLength(jwtSecret) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes.');
}
if (!Number.isInteger(refreshTokenDays) || refreshTokenDays < 1 || refreshTokenDays > 30) {
    throw new Error('REFRESH_TOKEN_DAYS must be an integer between 1 and 30.');
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again later.' },
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' },
});

app.use('/api/', apiLimiter);
app.get('/health', async (req, res) => {
    try {
        const { error } = await supabase.from('staff_users').select('id', { head: true, count: 'exact' }).limit(1);
        if (error) throw error;
        return res.status(200).json({
            status: 'ONLINE',
            database: 'CONNECTED',
            service: 'Janakpur PharmaDistro Core API',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
    catch (error) {
        console.error('[Healthcheck] Database connection failed:', error.message);
        return res.status(503).json({ status: 'DEGRADED', database: 'UNAVAILABLE' });
    }
});

const authRouter = createAuthRouter({
    jwtSecret,
    accessTokenExpiresIn,
    refreshTokenDays,
    isProduction,
});
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth', authRouter);

if (isProduction) {
    const distPath = path.resolve(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        return res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Requested API endpoint not found.' });
});

app.use((error, req, res, next) => {
    console.error(`[API] ${req.method} ${req.originalUrl}:`, error.stack || error.message);
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const message = isProduction && statusCode === 500 ? 'Internal Server Error' : error.message;
    res.status(statusCode).json({ success: false, error: message || 'An unexpected error occurred.' });
});

const server = app.listen(port, () => {
    console.log(`[PharmaDistro] API listening in ${nodeEnv} mode on port ${port}`);
});

const shutdown = signal => {
    console.log(`[PharmaDistro] ${signal} received; closing API`);
    server.close(error => {
        if (error) {
            console.error('[PharmaDistro] Error while closing HTTP server:', error);
            process.exitCode = 1;
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
