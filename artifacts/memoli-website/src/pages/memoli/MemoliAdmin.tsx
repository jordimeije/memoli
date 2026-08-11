import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle, Archive, Bell, Check, CheckCircle2, ChefHat, Clock3,
  Edit3, Package, RefreshCw, Save, ShoppingBag, Store, TrendingUp,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { api, asset } from "@/lib/paths";

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus = "nieuw" | "in_bereiding" | "klaar" | "gearchiveerd";

interface OrderItem { name: string; qty: number; price: number }
interface Order {
  id: string; name: string; phone: string; note: string;
  items: OrderItem[]; total: number; status: OrderStatus; createdAt: string;
}

type DayKey = "ma" | "di" | "wo" | "do" | "vr" | "za" | "zo";
interface DayHours { enabled: boolean; from: string; to: string }
type OpeningHours = Record<DayKey, DayHours>;
interface Settings { waitTime: number; isOpen: boolean; openingHours: OpeningHours }

const DEFAULT_OPENING_HOURS: OpeningHours = {
  ma: { enabled: true, from: "12:00", to: "22:00" },
  di: { enabled: true, from: "12:00", to: "22:00" },
  wo: { enabled: true, from: "12:00", to: "22:00" },
  do: { enabled: true, from: "12:00", to: "22:00" },
  vr: { enabled: true, from: "12:00", to: "22:00" },
  za: { enabled: true, from: "12:00", to: "22:00" },
  zo: { enabled: true, from: "14:00", to: "21:00" },
};

const WEEKDAYS: { key: DayKey; label: string }[] = [
  { key: "ma", label: "Maandag" }, { key: "di", label: "Dinsdag" },
  { key: "wo", label: "Woensdag" }, { key: "do", label: "Donderdag" },
  { key: "vr", label: "Vrijdag" }, { key: "za", label: "Zaterdag" },
  { key: "zo", label: "Zondag" },
];

// ── API helpers ────────────────────────────────────────────────────────────
async function fetchOrders(): Promise<{ orders: Order[]; settings: Settings }> {
  const r = await fetch(api("orders"));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function advanceOrderStatus(id: string): Promise<void> {
  const r = await fetch(api(`orders/${encodeURIComponent(id)}/status`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}",
  });
}

async function archiveOrder(id: string): Promise<void> {
  const r = await fetch(api(`orders/${encodeURIComponent(id)}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "gearchiveerd" }),
  });
}

async function saveSettings(s: Settings): Promise<void> {
  const r = await fetch(api("settings"), {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
  });
}

// ── Constants ──────────────────────────────────────────────────────────────
const DISH_LIST = [
  ["Broodje Döner", 5.5], ["Broodje Döner Groot", 7], ["Dürüm Döner", 4.5],
  ["Broodje Adana", 5.5], ["Broodje Sis Kebab", 5.5], ["Broodje Köfte", 5.5],
  ["Broodje Kipfilet", 5.5], ["Döner Schotel", 12.5], ["Adana Schotel", 13.5],
  ["Köfte Schotel", 12.5], ["Sis Kebab Schotel", 14], ["Kipfilet Schotel", 12.5],
  ["İskender Kebab Schotel", 14.5], ["Memoli Mix Speciaal", 18],
  ["Lahmacun met Salade", 2.5], ["Lahmacun met Döner", 4], ["Lahmacun met Kaas", 3.5],
  ["Kapsalon Döner", 9.5], ["Rijst met Döner", 8.5], ["Rijst", 3], ["Aardappelen", 3],
] as const;

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  nieuw:       { label: "Nieuw",       color: "text-amber-400", bg: "bg-amber-500/10",  border: "border-amber-500/30",  icon: <Bell className="w-3.5 h-3.5" /> },
  in_bereiding:{ label: "In bereiding",color: "text-blue-400",  bg: "bg-blue-500/10",   border: "border-blue-500/30",   icon: <ChefHat className="w-3.5 h-3.5" /> },
  klaar:       { label: "Klaar",       color: "text-green-400", bg: "bg-green-500/10",  border: "border-green-500/30",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  gearchiveerd:{ label: "Afgerond",    color: "text-gray-400",  bg: "bg-gray-500/10",   border: "border-gray-500/30",   icon: <Archive className="w-3.5 h-3.5" /> },
};

const STATUS_NEXT: Partial<Record<OrderStatus, string>> = {
  nieuw: "▶ In bereiding",
  in_bereiding: "✓ Markeer klaar",
};

type Tab = "bestellingen" | "wachttijd" | "gerechten" | "archief";

// ── Component ──────────────────────────────────────────────────────────────
export function MemoliAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>("bestellingen");
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>({ waitTime: 20, isOpen: true, openingHours: DEFAULT_OPENING_HOURS });
  const [dishes, setDishes] = useState(DISH_LIST.map(([name, price]) => ({ name, price: price as number, available: true })));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Polling ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
      setSettings(data.settings);
      setLastRefresh(new Date());
    } catch {
      // Other errors: API not yet available — ignore silently
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(() => refresh(true), 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refresh]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleAdvance(id: string) {
    try {
      await advanceOrderStatus(id);
      refresh(true);
    } catch {}
  }

  async function handleArchive(id: string) {
    try {
      await archiveOrder(id);
      refresh(true);
    } catch {}
  }

  async function handleWaitTime(v: number) {
    const next = { ...settings, waitTime: v };
    setSettings(next);
    await saveSettings(next);
  }

  async function handleOpen(v: boolean) {
    const next = { ...settings, isOpen: v };
    setSettings(next);
    await saveSettings(next);
  }

  async function handleHours(day: DayKey, change: Partial<DayHours>) {
    const next = {
      ...settings,
      openingHours: {
        ...settings.openingHours,
        [day]: { ...settings.openingHours[day], ...change },
      },
    };
    setSettings(next);
    await saveSettings(next);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const active    = orders.filter(o => o.status !== "gearchiveerd");
  const archived  = orders.filter(o => o.status === "gearchiveerd");
  const newCount  = active.filter(o => o.status === "nieuw").length;
  const waitColor = settings.waitTime <= 15 ? "text-green-400" : settings.waitTime <= 30 ? "text-[#E67E22]" : "text-red-400";
  const waitBg    = settings.waitTime <= 15 ? "bg-green-500" : settings.waitTime <= 30 ? "bg-[#E67E22]" : "bg-red-500";

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "bestellingen", label: "Bestellingen", icon: <ShoppingBag className="w-4 h-4" />, badge: newCount },
    { id: "wachttijd",    label: "Wachttijd",    icon: <Clock3 className="w-4 h-4" /> },
    { id: "gerechten",    label: "Gerechten",    icon: <Package className="w-4 h-4" /> },
    { id: "archief",      label: "Archief",      icon: <Archive className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#1A0A00] font-['Inter'] text-[#F5EDD6]">

      {/* ── Header ── */}
      <header className="border-b border-[#E67E22]/20 bg-[#241004] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={asset("images/memoli-logo.png")} alt="Memoli Kebab" className="h-12 w-12 rounded-full object-contain" />
            <div>
            <p className="font-['Playfair_Display'] text-xl font-bold md:text-2xl">Memoli Beheerderspaneel</p>
            <p className="mt-0.5 text-xs text-[#A0886A]">Krabbenbosweg 25 · Hengelo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <button onClick={() => refresh()} className="hidden sm:flex items-center gap-1.5 text-xs text-[#A0886A] hover:text-[#F5EDD6] transition-colors">
                <RefreshCw className="w-3 h-3" />
                {lastRefresh.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </button>
            )}
            <span className="hidden rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 sm:inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="border-b border-[#2D1500] bg-[#1A0A00]">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <nav className="flex gap-1 pt-4">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-t-lg px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#2D1500] text-[#E67E22] border border-b-0 border-[#E67E22]/30"
                    : "text-[#A0886A] hover:text-[#F5EDD6]"
                }`}>
                {tab.icon}{tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C0392B] text-[10px] font-bold text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">

        {/* ── BESTELLINGEN ── */}
        {activeTab === "bestellingen" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-['Playfair_Display'] text-3xl font-bold">Live Bestellingen</h1>
                <p className="mt-1 text-sm text-[#A0886A]">
                  {loading ? "Laden…" : newCount > 0
                    ? <span className="text-amber-400 font-semibold">{newCount} nieuwe bestelling{newCount > 1 ? "en" : ""} wacht op actie</span>
                    : "Alle bestellingen zijn in behandeling"}
                </p>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${waitBg} text-white`}>
                <Clock3 className="w-4 h-4" />~{settings.waitTime} min
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {([
                { label: "Nieuw",        count: active.filter(o => o.status === "nieuw").length,        color: "text-amber-400", icon: <Bell className="w-4 h-4" /> },
                { label: "In bereiding", count: active.filter(o => o.status === "in_bereiding").length, color: "text-blue-400",  icon: <ChefHat className="w-4 h-4" /> },
                { label: "Klaar",        count: active.filter(o => o.status === "klaar").length,        color: "text-green-400", icon: <CheckCircle2 className="w-4 h-4" /> },
              ] as const).map(s => (
                <div key={s.label} className="rounded-2xl border border-[#E67E22]/15 bg-[#241004] p-4">
                  <div className={`flex items-center gap-1.5 text-sm ${s.color} mb-1`}>{s.icon}{s.label}</div>
                  <p className="font-['Playfair_Display'] text-3xl font-bold text-white">{s.count}</p>
                </div>
              ))}
            </div>

            {/* Orders */}
            {active.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E67E22]/15 bg-[#241004] py-20 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-[#A0886A]" />
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#D1B995]">
                  {loading ? "Bestellingen laden…" : "Geen bestellingen"}
                </p>
                <p className="mt-2 text-sm text-[#A0886A]">Nieuwe bestellingen verschijnen hier automatisch.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map(order => {
                  const cfg = STATUS_CFG[order.status];
                  const hasNext = order.status === "nieuw" || order.status === "in_bereiding";
                  return (
                    <div key={order.id}
                      className={`rounded-2xl border p-5 transition-all duration-300 ${order.status === "nieuw" ? "border-amber-500/40 bg-[#2D1500]" : "border-[#2D1500] bg-[#241004]"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-['Playfair_Display'] text-2xl font-bold text-white">{order.id}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#A0886A]">Geplaatst om {order.createdAt}</p>
                          <p className="text-lg font-bold text-[#E67E22]">€{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs text-[#A0886A] mb-0.5">Klant</p>
                          <p className="font-semibold text-sm">{order.name}</p>
                          <p className="text-xs text-[#A0886A]">{order.phone}</p>
                          {order.note && <p className="text-xs text-[#F5EDD6]/60 mt-0.5 italic">"{order.note}"</p>}
                        </div>
                        <div className="flex-1 min-w-48">
                          <p className="text-xs text-[#A0886A] mb-0.5">Bestelling</p>
                          <ul className="space-y-0.5">
                            {order.items.map(item => (
                              <li key={item.name} className="flex justify-between text-sm gap-4">
                                <span className="text-[#F5EDD6]">{item.qty}× {item.name}</span>
                                <span className="text-[#A0886A]">€{(item.price * item.qty).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {hasNext && (
                          <button onClick={() => handleAdvance(order.id)}
                            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
                              order.status === "nieuw" ? "bg-[#E67E22] hover:bg-amber-500 text-[#1A0A00]" : "bg-[#C0392B] hover:bg-[#E74C3C] text-white"
                            }`}>
                            {STATUS_NEXT[order.status]}
                          </button>
                        )}
                        {order.status === "klaar" && (
                          <button onClick={() => handleArchive(order.id)}
                            className="flex items-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-2.5 text-sm font-bold text-green-400 transition-all hover:bg-green-500 hover:text-[#1A0A00] active:scale-95">
                            <Archive className="w-4 h-4" />Naar archief
                          </button>
                        )}
                        {order.status === "klaar" && (
                          <div className="flex items-center gap-1.5 text-xs text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />Klaar voor afhaal
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Open/Gesloten */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#E67E22]/15 bg-[#241004] p-5">
              <Store className="h-5 w-5 text-[#E67E22] flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Restaurant is nu</p>
                <p className={`text-lg font-bold ${settings.isOpen ? "text-green-400" : "text-red-400"}`}>
                  {settings.isOpen ? "OPEN" : "GESLOTEN"}
                </p>
              </div>
              <Switch checked={settings.isOpen} onCheckedChange={handleOpen}
                className="h-7 w-12 data-[state=checked]:bg-green-500 [&>span]:h-6 [&>span]:w-6 data-[state=checked]:[&>span]:translate-x-5" />
              <span className="hidden text-xs text-[#A0886A] sm:flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" />{orders.length} bestelling{orders.length !== 1 ? "en" : ""} vandaag
              </span>
            </div>
          </div>
        )}

        {/* ── WACHTTIJD ── */}
        {activeTab === "wachttijd" && (
          <div>
            <div className="mb-6">
              <h1 className="font-['Playfair_Display'] text-3xl font-bold">Live Wachttijd</h1>
              <p className="mt-1 text-sm text-[#A0886A]">Klanten zien deze tijd direct op de website</p>
            </div>
            <section className="relative overflow-hidden rounded-3xl border border-[#E67E22]/30 bg-[#2D1500] p-8 shadow-2xl shadow-[#C0392B]/10 mb-8">
              <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-[#C0392B]/10 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[#E67E22]">
                    <Clock3 className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Live Wachttijd</span>
                  </div>
                  <div className={`font-['Playfair_Display'] text-8xl font-bold ${waitColor}`}>
                    {settings.waitTime}<span className="ml-2 text-3xl text-[#A0886A]">min</span>
                  </div>
                  <p className="mt-3 text-[#D1B995]">
                    Klanten zien momenteel: <strong className={waitColor}>~{settings.waitTime} minuten</strong> wachttijd
                  </p>
                </div>
                <div>
                  <Slider min={5} max={90} step={5} value={[settings.waitTime]} onValueChange={v => handleWaitTime(v[0])}
                    className="h-9 [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-[#E67E22] [&_[data-slot=slider-thumb]]:h-7 [&_[data-slot=slider-thumb]]:w-7 [&_[data-slot=slider-thumb]]:border-[#F5EDD6] [&_[data-slot=slider-thumb]]:bg-[#E67E22]" />
                  <div className="mt-2 flex justify-between text-xs text-[#A0886A]">
                    <span>5 min</span><span>90 min</span>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {[10, 15, 20, 30, 45, 60].map(n => (
                      <button key={n} onClick={() => handleWaitTime(n)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-all duration-200 ${settings.waitTime === n ? "border-[#E67E22] bg-[#E67E22] font-bold text-[#1A0A00]" : "border-[#E67E22]/25 text-[#D1B995] hover:border-[#E67E22]"}`}>
                        {n} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <div className="rounded-2xl border border-[#E67E22]/15 bg-[#241004] p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#E67E22] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-[#F5EDD6] mb-0.5">Gesynchroniseerd met de website</p>
                <p className="text-[#A0886A]">Zodra je de slider beweegt, wordt de wachttijd opgeslagen op de server. Klanten zien direct de bijgewerkte tijd.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#E67E22]/15 bg-[#241004] p-5">
              <Store className="h-5 w-5 text-[#E67E22] flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Restaurant is nu</p>
                <p className={`text-lg font-bold ${settings.isOpen ? "text-green-400" : "text-red-400"}`}>{settings.isOpen ? "OPEN" : "GESLOTEN"}</p>
              </div>
              <Switch checked={settings.isOpen} onCheckedChange={handleOpen}
                className="h-7 w-12 data-[state=checked]:bg-green-500 [&>span]:h-6 [&>span]:w-6 data-[state=checked]:[&>span]:translate-x-5" />
            </div>
            <section className="mt-6 rounded-2xl border border-[#E67E22]/15 bg-[#241004] p-5">
              <div className="mb-5 flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[#E67E22]" />
                <div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold">Openingstijden</h2>
                  <p className="text-sm text-[#A0886A]">Deze tijden zijn direct zichtbaar voor klanten.</p>
                </div>
              </div>
              <div className="space-y-2">
                {WEEKDAYS.map(({ key, label }) => {
                  const day = settings.openingHours[key];
                  return (
                    <div key={key} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E67E22]/10 bg-[#1A0A00]/60 px-4 py-3">
                      <span className="w-28 text-sm font-semibold">{label}</span>
                      <Switch checked={day.enabled} onCheckedChange={enabled => handleHours(key, { enabled })}
                        className="h-5 w-9 data-[state=checked]:bg-green-500 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4" />
                      {day.enabled ? (
                        <div className="flex items-center gap-2 text-sm">
                          <input aria-label={`${label} opent`} type="time" value={day.from} onChange={e => handleHours(key, { from: e.target.value })}
                            className="rounded-lg border border-[#E67E22]/20 bg-[#2D1500] px-2 py-1.5 text-[#F5EDD6] [color-scheme:dark] focus:outline-none focus:border-[#E67E22]" />
                          <span className="text-[#A0886A]">tot</span>
                          <input aria-label={`${label} sluit`} type="time" value={day.to} onChange={e => handleHours(key, { to: e.target.value })}
                            className="rounded-lg border border-[#E67E22]/20 bg-[#2D1500] px-2 py-1.5 text-[#F5EDD6] [color-scheme:dark] focus:outline-none focus:border-[#E67E22]" />
                        </div>
                      ) : <span className="text-sm text-[#A0886A]">Gesloten</span>}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ── GERECHTEN ── */}
        {activeTab === "gerechten" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-['Playfair_Display'] text-3xl font-bold">Gerechten beheren</h1>
                <p className="mt-1 text-sm text-[#A0886A]">Beschikbaarheid en prijzen voor je online menu</p>
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-[#C0392B] px-5 py-3 text-sm font-bold transition-all hover:bg-[#E74C3C] active:scale-95">
                <Save className="h-4 w-4" />Wijzigingen opslaan
              </button>
            </div>
            <div className="rounded-3xl border border-[#E67E22]/15 bg-[#241004] overflow-hidden">
              <div className="divide-y divide-[#2D1500]">
                {dishes.map((dish, i) => (
                  <div key={dish.name} className="flex items-center gap-4 px-6 py-4">
                    <Switch checked={dish.available}
                      onCheckedChange={available => setDishes(ds => ds.map((d, idx) => idx === i ? { ...d, available } : d))}
                      className="data-[state=checked]:bg-green-500 flex-shrink-0" />
                    <div className={`flex-1 min-w-0 ${!dish.available ? "opacity-40" : ""}`}>
                      <p className="font-semibold">{dish.name}</p>
                      <p className="text-xs text-[#A0886A]">{dish.available ? "Beschikbaar" : "Tijdelijk uitverkocht"}</p>
                    </div>
                    <div className="flex items-center rounded-lg border border-[#E67E22]/20 bg-[#1A0A00]">
                      <span className="pl-3 text-sm text-[#A0886A]">€</span>
                      <input aria-label={`Prijs ${dish.name}`} value={dish.price.toFixed(2)}
                        onChange={e => setDishes(ds => ds.map((d, idx) => idx === i ? { ...d, price: Number(e.target.value) || 0 } : d))}
                        className="w-16 bg-transparent px-2 py-2 text-right text-sm outline-none focus:text-[#E67E22]" />
                      <Edit3 className="mr-3 h-3.5 w-3.5 text-[#A0886A]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ARCHIEF ── */}
        {activeTab === "archief" && (
          <div>
            <div className="mb-8">
              <h1 className="font-['Playfair_Display'] text-3xl font-bold">Archief</h1>
              <p className="mt-1 text-sm text-[#A0886A]">
                {archived.length === 0 ? "Nog geen gearchiveerde bestellingen." : `${archived.length} afgeronde bestelling${archived.length !== 1 ? "en" : ""}`}
              </p>
            </div>
            {archived.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E67E22]/15 bg-[#241004] py-20 text-center">
                <Archive className="mb-4 h-12 w-12 text-[#A0886A]" />
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#D1B995]">Archief is leeg</p>
                <p className="mt-2 text-sm text-[#A0886A]">Afgeronde bestellingen worden hier bewaard.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archived.map(order => (
                  <div key={order.id} className="rounded-2xl border border-green-500/20 bg-[#241004] p-5 opacity-75">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-['Playfair_Display'] text-xl font-bold text-white">{order.id}</span>
                        <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">Afgerond</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#A0886A]">{order.createdAt}</p>
                        <p className="font-bold text-[#A0886A]">€{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4">
                      <div>
                        <p className="text-sm font-semibold">{order.name}</p>
                        <p className="text-xs text-[#A0886A]">{order.phone}</p>
                      </div>
                      <p className="text-xs text-[#A0886A] flex-1">{order.items.map(i => `${i.qty}× ${i.name}`).join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-500/40 bg-[#24492d] px-5 py-3 font-semibold text-green-300 shadow-xl">
          <Check className="h-5 w-5" />Wijzigingen opgeslagen
        </div>
      )}
    </div>
  );
}

export default MemoliAdmin;
