"use client";

import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs-nav";

// Previous / Next pager rendered at the bottom of every docs page, so readers
// can move through the docs in order without hunting in the sidebar.
export default function DocsPagination() {
  const pathname = usePathname();
  const idx = DOCS_NAV.findIndex((item) => item.href === pathname);
  if (idx === -1) return null;

  const prev = idx > 0 ? DOCS_NAV[idx - 1] : null;
  const next = idx < DOCS_NAV.length - 1 ? DOCS_NAV[idx + 1] : null;

  return (
    <nav
      className="mt-16 flex items-stretch justify-between gap-4 border-t pt-6"
      style={{ borderColor: "var(--border)" }}
      aria-label="Documentation pages"
    >
      {prev ? (
        <a
          href={prev.href}
          className="flex flex-1 flex-col rounded-lg border p-4 transition-colors hover:border-[var(--accent)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            ← Previous
          </span>
          <span className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {prev.label}
          </span>
        </a>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <a
          href={next.href}
          className="flex flex-1 flex-col items-end rounded-lg border p-4 text-right transition-colors hover:border-[var(--accent)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Next →
          </span>
          <span className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {next.label}
          </span>
        </a>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
