import { Link } from "@tanstack/react-router";
import { Flame, Leaf, TrendingUp, Wallet, Dumbbell, Plus, Star } from "lucide-react";
import { dishes } from "@/lib/data";
import { getNutrition } from "@/lib/nutrition";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/currency";

type Row = {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Flame;
  color: string;
  filter: (d: (typeof dishes)[number]) => boolean;
  sort?: (a: (typeof dishes)[number], b: (typeof dishes)[number]) => number;
};

const ROWS: Row[] = [
  {
    key: "trending",
    title: "Trending today",
    subtitle: "What everyone's ordering right now",
    icon: TrendingUp,
    color: "text-primary",
    filter: () => true,
    sort: (a, b) => b.rating - a.rating,
  },
  {
    key: "healthy",
    title: "Healthy choices",
    subtitle: "Light, balanced, feel-good meals",
    icon: Leaf,
    color: "text-success",
    filter: (d) => getNutrition(d.id).healthy,
  },
  {
    key: "budget",
    title: "Budget picks under ₹250",
    subtitle: "Great value, no compromise",
    icon: Wallet,
    color: "text-warning",
    filter: (d) => d.price <= 250,
    sort: (a, b) => a.price - b.price,
  },
  {
    key: "protein",
    title: "High-protein meals",
    subtitle: "Fuel workouts and busy days",
    icon: Dumbbell,
    color: "text-primary",
    filter: (d) => getNutrition(d.id).tags.includes("high-protein"),
    sort: (a, b) => getNutrition(b.id).protein - getNutrition(a.id).protein,
  },
  {
    key: "lowcal",
    title: "Low-calorie bites",
    subtitle: "Under 450 kcal per serving",
    icon: Flame,
    color: "text-destructive",
    filter: (d) => getNutrition(d.id).tags.includes("low-cal"),
    sort: (a, b) => getNutrition(a.id).calories - getNutrition(b.id).calories,
  },
];

export function AdvancedRecs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      {ROWS.map((row) => {
        const items = dishes
          .filter(row.filter)
          .sort(row.sort ?? ((a, b) => b.rating - a.rating))
          .slice(0, 8);
        if (items.length === 0) return null;
        const Icon = row.icon;
        return (
          <div key={row.key} className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className={`flex items-center gap-2 text-xs font-semibold ${row.color}`}>
                  <Icon className="h-3.5 w-3.5" /> {row.subtitle}
                </div>
                <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">
                  {row.title}
                </h2>
              </div>
            </div>
            <Rail items={items} />
          </div>
        );
      })}
    </section>
  );
}

function Rail({ items }: { items: typeof dishes }) {
  const { addItem } = useCart();
  return (
    <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
      <div className="flex gap-3 snap-x snap-mandatory">
        {items.map((d) => {
          const n = getNutrition(d.id);
          return (
            <article
              key={d.id}
              className="card-lift w-60 shrink-0 snap-start rounded-2xl border border-border/60 bg-card p-2.5 shadow-card"
            >
              <Link to="/dish/$id" params={{ id: d.id }}>
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-32 w-full rounded-xl object-cover"
                />
              </Link>
              <div className="mt-2.5 px-0.5">
                <Link
                  to="/dish/$id"
                  params={{ id: d.id }}
                  className="line-clamp-1 text-sm font-semibold hover:text-primary"
                >
                  {d.name}
                </Link>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                  {d.restaurantName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {d.rating}
                  </span>
                  <span>·</span>
                  <span>{n.calories} kcal</span>
                  {n.tags.includes("high-protein") && (
                    <>
                      <span>·</span>
                      <span className="text-primary">{n.protein}g P</span>
                    </>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-sm font-bold">
                    {formatINR(d.price)}
                  </span>
                  <button
                    onClick={() => addItem(d)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
