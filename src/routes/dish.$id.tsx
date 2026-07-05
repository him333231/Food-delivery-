import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { getDish, dishes, addOns, reviews } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { DishCard } from "@/components/DishCard";

export const Route = createFileRoute("/dish/$id")({
  loader: ({ params }) => {
    const dish = getDish(params.id);
    if (!dish) throw notFound();
    return { dish };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dish.name} — Bites` },
          { name: "description", content: loaderData.dish.description },
          { property: "og:title", content: loaderData.dish.name },
          { property: "og:description", content: loaderData.dish.description },
          { property: "og:image", content: loaderData.dish.image },
        ]
      : [{ title: "Dish not found — Bites" }],
  }),
  component: DishDetails,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Dish not found</h1>
      <Link to="/restaurants" className="mt-4 inline-block text-primary underline">
        Back to restaurants
      </Link>
    </div>
  ),
});

function DishDetails() {
  const { dish } = Route.useLoaderData();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const addOnTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  const total = (dish.price + addOnTotal) * qty;

  const similar = dishes.filter((d) => d.id !== dish.id).slice(0, 4);

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        to="/restaurants"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="animate-fade-up">
          <img
            src={dish.image}
            alt={dish.name}
            className="aspect-square w-full rounded-3xl object-cover shadow-soft"
          />
        </div>

        <div className="animate-fade-up">
          <div className="flex items-center gap-2">
            <span
              className={`grid h-5 w-5 place-items-center rounded border-2 ${
                dish.veg ? "border-success" : "border-destructive"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  dish.veg ? "bg-success" : "bg-destructive"
                }`}
              />
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {dish.category}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {dish.name}
          </h1>
          <p className="mt-1 text-muted-foreground">from {dish.restaurantName}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-sm font-semibold text-success">
              <Star className="h-3.5 w-3.5 fill-current" /> {dish.rating}
            </span>
            <span className="text-sm text-muted-foreground">
              (1.2k+ reviews)
            </span>
          </div>

          <div className="mt-4 font-display text-3xl font-bold text-primary">
            ${dish.price.toFixed(2)}
          </div>

          <p className="mt-4 text-muted-foreground">{dish.description}</p>

          <div className="mt-6">
            <h3 className="text-sm font-semibold">Ingredients</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {dish.ingredients.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold">Add-ons</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {addOns.map((a) => {
                const active = selectedAddOns.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddOn(a.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground">
                      +${a.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card p-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-primary-soft"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-primary-soft"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addItem(dish, qty)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" /> Add to cart · ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.name}</span>
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Similar */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">You may also like</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((d) => (
            <DishCard key={d.id} dish={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
