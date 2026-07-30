import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.js';
import { Property } from '../entities/Property.js';
import { Notification } from '../entities/Notification.js';
dotenv.config();
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const useSsl = process.env.DB_SSL === 'true' ||
    Boolean(process.env.DATABASE_PUBLIC_URL && databaseUrl === process.env.DATABASE_PUBLIC_URL);
const connectionOptions = databaseUrl
    ? {
        url: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'auth_db',
        ssl: useSsl ? { rejectUnauthorized: false } : false
    };
export const AppDataSource = new DataSource({
    type: 'postgres',
    ...connectionOptions,
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Property, Notification],
});
export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Database connection established successfully');
        }
        return AppDataSource;
    }
    catch (error) {
        console.error('Error during Data Source initialization:', error);
        throw error;
    }
};
//# sourceMappingURL=ormconfig.js.map