import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5433/uemf" });
await client.connect();

// Clear all telegram chat IDs so any user can re-link fresh
const cleared = await client.query(
  "UPDATE users SET telegram_chat_id = NULL, telegram_link_token = NULL, telegram_link_expires = NULL WHERE telegram_chat_id IS NOT NULL"
);
console.log(`✓ Cleared ${cleared.rowCount} linked telegram accounts`);

const users = await client.query("SELECT id, username, role, telegram_chat_id FROM users");
console.log("Users:");
for (const u of users.rows) {
  console.log(`  [${u.id}] ${u.username} (${u.role}) - chat_id: ${u.telegram_chat_id ?? "none"}`);
}

await client.end();
