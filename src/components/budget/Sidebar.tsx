import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";

const NAV = [
  { label: "Dashboard", to: "/" },
  { label: "Transactions", to: "/transactions" },
  { label: "Reports", to: "/reports" },
] as const;

export function Sidebar() {
  const [today, setToday] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-foreground/15 bg-sidebar p-8 min-h-screen sticky top-0">
      <div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Est. MMXXVI · No. 001
        </div>
        <Link to="/" className="block">
          <h1 className="font-serif text-3xl mt-4 leading-tight">
            The<br />
            <em className="italic">Ledger</em>
          </h1>
        </Link>
        <div className="rule mt-6" />
        <p className="font-serif italic text-sm text-muted-foreground mt-4 leading-relaxed">
          A quiet record of where the coins have gone.
        </p>
      </div>

      <nav className="mt-12 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-4">{active ? "▸" : " "}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rule mb-4" />
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Today
        </div>
        <div className="font-serif text-sm mt-1 min-h-[1.25rem]" suppressHydrationWarning>
          {today}
        </div>
      </div>
    </aside>
  );
}
