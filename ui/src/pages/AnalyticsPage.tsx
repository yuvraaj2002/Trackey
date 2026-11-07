import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import type { AnalyticsResponse } from "../api/types";
import { CategoryBars } from "../components/analytics/CategoryBars";
import { CategoryRing } from "../components/analytics/CategoryRing";
import { LedgerScene } from "../components/analytics/LedgerScene";
import { TopSpendChart } from "../components/analytics/TopSpendChart";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { endOfDayIso, formatDateTime, formatMoney, startOfDayIso, toDateInputValue } from "../lib/format";

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

export function AnalyticsPage() {
  const initial = defaultRange();
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(range = { start, end }) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAnalytics({
        start: startOfDayIso(range.start),
        end: endOfDayIso(range.end),
        top_limit: 8,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Initial period only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load({ start, end });
  }

  const ringSlices = useMemo(
    () =>
      (data?.by_category ?? []).map((row) => ({
        id: row.category_id,
        name: row.category_name,
        amount: Number(row.total_amount),
        percent: Number(row.percentage_of_total),
        count: row.transaction_count,
      })),
    [data],
  );

  const bars = useMemo(
    () =>
      (data?.by_category ?? []).map((row) => ({
        id: row.category_id,
        name: row.category_name,
        amount: Number(row.total_amount),
        percent: Number(row.percentage_of_total),
        count: row.transaction_count,
        average: Number(row.average_amount),
      })),
    [data],
  );

  const topItems = useMemo(
    () =>
      (data?.top_spends ?? []).map((spend) => ({
        id: spend.id,
        label: spend.label,
        amount: Number(spend.amount),
        category: spend.category_name,
        createdAt: spend.created_at,
      })),
    [data],
  );

  const accentRatio = useMemo(() => {
    if (!data || data.by_category.length === 0) return 0.45;
    return Math.min(1, Number(data.by_category[0].percentage_of_total) / 100);
  }, [data]);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="A calm read of spending for a chosen stretch of time."
      />

      <form className="toolbar" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="start">
            Start
          </label>
          <input
            id="start"
            className="input"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="end">
            End
          </label>
          <input
            id="end"
            className="input"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            required
          />
        </div>
        <div className="field" style={{ justifyContent: "flex-end" }}>
          <span className="field-label" style={{ visibility: "hidden" }}>
            Apply
          </span>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Apply"}
          </Button>
        </div>
      </form>

      {error ? <div className="error-banner" style={{ marginTop: 16 }}>{error}</div> : null}

      {loading && !data ? (
        <p className="muted" style={{ marginTop: 24 }}>
          Gathering the period…
        </p>
      ) : !data ? (
        <div className="empty">
          <h2>No analytics</h2>
          <p>Choose a period and try again.</p>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 32 }}>
          <section className="analytics-hero">
            <div className="analytics-hero-copy">
              <div className="hero-metric">
                <div className="label">Total spend</div>
                <div className="value tabular">{formatMoney(data.summary.total_spend)}</div>
              </div>
              <div className="stats" style={{ marginTop: 24 }}>
                <div className="stat">
                  <div className="stat-val tabular">{data.summary.transaction_count}</div>
                  <div className="stat-label">Transactions</div>
                </div>
                <div className="stat">
                  <div className="stat-val tabular">{formatMoney(data.summary.average_spend)}</div>
                  <div className="stat-label">Average spend</div>
                </div>
              </div>
            </div>
            <LedgerScene accentRatio={accentRatio} />
          </section>

          <section className="viz-grid">
            <div className="viz-panel">
              <div className="section-head">
                <h2>Share by category</h2>
              </div>
              <CategoryRing
                slices={ringSlices}
                totalLabel={formatMoney(data.summary.total_spend)}
              />
            </div>
            <div className="viz-panel">
              <div className="section-head">
                <h2>Category bars</h2>
              </div>
              <CategoryBars bars={bars} />
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>Top spends</h2>
            </div>
            <TopSpendChart items={topItems} />
          </section>

          <section>
            <div className="section-head">
              <h2>Highest per category</h2>
            </div>
            {data.highest_per_category.length === 0 ? (
              <p className="muted">No peaks in this window.</p>
            ) : (
              <ul className="list">
                {data.highest_per_category.map((item) => (
                  <li
                    key={`${item.category_id}-${item.spend_id}`}
                    className="list-row"
                    style={{ gridTemplateColumns: "minmax(0, 1fr) 140px 110px" }}
                  >
                    <div>
                      <div className="title">{item.label}</div>
                      <div className="meta">{formatDateTime(item.created_at)}</div>
                    </div>
                    <div className="meta">{item.category_name}</div>
                    <div className="amount">{formatMoney(item.amount)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
