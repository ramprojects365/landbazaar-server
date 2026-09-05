# Run the LandBazar API with Docker

This setup runs two containers:

- `landbazaar-api`: the Express/TypeScript API
- `landbazaar-postgres`: PostgreSQL 16

PostgreSQL data is stored in the `postgres_data` Docker volume. Uploaded local files are stored in the `uploads_data` volume.

## Requirements

Install Docker Desktop for Windows and make sure Docker is running:

```bash
docker --version
docker compose version
```

## First-time setup

Run these commands from the `landbazaar-server` directory:

```bash
Copy-Item .env.example .env
```

Open `.env` and set a real JWT secret. It should be a long random value and must not be committed or shared publicly:

```env
JWT_SECRET=replace-with-a-long-random-production-secret
```

The Compose file overrides `DB_HOST` to `postgres`. Do not use `localhost` for the database host inside the API container; in Docker, `postgres` is the service name.

The API container uses these local database settings automatically:

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=auth_db
DB_SSL=false
```

Optional settings can also be added to `.env`:

```env
PUBLIC_WEB_URL=http://localhost:3000
PUBLIC_CLIENT_URL=http://localhost:3000
RESEND_API_KEY=
EMAIL_FROM=noreply@example.com
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_CLOUDFRONT_URL=
```

## Start the API

```bash
docker compose up --build -d
```

The API will be available at:

```text
http://localhost:3008
```

The API waits until PostgreSQL is healthy, then TypeORM creates or updates the tables automatically during startup.

Docker does not automatically load demo data from `sql/` or `landbazaar_dump.sql`. A new database will be empty apart from the tables created by TypeORM.

Check container status and logs:

```bash
docker compose ps
docker compose logs -f api
```

Test the API from PowerShell:

```powershell
Invoke-RestMethod http://localhost:3008/
Invoke-RestMethod http://localhost:3008/api/properties
```

The root request should return JSON containing `"success": true`. If `/api/properties` returns an empty list, the API is working and the local database simply has no properties yet.

## Create an administrator

After registering the administrator account, promote it directly in the local PostgreSQL database:

```sql
UPDATE users
SET user_type = 'admin'
WHERE email = 'admin@example.com';
```

To remove administrator access:

```sql
UPDATE users
SET user_type = 'user'
WHERE email = 'admin@example.com';
```

From the `landbazaar-server` directory, open a PostgreSQL shell in Docker with:

```powershell
docker compose exec postgres psql -U postgres -d auth_db
```

An administrator can view all properties, edit any property, and deactivate any property from the dashboard. The backend checks the role on every protected request; hiding the dashboard link is not used as a security control.

## Connect the local frontend

The frontend defaults to the deployed API unless its local environment is configured. In `landbazaar-client`, create `.env.local` with:

```env
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_BASE=http://localhost:3008
```

The client automatically adds `/api`, so requests go to `http://localhost:3008/api`.

Start the frontend in a second terminal:

```powershell
cd ..\landbazaar-client
npm install
npm run dev
```

Open `http://localhost:3000` in the browser. Keep the Docker terminal running while using the frontend.

## Stop and restart

Stop containers while keeping database data:

```bash
docker compose down
```

Start them again:

```bash
docker compose up -d
```

Rebuild after code or dependency changes:

```bash
docker compose up --build -d
```

## Reset all local data

This deletes the PostgreSQL database and uploaded files. Use only when a clean local database is needed:

```bash
docker compose down -v
docker compose up --build -d
```

## Give this project to another developer

Share the repository with these files:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `DOCKER_GUIDE.md`

Do not share `.env`, passwords, JWT secrets, email API keys, or cloud storage credentials. The other developer should copy `.env.example` to `.env`, set their own `JWT_SECRET`, and run `docker compose up --build -d`.

## Common problems

### Port 3008 is already in use

Set another host port in `.env`:

```env
API_PORT=3010
```

Then open `http://localhost:3010`. The API still listens on port `3008` inside its container.

### API cannot connect to PostgreSQL

Check that both services are running:

```bash
docker compose ps
docker compose logs postgres
docker compose logs api
```

Inside Compose, the database settings must be `DB_HOST=postgres`, `DB_PORT=5432`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, and `DB_NAME=auth_db`.

Do not change `DB_HOST` to `localhost` in the API container. `localhost` would point back to the API container, not the PostgreSQL container.

### Frontend still calls the deployed API

Check `landbazaar-client/.env.local`:

```env
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_BASE=http://localhost:3008
```

Restart `npm run dev` after changing environment variables. If `NEXT_PUBLIC_API_URL` is set, remove it or set it to `http://localhost:3008/api`, because it takes priority over `NEXT_PUBLIC_API_BASE`.

### Images disappear after recreating containers

Do not remove the volumes. The uploaded files are kept in `uploads_data` unless `docker compose down -v` is used.

### Image upload says storage is not configured

Configure `AWS_S3_BUCKET_NAME` and the related S3-compatible credentials in `.env`. The API can still run without cloud storage, but image upload endpoints that require S3 will not work.