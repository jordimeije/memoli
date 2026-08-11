import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ordersTable, settingsTable, type OrderItem, type OrderStatus } from "@workspace/db";

const router = Router();

// ── Opening-hours types ───────────────────────────────────────────────────────

export type DayKey = "ma" | "di" | "wo" | "do" | "vr" | "za" | "zo";

export interface DayHours {
  enabled: boolean;
  from: string;
  to: string;
}

export type OpeningHours = Record<DayKey, DayHours>;

export interface RestaurantSettings {
  waitTime: number;
  isOpen: boolean;
  openingHours: OpeningHours;
}

// ── Server-side menu (source of truth for prices) ────────────────────────────
const MENU_PRICES: Record<string, number> = {
  // Mobile app items
  "Döner Kebab": 10.50,
  "Iskender Kebab": 14.00,
  "Adana Kebab": 13.50,
  "Mixed Grill": 16.00,
  "Sis Kebab": 12.50,
  "Kip Wrap": 8.50,
  "Adana Wrap": 9.00,
  "Falafel Wrap": 8.00,
  "Groenten Dürüm": 7.50,
  "Turkse Pide": 9.00,
  "Lahmacun": 7.00,
  "Kip Pide": 10.00,
  "Hummus": 5.50,
  "Ezme": 4.50,
  "Gemengde Meze": 8.00,
  "Friet": 3.50,
  "Ayran": 2.50,
  "Water": 1.50,
  "Cola": 2.50,
  "Sinaasappelsap": 3.00,
  // Web mockup items
  "Broodje Döner": 5.50,
  "Broodje Döner Groot": 7.00,
  "Broodje Adana": 5.50,
  "Broodje Sis Kebab": 5.50,
  "Broodje Köfte": 5.50,
  "Broodje Kipfilet": 5.50,
  "Extra Los Broodje": 1.00,
  "Dürüm Döner": 4.50,
  "Dürüm Adana": 5.00,
  "Dürüm Köfte": 5.00,
  "Döner Schotel": 12.50,
  "Adana Schotel": 13.50,
  "Köfte Schotel": 12.50,
  "Sis Kebab Schotel": 14.00,
  "Kipfilet Schotel": 12.50,
  "Lamskoteletten Schotel": 16.50,
  "İskender Kebab Schotel": 14.50,
  "Memoli Mix Speciaal": 18.00,
  "Lahmacun met Salade": 2.50,
  "Lahmacun met Döner": 4.00,
  "Lahmacun met Kaas": 3.50,
  "Kapsalon Döner": 9.50,
  "Rijst met Döner": 8.50,
  "Rijst": 3.00,
  "Aardappelen": 3.00,
  "Mix Salade": 4.50,
  "Frisdranken": 2.00,
  "Ayran / Cherry": 2.00,
  "Fanta Exotic / Lemon": 2.00,
  "Fernandes Cola": 2.00,
  "Water / Spa": 1.50,
  "AA Drink / Red Bull": 3.00,
};

const VALID_STATUSES = new Set<OrderStatus>([
  "nieuw",
  "in_bereiding",
  "klaar",
  "gearchiveerd",
]);

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  nieuw: "in_bereiding",
  in_bereiding: "klaar",
  klaar: "gearchiveerd",
  gearchiveerd: null,
};

const DEFAULT_OPENING_HOURS: OpeningHours = {
  ma: { enabled: true, from: "12:00", to: "22:00" },
  di: { enabled: true, from: "12:00", to: "22:00" },
  wo: { enabled: true, from: "12:00", to: "22:00" },
  do: { enabled: true, from: "12:00", to: "22:00" },
  vr: { enabled: true, from: "12:00", to: "22:00" },
  za: { enabled: true, from: "12:00", to: "22:00" },
  zo: { enabled: true, from: "14:00", to: "21:00" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Euro float → integer cents for DB storage. */
function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/** Integer cents → euro float for API responses. */
function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Display ID derived from the auto-increment pk.
 * PostgreSQL allocates the serial atomically on INSERT — race-condition-free.
 */
function pkToDisplayId(pk: number): string {
  return `#${String(pk).padStart(4, "0")}`;
}

/**
 * Parse the integer pk from a display ID like "#0001".
 * Returns NaN if the format is unexpected.
 */
function displayIdToPk(id: string): number {
  const n = parseInt(id.replace(/^#0*/, ""), 10);
  return isNaN(n) ? parseInt(id.replace("#", ""), 10) : n;
}

/** Map an orders DB row to the API response shape. */
function rowToOrder(row: typeof ordersTable.$inferSelect) {
  return {
    id: pkToDisplayId(row.pk),
    name: row.name,
    phone: row.phone,
    note: row.note,
    items: row.items as OrderItem[],
    total: fromCents(row.total),
    status: row.status as OrderStatus,
    createdAt: row.createdAt,
  };
}

/** Map a settings DB row to the API response shape. */
function rowToSettings(row: typeof settingsTable.$inferSelect): RestaurantSettings {
  return {
    waitTime: row.waitTime,
    isOpen: row.isOpen,
    openingHours: (row.openingHours as OpeningHours | null) ?? DEFAULT_OPENING_HOURS,
  };
}

/**
 * Ensure the settings singleton row exists (id = 1) and return it.
 *
 * Uses INSERT … ON CONFLICT DO NOTHING so concurrent first requests are safe:
 * only one row can ever exist (enforced by the integer PK = 1 constraint).
 */
async function getOrInitSettings() {
  await db
    .insert(settingsTable)
    .values({ id: 1, waitTime: 20, isOpen: true, openingHours: DEFAULT_OPENING_HOURS })
    .onConflictDoNothing();
  const rows = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, 1))
    .limit(1);
  return rows[0]!;
}

// ── Opening-hours validation ──────────────────────────────────────────────────

const DAY_KEYS: DayKey[] = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isOpeningHours(value: unknown): value is OpeningHours {
  if (typeof value !== "object" || value === null) return false;
  const hours = value as Record<string, unknown>;
  return DAY_KEYS.every(day => {
    const entry = hours[day];
    if (typeof entry !== "object" || entry === null) return false;
    const item = entry as Record<string, unknown>;
    return (
      typeof item.enabled === "boolean" &&
      typeof item.from === "string" &&
      TIME_PATTERN.test(item.from) &&
      typeof item.to === "string" &&
      TIME_PATTERN.test(item.to)
    );
  });
}

// ── GET /api/orders ──────────────────────────────────────────────────────────
router.get("/orders", async (_req, res) => {
  try {
    const [rows, settingsRow] = await Promise.all([
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAtTs)),
      getOrInitSettings(),
    ]);
    res.json({
      orders: rows.map(rowToOrder),
      settings: rowToSettings(settingsRow),
    });
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ── POST /api/orders  (public — customers place orders) ──────────────────────
router.post("/orders", async (req, res) => {
  try {
    const settingsRow = await getOrInitSettings();

    if (!settingsRow.isOpen) {
      res.status(409).json({ error: "Het restaurant is momenteel gesloten." });
      return;
    }

    const { name, phone, note, items } = req.body as {
      name?: unknown;
      phone?: unknown;
      note?: unknown;
      items?: unknown;
    };

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (typeof phone !== "string" || !phone.trim()) {
      res.status(400).json({ error: "phone is required" });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "items must be a non-empty array" });
      return;
    }
    if (items.length > 30) {
      res.status(400).json({ error: "Too many distinct items (max 30)" });
      return;
    }

    const validatedItems: OrderItem[] = [];
    for (const raw of items) {
      if (typeof raw !== "object" || raw === null) {
        res.status(400).json({ error: "Each item must be an object" });
        return;
      }
      const item = raw as Record<string, unknown>;
      const itemName = typeof item["name"] === "string" ? item["name"].trim() : "";
      const qty = Number(item["qty"]);

      if (!itemName || !(itemName in MENU_PRICES)) {
        res.status(400).json({ error: `Unknown menu item: ${itemName}` });
        return;
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        res.status(400).json({ error: `Invalid quantity for ${itemName}: must be 1–99` });
        return;
      }

      validatedItems.push({ name: itemName, qty, price: MENU_PRICES[itemName]! });
    }

    const totalEuros = validatedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const time = new Date().toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // pk is allocated atomically by PostgreSQL — display ID derived from it
    const [inserted] = await db
      .insert(ordersTable)
      .values({
        name: name.trim(),
        phone: phone.trim(),
        note: typeof note === "string" ? note.trim() : "",
        items: validatedItems,
        total: toCents(totalEuros),
        status: "nieuw",
        createdAt: time,
      })
      .returning();

    res.status(201).json({ order: rowToOrder(inserted!) });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ── PATCH /api/orders/:id/status  (admin only) ───────────────────────────────
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const rawId = req.params["id"] as string;
    const pk = displayIdToPk(rawId);

    if (isNaN(pk)) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.pk, pk))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const row = rows[0]!;
    const { status } = req.body as { status?: unknown };

    let newStatus: OrderStatus;
    if (status !== undefined) {
      if (!VALID_STATUSES.has(status as OrderStatus)) {
        res.status(400).json({
          error: `Invalid status '${String(status)}'. Allowed: ${[...VALID_STATUSES].join(", ")}`,
        });
        return;
      }
      newStatus = status as OrderStatus;
    } else {
      const next = STATUS_FLOW[row.status as OrderStatus];
      if (!next) {
        res.json({ order: rowToOrder(row) });
        return;
      }
      newStatus = next;
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status: newStatus })
      .where(eq(ordersTable.pk, pk))
      .returning();

    res.json({ order: rowToOrder(updated!) });
  } catch (err) {
    console.error("PATCH /orders/:id/status error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET /api/settings  (public) ──────────────────────────────────────────────
router.get("/settings", async (_req, res) => {
  try {
    const row = await getOrInitSettings();
    res.json(rowToSettings(row));
  } catch (err) {
    console.error("GET /settings error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ── PUT /api/settings  (admin only) ─────────────────────────────────────────
router.put("/settings", async (req, res) => {
  try {
    const { waitTime, isOpen, openingHours } = req.body as {
      waitTime?: unknown;
      isOpen?: unknown;
      openingHours?: unknown;
    };

    const updates: { waitTime?: number; isOpen?: boolean; openingHours?: OpeningHours } = {};

    if (waitTime !== undefined) {
      const wt = Number(waitTime);
      if (!Number.isInteger(wt) || wt < 0 || wt > 300) {
        res.status(400).json({ error: "waitTime must be an integer 0–300" });
        return;
      }
      updates.waitTime = wt;
    }
    if (isOpen !== undefined) {
      if (typeof isOpen !== "boolean") {
        res.status(400).json({ error: "isOpen must be a boolean" });
        return;
      }
      updates.isOpen = isOpen;
    }
    if (openingHours !== undefined) {
      if (!isOpeningHours(openingHours)) {
        res.status(400).json({ error: "openingHours bevat ongeldige dagen of tijden" });
        return;
      }
      updates.openingHours = openingHours;
    }

    // Ensure singleton row exists, then update it
    await getOrInitSettings();
    const [updated] = await db
      .update(settingsTable)
      .set(updates)
      .where(eq(settingsTable.id, 1))
      .returning();

    res.json(rowToSettings(updated!));
  } catch (err) {
    console.error("PUT /settings error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
