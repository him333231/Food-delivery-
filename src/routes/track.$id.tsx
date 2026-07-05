import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ChefHat, Bike, PackageCheck, MapPin, Phone } from "lucide-react";
import { getOrder, type OrderRecord } from "@/lib/recommendations";
import { formatINR } from "@/lib/currency";

export const Route = createFileRoute("/track/$id")({
  head: () => ({
    meta: [
      { title: "Track your order — Bites" },
      { name: "description", content: "Live tracking for your Bites order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Order not found</h1>
      <Link to="/orders" className="mt-4 inline-block text-primary underline">
        View your orders
      </Link>
    </div>
  ),
});

const STAGES = [
  { id: "placed", label: "Order placed", icon: CheckCircle2, note: "We've received your order" },
  { id: "preparing", label: "Preparing", icon: ChefHat, note: "The kitchen is on it" },
  { id: "onway", label: "Out for delivery", icon: Bike, note: "Your rider is en route" },
  { id: "delivered", label: "Delivered", icon: PackageCheck, note: "Enjoy your meal!" },
] as const;

const STAGE_MS = 15_000; // 15s per stage in demo

function TrackPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getOrder(id);
    setOrder(found ?? null);
    setReady(true);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (ready && !order) throw notFound();
  if (!order) return null;

  const elapsed = now - order.placedAt;
  const stageIdx = Math.min(STAGES.length - 1, Math.floor(elapsed / STAGE_MS));
  const totalMs = STAGES.length * STAGE_MS;
  const progressPct = Math.min(100, (elapsed / totalMs) * 100);
  const etaMs = Math.max(0, totalMs - elapsed);
  const etaMin = Math.ceil(etaMs / 60_000);
  const etaSec = Math.max(0, Math.ceil(etaMs / 1000));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Live tracking
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {stageIdx === STAGES.length - 1 ? "Order delivered!" : "Your order is on the way"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order #{order.id.replace("ord_", "").slice(-6)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-right">
          <div className="text-xs text-muted-foreground">
            {stageIdx === STAGES.length - 1 ? "Delivered in" : "Arriving in"}
          </div>
          <div className="font-display text-xl font-bold text-primary">
            {stageIdx === STAGES.length - 1
              ? `${Math.max(1, Math.round(totalMs / 60_000))} min`
              : etaMin > 1
                ? `${etaMin} min`
                : `${etaSec}s`}
          </div>
        </div>
      </div>

      {/* Map illustration */}
      <div className="relative mt-6 aspect-[16/7] w-full overflow-hidden rounded-3xl border border-border/60 bg-primary-soft">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--primary) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, var(--primary) 0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* route line */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 175" preserveAspectRatio="none">
          <path
            d="M 30 140 Q 150 20 220 90 T 370 40"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeDasharray="6 6"
            fill="none"
            opacity="0.7"
          />
        </svg>
        {/* start pin */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-soft">
          <ChefHat className="h-3.5 w-3.5 text-primary" /> Restaurant
        </div>
        {/* rider */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
          style={{
            left: `${10 + progressPct * 0.8}%`,
            top: `${70 - Math.sin((progressPct / 100) * Math.PI) * 45}%`,
          }}
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft ring-4 ring-background">
            <Bike className="h-5 w-5" />
          </div>
        </div>
        {/* end pin */}
        <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-soft">
          <MapPin className="h-3.5 w-3.5 text-primary" /> You
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <ol className="mt-6 grid gap-3 sm:grid-cols-4">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i <= stageIdx;
          const current = i === stageIdx;
          return (
            <li
              key={s.id}
              className={`rounded-2xl border p-4 transition ${
                current
                  ? "border-primary bg-primary-soft"
                  : done
                    ? "border-success/40 bg-success/10"
                    : "border-border/60 bg-card"
              }`}
            >
              <div
                className={`grid h-9 w-9 place-items-center rounded-full ${
                  done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-2 text-sm font-semibold">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.note}</p>
            </li>
          );
        })}
      </ol>

      {/* Rider + items */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Your rider</h2>
          <div className="mt-3 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80"
              alt="Rider"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">Ravi Kumar</p>
              <p className="text-xs text-muted-foreground">Bike · DL 05 AZ 4429</p>
            </div>
            <a
              href="tel:+919999900000"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Items</h3>
          <ul className="mt-2 divide-y divide-border/60">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <img src={it.image} alt={it.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{it.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {it.restaurantName} · ×{it.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatINR(it.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Summary</h2>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatINR(order.total)}
            </span>
          </div>
          <Link
            to="/orders"
            className="mt-6 block rounded-full border border-border/60 bg-background px-5 py-2.5 text-center text-sm font-semibold"
          >
            All orders
          </Link>
          <Link
            to="/"
            className="mt-2 block rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Order more
          </Link>
        </aside>
      </div>
    </div>
  );
}
