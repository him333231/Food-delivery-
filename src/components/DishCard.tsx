import { Link } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import type { Dish } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/currency";

export function DishCard({ dish }: { dish: Dish }) {
  const { addItem } = useCart();
  return (
    <div className="card-lift group overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Link to="/dish/$id" params={{ id: dish.id }} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute left-3 top-3 grid h-6 w-6 place-items-center rounded border-2 bg-background ${
              dish.veg ? "border-success" : "border-destructive"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                dish.veg ? "bg-success" : "bg-destructive"
              }`}
            />
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate font-semibold">{dish.name}</h4>
            <p className="truncate text-xs text-muted-foreground">
              {dish.restaurantName}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
            <Star className="h-3 w-3 fill-current" />
            {dish.rating}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold">
            {formatINR(dish.price)}
          </span>
          <button
            onClick={() => addItem(dish)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
