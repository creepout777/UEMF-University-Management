import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5433/uemf" });
await client.connect();

const r = await client.query("SELECT id, username, role, linked_entity_id FROM users");
console.log("Users in DB:", r.rows);
await client.end();
