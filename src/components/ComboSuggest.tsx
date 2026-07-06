import { useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import { dishes } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/currency";

// Category → pairing categories (goes well with)
const PAIRS: Record<string, string[]> = {
  pizza: ["drinks", "dessert", "salad"],
  burger: ["drinks", "dessert"],
  biryani: ["drinks", "dessert"],
  indian: ["drinks", "dessert", "biryani"],
  mexican: ["drinks", "dessert"],
  asian: ["drinks", "dessert"],
  sushi: ["drinks", "salad"],
  salad: ["drinks"],
  dessert: ["drinks"],
  drinks: ["dessert"],
};

export function ComboSuggest() {
  const { items, addItem } = useCart();
  const suggestions = useMemo(() => {
    if (items.length === 0) return [];
    const cartIds = new Set(items.map((i) => i.dish.id));
    const wantedCats = new Set<string>();
    items.forEach((i) => {
      (PAIRS[i.dish.category] ?? []).forEach((c) => wantedCats.add(c));
    });
    return dishes
      .filter((d) => wantedCats.has(d.category) && !cartIds.has(d.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [items]);

  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          <Sparkles className="h-3 w-3" /> Combo AI
        </span>
        <h2 className="font-display text-lg font-semibold">
          Complete your meal
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Popular add-ons that pair with what's in your cart.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {suggestions.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-2"
          >
            <img
              src={d.image}
              alt={d.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold">{d.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {formatINR(d.price)}
              </div>
            </div>
            <button
              onClick={() => addItem(d)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90"
              aria-label={`Add ${d.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
