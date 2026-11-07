import { useMemo, useState } from "react";
import { formatMoney } from "../../lib/format";
import { chartColor } from "./colors";

type Slice = {
  id: number;
  name: string;
  amount: number;
  percent: number;
  count: number;
};

type CategoryRingProps = {
  slices: Slice[];
  totalLabel: string;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const from = polar(cx, cy, r, start);
  const to = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${r} ${r} 0 ${large} 1 ${to.x} ${to.y}`;
}

export function CategoryRing({ slices, totalLabel }: CategoryRingProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const stroke = 22;

  const arcs = useMemo(() => {
    let angle = 0;
    return slices.map((slice, index) => {
      const sweep = Math.max(0.8, (slice.percent / 100) * 360);
      const start = angle;
      const end = Math.min(359.999, angle + sweep);
      angle = end;
      return { ...slice, start, end, color: chartColor(index) };
    });
  }, [slices]);

  const active = arcs.find((slice) => slice.id === activeId) ?? null;

  if (slices.length === 0) {
    return (
      <div className="viz-empty">
        <p className="muted">No category share to draw yet.</p>
      </div>
    );
  }

  return (
    <div className="viz-ring">
      <div className="viz-ring-stage">
        <svg viewBox={`0 0 ${size} ${size}`} className="viz-ring-svg" role="img" aria-label="Spend by category">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--surface-sunken)" strokeWidth={stroke} />
          {arcs.map((slice) => {
            const isActive = activeId === null || activeId === slice.id;
            const isFocused = activeId === slice.id;
            return (
              <path
                key={slice.id}
                d={arcPath(cx, cy, radius, slice.start, slice.end)}
                fill="none"
                stroke={slice.color}
                strokeWidth={isFocused ? stroke + 4 : stroke}
                strokeLinecap="butt"
                opacity={isActive ? 1 : 0.28}
                className="viz-ring-arc"
                onMouseEnter={() => setActiveId(slice.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(slice.id)}
                onBlur={() => setActiveId(null)}
                tabIndex={0}
              />
            );
          })}
        </svg>
        <div className="viz-ring-center" aria-live="polite">
          {active ? (
            <>
              <div className="viz-ring-kicker">{active.name}</div>
              <div className="viz-ring-value tabular">{formatMoney(active.amount)}</div>
              <div className="viz-ring-meta">
                {active.percent.toFixed(1)}% · {active.count} txns
              </div>
            </>
          ) : (
            <>
              <div className="viz-ring-kicker">Total</div>
              <div className="viz-ring-value tabular">{totalLabel}</div>
              <div className="viz-ring-meta">Hover a slice</div>
            </>
          )}
        </div>
      </div>
      <ul className="viz-legend">
        {arcs.map((slice) => (
          <li key={slice.id}>
            <button
              type="button"
              className={`viz-legend-item${activeId === slice.id ? " on" : ""}`}
              onMouseEnter={() => setActiveId(slice.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(slice.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="viz-swatch" style={{ background: slice.color }} />
              <span className="viz-legend-copy">
                <span className="title">{slice.name}</span>
                <span className="meta tabular">
                  {formatMoney(slice.amount)} · {slice.percent.toFixed(1)}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
