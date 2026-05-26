import "dotenv/config";
import { randomBytes, pbkdf2 as pbkdf2Callback } from "node:crypto";
import { promisify } from "node:util";
import { parseArgs } from "node:util";

const pbkdf2 = promisify(pbkdf2Callback);

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;

const usage = () => {
  console.log(`Usage:
  node scripts/admin-users.mjs list
  node scripts/admin-users.mjs add --email user@example.com --password "secret"
  node scripts/admin-users.mjs set-password --email user@example.com --password "secret"
  node scripts/admin-users.mjs delete --email user@example.com
`);
};

const fail = (message) => {
  console.error(message);
  usage();
  process.exit(1);
};

const requireEnv = () => {
  if (!accountId || !apiToken || !databaseId) {
    fail("Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, or CLOUDFLARE_D1_DATABASE_ID in .env.");
  }
};

const sqlLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`;

const queryD1 = async (sql) => {
  requireEnv();

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ sql })
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    const errors = payload?.errors?.map((error) => error.message).join("; ") || `HTTP ${response.status}`;
    throw new Error(errors);
  }

  return payload;
};

const hashPassword = async (password) => {
  const salt = randomBytes(16);
  const iterations = 100_000;
  const derived = await pbkdf2(password, salt, iterations, 32, "sha256");
  return `pbkdf2:${iterations}:${salt.toString("base64")}:${derived.toString("base64")}`;
};

const getUserByEmail = async (email) => {
  const payload = await queryD1(
    `SELECT id, email, created_at, updated_at FROM admin_users WHERE email = ${sqlLiteral(email.trim().toLowerCase())} LIMIT 1`
  );
  return payload?.result?.[0]?.results?.[0] ?? null;
};

const printUsers = (rows) => {
  if (!rows.length) {
    console.log("No admin users found.");
    return;
  }

  console.table(rows);
};

const main = async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      email: { type: "string" },
      password: { type: "string" }
    }
  });

  const command = positionals[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "list") {
    const payload = await queryD1("SELECT id, email, created_at, updated_at FROM admin_users ORDER BY email ASC");
    const rows = payload?.result?.[0]?.results ?? [];
    printUsers(rows);
    return;
  }

  const email = values.email?.trim().toLowerCase();
  const password = values.password;

  if (!email) {
    fail("Missing --email.");
  }

  if (command === "add") {
    if (!password) {
      fail("Missing --password.");
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      fail(`User already exists: ${email}`);
    }

    const timestamp = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    await queryD1(
      `INSERT INTO admin_users (id, email, password_hash, created_at, updated_at)
       VALUES (lower(hex(randomblob(16))), ${sqlLiteral(email)}, ${sqlLiteral(passwordHash)}, ${sqlLiteral(timestamp)}, ${sqlLiteral(timestamp)})`
    );

    console.log(`Added admin user: ${email}`);
    return;
  }

  if (command === "set-password") {
    if (!password) {
      fail("Missing --password.");
    }

    const existing = await getUserByEmail(email);
    if (!existing) {
      fail(`User not found: ${email}`);
    }

    const timestamp = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    await queryD1(
      `UPDATE admin_users
       SET password_hash = ${sqlLiteral(passwordHash)}, updated_at = ${sqlLiteral(timestamp)}
       WHERE email = ${sqlLiteral(email)}`
    );

    console.log(`Updated password for: ${email}`);
    return;
  }

  if (command === "delete") {
    const existing = await getUserByEmail(email);
    if (!existing) {
      fail(`User not found: ${email}`);
    }

    await queryD1(`DELETE FROM admin_users WHERE email = ${sqlLiteral(email)}`);
    console.log(`Deleted admin user: ${email}`);
    return;
  }

  fail(`Unknown command: ${command}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
