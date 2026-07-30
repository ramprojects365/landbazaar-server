# PostgreSQL Setup Guide

This guide will help you set up the authentication API with PostgreSQL.

## Prerequisites

- PostgreSQL installed and running (version 12 or higher)
- Node.js and npm installed
- Basic knowledge of PostgreSQL

## Step 1: Create PostgreSQL Database

Open your PostgreSQL client (psql) or use a GUI tool like pgAdmin:

```sql
CREATE DATABASE auth_db;
```

Optional: Create a dedicated user for the application:

```sql
CREATE USER auth_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
```

## Step 2: Configure Environment Variables

Update your `.env` file with your PostgreSQL credentials:

```env
# Server Configuration
PORT=3000
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRY=7d

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=auth_db
DB_SSL=false
```

**For production environments with SSL:**
```env
DB_SSL=true
```

## Step 3: Initialize Database Schema

Install dependencies first:

```bash
npm install
```

Run the database setup script to create tables and indexes:

```bash
npm run setup-db
```

You should see output like:
```
Connecting to PostgreSQL database...
Connected successfully!
Reading initialization SQL...
Executing SQL initialization script...
Database initialized successfully!
Tables created:
  - users

Your PostgreSQL database is ready for use.
```

## Step 4: Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

For development with auto-reload:
```bash
npm run dev
```

## Verify Installation

Test the API with a simple health check:

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "success": true,
  "message": "Authentication API is running",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## Database Connection Issues

### Error: ECONNREFUSED

PostgreSQL is not running. Start PostgreSQL:

**On macOS (Homebrew):**
```bash
brew services start postgresql
```

**On Linux (systemd):**
```bash
sudo systemctl start postgresql
```

**On Windows:**
Start PostgreSQL from Services or use the installer's start option.

### Error: FATAL: role "postgres" does not exist

Create the postgres user:
```bash
createuser -s postgres
```

### Error: FATAL: database "auth_db" does not exist

Create the database:
```bash
createdb -U postgres auth_db
```

## Testing the API

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone_number": "+1234567890",
    "password": "TestPass123"
  }'
```

### Verify Database Entry

Check if user was created:

```bash
psql -U postgres -d auth_db -c "SELECT * FROM users;"
```

## Backing Up Your Database

```bash
pg_dump -U postgres -d auth_db > backup.sql
```

## Restoring from Backup

```bash
psql -U postgres -d auth_db < backup.sql
```

## Production Recommendations

1. **Change default PostgreSQL password**
2. **Use SSL certificates** for database connections
3. **Create dedicated database user** with limited privileges
4. **Enable PostgreSQL WAL archiving** for point-in-time recovery
5. **Set up regular automated backups**
6. **Use environment variables** for all sensitive data
7. **Enable connection pooling** for production (pgBouncer)

## Railway PostgreSQL

Railway provides `DATABASE_URL` for services inside the same Railway project and
may also expose `DATABASE_PUBLIC_URL` for external connections. The server checks
`DATABASE_URL` first, then `DATABASE_PUBLIC_URL`, then the local `DB_*` values.

For the property edit location fields, TypeORM `synchronize: true` should add
the nullable columns automatically on deploy. If you need to update Railway
Postgres manually, run:

```bash
psql "$DATABASE_URL" -f sql/railway-update.sql
```

## Additional PostgreSQL Tools

- **pgAdmin**: Web-based PostgreSQL management tool
- **DBeaver**: Universal database tool
- **psql**: Official PostgreSQL command-line client
- **pgBouncer**: Connection pooler for PostgreSQL
