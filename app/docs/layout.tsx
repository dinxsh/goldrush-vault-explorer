export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="w-64 border-r p-6" style={{ borderColor: "var(--border)" }}>
        <nav className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Documentation
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/docs"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                Introduction
              </a>
            </li>
            <li>
              <a
                href="/docs/getting-started"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                Getting Started
              </a>
            </li>
            <li>
              <a
                href="/docs/how-it-works"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="/docs/strategies"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                Strategy Guide
              </a>
            </li>
            <li>
              <a
                href="/docs/security"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                Security & Audits
              </a>
            </li>
            <li>
              <a
                href="/docs/faq"
                className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12 max-w-3xl">
        {children}
      </main>
    </div>
  );
}
