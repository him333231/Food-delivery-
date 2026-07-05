import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, Tag, MapPin, CreditCard, Wallet, Banknote } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { recordOrder, saveOrder } from "@/lib/recommendations";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Bites" },
      { name: "description", content: "Review your order and check out." },
    ],
  }),
  component: CartPage,
});

const COUPONS: Record<string, number> = {
  BITES30: 0.3,
  FREESHIP: 0,
  WELCOME10: 0.1,
};

function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [payment, setPayment] = useState("card");
  const [placed, setPlaced] = useState(false);

  const discountRate = applied ? COUPONS[applied] ?? 0 : 0;
  const discount = subtotal * discountRate;
  const deliveryFee = subtotal > 25 || applied === "FREESHIP" ? 0 : 2.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + deliveryFee + tax;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code in COUPONS) setApplied(code);
    else setApplied(null);
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-4xl">
          ✅
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">
          Your food is being prepared. You'll get live updates soon.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/orders"
            className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft"
          >
            View my orders
          </Link>
          <Link
            to="/"
            className="inline-block rounded-full border border-border/60 bg-card px-6 py-3 font-semibold"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some delicious food to get started.
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review items, add a coupon, and check out.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Items ({items.length})
              </h2>
              <button
                onClick={clear}
                className="text-xs font-medium text-muted-foreground hover:text-destructive"
              >
                Clear cart
              </button>
            </div>
            <ul className="mt-4 divide-y divide-border/60">
              {items.map((i) => (
                <li key={i.dish.id} className="flex gap-4 py-4">
                  <img
                    src={i.dish.image}
                    alt={i.dish.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{i.dish.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {i.dish.restaurantName}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(i.dish.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 p-1">
                        <button
                          onClick={() =>
                            updateQuantity(i.dish.id, i.quantity - 1)
                          }
                          className="grid h-7 w-7 place-items-center rounded-full bg-secondary hover:bg-primary-soft"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(i.dish.id, i.quantity + 1)
                          }
                          className="grid h-7 w-7 place-items-center rounded-full bg-secondary hover:bg-primary-soft"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(i.dish.id)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" /> Delivery address
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                defaultValue="Jane Doe"
                className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Full name"
              />
              <input
                defaultValue="+1 555 010 2030"
                className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Phone"
              />
              <input
                defaultValue="221 Baker Street, Apt 4B"
                className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
                placeholder="Street address"
              />
              <input
                defaultValue="Downtown"
                className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="City"
              />
              <input
                defaultValue="10001"
                className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="ZIP"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { id: "card", label: "Credit card", icon: CreditCard },
                { id: "wallet", label: "Wallet", icon: Wallet },
                { id: "cod", label: "Cash on delivery", icon: Banknote },
              ].map((p) => {
                const Icon = p.icon;
                const active = payment === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT column: summary */}
        <aside className="h-fit rounded-2xl border border-border/60 bg-card p-4 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>

          <div className="mt-4 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-background px-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              />
            </div>
            <button
              onClick={applyCoupon}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Apply
            </button>
          </div>
          {applied && (
            <p className="mt-2 text-xs font-medium text-success">
              Coupon {applied} applied
            </p>
          )}
          {coupon && !applied && !(coupon.trim().toUpperCase() in COUPONS) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Try: BITES30, WELCOME10, FREESHIP
            </p>
          )}

          <div className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={subtotal} />
            {discount > 0 && (
              <Row label={`Discount (${Math.round(discountRate * 100)}%)`} value={-discount} accent />
            )}
            <Row
              label="Delivery"
              value={deliveryFee}
              muted={deliveryFee === 0}
              zeroLabel="Free"
            />
            <Row label="Tax (8%)" value={tax} />
            <div className="my-3 border-t border-border/60" />
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              recordOrder(items.map((i) => i.dish.id));
              saveOrder({
                total,
                items: items.map((i) => ({
                  id: i.dish.id,
                  name: i.dish.name,
                  image: i.dish.image,
                  price: i.dish.price,
                  quantity: i.quantity,
                  restaurantName: i.dish.restaurantName,
                })),
              });
              clear();
              setPlaced(true);
            }}
            className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98]"
          >
            Place order · ${total.toFixed(2)}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By placing an order you agree to our Terms.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
  zeroLabel,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
  zeroLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          accent
            ? "font-semibold text-success"
            : muted
              ? "font-semibold text-success"
              : "font-medium"
        }
      >
        {muted && zeroLabel && value === 0 ? zeroLabel : `$${Math.abs(value).toFixed(2)}`}
        {value < 0 ? "" : ""}
      </span>
    </div>
  );
}
