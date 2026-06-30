"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  /** Points sorted ascending by x. x is a timestamp (ms). */
  points: { x: number; y: number }[];
}

interface LineChartProps {
  series: ChartSeries[];
  height?: number;
  /** Y-axis tick + tooltip value formatter. */
  valueFormat?: (v: number) => string;
  /** X-axis tick label formatter. */
  xFormat?: (x: number) => string;
  /** Tooltip header formatter (defaults to xFormat). */
  tooltipTitle?: (x: number) => string;
  yTicks?: number;
  xTicks?: number;
  /** Soft gradient fill under the line — only sensible for a single series. */
  fillArea?: boolean;
}

const PAD = { top: 14, right: 18, bottom: 30, left: 52 };

// Lightweight, dependency-free SVG line chart with a hover crosshair + tooltip.
// Multiple series share one time domain; series may start at different x (e.g.
// longer APY windows that need more history), which renders as a line that
// begins partway across — matching the reference design.
export default function LineChart({
  series,
  height = 320,
  valueFormat = (v) => v.toFixed(2),
  xFormat = (x) => new Date(x).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  tooltipTitle,
  yTicks = 4,
  xTicks = 7,
  fillArea = false,
}: LineChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = series.filter((s) => s.points.length > 0);

  const { xMin, xMax, yMin, yMax, unionX } = useMemo(() => {
    const xs = new Set<number>();
    let xLo = Infinity,
      xHi = -Infinity,
      yLo = Infinity,
      yHi = -Infinity;
    for (const s of visible) {
      for (const p of s.points) {
        xs.add(p.x);
        if (p.x < xLo) xLo = p.x;
        if (p.x > xHi) xHi = p.x;
        if (p.y < yLo) yLo = p.y;
        if (p.y > yHi) yHi = p.y;
      }
    }
    // Pad the y-domain so the line doesn't graze the edges; expand a flat line.
    if (yLo === yHi) {
      const bump = Math.abs(yLo) * 0.02 || 1;
      yLo -= bump;
      yHi += bump;
    } else {
      const padY = (yHi - yLo) * 0.08;
      yLo -= padY;
      yHi += padY;
    }
    return {
      xMin: xLo,
      xMax: xHi,
      yMin: yLo,
      yMax: yHi,
      unionX: Array.from(xs).sort((a, b) => a - b),
    };
  }, [visible]);

  if (visible.length === 0 || !Number.isFinite(xMin) || xMin === xMax) {
    return (
      <div
        ref={wrapRef}
        className="flex items-center justify-center rounded-lg border"
        style={{ height, borderColor: "var(--border)", background: "var(--card)", color: "var(--text-secondary)" }}
      >
        <span className="text-sm">Not enough data to plot.</span>
      </div>
    );
  }

  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = Math.max(height - PAD.top - PAD.bottom, 1);
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * innerH;

  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);
  const xStep = Math.max(1, Math.floor(unionX.length / xTicks));
  const xTickVals = unionX.filter((_, i) => i % xStep === 0);

  // Per-series fast lookup for the crosshair.
  const lookup = visible.map((s) => ({ s, map: new Map(s.points.map((p) => [p.x, p.y])) }));

  // Snap the hovered pixel to the nearest real x in the union domain.
  const snappedX = (() => {
    if (hoverX === null) return null;
    let best = unionX[0];
    let bestD = Infinity;
    for (const x of unionX) {
      const d = Math.abs(sx(x) - hoverX);
      if (d < bestD) {
        bestD = d;
        best = x;
      }
    }
    return best;
  })();

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const tooltipRows =
    snappedX === null
      ? []
      : lookup
          .filter(({ map }) => map.has(snappedX))
          .map(({ s, map }) => ({ key: s.key, label: s.label, color: s.color, value: map.get(snappedX)! }));

  const titleFn = tooltipTitle ?? xFormat;
  const tipLeft = snappedX === null ? 0 : Math.min(Math.max(sx(snappedX) + 12, PAD.left), width - 170);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <svg
        width={width}
        height={height}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverX(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        {fillArea && (
          <defs>
            <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={visible[0].color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={visible[0].color} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Horizontal grid + y labels */}
        {yTickVals.map((v, i) => (
          <g key={`y${i}`}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={sy(v)}
              y2={sy(v)}
              stroke="var(--border)"
              strokeDasharray="3 4"
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={sy(v) + 3} textAnchor="end" fontSize={10} fill="var(--text-secondary)">
              {valueFormat(v)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xTickVals.map((x, i) => (
          <text
            key={`x${i}`}
            x={sx(x)}
            y={height - 10}
            textAnchor="middle"
            fontSize={10}
            fill="var(--text-secondary)"
          >
            {xFormat(x)}
          </text>
        ))}

        {/* Area fill (single series) */}
        {fillArea && visible[0].points.length > 1 && (
          <path
            d={
              `M ${sx(visible[0].points[0].x)} ${sy(visible[0].points[0].y)} ` +
              visible[0].points.map((p) => `L ${sx(p.x)} ${sy(p.y)}`).join(" ") +
              ` L ${sx(visible[0].points[visible[0].points.length - 1].x)} ${sy(yMin)} L ${sx(
                visible[0].points[0].x
              )} ${sy(yMin)} Z`
            }
            fill="url(#lc-area)"
          />
        )}

        {/* Series lines */}
        {visible.map((s) => (
          <path
            key={s.key}
            d={s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Crosshair */}
        {snappedX !== null && (
          <>
            <line
              x1={sx(snappedX)}
              x2={sx(snappedX)}
              y1={PAD.top}
              y2={height - PAD.bottom}
              stroke="var(--text-secondary)"
              strokeWidth={1}
              opacity={0.5}
            />
            {tooltipRows.map((r) => (
              <circle key={r.key} cx={sx(snappedX)} cy={sy(r.value)} r={3.5} fill={r.color} stroke="var(--bg)" strokeWidth={1.5} />
            ))}
          </>
        )}
      </svg>

      {/* Tooltip */}
      {snappedX !== null && tooltipRows.length > 0 && (
        <div
          className="pointer-events-none absolute rounded-md border px-3 py-2 text-xs shadow-lg"
          style={{
            top: PAD.top + 4,
            left: tipLeft,
            background: "var(--card)",
            borderColor: "var(--border)",
            minWidth: 150,
          }}
        >
          <div className="mb-1 font-medium" style={{ color: "var(--text-primary)" }}>
            {titleFn(snappedX)}
          </div>
          <div className="flex flex-col gap-1">
            {tooltipRows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ width: 10, height: 2, background: r.color, display: "inline-block" }} />
                  {r.label}
                </span>
                <span className="font-mono font-medium" style={{ color: r.color }}>
                  {valueFormat(r.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
