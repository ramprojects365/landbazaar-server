import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const parsedPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const useSsl =
  process.env.DB_SSL === 'true' ||
  Boolean(process.env.DATABASE_PUBLIC_URL && databaseUrl === process.env.DATABASE_PUBLIC_URL) ||
  Boolean(databaseUrl && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1'));

const client = new Client(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parsedPort,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'auth_db',
        ssl: useSsl ? { rejectUnauthorized: false } : false
      }
);

async function backfillUsersUsername() {
  await client.connect();
  console.log('Connected to PostgreSQL database for backfilling usernames...');

  try {
    await client.query('BEGIN');

    // 1. Check if 'users' table exists
    const hasUsersTable = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
      ) AS exists;
    `);

    if (!hasUsersTable.rows[0]?.exists) {
      console.log('Users table does not exist yet. Nothing to backfill.');
      await client.query('COMMIT');
      return;
    }

    // 2. Check if 'username' column exists
    const hasUsernameColumn = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'username'
      ) AS exists;
    `);

    const exists = Boolean(hasUsernameColumn.rows[0]?.exists);

    if (!exists) {
      console.log('username column does not exist yet. Adding as nullable VARCHAR(100)...');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);');
    }

    // 3. Backfill any rows where username IS NULL or empty
    const fillResult = await client.query(`
      UPDATE users
      SET username = COALESCE(
        NULLIF(BTRIM(split_part(email, '@', 1)), ''),
        CONCAT('user_', SUBSTRING(id::text, 1, 8))
      )
      WHERE username IS NULL OR BTRIM(username) = '';
    `);

    console.log(`Backfilled ${fillResult.rowCount || 0} user records with valid usernames.`);

    await client.query('COMMIT');
    console.log('Username backfill migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during username backfill migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

backfillUsersUsername().catch((error) => {
  console.error('Backfill script failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
