// SEO (NL): "Afhaal Centrum Memoli Hengelo - Verse Turkse gerechten. Döner, kebab, schotels, lahmacun."
// SEO (EN): "Memoli Takeaway Hengelo - Fresh Turkish food. Döner, kebab, platters, lahmacun."
// SEO (TR): "Memoli Paket Servis Hengelo - Taze Türk yemekleri. Döner, kebap, tabaklar, lahmacun."

import { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, Clock, MapPin, Phone, ChevronDown, Star, Check, Flame } from "lucide-react";

type Lang = "nl" | "en" | "tr";
const FLAGS: Record<Lang, string> = { nl: "🇳🇱", en: "🇬🇧", tr: "🇹🇷" };

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  nl: {
    navMenu: "Menu", navAbout: "Over Ons", navContact: "Contact", navCart: "Bestelling",
    heroTagline: ["Vers.", "Warm.", "Turks."],
    heroSub: "Afhaal Centrum Memoli — Hengelo",
    heroDesc: "Authentieke Turkse gerechten, vers bereid voor afhaal. Al meer dan 18 jaar dé plek voor döner, kebab en meer.",
    heroCta: "Bestel nu", heroMore: "Meer info",
    heroReviews: "500+ reviews", heroHours: "ma–za 12:00–22:00",
    waitBadge: (n: number) => `Wachttijd: ~${n} min`,
    waitBanner: (n: number) => <><strong>{n} minuten</strong> wachttijd — Kom gerust langs!</>,
    menuLabel: "Onze Kaart", menuTitle: "Vers & Lekker",
    menuDesc: "Elke dag vers bereid met de beste ingrediënten. Kies je favorieten en wij zorgen voor de rest.",
    addBtn: "Voeg toe",
    aboutLabel: "Ons Verhaal", aboutTitle: "Sinds 2006 in het hart van Hengelo",
    aboutP1: "Opgericht in mei 2006 aan de Krabbenbosweg serveren wij al meer dan 18 jaar de lekkerste Turkse gerechten aan onze trouwe klanten. Familie-recepten, verse ingrediënten, elke dag opnieuw.",
    aboutP2: "Of je nu snel iets wilt meenemen of een grote bestelling plaatst — bij Memoli word je altijd met een glimlach geholpen.",
    hours: "Ma–Za: 12:00–22:00 · Zo: 14:00–21:00",
    footerDesc: "Vers Turkse afhaalgerechten in Hengelo. Döner, kebab, schotels, lahmacun en meer.",
    footerHoursTitle: "Openingstijden", footerMonSat: "Maandag – Zaterdag", footerSun: "Zondag", footerContact: "Contact",
    cartTitle: "Uw Bestelling", cartEmpty: "Uw winkelwagen is leeg", cartEmptySub: "Voeg gerechten toe via het menu",
    cartSubtotal: "Subtotaal", cartReady: (n: number) => `Klaar over ± ${n} min`,
    cartPlace: "Bestelling plaatsen", cartConfirm: "Bestelling ontvangen! Tot zo!",
    cats: { broodjes: "Broodjes", durum: "Dürüm / Wrap", schotels: "Schotels", lahmacun: "Lahmacun", overig: "Overig", dranken: "Dranken" },
  },
  en: {
    navMenu: "Menu", navAbout: "About Us", navContact: "Contact", navCart: "Order",
    heroTagline: ["Fresh.", "Warm.", "Turkish."],
    heroSub: "Memoli Takeaway Centre — Hengelo",
    heroDesc: "Authentic Turkish dishes, freshly prepared for collection. Your local döner, kebab & more for over 18 years.",
    heroCta: "Order now", heroMore: "More info",
    heroReviews: "500+ reviews", heroHours: "Mon–Sat 12:00–22:00",
    waitBadge: (n: number) => `Wait time: ~${n} min`,
    waitBanner: (n: number) => <><strong>{n} minutes</strong> wait time — Come on over!</>,
    menuLabel: "Our Menu", menuTitle: "Fresh & Delicious",
    menuDesc: "Made fresh every day with the finest ingredients. Pick your favourites and we'll take care of the rest.",
    addBtn: "Add",
    aboutLabel: "Our Story", aboutTitle: "In the heart of Hengelo since 2006",
    aboutP1: "Founded in May 2006 on the Krabbenbosweg, we have been serving the finest Turkish dishes to our loyal customers for over 18 years. Family recipes, fresh ingredients, every single day.",
    aboutP2: "Whether you're grabbing a quick bite or placing a large order — at Memoli you're always welcomed with a smile.",
    hours: "Mon–Sat: 12:00–22:00 · Sun: 14:00–21:00",
    footerDesc: "Fresh Turkish takeaway in Hengelo. Döner, kebab, platters, lahmacun and more.",
    footerHoursTitle: "Opening hours", footerMonSat: "Monday – Saturday", footerSun: "Sunday", footerContact: "Contact",
    cartTitle: "Your Order", cartEmpty: "Your basket is empty", cartEmptySub: "Add dishes from the menu",
    cartSubtotal: "Subtotal", cartReady: (n: number) => `Ready in ± ${n} min`,
    cartPlace: "Place order", cartConfirm: "Order received! See you soon!",
    cats: { broodjes: "Sandwiches", durum: "Dürüm / Wrap", schotels: "Platters", lahmacun: "Lahmacun", overig: "Sides", dranken: "Drinks" },
  },
  tr: {
    navMenu: "Menü", navAbout: "Hakkımızda", navContact: "İletişim", navCart: "Sipariş",
    heroTagline: ["Taze.", "Sıcak.", "Türk."],
    heroSub: "Memoli Paket Servis — Hengelo",
    heroDesc: "18 yılı aşkın süredir Hengelo'da taze Türk yemekleri. Döner, kebap, tabaklar ve daha fazlası.",
    heroCta: "Sipariş ver", heroMore: "Daha fazla",
    heroReviews: "500'den fazla yorum", heroHours: "Pzt–Cmt 12:00–22:00",
    waitBadge: (n: number) => `Bekleme: ~${n} dk`,
    waitBanner: (n: number) => <><strong>{n} dakika</strong> bekleme süresi — Buyurun!</>,
    menuLabel: "Menümüz", menuTitle: "Taze & Lezzetli",
    menuDesc: "Her gün en taze malzemelerle hazırlıyoruz. Favorilerinizi seçin, gerisini bize bırakın.",
    addBtn: "Ekle",
    aboutLabel: "Hikayemiz", aboutTitle: "2006'dan beri Hengelo'nun kalbindeyiz",
    aboutP1: "Mayıs 2006'da Krabbenbosweg'de kurulan işletmemiz, 18 yılı aşkın süredir sadık müşterilerimize en lezzetli Türk yemeklerini sunmaktadır. Aile tarifleri, taze malzemeler, her gün.",
    aboutP2: "Hızlıca bir şeyler almak ister ya da büyük bir sipariş verirseniz — Memoli'de her zaman güleryüzle karşılanırsınız.",
    hours: "Pzt–Cmt: 12:00–22:00 · Paz: 14:00–21:00",
    footerDesc: "Hengelo'da taze Türk yemekleri. Döner, kebap, tabaklar, lahmacun ve daha fazlası.",
    footerHoursTitle: "Çalışma saatleri", footerMonSat: "Pazartesi – Cumartesi", footerSun: "Pazar", footerContact: "İletişim",
    cartTitle: "Siparişiniz", cartEmpty: "Sepetiniz boş", cartEmptySub: "Menüden yemek ekleyin",
    cartSubtotal: "Ara toplam", cartReady: (n: number) => `± ${n} dk içinde hazır`,
    cartPlace: "Sipariş ver", cartConfirm: "Siparişiniz alındı! Görüşürüz!",
    cats: { broodjes: "Ekmek Arası", durum: "Dürüm / Wrap", schotels: "Tabaklar", lahmacun: "Lahmacun", overig: "Yan Yemekler", dranken: "İçecekler" },
  },
} as const;

// ─── MENU DATA ────────────────────────────────────────────────────────────────
interface MenuItem { id: string; name: string; img: string; price: number; desc: { nl: string; en: string; tr: string } }
interface Category { id: string; emoji: string; items: MenuItem[] }

// Prefer the upgraded WebP assets from the restaurant menu packages.
const IMG = (f: string) =>
  `/__mockup/images/items/${f.endsWith(".jpg") ? f.replace(/\.jpg$/, ".webp") : f}`;

const MENU: Category[] = [
  {
    id: "broodjes", emoji: "🥙",
    items: [
      { id: "broodje-doner",       name: "Broodje Döner",        img: IMG("broodje-doner.jpg"),       price: 5.50, desc: { nl: "Kalfsvlees, kruiden, salade",                   en: "Veal, herbs, salad",                     tr: "Dana eti, baharatlar, salata" } },
      { id: "broodje-doner-groot", name: "Broodje Döner Groot",  img: IMG("broodje-doner-groot.jpg"), price: 7.00, desc: { nl: "Kalfsvlees, kruiden, salade — groot",          en: "Veal, herbs, salad — large",             tr: "Dana eti, baharatlar, salata — büyük" } },
      { id: "broodje-adana",       name: "Broodje Adana",        img: IMG("broodje-adana.jpg"),       price: 5.50, desc: { nl: "Lamsgehakt met kruiden en salade",             en: "Minced lamb with herbs and salad",       tr: "Kıymalı kuzu, baharatlar, salata" } },
      { id: "broodje-sis-kebab",   name: "Broodje Sis Kebab",    img: IMG("broodje-sis-kebab.jpg"),   price: 5.50, desc: { nl: "Lamsvlees, speciale kruiden, salade",          en: "Lamb, special herbs, salad",             tr: "Kuzu eti, özel baharatlar, salata" } },
      { id: "broodje-kofte",       name: "Broodje Köfte",        img: IMG("broodje-kofte.jpg"),       price: 5.50, desc: { nl: "Speciaal gekruid gehakt en salade",            en: "Seasoned minced meat and salad",         tr: "Baharatlı köfte ve salata" } },
      { id: "broodje-kipfilet",    name: "Broodje Kipfilet",     img: IMG("broodje-kipfilet.jpg"),    price: 5.50, desc: { nl: "Kipfilet, speciale kruiden, paprika, salade", en: "Chicken fillet, special herbs, peppers", tr: "Tavuk göğsü, özel baharatlar, biber" } },
      { id: "extra-los-broodje",   name: "Extra Los Broodje",    img: IMG("extra-los-broodje.jpg"),   price: 1.00, desc: { nl: "Extra broodje erbij",                         en: "Extra bread on the side",                tr: "Ekstra ekmek" } },
    ],
  },
  {
    id: "durum", emoji: "🌯",
    items: [
      { id: "durum-doner",  name: "Dürüm Döner",  img: IMG("durum-wrap-doner.webp"), price: 4.50, desc: { nl: "Döner in dunne wrap met kruiden en salade",  en: "Döner in thin wrap with herbs and salad",  tr: "İnce dürümde döner, baharatlar, salata" } },
      { id: "durum-adana",  name: "Dürüm Adana",  img: IMG("durum-wrap-adana.jpg"),  price: 5.00, desc: { nl: "Adana in dunne wrap met kruiden en salade",  en: "Adana in thin wrap with herbs and salad",  tr: "İnce dürümde adana, baharatlar, salata" } },
      { id: "durum-kofte",  name: "Dürüm Köfte",  img: IMG("durum-wrap-kofte.jpg"),  price: 5.00, desc: { nl: "Köfte in dunne wrap met kruiden en salade",  en: "Köfte in thin wrap with herbs and salad",  tr: "İnce dürümde köfte, baharatlar, salata" } },
    ],
  },
  {
    id: "schotels", emoji: "🍽️",
    items: [
      { id: "doner-schotel",          name: "Döner Schotel",              img: IMG("doner-schotel.webp"),           price: 12.50, desc: { nl: "Döner met rijst of friet en salade",          en: "Döner with rice or fries and salad",          tr: "Döner, pilav veya patates, salata" } },
      { id: "adana-schotel",          name: "Adana Schotel",              img: IMG("adana-schotel.jpg"),            price: 13.50, desc: { nl: "Adana kebab met rijst of friet en salade",    en: "Adana kebab with rice or fries and salad",    tr: "Adana kebap, pilav veya patates, salata" } },
      { id: "kofte-schotel",          name: "Köfte Schotel",              img: IMG("kofte-schotel.jpg"),            price: 12.50, desc: { nl: "Köfte met rijst of friet en salade",          en: "Köfte with rice or fries and salad",          tr: "Köfte, pilav veya patates, salata" } },
      { id: "sis-kebab-schotel",      name: "Sis Kebab Schotel",          img: IMG("sis-kebab-schotel.jpg"),        price: 14.00, desc: { nl: "Sis kebab met rijst of friet en salade",     en: "Sis kebab with rice or fries and salad",      tr: "Şiş kebap, pilav veya patates, salata" } },
      { id: "kipfilet-schotel",       name: "Kipfilet Schotel",           img: IMG("kipfilet-schotel.jpg"),         price: 12.50, desc: { nl: "Kipfilet met rijst of friet en salade",      en: "Chicken fillet with rice or fries and salad", tr: "Tavuk göğsü, pilav veya patates, salata" } },
      { id: "lamskoteletten-schotel", name: "Lamskoteletten Schotel",     img: IMG("lamskoteletten-schotel.jpg"),   price: 16.50, desc: { nl: "Lamskoteletten met rijst of friet en salade", en: "Lamb chops with rice or fries and salad",     tr: "Kuzu pirzola, pilav veya patates, salata" } },
      { id: "iskender-schotel",       name: "İskender Kebab Schotel",     img: IMG("iskender-kebab-schotel.jpg"),   price: 14.50, desc: { nl: "İskender kebab met yoghurtsaus en boter",    en: "İskender kebab with yoghurt sauce and butter", tr: "İskender kebap, yoğurt sosu ve tereyağı" } },
      { id: "memoli-mix-schotel",     name: "Memoli Mix Speciaal",        img: IMG("memoli-mix-speciaal-schotel.jpg"), price: 18.00, desc: { nl: "Huisspecialiteit: mix van vlees, rijst, salade", en: "House special: mixed meat, rice, salad",    tr: "Özel karışım: çeşitli et, pilav, salata" } },
    ],
  },
  {
    id: "lahmacun", emoji: "🍕",
    items: [
      { id: "lahmacun-salade",   name: "Lahmacun met Salade",  img: IMG("lahmacun-met-salade.jpg"),  price: 2.50, desc: { nl: "Dunne Turkse pizza met salade",          en: "Thin Turkish pizza with salad",          tr: "İnce hamurlu lahmacun, salata ile" } },
      { id: "lahmacun-doner",    name: "Lahmacun met Döner",   img: IMG("lahmacun-met-doner.jpg"),   price: 4.00, desc: { nl: "Lahmacun met döner vlees en salade",     en: "Lahmacun with döner meat and salad",     tr: "Lahmacun, döner eti ve salata ile" } },
      { id: "lahmacun-kaas",     name: "Lahmacun met Kaas",    img: IMG("lahmacun-met-kaas.jpg"),    price: 3.50, desc: { nl: "Lahmacun met gesmolten kaas en salade",  en: "Lahmacun with melted cheese and salad",  tr: "Lahmacun, eritilmiş peynir ve salata" } },
    ],
  },
  {
    id: "overig", emoji: "🥗",
    items: [
      { id: "kapsalon-doner",  name: "Kapsalon Döner",    img: IMG("kapsalon-doner.jpg"),     price: 9.50,  desc: { nl: "Döner, friet, sla, kaas, saus",     en: "Döner, fries, lettuce, cheese, sauce",  tr: "Döner, patates, marul, peynir, sos" } },
      { id: "rijst-met-doner", name: "Rijst met Döner",   img: IMG("rijst-met-doner.webp"),   price: 8.50,  desc: { nl: "Gekruide rijst met döner vlees",    en: "Spiced rice with döner meat",           tr: "Baharatlı pilav, döner eti ile" } },
      { id: "rijst",           name: "Rijst",             img: IMG("rijst.jpg"),              price: 3.00,  desc: { nl: "Gekruide rijst als bijgerecht",     en: "Spiced rice side dish",                 tr: "Baharatlı pilav (yan yemek)" } },
      { id: "aardappelen",     name: "Aardappelen",       img: IMG("aardappelen.jpg"),        price: 3.00,  desc: { nl: "Gebakken aardappelen als bijgerecht", en: "Roasted potatoes side dish",           tr: "Fırın patates (yan yemek)" } },
      { id: "mix-salade",      name: "Mix Salade",        img: IMG("mix-salade.jpg"),         price: 4.50,  desc: { nl: "Verse gemengde salade",             en: "Fresh mixed salad",                     tr: "Taze karışık salata" } },
    ],
  },
  {
    id: "dranken", emoji: "🥤",
    items: [
      { id: "frisdranken",       name: "Frisdranken",          img: IMG("frisdranken.jpg"),           price: 2.00, desc: { nl: "Diverse frisdranken",           en: "Assorted soft drinks",       tr: "Çeşitli meşrubatlar" } },
      { id: "ayran",             name: "Ayran / Cherry",       img: IMG("ayran-ayran-cherry.jpg"),    price: 2.00, desc: { nl: "Turkse yoghurtdrank of cherry", en: "Turkish yoghurt drink or cherry", tr: "Ayran veya vişneli ayran" } },
      { id: "fanta",             name: "Fanta Exotic / Lemon", img: IMG("fanta-exotic-lemon.jpg"),    price: 2.00, desc: { nl: "Fanta Exotic of Fanta Lemon",   en: "Fanta Exotic or Fanta Lemon", tr: "Fanta Exotic veya Limon" } },
      { id: "fernandes",         name: "Fernandes Cola",       img: IMG("fernandes-cola.jpg"),        price: 2.00, desc: { nl: "Fernandes cola frisdrank",      en: "Fernandes cola",              tr: "Fernandes kola" } },
      { id: "water",             name: "Water / Spa",          img: IMG("chaudfontaine-spa-blauw.jpg"), price: 1.50, desc: { nl: "Chaudfontaine of Spa blauw",  en: "Still mineral water",         tr: "Maden suyu" } },
      { id: "energy",            name: "AA Drink / Red Bull",  img: IMG("aa-drink-red-bull.jpg"),     price: 3.00, desc: { nl: "AA Drink of Red Bull",          en: "AA Drink or Red Bull",        tr: "AA İçeceği veya Red Bull" } },
    ],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
interface CartItem { id: string; name: string; price: number; qty: number }
type DayKey = "ma" | "di" | "wo" | "do" | "vr" | "za" | "zo";
type OpeningHours = Record<DayKey, { enabled: boolean; from: string; to: string }>;

const DEFAULT_OPENING_HOURS: OpeningHours = {
  ma: { enabled: true, from: "12:00", to: "22:00" }, di: { enabled: true, from: "12:00", to: "22:00" },
  wo: { enabled: true, from: "12:00", to: "22:00" }, do: { enabled: true, from: "12:00", to: "22:00" },
  vr: { enabled: true, from: "12:00", to: "22:00" }, za: { enabled: true, from: "12:00", to: "22:00" },
  zo: { enabled: true, from: "14:00", to: "21:00" },
};
const DAY_LABELS: Record<Lang, Record<DayKey, string>> = {
  nl: { ma: "Maandag", di: "Dinsdag", wo: "Woensdag", do: "Donderdag", vr: "Vrijdag", za: "Zaterdag", zo: "Zondag" },
  en: { ma: "Monday", di: "Tuesday", wo: "Wednesday", do: "Thursday", vr: "Friday", za: "Saturday", zo: "Sunday" },
  tr: { ma: "Pazartesi", di: "Salı", wo: "Çarşamba", do: "Perşembe", vr: "Cuma", za: "Cumartesi", zo: "Pazar" },
};

export function MemoliWebsite({ waitTime: externalWaitTime }: { waitTime?: number }) {
  const [lang, setLang] = useState<Lang>("nl");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [waitTime, setWaitTime] = useState(externalWaitTime ?? 20);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState("broodjes");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form">("cart");
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const t = T[lang];

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Poll live restaurant settings from API every 10s
  useEffect(() => {
    if (externalWaitTime !== undefined) return;
    const poll = async () => {
      try {
        const r = await fetch("/api/settings");
        if (r.ok) {
          const d = await r.json();
          setWaitTime(d.waitTime);
          if (d.openingHours) setOpeningHours(d.openingHours);
        }
      } catch { /* API not yet up */ }
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [externalWaitTime]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart(item: { id: string; name: string; price: number }) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  }

  async function placeOrder() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          note: form.note,
          items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
        }),
      });
      const data = res.ok ? await res.json() : null;
      setOrderId(data?.order?.id ?? null);
    } catch { setOrderId(null); }
    setSubmitting(false);
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]); setCartOpen(false); setOrderPlaced(false);
      setCheckoutStep("cart"); setForm({ name: "", phone: "", note: "" }); setOrderId(null);
    }, 4000);
  }

  const waitBg  = waitTime <= 15 ? "bg-green-500" : waitTime <= 30 ? "bg-amber-500" : "bg-red-500";
  const waitDot = waitTime <= 15 ? "bg-green-400" : waitTime <= 30 ? "bg-amber-400" : "bg-red-400";
  const currentCat = MENU.find(c => c.id === activeCat)!;
  const weekdayOrder: DayKey[] = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const regularDays = weekdayOrder.filter(day => day !== "zo").map(day => openingHours[day]);
  const sameRegularHours = regularDays.every(day => day.enabled && day.from === regularDays[0].from && day.to === regularDays[0].to);
  const compactHours = sameRegularHours
    ? `Ma–Za ${regularDays[0].from}–${regularDays[0].to}`
    : `${openingHours.ma.enabled ? `${openingHours.ma.from}–${openingHours.ma.to}` : "Gesloten"}`;

  return (
    <div className="min-h-screen bg-[#120800] text-[#F5EDD6] font-['Inter'] relative overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? "bg-[#1A0A00]/95 backdrop-blur-md shadow-lg shadow-black/50" : "bg-transparent"}`}>
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/__mockup/images/memoli-logo.png"
              alt="Memoli Kebab"
              className="h-11 w-11 rounded-full object-contain"
            />
            <span className="font-['Playfair_Display'] text-2xl font-bold text-white tracking-wide">Memoli</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A0886A]">
            <a href="#menu" className="hover:text-[#E67E22] transition-colors">{t.navMenu}</a>
            <a href="#over-ons" className="hover:text-[#E67E22] transition-colors">{t.navAbout}</a>
            <a href="#contact" className="hover:text-[#E67E22] transition-colors">{t.navContact}</a>
          </div>
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center bg-[#2D1500]/80 border border-[#3D2000] rounded-lg overflow-hidden">
              {(["nl","en","tr"] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} title={l.toUpperCase()}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold transition-all duration-200 ${lang === l ? "bg-[#C0392B] text-white" : "text-[#A0886A] hover:text-white"}`}>
                  <span>{FLAGS[l]}</span><span className="hidden sm:inline">{l.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#C0392B] hover:bg-[#E74C3C] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navCart}</span>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#E67E22] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D0C00] via-[#1A0800] to-[#0A0500]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,#C0392B,transparent)]" />
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2">
          <img src="/__mockup/images/hero-doener.jpg" alt="Vers bereide döner bij Memoli" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120800] via-[#120800]/70 md:via-[#120800]/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className={`w-2 h-2 rounded-full animate-pulse ${waitDot}`} />
            <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
            <span className="text-sm font-medium">{t.waitBadge(waitTime)}</span>
          </div>
          <h1 className="font-['Playfair_Display'] text-6xl md:text-8xl font-bold leading-[1.05] mb-4 text-white">
            {t.heroTagline[0]}<br /><span className="text-[#E67E22]">{t.heroTagline[1]}</span><br />{t.heroTagline[2]}
          </h1>
          <p className="text-lg md:text-xl text-[#A0886A] mb-3 max-w-md">{t.heroSub}</p>
          <p className="text-[#F5EDD6]/70 mb-10 max-w-sm">{t.heroDesc}</p>
          <div className="flex flex-wrap gap-4">
            <a href="#menu" className="inline-flex items-center gap-2 bg-[#C0392B] hover:bg-[#E74C3C] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/50">
              {t.heroCta} <ChevronDown className="w-5 h-5" />
            </a>
            <a href="#over-ons" className="inline-flex items-center gap-2 border border-[#E67E22]/40 text-[#E67E22] hover:bg-[#E67E22]/10 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200">
              {t.heroMore}
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-6">
            {[
              { icon: <Star className="w-4 h-4" />, text: `4.8 ★ — ${t.heroReviews}` },
              { icon: <Clock className="w-4 h-4" />, text: compactHours },
              { icon: <MapPin className="w-4 h-4" />, text: "Krabbenbosweg 25, Hengelo" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 text-sm text-[#A0886A]">
                <span className="text-[#E67E22]">{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAIT BANNER ──────────────────────────────────── */}
      <div className={`${waitBg} py-3 px-6`}>
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 text-white font-semibold text-sm">
          <Clock className="w-4 h-4 animate-pulse" />{t.waitBanner(waitTime)}
        </div>
      </div>

      {/* ── MENU ─────────────────────────────────────────── */}
      <main id="menu">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase mb-2">{t.menuLabel}</p>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-white mb-4">{t.menuTitle}</h2>
            <p className="text-[#A0886A] max-w-md mx-auto">{t.menuDesc}</p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {MENU.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCat === cat.id ? "bg-[#C0392B] text-white shadow-lg shadow-red-900/40" : "bg-[#2D1500] text-[#A0886A] hover:text-white hover:bg-[#3D1F00]"
                }`}>
                {cat.emoji} {t.cats[cat.id as keyof typeof t.cats]}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCat.items.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <article key={item.id} className="bg-[#2D1500] border border-[#3D2000] rounded-2xl overflow-hidden hover:border-[#C0392B]/40 hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300 group flex flex-col">
                  <div className="relative h-36 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D1500]/60 to-transparent" />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-['Playfair_Display'] text-sm font-semibold text-white mb-1 leading-tight">{item.name}</h3>
                    <p className="text-[#A0886A] text-xs mb-3 leading-relaxed flex-1">{item.desc[lang]}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#E67E22] font-bold text-base">€{item.price.toFixed(2)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-0.5 bg-[#C0392B]/20 border border-[#C0392B]/40 rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1.5 text-white hover:bg-[#C0392B]/40 transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="px-1.5 text-white font-bold text-xs">{inCart.qty}</span>
                          <button onClick={() => addToCart(item)} className="px-2 py-1.5 text-white hover:bg-[#C0392B]/40 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)}
                          className="flex items-center gap-1 bg-[#C0392B] hover:bg-[#E74C3C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95">
                          <Plus className="w-3 h-3" /> {t.addBtn}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── OVER ONS ─────────────────────────────────────── */}
      <section id="over-ons" className="bg-[#1A0A00] border-t border-[#2D1500]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#E67E22] text-sm font-semibold tracking-widest uppercase mb-3">{t.aboutLabel}</p>
            <h2 className="font-['Playfair_Display'] text-4xl font-bold text-white mb-6">{t.aboutTitle}</h2>
            <p className="text-[#A0886A] leading-relaxed mb-4">{t.aboutP1}</p>
            <p className="text-[#A0886A] leading-relaxed mb-8">{t.aboutP2}</p>
            <div className="space-y-3">
              {[
                { icon: <MapPin className="w-4 h-4" />, text: "Krabbenbosweg 25, 7555 EC Hengelo" },
                { icon: <Clock className="w-4 h-4" />, text: compactHours },
                { icon: <Phone className="w-4 h-4" />, text: "+31 (0)74 000 0000" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 text-[#F5EDD6]">
                  <span className="text-[#E67E22] flex-shrink-0">{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="/__mockup/images/about-interior.jpg" alt="Interieur Memoli Hengelo" className="col-span-2 h-56 w-full object-cover rounded-2xl" />
            <img src="/__mockup/images/about-ingredients.jpg" alt="Verse ingrediënten" className="h-40 w-full object-cover rounded-2xl" />
            <img src="/__mockup/images/about-wrap.jpg" alt="Dürüm wrap" className="h-40 w-full object-cover rounded-2xl" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer id="contact" className="bg-[#0A0400] border-t border-[#1A0A00]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><img src="/__mockup/images/memoli-logo.png" alt="Memoli Kebab" className="h-7 w-7 rounded-full object-contain" /><span className="font-['Playfair_Display'] text-xl font-bold text-white">Memoli</span></div>
              <p className="text-[#A0886A] text-sm max-w-xs leading-relaxed">{t.footerDesc}</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-white font-semibold mb-3">{t.footerHoursTitle}</p>
                <div className="space-y-1 text-[#A0886A]">
                  {weekdayOrder.map(day => (
                    <div key={day} className="flex justify-between gap-5">
                      <p>{DAY_LABELS[lang][day]}</p>
                      <p className="text-[#F5EDD6]">{openingHours[day].enabled ? `${openingHours[day].from} – ${openingHours[day].to}` : (lang === "nl" ? "Gesloten" : lang === "en" ? "Closed" : "Kapalı")}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-3">{t.footerContact}</p>
                <div className="space-y-1 text-[#A0886A]"><p>Krabbenbosweg 25</p><p>7555 EC Hengelo</p></div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#1A0A00] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#A0886A] text-xs">
            <span>© {new Date().getFullYear()} Afhaal Centrum Memoli · Hengelo</span>
            <div className="flex gap-1">
              {(["nl","en","tr"] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-xs font-bold transition-all ${lang === l ? "bg-[#C0392B] text-white" : "text-[#A0886A] hover:text-white"}`}>
                  {FLAGS[l]} {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ──────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }} />
          <div className="w-full max-w-sm bg-[#1A0A00] border-l border-[#2D1500] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D1500]">
              <div className="flex items-center gap-2">
                {checkoutStep === "form" && (
                  <button onClick={() => setCheckoutStep("cart")} className="text-[#A0886A] hover:text-white mr-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                <ShoppingCart className="w-5 h-5 text-[#E67E22]" />
                <span className="font-['Playfair_Display'] text-xl font-bold text-white">
                  {checkoutStep === "form" ? (lang === "nl" ? "Jouw gegevens" : lang === "en" ? "Your details" : "Bilgileriniz") : t.cartTitle}
                </span>
              </div>
              <button onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }} className="text-[#A0886A] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1 — Cart items */}
            {checkoutStep === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-[#A0886A]">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>{t.cartEmpty}</p><p className="text-sm mt-1">{t.cartEmptySub}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-[#2D1500] rounded-xl p-3">
                          <div className="flex-1"><p className="text-white text-sm font-semibold">{item.name}</p><p className="text-[#E67E22] text-sm font-bold">€{(item.price * item.qty).toFixed(2)}</p></div>
                          <div className="flex items-center gap-1 bg-[#1A0A00] rounded-lg border border-[#3D2000]">
                            <button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-[#A0886A] hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="px-2 text-white text-sm font-bold">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-[#A0886A] hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="px-6 pb-6 border-t border-[#2D1500] pt-4 space-y-3">
                    <div className="flex items-center justify-between text-[#A0886A] text-sm">
                      <span>{t.cartSubtotal}</span><span className="text-white font-bold text-lg">€{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#2D1500] rounded-lg px-3 py-2 text-sm">
                      <Clock className="w-4 h-4 text-[#E67E22]" /><span className="text-[#A0886A]">{t.cartReady(waitTime)}</span>
                    </div>
                    <button onClick={() => setCheckoutStep("form")}
                      className="w-full bg-[#C0392B] hover:bg-[#E74C3C] text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40">
                      {t.cartPlace} →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2 — Customer details form */}
            {checkoutStep === "form" && (
              <div className="flex-1 flex flex-col px-6 py-4">
                {orderPlaced ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <p className="font-['Playfair_Display'] text-xl font-bold text-white mb-1">{t.cartConfirm}</p>
                      {orderId && <p className="text-[#E67E22] font-bold text-lg">{orderId}</p>}
                      <p className="text-[#A0886A] text-sm mt-2">{t.cartReady(waitTime)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Order summary */}
                    <div className="bg-[#2D1500] rounded-xl p-3 text-sm">
                      {cart.map(c => (
                        <div key={c.id} className="flex justify-between text-[#A0886A] gap-2 py-0.5">
                          <span>{c.qty}× {c.name}</span>
                          <span className="text-[#E67E22] font-semibold">€{(c.price * c.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#3D2000] mt-2 pt-2 flex justify-between font-bold text-white">
                        <span>{t.cartSubtotal}</span><span>€{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-[#A0886A] font-semibold uppercase tracking-wider mb-1 block">
                          {lang === "nl" ? "Naam" : lang === "en" ? "Name" : "İsim"} *
                        </label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder={lang === "nl" ? "Je naam" : lang === "en" ? "Your name" : "Adınız"}
                          className="w-full bg-[#2D1500] border border-[#3D2000] focus:border-[#E67E22] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#A0886A]/50" />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0886A] font-semibold uppercase tracking-wider mb-1 block">
                          {lang === "nl" ? "Telefoonnummer" : lang === "en" ? "Phone number" : "Telefon"} *
                        </label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="06-12345678" type="tel"
                          className="w-full bg-[#2D1500] border border-[#3D2000] focus:border-[#E67E22] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#A0886A]/50" />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0886A] font-semibold uppercase tracking-wider mb-1 block">
                          {lang === "nl" ? "Opmerking" : lang === "en" ? "Note" : "Not"} ({lang === "nl" ? "optioneel" : lang === "en" ? "optional" : "isteğe bağlı"})
                        </label>
                        <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                          placeholder={lang === "nl" ? "Geen ui, extra saus…" : lang === "en" ? "No onion, extra sauce…" : "Soğansız, fazla sos…"}
                          rows={2}
                          className="w-full bg-[#2D1500] border border-[#3D2000] focus:border-[#E67E22] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#A0886A]/50 resize-none" />
                      </div>
                    </div>

                    <button onClick={placeOrder} disabled={!form.name.trim() || !form.phone.trim() || submitting}
                      className="w-full bg-[#C0392B] hover:bg-[#E74C3C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40 mt-auto">
                      {submitting ? "Bestelling plaatsen…" : t.cartPlace}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
