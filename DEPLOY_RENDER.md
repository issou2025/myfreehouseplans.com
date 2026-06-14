# Render Deployment

## Services

This project is prepared for Render with:

- A Next.js web service
- A Render PostgreSQL database
- A persistent disk mounted at `/var/data` for uploaded files

The included `render.yaml` can be used as a Render Blueprint.

## Required Environment Variables

Render should provide:

- `PORT`: provided automatically by Render
- `DATABASE_URL`: provided by the Render PostgreSQL database
- `NODE_ENV=production`
- `POSTGRES_SSL=true`
- `REQUIRE_DATABASE=true`
- `ADMIN_USERNAME=issou`
- `ADMIN_PASSWORD`: required in production to protect `/admin`, admin message reads, and plan writes
- `ADMIN_SESSION_SECRET`: a separate long random secret for signed admin sessions
- `NEXT_PUBLIC_SITE_URL`: the final public `https://` domain
- `UPLOAD_DIR=/var/data/uploads`
- `CLOUDINARY_CLOUD_NAME`: optional, recommended for production uploads
- `CLOUDINARY_API_KEY`: optional, recommended for production uploads
- `CLOUDINARY_API_SECRET`: optional, recommended for production uploads
- `CLOUDINARY_FOLDER=myhouseplans`

## Build and Start

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run db:migrate && npm run start -- -p $PORT
```

Health check:

```text
/api/health
```

## Database Migration

After creating the PostgreSQL database and setting `DATABASE_URL`, run:

```bash
npm run db:migrate
```

The app also creates the same tables automatically when the API is used, but running the migration once is the cleaner deployment path.

The Render blueprint runs the migration before starting the web server.

## Admin Access

The admin area uses a signed secure session after login. Set:

```text
ADMIN_USERNAME=issou
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_SESSION_SECRET=use-a-different-long-random-secret
```

Without `ADMIN_PASSWORD`, production admin routes return `503` instead of exposing the CMS.

## Upload Storage

Plans and contact messages are stored in PostgreSQL when `DATABASE_URL` is present.

Uploads use Cloudinary when these variables are present:

```text
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=myhouseplans
```

When Cloudinary is configured, uploaded images and documents are sent to Cloudinary and the app stores/returns the Cloudinary secure URL.

If Cloudinary is not configured, uploads fall back to `UPLOAD_DIR`. On Render, attach a persistent disk and set:

```text
UPLOAD_DIR=/var/data/uploads
```

Without Cloudinary or a persistent disk, uploaded files can disappear when Render restarts or redeploys the service.

## Production Readiness Notes

Keep `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` set on Render, and use Cloudinary or the persistent disk configuration above for durable uploads.
