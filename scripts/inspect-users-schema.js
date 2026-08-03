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

async function inspect() {
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position;
  `);

  const rowCount = await client.query('SELECT COUNT(*)::int AS total_users FROM users;');
  const nullUsername = await client.query(`
    SELECT COUNT(*)::int AS null_usernames
    FROM users
    WHERE username IS NULL OR BTRIM(username) = '';
  `).catch(() => ({ rows: [{ null_usernames: -1 }] }));

  console.log('total_users=', rowCount.rows[0].total_users);
  console.log('null_usernames=', nullUsername.rows[0].null_usernames);
  console.table(cols.rows);

  await client.end();
}

inspect().catch((error) => {
  console.error(error);
  process.exit(1);
});
