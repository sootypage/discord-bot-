import { clearSessionCookie } from "../../../../lib/session";

export async function GET() {
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie());
  headers.append("Location", "/");
  return new Response(null, { status: 302, headers });
}
