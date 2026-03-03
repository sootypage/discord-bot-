export async function GET() {
  // Uses the same application id as your OAuth app
  const clientId = process.env.DISCORD_CLIENT_ID;

  // Permissions: Administrator (8) (simple for now)
  // scope bot + applications.commands
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "bot applications.commands",
    permissions: "8",
  });

  return Response.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}