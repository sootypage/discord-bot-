"use client";

import { useEffect, useState } from "react";

const TAB = "px-3 py-2 rounded-xl text-sm font-semibold transition";
const TAB_INACTIVE = "text-zinc-300 hover:text-white hover:bg-zinc-900/60";
const TAB_ACTIVE = "text-white bg-zinc-900/70 border border-zinc-800";

function cn(...a) { return a.filter(Boolean).join(" "); }

export default function Navbar() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const isDash = path.startsWith("/dashboard");
  const isStatus = path.startsWith("/status");

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0b0d13]/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-center">
              <span className="text-yellow-400 font-black">⚡</span>
            </div>
            <div className="font-extrabold tracking-wide">
              <span className="text-white">WAVEBOT</span>
              <span className="text-yellow-400"> DASH</span>
            </div>
          </div>

          {/* Center tabs */}
          <div className="hidden md:flex items-center gap-2">
            <a className={cn(TAB, isStatus ? TAB_ACTIVE : TAB_INACTIVE)} href="/status">
              Status
            </a>
            <a className={cn(TAB, isDash ? TAB_ACTIVE : TAB_INACTIVE)} href="/dashboard">
              Dashboard
            </a>
            <a className={cn(TAB, TAB_INACTIVE)} href="/">
              Home
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              className="rounded-xl border border-yellow-500/70 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-500/20 transition"
              href="/api/invite"
            >
              Invite
            </a>

            {me ? (
              <a
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/80 transition"
                href="/api/auth/logout"
                title="Logout"
              >
                <span className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">
                  {initials(me.username)}
                </span>
                <span className="hidden sm:inline">{me.username}</span>
              </a>
            ) : (
              <a
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-bold text-zinc-100 hover:bg-zinc-900/80 transition"
                href="/api/auth/login"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name = "U") {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}