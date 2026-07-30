import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import imageUploadRoutes from './routes/imageUploadRoutes.js';
import uploadsRoutes from './routes/uploadsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { initializeDatabase } from './config/database.js';
const app = express();
const PORT = process.env.PORT || 3000;
const getPublicApiBaseUrl = () => {
    const configuredUrl = process.env.PUBLIC_API_URL || process.env.API_BASE_URL;
    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }
    return `http://localhost:${PORT}`;
};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'uploads', 'avatars')));
app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nDisallow:');
});
app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
});
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Property Listing API with TypeORM is running',
        version: '2.0.0',
        endpoints: {
            auth: {
                test: 'POST /api/auth/test',
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile (requires auth token)',
                verifyEmail: 'POST /api/auth/verify-email'
            },
            properties: {
                getAll: 'GET /api/properties (with filters)',
                getById: 'GET /api/properties/:id',
                getMyProperties: 'GET /api/properties/my-properties (requires auth)',
                create: 'POST /api/properties (requires auth)',
                update: 'PUT /api/properties/:id (requires auth)',
                delete: 'DELETE /api/properties/:id (requires auth)',
                search: 'GET /api/properties/search?q=searchTerm',
                fitMatches: 'POST /api/properties/fit/matches',
                fitLead: 'POST /api/properties/fit/lead',
                fitView: 'POST /api/properties/fit/view',
                recordView: 'POST /api/properties/:id/view'
            },
            notifications: {
                list: 'GET /api/notifications (requires auth)',
                unreadCount: 'GET /api/notifications/unread-count (requires auth)',
                markRead: 'PATCH /api/notifications/:id/read (requires auth)',
                markAllRead: 'PATCH /api/notifications/read-all (requires auth)'
            },
            contact: {
                send: 'POST /api/contact'
            },
            images: {
                uploadMultiple: 'POST /api/images/upload-multiple (requires auth, max 15 images)',
                uploadSingle: 'POST /api/images/upload-single',
                delete: 'DELETE /api/images/delete (requires auth)',
                get: 'GET /api/images/test (requires auth)'
            }
        },
        note: 'This API uses TypeORM with PostgreSQL for database operations'
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/images', imageUploadRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use((req, res) => {
    console.log('Route not found:', req.method, req.originalUrl);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use((err, req, res, next) => {
    if ('status' in err && typeof err.status === 'number') {
        res.status(err.status).json({
            success: false,
            message: err.message
        });
        return;
    }
    if (err instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: 'File is too large. Images can be up to 5MB.',
            LIMIT_FILE_COUNT: 'Too many files uploaded.',
            LIMIT_UNEXPECTED_FILE: 'Unexpected upload field.'
        };
        res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
            success: false,
            message: messages[err.code] || err.message
        });
        return;
    }
    if (err.message.includes('Only JPEG, PNG') || err.message.includes('Invalid file type')) {
        res.status(400).json({
            success: false,
            message: err.message
        });
        return;
    }
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            const publicApiBaseUrl = getPublicApiBaseUrl();
            console.log(`Server is running on port ${PORT}`);
            console.log(`API endpoints available at ${publicApiBaseUrl}/api/auth`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
//# sourceMappingURL=server.js.map