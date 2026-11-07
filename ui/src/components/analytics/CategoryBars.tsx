import { useState } from "react";
import { formatMoney } from "../../lib/format";
import { chartColor } from "./colors";

type Bar = {
  id: number;
  name: string;
  amount: number;
  percent: number;
  count: number;
  average: number;
};

type CategoryBarsProps = {
  bars: Bar[];
};

export function CategoryBars({ bars }: CategoryBarsProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  if (bars.length === 0) {
    return <p className="muted">No categorized spend in this period.</p>;
  }

  return (
    <div className="viz-bars" role="list">
      {bars.map((bar, index) => {
        const active = activeId === bar.id;
        return (
          <div
            key={bar.id}
            role="listitem"
            className={`viz-bar-row${active ? " on" : ""}`}
            onMouseEnter={() => setActiveId(bar.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <div className="viz-bar-head">
              <div className="viz-bar-label">
                <span className="viz-swatch" style={{ background: chartColor(index) }} />
                <span className="title">{bar.name}</span>
              </div>
              <div className="amount tabular">{formatMoney(bar.amount)}</div>
            </div>
            <div className="viz-bar-track">
              <div
                className="viz-bar-fill"
                style={{
                  width: `${Math.min(100, bar.percent)}%`,
                  background: chartColor(index),
                }}
              />
            </div>
            <div className={`viz-bar-tip${active ? " show" : ""}`}>
              {bar.count} transactions · avg {formatMoney(bar.average)} · {bar.percent.toFixed(1)}% of total
            </div>
          </div>
        );
      })}
    </div>
  );
}
