import bcrypt from "bcryptjs";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const users = [
  { username: "admin",          email: "admin@uemf.ma",          password: "admin123",   role: "admin",          linkedEntityId: 0 },
  { username: "administration", email: "administration@uemf.ma", password: "admin456",   role: "administration", linkedEntityId: 0 },
  { username: "teacher",        email: "teacher@uemf.ma",        password: "teacher123", role: "teacher",        linkedEntityId: 1 },
  { username: "student",        email: "student@uemf.ma",        password: "student123", role: "student",        linkedEntityId: 1 },
];

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10);
  await client.query(
    `INSERT INTO users (username, email, password_hash, role, linked_entity_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [u.username, u.email, hash, u.role, u.linkedEntityId]
  );
  console.log(`✓ ${u.username} (${u.role})`);
}

await client.end();
console.log("Done.");
