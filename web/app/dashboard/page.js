"use client";

import { useEffect, useMemo, useState } from "react";

function guildIconUrl(g) {
  if (!g.icon) return null;
  return `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`;
}

function initials(name = "S") {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "S";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/me/guilds")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setGuilds(d.guilds))
      .catch(() => setErr("Not logged in or failed to load servers."));
  }, []);

  const filtered = useMemo(() => {
    if (!guilds) return [];
    const s = q.trim().toLowerCase();
    if (!s) return guilds;
    return guilds.filter((g) => (g.name || "").toLowerCase().includes(s));
  }, [guilds, q]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Server Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage your Discord servers with WaveBot
        </p>
      </div>

      {/* Search bar */}
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/55 p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <span className="text-zinc-500">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for a server..."
              className="w-full bg-transparent text-sm outline-none text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
            <span className="text-zinc-500">📊</span>
            <span>{filtered.length} Servers</span>
          </div>
        </div>
      </div>

      {/* Errors / Loading */}
      {err && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-rose-900/60 bg-rose-500/10 p-4 text-rose-200">
          {err}
        </div>
      )}

      {!guilds && !err && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/55 p-4 text-zinc-300">
          Loading…
        </div>
      )}

      {/* Server cards */}
      {guilds && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const icon = guildIconUrl(g);
            // For now: everything is "Bot Active" since we don't check membership yet.
            // We can add real "Bot Active / Not Configured" next.
            const statusText = "Bot Active";
            const statusColor = "text-emerald-400";
            const buttonText = "Manage Server";
            const buttonClass =
              "bg-yellow-500/90 hover:bg-yellow-400 text-black font-extrabold";

            return (
              <div
                key={g.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/55 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_80px_rgba(0,0,0,0.35)] overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="h-12 w-12 rounded-2xl border border-zinc-800 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-200">
                        {initials(g.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 text-center">
                      <div className="truncate text-sm font-extrabold text-zinc-100">
                        {g.name}
                      </div>
                      <div className={`mt-1 text-xs font-semibold ${statusColor}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <a
                    href={`/dashboard/${g.id}`}
                    className={`block w-full rounded-xl px-4 py-2 text-center text-sm transition ${buttonClass}`}
                  >
                    {buttonText}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}