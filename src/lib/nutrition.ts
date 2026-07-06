import { dishes } from "./data";

export type Nutrition = {
  calories: number; // kcal per serving
  protein: number; // g
  carbs: number;
  fat: number;
  sugar: number;
  healthy: boolean;
  tags: string[]; // e.g. "high-protein", "low-cal", "budget"
};

// Deterministic pseudo-nutrition derived from category/veg — mocked but stable.
const CATEGORY_BASELINE: Record<
  string,
  Omit<Nutrition, "tags" | "healthy">
> = {
  pizza: { calories: 780, protein: 28, carbs: 90, fat: 32, sugar: 6 },
  burger: { calories: 720, protein: 32, carbs: 55, fat: 38, sugar: 8 },
  biryani: { calories: 650, protein: 26, carbs: 82, fat: 22, sugar: 4 },
  indian: { calories: 520, protein: 22, carbs: 45, fat: 26, sugar: 6 },
  salad: { calories: 320, protein: 14, carbs: 30, fat: 14, sugar: 6 },
  sushi: { calories: 420, protein: 24, carbs: 55, fat: 10, sugar: 5 },
  asian: { calories: 560, protein: 24, carbs: 68, fat: 18, sugar: 6 },
  mexican: { calories: 590, protein: 22, carbs: 62, fat: 24, sugar: 5 },
  dessert: { calories: 380, protein: 6, carbs: 52, fat: 16, sugar: 34 },
  drinks: { calories: 120, protein: 3, carbs: 18, fat: 3, sugar: 14 },
};

function build(id: string): Nutrition {
  const d = dishes.find((x) => x.id === id);
  const base = CATEGORY_BASELINE[d?.category ?? "indian"] ?? CATEGORY_BASELINE.indian;
  const veggieAdj = d?.veg ? 0.9 : 1;
  const calories = Math.round(base.calories * veggieAdj);
  const protein = Math.round(base.protein * (d?.veg ? 0.85 : 1));
  const tags: string[] = [];
  if (calories < 450) tags.push("low-cal");
  if (protein >= 24) tags.push("high-protein");
  if ((d?.price ?? 0) <= 250) tags.push("budget");
  if (d?.veg) tags.push("veg");
  const healthy = calories < 500 && base.fat < 25;
  return {
    calories,
    protein,
    carbs: base.carbs,
    fat: Math.round(base.fat * veggieAdj),
    sugar: base.sugar,
    healthy,
    tags,
  };
}

const cache = new Map<string, Nutrition>();
export function getNutrition(dishId: string): Nutrition {
  let n = cache.get(dishId);
  if (!n) {
    n = build(dishId);
    cache.set(dishId, n);
  }
  return n;
}

// ---- Consumption tracking (localStorage) ----
export type ConsumptionEntry = {
  dishId: string;
  quantity: number;
  loggedAt: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  name: string;
  restaurantName: string;
};

const LOG_KEY = "bites_nutrition_log_v1";
const WATER_KEY = "bites_water_log_v1";

export function getConsumption(): ConsumptionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function logConsumption(
  items: { dishId: string; quantity: number }[],
): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const prev = getConsumption();
  const next = items
    .map((i) => {
      const d = dishes.find((x) => x.id === i.dishId);
      if (!d) return null;
      const n = getNutrition(i.dishId);
      return {
        dishId: i.dishId,
        quantity: i.quantity,
        loggedAt: now,
        calories: n.calories * i.quantity,
        protein: n.protein * i.quantity,
        carbs: n.carbs * i.quantity,
        fat: n.fat * i.quantity,
        sugar: n.sugar * i.quantity,
        name: d.name,
        restaurantName: d.restaurantName,
      } as ConsumptionEntry;
    })
    .filter((x): x is ConsumptionEntry => x !== null);
  window.localStorage.setItem(LOG_KEY, JSON.stringify([...next, ...prev].slice(0, 500)));
}

export function getWater(): { date: string; glasses: number }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(WATER_KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function addWaterGlass(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const list = getWater();
  const idx = list.findIndex((x) => x.date === today);
  if (idx >= 0) list[idx].glasses += 1;
  else list.unshift({ date: today, glasses: 1 });
  window.localStorage.setItem(WATER_KEY, JSON.stringify(list.slice(0, 60)));
}

// Aggregations
export function sumRange(entries: ConsumptionEntry[], sinceMs: number) {
  const filtered = entries.filter((e) => e.loggedAt >= sinceMs);
  return filtered.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      sugar: acc.sugar + e.sugar,
      count: acc.count + e.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, count: 0 },
  );
}

export const DAILY_CAL_GOAL = 2000;
