import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, Star, Plus } from "lucide-react";
import { restaurants, categories, dishes } from "@/lib/data";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/currency";
import { getUserPrefs } from "@/lib/recommendations";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants near you — Bites" },
      {
        name: "description",
        content: "Browse top-rated restaurants and cuisines near you.",
      },
    ],
  }),
  component: RestaurantsPage,
});

type Sort = "recommended" | "rating" | "delivery" | "distance";

function RestaurantsPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const { addItem } = useCart();

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    let l = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q),
    );
    if (activeCat) {
      l = l.filter((r) => r.cuisine.toLowerCase().includes(activeCat));
    }
    if (vegOnly) l = l.filter((r) => r.veg);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === "delivery")
      l = [...l].sort((a, b) => a.deliveryFee - b.deliveryFee);
    if (sort === "distance")
      l = [...l].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    return l;
  }, [query, activeCat, vegOnly, sort]);

  // AI-powered dish search: match dishes by name/ingredients/cuisine,
  // then boost by user favorite categories.
  const aiDishMatches = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const prefs = getUserPrefs();
    const favs = new Set(prefs.favoriteCategories);
    const scored = dishes
      .map((d) => {
        const hay = `${d.name} ${d.category} ${d.description} ${d.ingredients.join(
          " ",
        )} ${d.restaurantName}`.toLowerCase();
        let score = 0;
        if (d.name.toLowerCase().includes(q)) score += 8;
        if (d.category.toLowerCase().includes(q)) score += 6;
        if (d.ingredients.some((i) => i.toLowerCase().includes(q))) score += 4;
        if (hay.includes(q)) score += 2;
        if (favs.has(d.category)) score += 3;
        score += d.rating;
        if (vegOnly && !d.veg) score = 0;
        return { d, score };
      })
      .filter((x) => x.score > 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.d);
    return scored;
  }, [query, vegOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Restaurants near you
        </h1>
        <p className="text-sm text-muted-foreground">
          {list.length} places delivering to Bengaluru
        </p>
      </div>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-card px-4 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cuisines, or restaurants..."
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="h-4 w-4 accent-[oklch(0.65_0.15_145)]"
            />
            Veg only
          </label>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="delivery">Delivery fee</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI dish suggestions */}
      {query && aiDishMatches.length > 0 && (
        <section className="mt-6 rounded-2xl border border-primary/25 bg-primary-soft/50 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              <Sparkles className="h-3 w-3" /> AI picks
            </span>
            <p className="text-sm text-muted-foreground">
              Dishes matching “{query}”, tuned to your taste
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiDishMatches.map((d) => (
              <div
                key={d.id}
                className="flex gap-3 rounded-xl border border-border/60 bg-card p-3"
              >
                <Link
                  to="/dish/$id"
                  params={{ id: d.id }}
                  className="shrink-0"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/dish/$id"
                    params={{ id: d.id }}
                    className="line-clamp-1 text-sm font-semibold hover:text-primary"
                  >
                    {d.name}
                  </Link>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {d.restaurantName}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <Star className="h-3 w-3 fill-current" /> {d.rating}
                      </span>
                      <span className="font-semibold">{formatINR(d.price)}</span>
                    </span>
                    <button
                      onClick={() => addItem(d)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <CatChip
          label="All"
          active={activeCat === null}
          onClick={() => setActiveCat(null)}
        />
        {categories.map((c) => (
          <CatChip
            key={c.id}
            label={`${c.emoji} ${c.name}`}
            active={activeCat === c.id}
            onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
          />
        ))}
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border/70 py-20 text-center">
          <div className="text-4xl">🔍</div>
          <h3 className="mt-3 font-display text-lg font-semibold">
            No restaurants match your filters
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing filters or searching a different cuisine.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border/60 bg-card hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}
