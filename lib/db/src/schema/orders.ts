import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ── Orders ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export type OrderStatus = "nieuw" | "in_bereiding" | "klaar" | "gearchiveerd";

export const ordersTable = pgTable("orders", {
  /**
   * Auto-increment PK — also the source of the human-readable display ID.
   * Display ID = `#${String(pk).padStart(4, "0")}` (e.g. #0001).
   * Using the serial directly avoids race conditions from count-based ID
   * generation: PostgreSQL allocates pk atomically on INSERT.
   */
  pk: serial("pk").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  note: text("note").notNull().default(""),
  items: jsonb("items").notNull().$type<OrderItem[]>(),
  /** Stored as euro-cents (integer) to avoid floating-point rounding. */
  total: integer("total_cents").notNull(),
  status: text("status").notNull().default("nieuw").$type<OrderStatus>(),
  /** Locale-formatted time string, e.g. "14:30" — for display only. */
  createdAt: text("created_at").notNull(),
  createdAtTs: timestamp("created_at_ts").notNull().defaultNow(),
});

export type DbOrder = typeof ordersTable.$inferSelect;

// ── Settings (single-row singleton, id always = 1) ───────────────────────────
// Using a fixed integer PK instead of serial so that a PK constraint at the
// database level guarantees exactly one row. Inserts always use id=1 with
// ON CONFLICT DO NOTHING, which is safe under concurrent first requests.

export const settingsTable = pgTable("settings", {
  id: integer("id").primaryKey(),
  waitTime: integer("wait_time").notNull().default(20),
  isOpen: boolean("is_open").notNull().default(true),
  /** Per-day opening hours, stored as JSONB. Null until first update. */
  openingHours: jsonb("opening_hours").$type<Record<string, { enabled: boolean; from: string; to: string }>>(),
});
