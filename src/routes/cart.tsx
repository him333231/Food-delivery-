import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Home,
  Briefcase,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { recordOrder, saveOrder } from "@/lib/recommendations";
import { logConsumption } from "@/lib/nutrition";
import { ComboSuggest } from "@/components/ComboSuggest";
import { formatINR } from "@/lib/currency";
import {
  getAddresses,
  saveAddress,
  deleteAddress,
  getSelectedAddressId,
  setSelectedAddressId,
  type Address,
} from "@/lib/address-store";

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

const LABEL_ICON: Record<string, typeof Home> = {
  Home,
  Work: Briefcase,
  Other: MoreHorizontal,
};

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [payment, setPayment] = useState("card");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    city: "Bengaluru",
    zip: "",
  });

  useEffect(() => {
    const list = getAddresses();
    setAddresses(list);
    const sel = getSelectedAddressId();
    if (sel && list.some((a) => a.id === sel)) setSelectedAddr(sel);
    else if (list[0]) setSelectedAddr(list[0].id);
    else setShowForm(true);
  }, []);

  const chooseAddress = (id: string) => {
    setSelectedAddr(id);
    setSelectedAddressId(id);
  };

  const submitAddress = () => {
    if (!form.name.trim() || !form.line1.trim() || !form.phone.trim()) return;
    const saved = saveAddress(form);
    const next = [saved, ...addresses];
    setAddresses(next);
    setSelectedAddr(saved.id);
    setShowForm(false);
    setForm({ label: "Home", name: "", phone: "", line1: "", city: "Bengaluru", zip: "" });
  };

  const removeAddr = (id: string) => {
    deleteAddress(id);
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    if (selectedAddr === id) setSelectedAddr(next[0]?.id ?? null);
  };

  const discountRate = applied ? COUPONS[applied] ?? 0 : 0;
  const discount = subtotal * discountRate;
  const deliveryFee = subtotal > 499 || applied === "FREESHIP" ? 0 : 39;
  const tax = (subtotal - discount) * 0.05; // 5% GST
  const total = subtotal - discount + deliveryFee + tax;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code in COUPONS) setApplied(code);
    else setApplied(null);
  };

  const placeOrder = () => {
    if (items.length === 0) return;
    if (!selectedAddr && addresses.length === 0) {
      setShowForm(true);
      return;
    }
    recordOrder(items.map((i) => i.dish.id));
    const record = saveOrder({
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
    navigate({ to: "/track/$id", params: { id: record.id } });
  };

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
                        {formatINR(i.dish.price * i.quantity)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 p-1">
                        <button
                          onClick={() => updateQuantity(i.dish.id, i.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full bg-secondary hover:bg-primary-soft"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(i.dish.id, i.quantity + 1)}
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

          {/* Address book */}
          <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" /> Delivery address
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Add new
                </button>
              )}
            </div>

            {addresses.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {addresses.map((a) => {
                  const Icon = LABEL_ICON[a.label] ?? Home;
                  const active = selectedAddr === a.id;
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => chooseAddress(a.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-primary bg-primary-soft"
                            : "border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                            active ? "bg-primary text-primary-foreground" : "bg-secondary"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{a.label}</span>
                            {active && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                <Check className="h-3 w-3" /> Selected
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.name} · {a.phone}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.line1}, {a.city} {a.zip}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAddr(a.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Delete address"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {showForm && (
              <div className="mt-4 rounded-xl border border-dashed border-border/60 p-4">
                <div className="flex gap-2">
                  {(["Home", "Work", "Other"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm((f) => ({ ...f, label: l }))}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        form.label === l
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Full name"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Phone (+91)"
                  />
                  <input
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
                    placeholder="Flat / street address"
                  />
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="City"
                  />
                  <input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="PIN code"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setShowForm(false)}
                      className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={submitAddress}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
                  >
                    Save address
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { id: "card", label: "Credit / Debit card", icon: CreditCard },
                { id: "wallet", label: "UPI / Wallet", icon: Wallet },
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
              <Row
                label={`Discount (${Math.round(discountRate * 100)}%)`}
                value={-discount}
                accent
              />
            )}
            <Row
              label="Delivery"
              value={deliveryFee}
              muted={deliveryFee === 0}
              zeroLabel="Free"
            />
            <Row label="GST (5%)" value={tax} />
            <div className="my-3 border-t border-border/60" />
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatINR(total)}
              </span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={!selectedAddr}
            className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {selectedAddr
              ? `Place order · ${formatINR(total)}`
              : "Add an address to continue"}
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
        {muted && zeroLabel && value === 0
          ? zeroLabel
          : `${value < 0 ? "-" : ""}${formatINR(Math.abs(value))}`}
      </span>
    </div>
  );
}
