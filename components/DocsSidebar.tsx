"use client";

import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs-nav";

// Sidebar nav for the docs. Highlights the current page so the reader always
// knows where they are in the sequence.
export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Documentation
      </h3>
      <ul className="space-y-2">
        {DOCS_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{
                  color: active ? "var(--accent)" : "var(--text-primary)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
