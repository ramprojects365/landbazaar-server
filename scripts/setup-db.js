import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

const client = new Client({
  host: process.env.DB_HOST,
  port: port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    await client.connect();

    await client.query('DROP TABLE IF EXISTS properties CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');

    const initSqlPath = path.join(process.cwd(), 'sql', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await client.query(initSql);

    const propertiesSqlPath = path.join(process.cwd(), 'sql', 'properties.sql');
    const propertiesSql = fs.readFileSync(propertiesSqlPath, 'utf8');
    await client.query(propertiesSql);
   

  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
 
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
