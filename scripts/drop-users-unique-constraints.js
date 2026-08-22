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

async function dropUniqueConstraints() {
  await client.connect();

  try {
    console.log('Checking for unique constraints on users(username) and users(phone_number)...');

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
      console.log('Users table does not exist yet. Nothing to modify.');
      return;
    }

    // Query all unique constraints on users table for username and phone_number columns
    const constraintsQuery = `
      SELECT tc.constraint_name, kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'users'
        AND kcu.column_name IN ('username', 'phone_number');
    `;

    const res = await client.query(constraintsQuery);

    if (res.rows.length === 0) {
      console.log('No unique constraints found on username or phone_number.');
    } else {
      for (const row of res.rows) {
        console.log(`Dropping constraint: ${row.constraint_name} on column ${row.column_name}`);
        await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
      }
      console.log('Unique constraints successfully dropped.');
    }

    // Also check for any unique indexes that may not be table constraints
    const indexesQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'users'
        AND indexdef LIKE '%UNIQUE%'
        AND (indexdef LIKE '%(username)%' OR indexdef LIKE '%(phone_number)%');
    `;

    const idxRes = await client.query(indexesQuery);
    for (const row of idxRes.rows) {
      console.log(`Dropping unique index: ${row.indexname}`);
      await client.query(`DROP INDEX IF EXISTS "${row.indexname}";`);
    }

    // Check if username column exists
    const hasUsernameColumn = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'username'
      ) AS exists;
    `);

    if (hasUsernameColumn.rows[0]?.exists) {
      // Backfill any NULL/empty values first
      await client.query(`
        UPDATE users
        SET username = COALESCE(
          NULLIF(BTRIM(split_part(email, '@', 1)), ''),
          CONCAT('user_', SUBSTRING(id::text, 1, 8))
        )
        WHERE username IS NULL OR BTRIM(username) = '';
      `);

      // Expand username column length to 100 if needed
      await client.query('ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(100);');
    }

    console.log('Users table updated: username and phone_number can now have duplicate values.');
  } catch (error) {
    console.error('Error dropping constraints:', error);
    throw error;
  } finally {
    await client.end();
  }
}

dropUniqueConstraints().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
