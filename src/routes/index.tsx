import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles, ArrowRight, Star } from "lucide-react";
import { categories, restaurants } from "@/lib/data";
import { RestaurantCard } from "@/components/RestaurantCard";
import { AiRecommendations } from "@/components/AiRecommendations";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = restaurants.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_80%_-10%,var(--primary-soft),transparent)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered picks for you
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Delicious food, <span className="text-primary">delivered fast.</span>
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Discover top restaurants and dishes around you. Personalized
              recommendations, live tracking, contactless delivery.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-full border border-border/60 bg-card p-1.5 pl-5 shadow-card">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                placeholder="Search restaurants or dishes..."
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Link
                to="/restaurants"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              >
                Search
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <div>
                <div className="font-display text-2xl font-bold">2k+</div>
                <div className="text-muted-foreground">Restaurants</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">15 min</div>
                <div className="text-muted-foreground">Avg. delivery</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">4.8 ★</div>
                <div className="text-muted-foreground">Rated by users</div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-primary-soft to-transparent blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80"
              alt="Delicious pizza"
              className="mx-auto aspect-square w-full max-w-md rounded-[2.5rem] object-cover shadow-soft"
            />
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border/60 bg-card p-3 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-semibold">4.9 rating</div>
                  <div className="text-xs text-muted-foreground">12k+ reviews</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 top-6 hidden rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft md:block">
              <div className="text-xs text-muted-foreground">Delivering in</div>
              <div className="font-display text-xl font-bold text-primary">18 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionHeader title="What's on your mind?" />
        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
          {categories.map((c) => (
            <Link
              to="/restaurants"
              key={c.id}
              className="card-lift flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 text-center"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-xs font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI RECOMMENDED */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Recommended
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Picked for your Friday evening
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Since you usually order Pizza on Friday evenings, you may love
              Pepperoni Pizza with Garlic Bread and Coke.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((d) => (
            <DishCard key={d.id} dish={d} />
          ))}
        </div>
      </section>

      {/* POPULAR RESTAURANTS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionHeader
          title="Popular restaurants"
          action={
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((r) => (
            <Link key={r.id} to="/restaurants">
              <RestaurantCard r={r} />
            </Link>
          ))}
        </div>
      </section>

      {/* OFFER BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative max-w-xl">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              Limited time
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Get 30% off your first order
            </h2>
            <p className="mt-2 text-primary-foreground/90">
              Use code <span className="font-bold">BITES30</span> at checkout. Free
              delivery on orders above $25.
            </p>
            <Link
              to="/restaurants"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-primary shadow-soft"
            >
              Order now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
