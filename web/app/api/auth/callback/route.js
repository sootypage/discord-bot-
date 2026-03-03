import { makeSessionCookie } from "../../../../lib/session";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new Response(`Token exchange failed: ${txt}`, { status: 500 });
  }

  const token = await tokenRes.json();

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });

  if (!meRes.ok) return new Response("Failed to fetch user", { status: 500 });
  const me = await meRes.json();

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    makeSessionCookie({
      uid: me.id,
      username: me.username,
      access_token: token.access_token,
      created: Date.now(),
    })
  );
  headers.append("Location", "/dashboard");

  return new Response(null, { status: 302, headers });
}
