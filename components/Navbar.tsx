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
          <Link href="/" className="group">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                GoldRush Vault Explorer
              </span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Powered by{" "}
                <a
                  href="https://goldrush.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--accent)]"
                  style={{ color: "var(--accent)" }}
                >
                  goldrush.dev
                </a>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Explore
            </Link>
            <Link
              href="/earn"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Opportunities
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
