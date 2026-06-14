import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run database migrations.");
  process.exit(1);
}

const useSsl = process.env.POSTGRES_SSL !== "false";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
});

try {
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

  await pool.query("create index if not exists app_plans_status_idx on app_plans(status);");
  await pool.query("create index if not exists app_messages_status_idx on app_messages(status);");
  console.log("Database migration completed.");
} finally {
  await pool.end();
}
