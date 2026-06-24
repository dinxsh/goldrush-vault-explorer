interface ViewToggleProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 rounded border p-1" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <button
        onClick={() => onViewChange("grid")}
        className="flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors"
        style={{
          background: view === "grid" ? "var(--accent)" : "transparent",
          color: view === "grid" ? "#0f0f0f" : "var(--text-secondary)",
        }}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        onClick={() => onViewChange("table")}
        className="flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors"
        style={{
          background: view === "table" ? "var(--accent)" : "transparent",
          color: view === "table" ? "#0f0f0f" : "var(--text-secondary)",
        }}
        title="Table view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="2" />
          <rect x="3" y="8" width="18" height="1" />
          <rect x="3" y="10" width="18" height="1" />
          <rect x="3" y="12" width="18" height="1" />
          <rect x="3" y="14" width="18" height="1" />
          <rect x="3" y="16" width="18" height="1" />
          <rect x="3" y="18" width="18" height="2" />
        </svg>
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  );
}
