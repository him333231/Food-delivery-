import { dishes, restaurants, type Dish, type Restaurant } from "./data";

export type TimeSlot = "morning" | "afternoon" | "evening" | "night";

export type Recommendation = {
  dish: Dish;
  restaurant: Restaurant;
  reason: string;
};

const STORAGE_KEY = "bites_user_prefs_v1";
const ORDERS_KEY = "bites_user_orders_v1";

export type OrderItemSnapshot = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  restaurantName: string;
};

export type OrderRecord = {
  id: string;
  placedAt: number;
  total: number;
  items: OrderItemSnapshot[];
};

export function getOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as OrderRecord[];
  } catch {
    // ignore
  }
  return [];
}

export function saveOrder(order: Omit<OrderRecord, "id" | "placedAt">): OrderRecord {
  const next: OrderRecord = {
    id: `ord_${Date.now()}`,
    placedAt: Date.now(),
    ...order,
  };
  if (typeof window === "undefined") return next;
  const prev = getOrders();
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([next, ...prev].slice(0, 50)));
  return next;
}

export function getOrder(id: string): OrderRecord | undefined {
  return getOrders().find((o) => o.id === id);
}


export type UserPrefs = {
  orderHistory: string[]; // dish ids
  favoriteCategories: string[];
};

export function getUserPrefs(): UserPrefs {
  if (typeof window === "undefined") return { orderHistory: [], favoriteCategories: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserPrefs;
  } catch {
    // ignore
  }
  return { orderHistory: [], favoriteCategories: [] };
}

export function recordOrder(dishIds: string[]) {
  if (typeof window === "undefined") return;
  const prefs = getUserPrefs();
  const nextHistory = [...dishIds, ...prefs.orderHistory].slice(0, 30);
  const catCounts = new Map<string, number>();
  nextHistory.forEach((id) => {
    const d = dishes.find((x) => x.id === id);
    if (d) catCounts.set(d.category, (catCounts.get(d.category) ?? 0) + 1);
  });
  const favoriteCategories = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ orderHistory: nextHistory, favoriteCategories }),
  );
}

export function getTimeSlot(date = new Date()): TimeSlot {
  const h = date.getHours();
  if (h < 11) return "morning";
  if (h < 16) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

const slotCategories: Record<TimeSlot, string[]> = {
  morning: ["dessert", "drinks", "salad"],
  afternoon: ["burger", "salad", "mexican", "asian"],
  evening: ["pizza", "burger", "mexican"],
  night: ["asian", "pizza", "dessert"],
};

const slotLabel: Record<TimeSlot, string> = {
  morning: "breakfast",
  afternoon: "lunch",
  evening: "evening bites",
  night: "dinner",
};

function restaurantScore(r: Restaurant) {
  const timeMin = parseInt(r.deliveryTime, 10) || 30;
  return r.rating * 2 - timeMin / 30 - r.deliveryFee / 5;
}

export function generateRecommendations(limit = 6): {
  items: Recommendation[];
  message: string;
} {
  const prefs = getUserPrefs();
  const slot = getTimeSlot();
  const scored = new Map<string, { score: number; reason: string }>();

  // 1. Previous orders → similar (same category, exclude already ordered)
  const lastCategory = prefs.favoriteCategories[0];
  dishes.forEach((d) => {
    let score = 0;
    let reason = "Top pick nearby";

    if (lastCategory && d.category === lastCategory && !prefs.orderHistory.includes(d.id)) {
      score += 10;
      reason = "Because you love " + lastCategory;
    }
    // 2. Time of day
    if (slotCategories[slot].includes(d.category)) {
      score += 5;
      if (score === 5) reason = "Perfect for " + slotLabel[slot];
    }
    // 3. Favorite categories (secondary)
    if (prefs.favoriteCategories.slice(1, 3).includes(d.category)) {
      score += 3;
    }
    // 4. Restaurant rating / popularity
    const r = restaurants.find((x) => x.id === d.restaurantId);
    if (r) score += restaurantScore(r);

    scored.set(d.id, { score, reason });
  });

  const sorted = [...scored.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([id, meta]) => {
      const dish = dishes.find((d) => d.id === id)!;
      const restaurant = restaurants.find((r) => r.id === dish.restaurantId)!;
      return { dish, restaurant, reason: meta.reason };
    });

  const message = buildMessage(prefs, slot, sorted);
  return { items: sorted, message };
}

function buildMessage(prefs: UserPrefs, slot: TimeSlot, items: Recommendation[]): string {
  const top = items[0];
  if (prefs.orderHistory.length === 0) {
    return `New here? Try one of our trending ${slotLabel[slot]} picks — starting with ${top?.dish.name ?? "our top-rated dishes"}.`;
  }
  const fav = prefs.favoriteCategories[0];
  if (fav && top) {
    return `I noticed you enjoy ${fav}. For ${slotLabel[slot]}, you might love ${top.dish.name} from ${top.restaurant.name}.`;
  }
  return `Good ${slot}! Here are a few ${slotLabel[slot]} ideas curated just for you.`;
}
