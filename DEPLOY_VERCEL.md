# Vercel Deployment

This Next.js project deploys directly on Vercel. For a fully working admin panel, configure durable database and upload storage first.

## 1. Import the repository

Import the repository into Vercel. The detected framework should be `Next.js`.

- Build command: `npm run build`
- Install command: `npm install`
- Node.js: 20 or newer

No `vercel.json` file is required.

## 2. Configure PostgreSQL

Create a PostgreSQL database using Neon, Supabase, Vercel Marketplace, or another managed PostgreSQL provider.

Add:

```text
DATABASE_URL=postgresql://...
POSTGRES_SSL=true
REQUIRE_DATABASE=true
```

The app automatically creates the required plan, category, deletion-tracking and message tables when first used. You may also run:

```bash
npm run db:migrate
```

## 3. Configure durable uploads

Vercel functions have an ephemeral filesystem. Configure Cloudinary:

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=myhouseplans
REQUIRE_CLOUD_UPLOADS=true
```

Without Cloudinary, the upload API intentionally returns an error on Vercel instead of pretending the file was stored permanently.

Admin uploads use a protected signed-upload endpoint and then send files directly to Cloudinary. This allows large PDF, ZIP, DWG, RVT, and IFC files to avoid Vercel function request-size limits.

## 4. Protect the admin area

Add:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=a-long-random-password
ADMIN_SESSION_SECRET=a-different-long-random-secret
```

The admin area remains unavailable in production if `ADMIN_PASSWORD` is missing.

## 5. Verify after deployment

Open:

```text
/api/health
```

Confirm:

- `checks.databaseReachable` is `true`
- `checks.uploadProvider` is `cloudinary`
- `deploymentReady` is `true`

Then log in at `/admin/login`, create a draft plan, upload an image, publish it, and verify its public page.

## Local development

Local development may use JSON files and disk uploads when PostgreSQL and Cloudinary are absent. These fallbacks are for local development only.
