import { Link } from "@tanstack/react-router";
import { ShoppingCart, MapPin, Search, Receipt } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function Navbar() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            🍽
          </span>
          <span>Bites</span>
        </Link>
        <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Downtown</span>
          <span>· 10 min</span>
        </div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 hover:bg-primary-soft"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary bg-primary-soft" }}
          >
            Home
          </Link>
          <Link
            to="/restaurants"
            className="rounded-lg px-3 py-2 hover:bg-primary-soft"
            activeProps={{ className: "text-primary bg-primary-soft" }}
          >
            Restaurants
          </Link>
          <button
            className="hidden rounded-lg p-2 hover:bg-primary-soft sm:inline-flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/cart"
            className="relative ml-1 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-background px-1 text-xs font-bold text-primary">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
