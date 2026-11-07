import { useState } from "react";
import { formatDateTime, formatMoney } from "../../lib/format";
import { chartColor } from "./colors";

type Item = {
  id: number;
  label: string;
  amount: number;
  category: string;
  createdAt: string;
};

type TopSpendChartProps = {
  items: Item[];
};

export function TopSpendChart({ items }: TopSpendChartProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const max = Math.max(...items.map((item) => item.amount), 1);

  if (items.length === 0) {
    return <p className="muted">Nothing to rank yet.</p>;
  }

  return (
    <div className="viz-rank" role="list">
      {items.map((item, index) => {
        const active = activeId === item.id;
        const width = (item.amount / max) * 100;
        return (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className={`viz-rank-row${active ? " on" : ""}`}
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(item.id)}
            onBlur={() => setActiveId(null)}
          >
            <span className="viz-rank-index tabular">{index + 1}</span>
            <span className="viz-rank-body">
              <span className="viz-rank-top">
                <span className="title">{item.label}</span>
                <span className="amount tabular">{formatMoney(item.amount)}</span>
              </span>
              <span className="viz-rank-track">
                <span
                  className="viz-rank-fill"
                  style={{ width: `${width}%`, background: chartColor(index) }}
                />
              </span>
              <span className={`viz-rank-meta${active ? " show" : ""}`}>
                {item.category} · {formatDateTime(item.createdAt)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
