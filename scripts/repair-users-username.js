import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const parsedPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

const client = new Client(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parsedPort,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'auth_db',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
);

async function repairUsersUsername() {
  await client.connect();

  try {
    await client.query('BEGIN');

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
      console.log('username column does not exist yet; adding as nullable first...');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);');
    }

    const fillResult = await client.query(`
      UPDATE users
      SET username = CONCAT('user_', SUBSTRING(id::text, 1, 8))
      WHERE username IS NULL OR BTRIM(username) = '';
    `);

    const duplicateRows = await client.query(`
      WITH ranked AS (
        SELECT id,
               username,
               ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at, id) AS rn
        FROM users
      )
      UPDATE users u
      SET username = CONCAT(u.username, '_', SUBSTRING(u.id::text, 1, 4))
      FROM ranked r
      WHERE u.id = r.id
        AND r.rn > 1;
    `);

    await client.query('COMMIT');

    console.log(`Filled empty usernames: ${fillResult.rowCount}`);
    console.log(`Adjusted duplicate usernames: ${duplicateRows.rowCount}`);
    console.log('Username repair completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

repairUsersUsername().catch((error) => {
  console.error('Username repair failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
