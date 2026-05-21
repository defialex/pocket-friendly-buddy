import { formatMoney, type Expense } from "@/lib/budget-store";

export function StatStrip({ expenses }: { expenses: Expense[] }) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);

  const thisMonth = expenses.filter((e) => e.date.startsWith(month));

  const income = thisMonth
    .filter((e) => e.kind === "income")
    .reduce((s, e) => s + e.amount, 0);

  const spent = thisMonth
    .filter((e) => e.kind === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const net = income - spent;

  return (
    <section className="border border-foreground/15 bg-card">
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        
        {/* HERO BALANCE */}
        <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-foreground/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Net Balance · This Month
          </div>

          <div className="mt-6 font-serif text-6xl md:text-8xl leading-none tracking-tight">
            {net >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(net))}
          </div>

          <div className="mt-6 flex gap-10 text-sm">
            <div>
              <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                Income
              </div>
              <div className="mt-2 font-serif text-2xl">
                {formatMoney(income)}
              </div>
            </div>

            <div>
              <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                Spent
              </div>
              <div className="mt-2 font-serif text-2xl">
                {formatMoney(spent)}
              </div>
            </div>
          </div>
        </div>

        {/* SIDE STATS */}
        <div className="grid grid-cols-2">
          <div className="p-8 border-b border-r border-foreground/10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Entries
            </div>

            <div className="mt-4 font-serif text-5xl">
              {thisMonth.length}
            </div>
          </div>

          <div className="p-8 border-b border-foreground/10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Avg Entry
            </div>

            <div className="mt-4 font-serif text-3xl">
              {thisMonth.length
                ? formatMoney(
                    spent / Math.max(
                      1,
                      thisMonth.filter((e) => e.kind === "expense").length
                    )
                  )
                : "$0"}
            </div>
          </div>

          <div className="p-8 col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Monthly Status
            </div>

            <div className="mt-4 font-serif italic text-xl">
              {net >= 0
                ? "Living within means."
                : "Spending exceeds income."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}