// Hook especial do Next.js (App Router) — o nome do arquivo e da função
// exportada (`register`) são convenção fixa do framework, não escolha
// nossa; ele roda uma vez no boot do processo, antes de qualquer request.
//
// Ciclo C6 do plano de segurança (achado A1): é AQUI que o painel agenda a
// garantia periódica do serviço Swarm `encha-guard` (ver
// src/lib/guard-runtime.ts, `inicializarGarantiaGuardaSwarm`).
//
// O Next.js também executa `instrumentation.ts` no runtime EDGE durante o
// build (não só no runtime Node de produção) — os imports usados aqui
// (`node:net` via swarm-guard.ts, `undici` via portainer.ts) não existem
// nesse runtime e quebrariam o build se fossem import estático no topo do
// arquivo. Por isso o import de guard-runtime.ts é DINÂMICO e só acontece
// dentro do `if (process.env.NEXT_RUNTIME === "nodejs")` — nunca mova esse
// import para o topo do módulo.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { inicializarGarantiaGuardaSwarm } = await import("@/lib/guard-runtime");
      inicializarGarantiaGuardaSwarm();
    } catch (e) {
      console.error("[guard] instrumentation: falha ao inicializar a garantia periódica do encha-guard:", e);
    }
    // Sincronização automática do arquivo da stack enchat (chave remota no
    // Console). try/catch próprio: uma falha aqui nunca derruba o guard.
    try {
      const { inicializarSincronizacaoStack } = await import("@/lib/sync-runtime");
      inicializarSincronizacaoStack();
    } catch (e) {
      console.error("[sync-stack] instrumentation: falha ao inicializar a sincronização automática:", e);
    }
  }
}
