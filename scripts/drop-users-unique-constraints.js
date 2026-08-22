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

async function dropUniqueConstraints() {
  await client.connect();

  try {
    console.log('Checking for unique constraints on users(username) and users(phone_number)...');

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

    // Expand username column length to 100 if needed
    await client.query('ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(100);');

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
