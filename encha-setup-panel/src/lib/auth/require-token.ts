import { readSession, type Session } from "@/lib/session";
import { getServiceToken } from "@/lib/portainer";

// Ponto único de acesso ao token do Portainer para rotas autenticadas.
// - Sessão do modo "portainer" (legado, sem PANEL_ADMIN_USER): usa o JWT
//   guardado no próprio cookie, exatamente como antes desta mudança.
// - Sessão do modo "local" (admin próprio do painel): não há JWT no cookie
//   — o token vem do cache de credenciais de serviço.
export async function requireSessionToken(): Promise<{ session: Session; token: string } | null> {
  const session = await readSession();
  if (!session) return null;
  const token = session.jwt ?? (await getServiceToken());
  return { session, token };
}
