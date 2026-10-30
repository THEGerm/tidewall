// Checks the Cloudflare Access token on requests to /api/me/*. Access already
// gates these paths; this check stops anything that reaches the Worker
// without passing through Access (Cloudflare's own recommendation).

import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function accessEmail(
  request: Request,
  teamDomain: string,
  aud: string,
): Promise<string | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  jwks ??= createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience: aud,
    });
    return typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  } catch {
    return null;
  }
}
