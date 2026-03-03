import fs from "fs";
import path from "path";
import { getSessionFromRequest } from "../../../../../lib/session";

function safeId(id) {
  return /^\d{17,20}$/.test(id) ? id : null;
}

function readJson(fp, fallback) {
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch { return fallback; }
}

function writeJson(fp, obj) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
}

function toBool(v, def = false) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return def;
}

function toNum(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session?.access_token) return new Response("Unauthorized", { status: 401 });

  const guildId = safeId(params.guildId);
  if (!guildId) return new Response("Bad guild id", { status: 400 });

  const root = path.join(process.cwd(), "..");

  const guildCfgPath = path.join(root, "data", "guilds", `${guildId}.json`);
  const levelsPath   = path.join(root, "data", "levels", `${guildId}.json`);
  const ticketsPath  = path.join(root, "data", "tickets", `${guildId}.json`);
  const econPath     = path.join(root, "data", "economy", `${guildId}.json`);

  const guildCfg = readJson(guildCfgPath, {});
  const levels   = readJson(levelsPath, { settings: {}, users: {} });
  const tickets  = readJson(ticketsPath, { settings: {}, openTickets: {}, nextId: 1 });
  const econ     = readJson(econPath, { settings: {}, users: {} });

  return Response.json({
    // ---- Moderation/config ----
    modLogChannelId: guildCfg.modLogChannelId ?? "",
    badWords: Array.isArray(guildCfg.badWords) ? guildCfg.badWords.join("\n") : "",

    antiLink: !!guildCfg.antiLink,
    antiSpam: !!guildCfg.antiSpam,
    maxMentions: Number.isFinite(Number(guildCfg.maxMentions)) ? Number(guildCfg.maxMentions) : 5,
    logDeletes: !!guildCfg.logDeletes,

    // ---- Leveling ----
    levelChannelId: levels.settings?.levelChannelId ?? "",
    xpMin: levels.settings?.xpMin ?? 5,
    xpMax: levels.settings?.xpMax ?? 20,
    cooldownMs: levels.settings?.cooldownMs ?? 60000,

    levelUpMessageTemplate: levels.settings?.levelUpMessageTemplate ?? "🎉 {user} leveled up to **Level {level}**!",
    xpBlacklistChannelsText: Array.isArray(levels.settings?.xpBlacklistChannels)
      ? levels.settings.xpBlacklistChannels.join("\n")
      : "",
    xpBlacklistRolesText: Array.isArray(levels.settings?.xpBlacklistRoles)
      ? levels.settings.xpBlacklistRoles.join("\n")
      : "",

    levelRolesText: Array.isArray(levels.settings?.levelRoles)
      ? levels.settings.levelRoles.map((r) => `${r.level}:${r.roleId}`).join("\n")
      : "",

    // ---- Tickets ----
    ticketCategoryId: tickets.settings?.categoryChannelId ?? "",
    ticketSupportRoleId: tickets.settings?.supportRoleId ?? "",
    ticketLogChannelId: tickets.settings?.logChannelId ?? "",
    ticketWelcomeMessage: tickets.settings?.welcomeMessage ?? "Thanks for opening a ticket! Please describe your issue.",
    ticketAutoCloseHours: Number.isFinite(Number(tickets.settings?.autoCloseHours)) ? Number(tickets.settings.autoCloseHours) : 0,
    ticketTranscript: !!tickets.settings?.transcript,

    ticketTypesText: Array.isArray(tickets.settings?.ticketTypes)
      ? tickets.settings.ticketTypes.map((t) => `${t.id}|${t.label}|${t.description ?? ""}`).join("\n")
      : "",

    // ---- Economy ----
    startingBalance: Number.isFinite(Number(econ.settings?.startingBalance)) ? Number(econ.settings.startingBalance) : 0,
    dailyAmount: Number.isFinite(Number(econ.settings?.dailyAmount)) ? Number(econ.settings.dailyAmount) : 100,
    shopItemsText: Array.isArray(econ.settings?.shopItems)
      ? econ.settings.shopItems.map((it) => `${it.id}|${it.name}|${it.price}|${it.description ?? ""}`).join("\n")
      : "",
  });
}

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session?.access_token) return new Response("Unauthorized", { status: 401 });

  const guildId = safeId(params.guildId);
  if (!guildId) return new Response("Bad guild id", { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return new Response("Bad JSON", { status: 400 });

  const root = path.join(process.cwd(), "..");

  const guildCfgPath = path.join(root, "data", "guilds", `${guildId}.json`);
  const levelsPath   = path.join(root, "data", "levels", `${guildId}.json`);
  const ticketsPath  = path.join(root, "data", "tickets", `${guildId}.json`);
  const econPath     = path.join(root, "data", "economy", `${guildId}.json`);

  const guildCfg = readJson(guildCfgPath, {});
  const levels   = readJson(levelsPath, { settings: {}, users: {} });
  const tickets  = readJson(ticketsPath, { settings: {}, openTickets: {}, nextId: 1 });
  const econ     = readJson(econPath, { settings: {}, users: {} });

  // ---- Moderation/config ----
  guildCfg.modLogChannelId = body.modLogChannelId?.trim() || null;

  guildCfg.antiLink = toBool(body.antiLink, false);
  guildCfg.antiSpam = toBool(body.antiSpam, false);
  guildCfg.maxMentions = toNum(body.maxMentions, 5);
  guildCfg.logDeletes = toBool(body.logDeletes, false);

  const badWordsLines = String(body.badWords ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  guildCfg.badWords = badWordsLines;

  // ---- Leveling ----
  levels.settings ??= {};
  levels.users ??= levels.users || {};

  levels.settings.levelChannelId = body.levelChannelId?.trim() || null;
  levels.settings.xpMin = toNum(body.xpMin, 5);
  levels.settings.xpMax = toNum(body.xpMax, 20);
  levels.settings.cooldownMs = toNum(body.cooldownMs, 60000);

  levels.settings.levelUpMessageTemplate =
    String(body.levelUpMessageTemplate ?? "🎉 {user} leveled up to **Level {level}**!").slice(0, 500);

  const blCh = String(body.xpBlacklistChannelsText ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean);
  const blRoles = String(body.xpBlacklistRolesText ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean);

  levels.settings.xpBlacklistChannels = blCh.filter((id) => /^\d{17,20}$/.test(id)).slice(0, 200);
  levels.settings.xpBlacklistRoles = blRoles.filter((id) => /^\d{17,20}$/.test(id)).slice(0, 200);

  const rolesLines = String(body.levelRolesText ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  levels.settings.levelRoles = rolesLines
    .map((line) => {
      const [lvl, roleId] = line.split(":").map((x) => x.trim());
      const level = Number(lvl);
      if (!Number.isFinite(level) || !/^\d{17,20}$/.test(roleId || "")) return null;
      return { level, roleId };
    })
    .filter(Boolean)
    .sort((a, b) => a.level - b.level);

  // ---- Tickets ----
  tickets.settings ??= {};
  tickets.openTickets ??= tickets.openTickets || {};
  tickets.nextId ??= tickets.nextId || 1;

  tickets.settings.categoryChannelId = body.ticketCategoryId?.trim() || null;
  tickets.settings.supportRoleId = body.ticketSupportRoleId?.trim() || null;
  tickets.settings.logChannelId = body.ticketLogChannelId?.trim() || null;

  tickets.settings.welcomeMessage = String(body.ticketWelcomeMessage ?? "").slice(0, 1500);
  tickets.settings.autoCloseHours = Math.max(0, toNum(body.ticketAutoCloseHours, 0));
  tickets.settings.transcript = toBool(body.ticketTranscript, false);

  const typesLines = String(body.ticketTypesText ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  tickets.settings.ticketTypes = typesLines
    .map((line) => {
      const [id, label, description] = line.split("|").map((x) => (x ?? "").trim());
      if (!id || !label) return null;
      return { id, label, description: description || "" };
    })
    .filter(Boolean)
    .slice(0, 25);

  // ---- Economy ----
  econ.settings ??= {};
  econ.users ??= econ.users || {};

  econ.settings.startingBalance = toNum(body.startingBalance, 0);
  econ.settings.dailyAmount = toNum(body.dailyAmount, 100);

  const shopLines = String(body.shopItemsText ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  econ.settings.shopItems = shopLines
    .map((line) => {
      // id|name|price|description
      const [id, name, priceStr, description] = line.split("|").map((x) => (x ?? "").trim());
      const price = Number(priceStr);
      if (!id || !name || !Number.isFinite(price)) return null;
      return { id, name, price, description: description || "" };
    })
    .filter(Boolean)
    .slice(0, 200);

  writeJson(guildCfgPath, guildCfg);
  writeJson(levelsPath, levels);
  writeJson(ticketsPath, tickets);
  writeJson(econPath, econ);

  return Response.json({ ok: true });
}