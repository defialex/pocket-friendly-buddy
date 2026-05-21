import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/" },
  { label: "Transactions", to: "/transactions" },
  { label: "Categories", to: "/categories" },
  { label: "Reports", to: "/reports" },
] as const;

export function Sidebar() {
  const [today, setToday] = useState<string>("");
  const [open, setOpen] = useState(false);
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

  // close mobile drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-foreground/15 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
        <Link to="/" className="font-serif text-xl leading-none">
          The <em className="italic">Ledger</em>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="p-2 -mr-2 text-foreground"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile overlay drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`lg:hidden fixed top-14 left-0 right-0 z-40 bg-sidebar border-b border-foreground/15 transform transition-transform duration-200 ${
          open ? "translate-y-0" : "-translate-y-[120%]"
        }`}
      >
        <nav className="p-4 space-y-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="w-4">{active ? "▸" : " "}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar */}
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
    </>
  );
}
