import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCurrentBoardId } from "@/lib/budget-store";

export function Sidebar() {
  const [today, setToday] = useState<string>("");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const currentBoardId = useCurrentBoardId();

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
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="mobile-safe-header lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 border-b border-foreground/10 bg-sidebar/95 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/85">
        {currentBoardId ? (
          <Link
            to="/board/$boardId"
            params={{ boardId: currentBoardId }}
            className="font-sans text-xl leading-none font-semibold tracking-normal"
          >
            Odin's Eye
          </Link>
        ) : (
          <Link to="/boards" className="font-sans text-xl leading-none font-semibold">
            Odin's Eye
          </Link>
        )}
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
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`mobile-safe-drawer lg:hidden fixed left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-b border-foreground/10 transform transition-transform duration-200 ${
          open ? "translate-y-0" : "-translate-y-[120%]"
        }`}
      >
        <nav className="p-4 space-y-1">
          <MobileNavLinks currentBoardId={currentBoardId} pathname={location.pathname} />
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-foreground/10 bg-sidebar/80 backdrop-blur-xl p-8 min-h-screen sticky top-0">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Consistency OS
          </div>
          {currentBoardId ? (
            <Link to="/board/$boardId" params={{ boardId: currentBoardId }} className="block">
              <h1 className="font-sans text-4xl mt-4 leading-none font-semibold tracking-normal">
                Odin's Eye
              </h1>
            </Link>
          ) : (
            <Link to="/boards" className="block">
              <h1 className="font-sans text-4xl mt-4 leading-none font-semibold tracking-normal">
                Odin's Eye
              </h1>
            </Link>
          )}
          <div className="rule mt-7" />
          <p className="font-serif text-base text-muted-foreground mt-5 leading-relaxed">
            What you do is who you are!
          </p>
        </div>

        <nav className="mt-12 space-y-1">
          <DesktopNavLinks currentBoardId={currentBoardId} pathname={location.pathname} />
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

function MobileNavLinks({
  currentBoardId,
  pathname,
}: {
  currentBoardId: string;
  pathname: string;
}) {
  return (
    <>
      {currentBoardId && (
        <Link
          to="/board/$boardId"
          params={{ boardId: currentBoardId }}
          className={`flex items-center gap-3 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            pathname.startsWith("/board/") ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <span className="w-4">{pathname.startsWith("/board/") ? "▸" : " "}</span>
          <span>My Dashboard</span>
        </Link>
      )}

      <Link
        to="/boards"
        className={`flex items-center gap-3 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors ${
          pathname === "/boards" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <span className="w-4">{pathname === "/boards" ? "▸" : " "}</span>
        <span>All Dashboards</span>
      </Link>
    </>
  );
}

function DesktopNavLinks({
  currentBoardId,
  pathname,
}: {
  currentBoardId: string;
  pathname: string;
}) {
  return (
    <>
      {currentBoardId && (
        <Link
          to="/board/$boardId"
          params={{ boardId: currentBoardId }}
          className={`flex items-center gap-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            pathname.startsWith("/board/")
              ? "text-foreground bg-sidebar-accent px-3 rounded-full shadow-[inset_0_0_0_1px_oklch(0.62_0.055_145_/_0.12)]"
              : "text-muted-foreground hover:text-foreground px-3 rounded-full hover:bg-sidebar-accent/70"
          }`}
        >
          <span className="w-4">{pathname.startsWith("/board/") ? "▸" : " "}</span>
          <span>My Dashboard</span>
        </Link>
      )}

      <Link
        to="/boards"
        className={`flex items-center gap-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
          pathname === "/boards"
            ? "text-foreground bg-sidebar-accent px-3 rounded-full shadow-[inset_0_0_0_1px_oklch(0.62_0.055_145_/_0.12)]"
            : "text-muted-foreground hover:text-foreground px-3 rounded-full hover:bg-sidebar-accent/70"
        }`}
      >
        <span className="w-4">{pathname === "/boards" ? "▸" : " "}</span>
        <span>All Dashboards</span>
      </Link>
    </>
  );
}
