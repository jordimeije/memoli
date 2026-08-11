import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import app from "./app";
import { db } from "@workspace/db";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Run all pending Drizzle migrations before accepting traffic.
// Migration SQL files are copied to dist/migrations/ by build.mjs.
// This ensures a fresh database always has the correct schema on every
// start/restart, with no manual intervention needed.
const migrationsFolder = path.join(__dirname, "migrations");
logger.info({ migrationsFolder }, "Running database migrations");
await migrate(db, { migrationsFolder });
logger.info("Database migrations complete");

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
