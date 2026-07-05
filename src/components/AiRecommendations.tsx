import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Star, Clock, Plus, Bot } from "lucide-react";
import { generateRecommendations, type Recommendation } from "@/lib/recommendations";
import { useCart } from "@/lib/cart-context";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/currency";


export function AiRecommendations() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    // Simulate async AI call
    const t = setTimeout(() => {
      const { items, message } = generateRecommendations(6);
      setItems(items);
      setMessage(message);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI Recommended for You
        </span>
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Smart picks, personalized
      </h2>

      {/* AI assistant message */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft/60 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {loading ? (
            <span className="inline-block h-4 w-3/4 animate-pulse rounded bg-primary/20" />
          ) : (
            message
          )}
        </p>
      </div>

      {/* Horizontal scroll cards */}
      <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
        <div className="flex gap-4 snap-x snap-mandatory">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-72 shrink-0 snap-start rounded-2xl border border-border/60 bg-card p-3"
                >
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-3 h-9 w-full rounded-full" />
                </div>
              ))
            : items.map((rec, idx) => (
                <article
                  key={rec.dish.id}
                  className="card-lift group w-72 shrink-0 animate-fade-up snap-start rounded-2xl border border-border/60 bg-card p-3 shadow-card"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="relative">
                    <Link to="/dish/$id" params={{ id: rec.dish.id }}>
                      <img
                        src={rec.dish.image}
                        alt={rec.dish.name}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    </Link>
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-soft">
                      <Sparkles className="h-3 w-3" /> For You
                    </span>
                    <img
                      src={rec.restaurant.image}
                      alt={rec.restaurant.name}
                      className="absolute -bottom-3 right-3 h-10 w-10 rounded-full border-2 border-card object-cover shadow-soft"
                    />
                  </div>
                  <div className="mt-4 px-1">
                    <Link
                      to="/dish/$id"
                      params={{ id: rec.dish.id }}
                      className="line-clamp-1 font-semibold hover:text-primary"
                    >
                      {rec.dish.name}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {rec.restaurant.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11px] italic text-primary">
                      {rec.reason}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {rec.dish.rating}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {rec.restaurant.deliveryTime}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-lg font-bold">
                        {formatINR(rec.dish.price)}
                      </span>

                      <button
                        onClick={() => addItem(rec.dish)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.97]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
