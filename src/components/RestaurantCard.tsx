import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@/lib/data";

export function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <div className="card-lift group overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {r.offer && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
            {r.offer}
          </span>
        )}
        <span
          className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded border-2 bg-background ${
            r.veg ? "border-success" : "border-destructive"
          }`}
          aria-label={r.veg ? "Vegetarian" : "Non-vegetarian"}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              r.veg ? "bg-success" : "bg-destructive"
            }`}
          />
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-lg font-semibold">{r.name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-sm font-semibold text-success">
            <Star className="h-3.5 w-3.5 fill-current" />
            {r.rating}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{r.cuisine}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {r.deliveryTime}
          </span>
          <span>{r.distance}</span>
          <span className="inline-flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" /> ${r.deliveryFee.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
