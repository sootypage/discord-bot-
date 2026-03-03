"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../../components/layout";
import { Button, Card, Input, SectionTitle, Divider } from "../../../components/ui";

function TextArea({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-zinc-300">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={6}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-indigo-500 resize-y"
      />
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export default function GuildSettings({ params }) {
  const guildId = params.guildId;

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Moderation / Config
  const [modLogChannelId, setModLogChannelId] = useState("");
  const [badWords, setBadWords] = useState("");

  // Leveling
  const [levelChannelId, setLevelChannelId] = useState("");
  const [xpMin, setXpMin] = useState(5);
  const [xpMax, setXpMax] = useState(20);
  const [cooldownMs, setCooldownMs] = useState(60000);
  const [levelRolesText, setLevelRolesText] = useState("");

  // Tickets
  const [ticketCategoryId, setTicketCategoryId] = useState("");
  const [ticketSupportRoleId, setTicketSupportRoleId] = useState("");
  const [ticketLogChannelId, setTicketLogChannelId] = useState("");
  const [ticketTypesText, setTicketTypesText] = useState("");

  const dirty = useMemo(() => msg === "Unsaved changes", [msg]);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/settings`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        // config
        setModLogChannelId(d.modLogChannelId ?? "");
        setBadWords(d.badWords ?? "");

        // leveling
        setLevelChannelId(d.levelChannelId ?? "");
        setXpMin(Number(d.xpMin ?? 5));
        setXpMax(Number(d.xpMax ?? 20));
        setCooldownMs(Number(d.cooldownMs ?? 60000));
        setLevelRolesText(d.levelRolesText ?? "");

        // tickets
        setTicketCategoryId(d.ticketCategoryId ?? "");
        setTicketSupportRoleId(d.ticketSupportRoleId ?? "");
        setTicketLogChannelId(d.ticketLogChannelId ?? "");
        setTicketTypesText(d.ticketTypesText ?? "");
      })
      .catch(() => setMsg("Failed to load settings (are you logged in?)"))
      .finally(() => setLoading(false));
  }, [guildId]);

  function markDirty(fn) {
    return (e) => {
      fn(e.target.value);
      setMsg("Unsaved changes");
    };
  }

  function markDirtyNumber(fn) {
    return (e) => {
      const n = Number(e.target.value);
      fn(Number.isFinite(n) ? n : 0);
      setMsg("Unsaved changes");
    };
  }

  async function save() {
    setMsg("Saving…");

    const res = await fetch(`/api/guild/${guildId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // config
        modLogChannelId: modLogChannelId.trim() || null,
        badWords,

        // leveling
        levelChannelId: levelChannelId.trim() || null,
        xpMin,
        xpMax,
        cooldownMs,
        levelRolesText,

        // tickets
        ticketCategoryId: ticketCategoryId.trim() || null,
        ticketSupportRoleId: ticketSupportRoleId.trim() || null,
        ticketLogChannelId: ticketLogChannelId.trim() || null,
        ticketTypesText,
      }),
    });

    setMsg(res.ok ? "✅ Saved!" : "❌ Save failed");
    setTimeout(() => {
      if (res.ok) setMsg("");
    }, 1200);
  }

  return (
    <AppShell
      title="Server settings"
      subtitle={guildId}
      right={
        <div className="flex gap-2">
          <Button href="/dashboard" variant="ghost">
            Back
          </Button>
          <Button onClick={save} variant="primary">
            Save
          </Button>
        </div>
      }
      sidebar={
        <div className="grid gap-2">
          <div className="px-2 py-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Settings
            </div>
          </div>

          <a className="rounded-xl px-3 py-2 bg-zinc-800/60 text-sm font-semibold text-zinc-100" href="#moderation">
            Moderation
          </a>
          <a className="rounded-xl px-3 py-2 hover:bg-zinc-800/50 text-sm text-zinc-200" href="#leveling">
            Leveling
          </a>
          <a className="rounded-xl px-3 py-2 hover:bg-zinc-800/50 text-sm text-zinc-200" href="#tickets">
            Tickets
          </a>

          <Divider />

          <p className="px-2 text-xs text-zinc-400">
            {dirty ? "⚠️ You have unsaved changes" : "Edit settings, then press Save."}
          </p>
        </div>
      }
    >
      {loading ? (
        <Card>
          <p className="text-zinc-300">Loading…</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* MODERATION */}
          <Card>
            <div id="moderation" />
            <SectionTitle title="Moderation" desc="Filters and logging." />

            <div className="grid gap-4">
              <Input
                label="Mod Log Channel ID"
                value={modLogChannelId}
                onChange={markDirty(setModLogChannelId)}
                placeholder="123456789012345678"
                hint="Developer Mode → right click channel → Copy ID"
              />

              <TextArea
                label="Badword List (one per line)"
                value={badWords}
                onChange={markDirty(setBadWords)}
                placeholder={`word1\nword2\nword3`}
                hint="Messages containing these words will be removed (simple filter)."
              />
            </div>
          </Card>

          {/* LEVELING */}
          <Card>
            <div id="leveling" />
            <SectionTitle title="Leveling / XP" desc="XP amount, cooldown, channel, and roles." />

            <div className="grid gap-4">
              <Input
                label="Level Up Channel ID"
                value={levelChannelId}
                onChange={markDirty(setLevelChannelId)}
                placeholder="123456789012345678"
                hint="Leave blank to send level-up messages in the same channel."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="XP Min"
                  value={String(xpMin)}
                  onChange={markDirtyNumber(setXpMin)}
                  placeholder="5"
                  hint="Minimum XP per message"
                />
                <Input
                  label="XP Max"
                  value={String(xpMax)}
                  onChange={markDirtyNumber(setXpMax)}
                  placeholder="20"
                  hint="Maximum XP per message"
                />
                <Input
                  label="Cooldown (ms)"
                  value={String(cooldownMs)}
                  onChange={markDirtyNumber(setCooldownMs)}
                  placeholder="60000"
                  hint="60000 = 1 minute"
                />
              </div>

              <TextArea
                label="XP Roles (one per line)"
                value={levelRolesText}
                onChange={markDirty(setLevelRolesText)}
                placeholder={`5:123456789012345678\n10:123456789012345678`}
                hint="Format: LEVEL:ROLE_ID. Users get role when they reach that level."
              />
            </div>
          </Card>

          {/* TICKETS */}
          <Card>
            <div id="tickets" />
            <SectionTitle title="Tickets" desc="Where tickets are created and how the dropdown looks." />

            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Ticket Category Channel ID"
                  value={ticketCategoryId}
                  onChange={markDirty(setTicketCategoryId)}
                  placeholder="123456789012345678"
                  hint="Category to create ticket channels under"
                />
                <Input
                  label="Support Role ID"
                  value={ticketSupportRoleId}
                  onChange={markDirty(setTicketSupportRoleId)}
                  placeholder="123456789012345678"
                  hint="Role to ping / give access to tickets"
                />
                <Input
                  label="Ticket Log Channel ID"
                  value={ticketLogChannelId}
                  onChange={markDirty(setTicketLogChannelId)}
                  placeholder="123456789012345678"
                  hint="Optional: logs when tickets open/close"
                />
              </div>

              <TextArea
                label="Ticket Dropdown Options (one per line)"
                value={ticketTypesText}
                onChange={markDirty(setTicketTypesText)}
                placeholder={`support|Support|General help\nreport|Report|Report a player`}
                hint="Format: id|Label|Description. Max 25 options."
              />
            </div>
          </Card>

          {msg && <div className="text-sm text-zinc-300">{msg}</div>}
        </div>
      )}
    </AppShell>
  );
}