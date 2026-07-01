import DocsSidebar from "@/components/DocsSidebar";
import DocsPagination from "@/components/DocsPagination";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="w-64 border-r p-6" style={{ borderColor: "var(--border)" }}>
        <DocsSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12 max-w-3xl">
        {children}
        <DocsPagination />
      </main>
    </div>
  );
}
