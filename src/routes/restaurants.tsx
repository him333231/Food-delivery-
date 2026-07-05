import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { restaurants, categories } from "@/lib/data";
import { RestaurantCard } from "@/components/RestaurantCard";

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

  const list = useMemo(() => {
    let l = restaurants.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(query.toLowerCase()),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Restaurants near you
        </h1>
        <p className="text-sm text-muted-foreground">
          {list.length} places delivering to Downtown
        </p>
      </div>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-card px-4 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants or cuisines..."
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
