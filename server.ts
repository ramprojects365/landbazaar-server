import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import imageUploadRoutes from './routes/imageUploadRoutes';
import uploadsRoutes from './routes/uploadsRoutes';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req: Request, res: Response) => {
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
        search: 'GET /api/properties/search?q=searchTerm'
      },
      images: {
        uploadMultiple: 'POST /api/images/upload-multiple (requires auth, max 10 images)',
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

app.use((req: Request, res: Response) => {
  console.log('Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT,  () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
