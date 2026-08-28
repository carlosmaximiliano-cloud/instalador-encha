import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fingerprintEnchat, machineIdNovo, ENCHAT_APP_HOSTNAME } from "./enchat-fingerprint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Espelho do MESMO vetor que internal/licenca/fingerprint_test.go lê (Go,
// autoritativo) — Ciclo 20 (repo Encha Tracker). Mesmo precedente de
// contrato-licenca-check/vetor-identidade-espelho: sem o repo vizinho
// clonado ao lado, avisa e cai num fallback local (nunca falha por
// ausência do repo vizinho) — mas o gate REAL, que roda com os dois
// repositórios lado a lado, sempre usa o arquivo compartilhado.
const TRACKER_REPO = process.env.TRACKER_REPO ?? path.resolve(__dirname, "../../../Encha Tracker");
const VETOR_PATH = path.join(TRACKER_REPO, "internal/licenca/testdata/vetor_fingerprint.json");

type CasoVetor = { nome: string; machine_id: string; hostname: string; fingerprint: string };

function carregarVetor(): CasoVetor[] {
  if (!existsSync(VETOR_PATH)) {
    // Fallback local — os mesmos dois valores, só para este arquivo não
    // ficar sem teste nenhum quando o repo do Tracker não está clonado ao
    // lado. O gate de verdade (tools/contrato-fingerprint/verificar.mjs,
    // repo Tracker) SEMPRE lê o arquivo compartilhado.
    return [
      { nome: "vetor do Encha Tracker (fallback local)", machine_id: "0123456789abcdef0123456789abcdef", hostname: "encha-tracker", fingerprint: "58132042721689d3e6fb25654444e5b7" },
      { nome: "vetor original do EnchaT (fallback local)", machine_id: "0123456789abcdef0123456789abcdef", hostname: "enchat-app", fingerprint: "81d4ffe1db36fb2a555810df47d1079e" },
    ];
  }
  const raw = JSON.parse(readFileSync(VETOR_PATH, "utf8")) as { casos: CasoVetor[] };
  return raw.casos;
}

const vetor = carregarVetor();

describe("fingerprintEnchat — vetor dourado compartilhado (Ciclo 20)", () => {
  for (const c of vetor) {
    it(c.nome, () => {
      expect(fingerprintEnchat(c.machine_id, c.hostname)).toBe(c.fingerprint);
    });
  }

  it("hostnames diferentes produzem fingerprints diferentes para o mesmo machineId", () => {
    const vistos = new Map<string, string>();
    for (const c of vetor) {
      const got = fingerprintEnchat(c.machine_id, c.hostname);
      const outro = vistos.get(got);
      expect(outro, `${c.nome} colidiu com ${outro}`).toBeUndefined();
      vistos.set(got, c.nome);
    }
  });

  it("o default do 2º argumento é ENCHAT_APP_HOSTNAME", () => {
    expect(fingerprintEnchat("abc")).toBe(fingerprintEnchat("abc", ENCHAT_APP_HOSTNAME));
  });

  it("é determinístico", () => {
    const a = fingerprintEnchat("x", "host-y");
    const b = fingerprintEnchat("x", "host-y");
    expect(a).toBe(b);
  });
});

describe("machineIdNovo", () => {
  it("gera 32 caracteres hex (16 bytes)", () => {
    const id = machineIdNovo();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it("nunca repete entre chamadas", () => {
    const ids = new Set(Array.from({ length: 20 }, () => machineIdNovo()));
    expect(ids.size).toBe(20);
  });
});
