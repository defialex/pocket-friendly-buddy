export function Sidebar() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-foreground/15 bg-sidebar p-8 min-h-screen sticky top-0">
      <div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Est. MMXXVI · No. 001
        </div>
        <h1 className="font-serif text-3xl mt-4 leading-tight">
          The<br />
          <em className="italic">Ledger</em>
        </h1>
        <div className="rule mt-6" />
        <p className="font-serif italic text-sm text-muted-foreground mt-4 leading-relaxed">
          A quiet record of where the coins have gone.
        </p>
      </div>

      <nav className="mt-12 space-y-1">
        {[
          { label: "Dashboard", active: true },
          { label: "Transactions", active: false },
          { label: "Categories", active: false },
          { label: "Reports", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 py-2 font-mono text-xs uppercase tracking-wider ${
              item.active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="w-4">{item.active ? "▸" : " "}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rule mb-4" />
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Today
        </div>
        <div className="font-serif text-sm mt-1">{today}</div>
      </div>
    </aside>
  );
}
