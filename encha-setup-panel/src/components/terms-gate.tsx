import { fetchTerms } from "@/lib/monitor";
import { hasAccepted, flushPendingAcceptances } from "@/lib/terms";
import { TermsDialog } from "./terms-dialog";

// Server component — lê o Monitor e o SQLite local direto (sem round-trip de
// API), montado em (dashboard)/layout.tsx dentro de <Suspense fallback={null}>
// para não atrasar o primeiro paint com o timeout de 4s do fetch ao Monitor.
//
// Fail-open é obrigatório: se o Monitor estiver fora do ar, fetchTerms()
// devolve null e NADA bloqueia — uma queda central não pode inutilizar todos
// os painéis instalados. O bloqueio só acontece quando existe uma versão de
// termos publicada com sucesso e ela ainda não foi aceita nesta instalação.
export async function TermsGate() {
  const terms = await fetchTerms();
  if (!terms) return null;

  if (hasAccepted(terms.version)) {
    // Aproveita este render (dashboard já aberto = terms ok) para drenar a
    // fila de sincronização com o Monitor, sem cron/timer dedicado.
    void flushPendingAcceptances();
    return null;
  }

  return <TermsDialog version={terms.version} contentMd={terms.content_md} />;
}
