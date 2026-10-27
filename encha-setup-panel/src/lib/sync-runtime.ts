import { discoverContext, withServiceToken } from "./portainer";
import { hasServiceCredentials } from "./auth/local-admin";
import { sincronizacaoAutomaticaLigada } from "./flag-sincronizacao";
import { FixarVersoesError, STACK_ENCHAT } from "./fixar-versoes";
import { STACK_TRACKER, sincronizarStackEnchat, sincronizarStackTracker } from "./sincronizar-stack";
import { podeTentarAuto } from "./stack-sync-store";

// Agendador da sincronização automática do arquivo da stack enchat — mesmo
// padrão do guard-runtime.ts: setTimeout/setInterval com .unref(), token de
// serviço, nunca lança. Só age com a chave remota ligada (ver
// flag-sincronizacao.ts) e fora do backoff.

const PRIMEIRA_TENTATIVA_MS = 3 * 60_000; // depois do boot: deixa o painel antigo (start-first) sair
const INTERVALO_MS = 2 * 60_000;

const ESPERADOS = ["em_andamento", "nao_convergida", "mudou_durante", "lease_perdido", "stack_nao_instalada"];

async function tentar(
  stackId: string,
  rotulo: string,
  rodar: (token: string) => Promise<unknown>
): Promise<void> {
  try {
    if (!(await sincronizacaoAutomaticaLigada())) return;
    if (!podeTentarAuto(stackId).pode) return;
    await withServiceToken(async (token) => {
      await discoverContext(token); // falha cedo se o Portainer estiver fora
      await rodar(token);
    });
  } catch (e) {
    // Esperados: em_andamento (outro processo), nao_convergida, mudou_durante, lease_perdido — silêncio.
    if (e instanceof FixarVersoesError && ESPERADOS.includes(e.codigo)) return;
    console.error(`[${rotulo}] tentativa falhou (a próxima janela tenta de novo):`, e instanceof Error ? e.message : e);
  }
}

export async function tentarSincronizarStack(): Promise<void> {
  await tentar(STACK_ENCHAT, "sync-stack", (token) => sincronizarStackEnchat({ token, modo: "auto", user: "system", ip: "local" }));
}

/** Stack do Tracker: tentativa independente da do enchat (uma não bloqueia nem atrasa a outra). */
export async function tentarSincronizarStackTracker(): Promise<void> {
  await tentar(STACK_TRACKER, "sync-stack-tracker", (token) => sincronizarStackTracker({ token, modo: "auto", user: "system", ip: "local" }));
}

async function tentarTodas(): Promise<void> {
  await Promise.allSettled([tentarSincronizarStack(), tentarSincronizarStackTracker()]);
}

export function inicializarSincronizacaoStack(): void {
  if (!hasServiceCredentials()) {
    console.log("[sync-stack] sem credenciais de serviço do Portainer — sincronização automática desativada (o botão manual continua).");
    return;
  }
  const primeiro = setTimeout(() => void tentarTodas(), PRIMEIRA_TENTATIVA_MS);
  primeiro.unref?.();
  const repetido = setInterval(() => void tentarTodas(), INTERVALO_MS);
  repetido.unref?.();
}
