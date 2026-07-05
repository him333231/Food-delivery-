export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              🍽
            </span>
            Bites
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Delicious food delivered fast, powered by smart recommendations.
          </p>
        </div>
        {[
          { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
          { title: "Support", links: ["Help center", "Safety", "Contact", "Partners"] },
          { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-primary">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Bites. All rights reserved.
      </div>
    </footer>
  );
}
