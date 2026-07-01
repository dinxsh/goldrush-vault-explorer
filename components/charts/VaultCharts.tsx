"use client";

import { useEffect, useMemo, useState } from "react";
import LineChart, { type ChartSeries } from "./LineChart";
import { APY_WINDOWS, type ApyWindow } from "@/lib/apy-windows";

interface SeriesResponse {
  series: { date: string; price: number }[];
  count: number;
  hasData: boolean;
  windows: ApyWindow[];
  apyByWindow: Record<string, { date: string; apy: number }[]>;
  currentByWindow: Record<string, number | null>;
  days: number;
}

const toMs = (date: string) => new Date(`${date}T00:00:00Z`).getTime();
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;
const fmtUsd = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(2)}k` : `$${v.toLocaleString(undefined, { maximumFractionDigits: v < 10 ? 4 : 2 })}`;
const fmtDate = (x: number) =>
  new Date(x).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function useVaultSeries(address: string, chain: string, days = 90) {
  const [data, setData] = useState<SeriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    // The upstream price APIs occasionally throttle or time out under load. A
    // single failed fetch shouldn't blank the chart for a vault that has data,
    // so retry a couple of times with backoff before giving up.
    async function load() {
      const delays = [0, 600, 1500];
      for (let attempt = 0; attempt < delays.length; attempt++) {
        if (delays[attempt]) await new Promise((r) => setTimeout(r, delays[attempt]));
        if (cancelled) return;
        try {
          const r = await fetch(`/api/vault-series?address=${address}&chain=${chain}&days=${days}`);
          if (!r.ok) throw new Error(String(r.status));
          const json = await r.json();
          if (cancelled) return;
          // A genuine "no history" answer (200 + hasData:false) is final — don't
          // retry it. Only network/5xx failures fall through to another attempt.
          setData(json);
          setLoading(false);
          return;
        } catch {
          if (attempt === delays.length - 1 && !cancelled) {
            setFailed(true);
            setLoading(false);
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [address, chain, days]);

  return { data, loading, failed };
}

function Panel({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function VaultCharts({
  address,
  chain,
  vaultName,
}: {
  address: string;
  chain: string;
  vaultName: string;
}) {
  const { data, loading, failed } = useVaultSeries(address, chain, 90);
  // Window visibility toggles for the multi-window APY chart.
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(APY_WINDOWS.map((w) => [w.key, true]))
  );

  const valueSeries: ChartSeries[] = useMemo(() => {
    if (!data?.series?.length) return [];
    return [
      {
        key: "value",
        label: "Withdrawable",
        color: "#5ce17f", // --gr-green (concrete hex for SVG stroke + gradient stops)
        points: data.series.map((p) => ({ x: toMs(p.date), y: p.price })),
      },
    ];
  }, [data]);

  const apySeries: ChartSeries[] = useMemo(() => {
    if (!data?.apyByWindow) return [];
    return APY_WINDOWS.filter((w) => active[w.key]).map((w) => ({
      key: w.key,
      label: w.label,
      color: w.color,
      points: (data.apyByWindow[w.key] ?? []).map((p) => ({ x: toMs(p.date), y: p.apy })),
    }));
  }, [data, active]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }} />
        ))}
      </div>
    );
  }

  // No live history → render nothing at all (no empty-state panel). We never
  // show a chart surface without real data behind it.
  if (failed || !data?.hasData) {
    return null;
  }

  const anyApy = APY_WINDOWS.some((w) => (data.apyByWindow[w.key] ?? []).length > 0);

  return (
    <div className="space-y-6">
      {/* Withdrawable value per share */}
      <Panel
        title="Withdrawable Value per Share"
        subtitle="Live USD value of one vault share over the last 90 days"
      >
        <LineChart series={valueSeries} height={300} valueFormat={fmtUsd} xFormat={fmtDate} fillArea />
      </Panel>

      {/* Multi-window APY */}
      <Panel
        title={vaultName}
        subtitle={address}
        right={
          <span className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>
            Last {data.days} days ({data.count} points)
          </span>
        }
      >
        {/* Window toggles */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Windows:
          </span>
          {APY_WINDOWS.map((w) => {
            const on = active[w.key];
            return (
              <button
                key={w.key}
                onClick={() => setActive((prev) => ({ ...prev, [w.key]: !prev[w.key] }))}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  borderColor: on ? w.color : "var(--border)",
                  color: on ? w.color : "var(--text-secondary)",
                  background: on ? `${w.color}1a` : "transparent",
                  opacity: on ? 1 : 0.7,
                }}
              >
                <span style={{ width: 12, height: 2, background: on ? w.color : "var(--text-secondary)", display: "inline-block" }} />
                {w.label}
              </button>
            );
          })}
        </div>

        {anyApy ? (
          <LineChart series={apySeries} height={340} valueFormat={fmtPct} xFormat={fmtDate} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Not enough price history yet to derive windowed APY.
          </div>
        )}
      </Panel>

      {/* Current APY by window */}
      <Panel title="Current APY by Window" subtitle="Trailing annualized yield, derived from live share-price growth">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {APY_WINDOWS.map((w) => {
            const v = data.currentByWindow[w.key];
            return (
              <div
                key={w.key}
                className="rounded-lg border p-3 text-center"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {w.label}
                </div>
                <div className="mt-1 text-lg font-bold" style={{ color: v != null ? w.color : "var(--text-secondary)" }}>
                  {v != null ? fmtPct(v) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
