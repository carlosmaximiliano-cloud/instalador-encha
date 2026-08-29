import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Testar o handler POST end-to-end exigiria simular sessão/cookies do
// Next.js (readSession via next/headers) — este repositório não tem
// precedente de teste de rota (nenhuma rota tinha teste nenhum antes do
// Ciclo 20b). Em vez de montar esse harness só para este arquivo, as
// mutações M1/M2 do contrato (ciclos/ciclo-20b.md) são provadas na FORMA
// do código-fonte real — mesmo espírito de tools/rotas/verificar.go no
// repo Encha Tracker (chi.Walk inspeciona a topologia real do router em
// vez de reconstruir uma cópia dela). As peças que a rota COMPÕE
// (getOrCreateMachineId, resolverAppHostname) já são testadas por
// comportamento em pairing-store.test.ts e installer-hostname.test.ts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTE = readFileSync(path.join(__dirname, "route.ts"), "utf8");

describe("POST /api/license/tracker/ativar — forma do código-fonte", () => {
  it("mutação M1: chama getOrCreateMachineId (reuso persistido), NUNCA machineIdNovo diretamente", () => {
    expect(FONTE).toMatch(/getOrCreateMachineId\(/);
    expect(FONTE).not.toMatch(/machineIdNovo\(/);
  });

  it("resolve o hostname via resolverAppHostname (nunca um literal solto)", () => {
    expect(FONTE).toMatch(/resolverAppHostname\(def,\s*"emailActivation"\)/);
  });

  it("mutação M2: nenhuma chamada a logAudit inclui a chave (`chave`) no meta", () => {
    const blocosLogAudit = FONTE.match(/logAudit\(\{[\s\S]*?\}\);/g) ?? [];
    expect(blocosLogAudit.length).toBeGreaterThan(0);
    for (const bloco of blocosLogAudit) {
      // Remove linhas de comentário `//` antes de checar — o próprio
      // código explica em prosa "nunca a chave", o que citaria a palavra
      // sem vazar nada (achado ao rodar este teste pela primeira vez).
      const semComentarios = bloco
        .split("\n")
        .filter((linha) => !linha.trim().startsWith("//"))
        .join("\n");
      expect(semComentarios).not.toMatch(/\bchave\b/);
    }
  });

  it("mutação M5: os três guards (origem, CSRF, sessão) são REALMENTE CHAMADOS antes de qualquer chamada ao Console", () => {
    // Procura a CHAMADA de verdade (identificador + parênteses de invocação
    // com o argumento certo), não só o identificador — um `import
    // { verifyCsrf, ... }` sem uso nenhum ainda faria `indexOf("verifyCsrf")`
    // achar alguma coisa, mascarando a mutação que remove só a LINHA que
    // invoca a função (achado ao rodar a mutação ao vivo: o teste antigo,
    // que só procurava o identificador solto, passou mesmo com a chamada
    // apagada, porque o import continuava mencionando o nome).
    const idxOrigin = FONTE.search(/verifyOrigin\(req\)/);
    const idxCsrf = FONTE.search(/verifyCsrf\(req\)/);
    const idxSessao = FONTE.search(/requireSessionToken\(\)/);
    const idxAtivar = FONTE.indexOf("ativarTrackerPorEmail(");
    expect(idxOrigin).toBeGreaterThan(-1);
    expect(idxCsrf).toBeGreaterThan(-1);
    expect(idxSessao).toBeGreaterThan(-1);
    expect(idxAtivar).toBeGreaterThan(-1);
    expect(idxOrigin).toBeLessThan(idxAtivar);
    expect(idxCsrf).toBeLessThan(idxAtivar);
    expect(idxSessao).toBeLessThan(idxAtivar);
  });
});
