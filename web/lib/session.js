import cookie from "cookie";
import crypto from "crypto";

function verify(token, secret) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (expected !== sig) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function getSessionFromRequest(req) {
  const header = req.headers.get("cookie") || "";
  const cookies = cookie.parse(header);
  return verify(cookies.session, process.env.SESSION_SECRET);
}

export function makeSessionCookie(payload) {
  const token = sign(payload, process.env.SESSION_SECRET);

  return cookie.serialize("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });
}

export function clearSessionCookie() {
  return cookie.serialize("session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
