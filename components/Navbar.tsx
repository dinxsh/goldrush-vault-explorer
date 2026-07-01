import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          {/* Branding */}
          <Link href="/" className="group flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goldrush-logo.svg" alt="GoldRush" className="h-4 w-auto" />
            <span
              className="hidden border-l pl-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors group-hover:text-[var(--accent)] sm:inline"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Vault Explorer
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Earn
            </Link>
            <Link
              href="/explore"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Explore
            </Link>
            <Link
              href="/docs"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
