import { discoverContext, withServiceToken } from "./portainer";
import { hasServiceCredentials } from "./auth/local-admin";
import { sincronizacaoAutomaticaLigada } from "./flag-sincronizacao";
import { FixarVersoesError, STACK_ENCHAT } from "./fixar-versoes";
import { sincronizarStackEnchat } from "./sincronizar-stack";
import { podeTentarAuto } from "./stack-sync-store";

// Agendador da sincronização automática do arquivo da stack enchat — mesmo
// padrão do guard-runtime.ts: setTimeout/setInterval com .unref(), token de
// serviço, nunca lança. Só age com a chave remota ligada (ver
// flag-sincronizacao.ts) e fora do backoff.

const PRIMEIRA_TENTATIVA_MS = 3 * 60_000; // depois do boot: deixa o painel antigo (start-first) sair
const INTERVALO_MS = 2 * 60_000;

export async function tentarSincronizarStack(): Promise<void> {
  try {
    if (!(await sincronizacaoAutomaticaLigada())) return;
    if (!podeTentarAuto(STACK_ENCHAT).pode) return;
    await withServiceToken(async (token) => {
      await discoverContext(token); // falha cedo se o Portainer estiver fora
      await sincronizarStackEnchat({ token, modo: "auto", user: "system", ip: "local" });
    });
  } catch (e) {
    // Esperados: em_andamento (outro processo), nao_convergida, mudou_durante — silêncio.
    if (e instanceof FixarVersoesError && ["em_andamento", "nao_convergida", "mudou_durante", "stack_nao_instalada"].includes(e.codigo)) return;
    console.error("[sync-stack] tentativa falhou (a próxima janela tenta de novo):", e instanceof Error ? e.message : e);
  }
}

export function inicializarSincronizacaoStack(): void {
  if (!hasServiceCredentials()) {
    console.log("[sync-stack] sem credenciais de serviço do Portainer — sincronização automática desativada (o botão manual continua).");
    return;
  }
  const primeiro = setTimeout(() => void tentarSincronizarStack(), PRIMEIRA_TENTATIVA_MS);
  primeiro.unref?.();
  const repetido = setInterval(() => void tentarSincronizarStack(), INTERVALO_MS);
  repetido.unref?.();
}
