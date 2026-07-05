import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Package, RotateCcw, Sparkles } from "lucide-react";
import { getOrders, type OrderRecord } from "@/lib/recommendations";
import { useCart } from "@/lib/cart-context";
import { dishes } from "@/lib/data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — Bites" },
      { name: "description", content: "View your past food orders and reorder in one tap." },
    ],
  }),
  component: OrdersPage,
});

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ready, setReady] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setOrders(getOrders());
    setReady(true);
  }, []);

  const reorder = (order: OrderRecord) => {
    order.items.forEach((it) => {
      const dish = dishes.find((d) => d.id === it.id);
      if (dish) addItem(dish, it.quantity);
    });
  };

  if (ready && orders.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-primary">
          <Package className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">No orders yet</h1>
        <p className="mt-2 text-muted-foreground">
          Your order history will appear here once you place your first order.
          The more you order, the smarter your AI recommendations get.
        </p>
        <Link
          to="/restaurants"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} order{orders.length === 1 ? "" : "s"} placed. Reorder
            favorites in one tap.
          </p>
        </div>
        <Link
          to="/"
          className="hidden items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary sm:inline-flex"
        >
          <Sparkles className="h-4 w-4" /> See AI picks
        </Link>
      </div>

      <ul className="mt-8 space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  <Package className="h-3.5 w-3.5" /> Delivered
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(order.placedAt)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Order #{order.id.replace("ord_", "").slice(-6)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-display text-xl font-bold text-primary">
                  ${order.total.toFixed(2)}
                </div>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border/60">
              {order.items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{it.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {it.restaurantName}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      ${(it.price * it.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      × {it.quantity}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => reorder(order)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" /> Reorder
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
