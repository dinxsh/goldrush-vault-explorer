import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-opacity group-hover:opacity-80"
              style={{ background: "var(--accent)", color: "#0f0f0f" }}
            >
              ⚙️
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                GoldRush Explorer
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Powered by goldrush.dev
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Explore
            </Link>
            <Link
              href="/earn"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Opportunities
            </Link>
          </div>

          {/* GoldRush Badge */}
          <a
            href="https://goldrush.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:border-[var(--accent)]"
            style={{
              borderColor: "var(--border)",
              color: "var(--accent)",
            }}
          >
            goldrush.dev →
          </a>
        </div>
      </div>
    </nav>
  );
}
