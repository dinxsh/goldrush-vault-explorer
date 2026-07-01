// Ordered documentation pages. Single source of truth for both the sidebar and
// the Previous/Next pager so their order can never drift apart.
export interface DocsNavItem {
  href: string;
  label: string;
}

export const DOCS_NAV: DocsNavItem[] = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/getting-started", label: "Getting Started" },
  { href: "/docs/how-it-works", label: "How It Works" },
  { href: "/docs/strategies", label: "Strategy Guide" },
  { href: "/docs/security", label: "Security & Audits" },
  { href: "/docs/faq", label: "FAQ" },
];
