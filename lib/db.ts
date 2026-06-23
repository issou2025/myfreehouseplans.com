import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

function shouldUseSsl() {
  if (!connectionString) return false;
  if (process.env.POSTGRES_SSL === "false") return false;
  return process.env.NODE_ENV === "production" || connectionString.includes("render.com");
}

export function hasDatabase() {
  return Boolean(connectionString);
}

export function getPool() {
  if (!connectionString) return null;
  if (!globalThis.postgresPool) {
    globalThis.postgresPool = new Pool({
      connectionString,
      ssl: shouldUseSsl() ? { rejectUnauthorized: false } : undefined
    });
  }
  return globalThis.postgresPool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const pool = getPool();
  if (!pool) return null;
  return pool.query<T>(text, values);
}

export async function ensureDatabaseSchema() {
  const pool = getPool();
  if (!pool) return false;

  await pool.query(`
    create table if not exists app_plans (
      id text primary key,
      slug text not null unique,
      reference text not null unique,
      status text not null default 'Draft',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists app_messages (
      id text primary key,
      email text not null,
      status text not null default 'New',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists app_deleted_plans (
      id text primary key,
      deleted_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists app_categories (
      id text primary key,
      slug text not null unique,
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists app_deleted_categories (
      id text primary key,
      deleted_at timestamptz not null default now()
    );
  `);

  await pool.query("create index if not exists app_plans_status_idx on app_plans(status);");
  await pool.query("create index if not exists app_messages_status_idx on app_messages(status);");
  await pool.query("create index if not exists app_categories_slug_idx on app_categories(slug);");
  return true;
}
