// Decodificação (não-verificada) do payload de um JWT — usada só para ler o
// `exp` para fins de cache/expiração local. A validade real do token é sempre
// decidida pelo Portainer em cada chamada; isto nunca substitui verificação
// de assinatura.

export function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    return null;
  }
}

export function isJwtExpired(jwt: string): boolean {
  const payload = decodeJwtPayload(jwt);
  if (!payload) return true;
  return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
}

// Epoch ms de expiração do JWT, ou null se ausente/ilegível.
export function jwtExpiryMs(jwt: string): number | null {
  const payload = decodeJwtPayload(jwt);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}
