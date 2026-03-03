import { Container } from "./ui";

export function AppShell({ title, subtitle, right, sidebar, children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="text-sm font-semibold text-zinc-200">{title}</div>
              {subtitle ? <div className="text-xs text-zinc-400 mt-1">{subtitle}</div> : null}
            </div>
            <div className="flex items-center gap-2">{right}</div>
          </div>
        </Container>
      </div>

      {/* Main area */}
      <Container>
        <div className="grid grid-cols-12 gap-6 py-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
              {sidebar}
            </div>
          </aside>

          {/* Content */}
          <main className="col-span-12 lg:col-span-9">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}