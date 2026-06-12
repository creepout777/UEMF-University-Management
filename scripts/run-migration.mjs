import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5433/uemf" });
await client.connect();

console.log("⚡ Running UEMF Telegram DB migration...");

const runQuery = async (sql) => {
  try {
    await client.query(sql);
    console.log(`✓ Executed: ${sql.slice(0, 50)}...`);
  } catch (err) {
    if (err.code === "42701" || err.code === "42P07") {
      // Column or table already exists
      console.log(`⚠ Already exists: ${err.message}`);
    } else {
      console.error(`✗ Error: ${err.message}`, err);
    }
  }
};

// 1. Create absences table
await runQuery(`
  CREATE TABLE IF NOT EXISTS "absences" (
    "id" serial PRIMARY KEY NOT NULL,
    "student_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "date" timestamp NOT NULL,
    "status" text DEFAULT 'unexcused' NOT NULL,
    "reason" text,
    "created_at" timestamp DEFAULT now() NOT NULL
  )
`);

// 2. Add columns to users
await runQuery(`ALTER TABLE "users" ADD COLUMN "telegram_chat_id" text`);
await runQuery(`ALTER TABLE "users" ADD COLUMN "telegram_link_token" text`);
await runQuery(`ALTER TABLE "users" ADD COLUMN "telegram_link_expires" timestamp`);
await runQuery(`ALTER TABLE "users" ADD CONSTRAINT "users_telegram_chat_id_unique" UNIQUE("telegram_chat_id")`);
await runQuery(`ALTER TABLE "users" ADD CONSTRAINT "users_telegram_link_token_unique" UNIQUE("telegram_link_token")`);

// 3. Add column to enrollments
await runQuery(`ALTER TABLE "enrollments" ADD COLUMN "progress_percent" integer DEFAULT 0 NOT NULL`);

console.log("⚡ Migration finished!");
await client.end();
