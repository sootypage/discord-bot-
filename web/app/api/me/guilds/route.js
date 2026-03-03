import { getSessionFromRequest } from "../../../../lib/session";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session?.access_token) return new Response("Unauthorized", { status: 401 });

  const guildRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!guildRes.ok) return new Response("Failed to fetch guilds", { status: 500 });

  const guilds = await guildRes.json();

  // Manage Guild (0x20) or Admin (0x8)
  const manageable = guilds.filter((g) => {
    const perms = BigInt(g.permissions);
    const MANAGE_GUILD = 1n << 5n;
    const ADMIN = 1n << 3n;
    return (perms & MANAGE_GUILD) === MANAGE_GUILD || (perms & ADMIN) === ADMIN;
  });

  return Response.json({ guilds: manageable });
}
