import { describe, expect, it } from "vitest";
import { MARCA_AUSENTE, MARCA_FIM, MARCA_INICIO, SCRIPT_LER_ESTADO, parseEstado, portaoEstado } from "./estado-sidecar";
import type { AlvoImagens } from "./fixar-versoes";

const alvo = (over: Partial<AlvoImagens> = {}): AlvoImagens => ({
  edicao: "full",
  tag: "0.4.7",
  app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7@sha256:" + "a".repeat(64),
  pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7",
  updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
  tagUpdater: "0.4.7",
  ...over,
});
const logs = (j: unknown) => `${MARCA_INICIO}\r\n${JSON.stringify(j)}\r\n${MARCA_FIM}\r\n`;

describe("parseEstado", () => {
  it("lê o JSON entre as marcas (tolera \\r do TTY)", () => {
    expect(parseEstado(logs({ em_andamento: false, versao_atual: "0.4.7" })).estado).toMatchObject({ em_andamento: false, versao_atual: "0.4.7" });
  });
  it("ausente", () => expect(parseEstado(MARCA_AUSENTE)).toEqual({ estado: null, motivo: "ausente" }));
  it.each([
    ["sem marcas", "lixo"],
    ["JSON inválido", `${MARCA_INICIO}\n{x\n${MARCA_FIM}`],
    ["array", logs([1])],
    ["fim antes do início", `${MARCA_FIM}\n${MARCA_INICIO}`],
  ])("ilegível: %s", (_n, l) => expect(parseEstado(l).motivo).toBe("ilegivel"));
  it("ignora campos de tipo errado (dado, não autoridade)", () => {
    expect(parseEstado(logs({ em_andamento: "false", versao_atual: 7 })).estado).toEqual(
      expect.objectContaining({ em_andamento: undefined, versao_atual: undefined })
    );
  });
});

describe("portaoEstado", () => {
  const ok = { em_andamento: false, versao_atual: "0.4.7", app_imagem_aplicada: "ghcr.io/carlosmaximiliano-cloud/enchat" };
  it("abre quando tudo concorda", () => expect(portaoEstado(ok, alvo()).abre).toBe(true));
  it("fecha com operação em andamento", () => expect(portaoEstado({ ...ok, em_andamento: true }, alvo()).abre).toBe(false));
  it("fecha quando o app roda versão diferente da aplicada (regressão por Update the stack)", () => {
    const p = portaoEstado({ ...ok, versao_atual: "0.4.7" }, alvo({ tag: "0.4.6" }));
    expect(p.abre).toBe(false);
    expect(p.motivo).toContain("0.4.7");
  });
  it("fecha quando a edição aplicada difere da que roda", () => {
    expect(portaoEstado({ ...ok, app_imagem_aplicada: "ghcr.io/enchainterno/enchat-free" }, alvo()).abre).toBe(false);
  });
  it("0.4.6 (sem app_imagem_aplicada) continua válido pela versão", () => {
    expect(portaoEstado({ em_andamento: false, versao_atual: "0.4.7" }, alvo()).abre).toBe(true);
  });
  it("fecha sem versao_atual", () => expect(portaoEstado({ em_andamento: false }, alvo()).abre).toBe(false));
  it("autoatualização solicitada e sidecar ainda atrás: espera; depois de 15 min libera", () => {
    const e = { ...ok, auto_atualizacao: "solicitada: 0.4.7", concluido_em: "2026-10-09T18:46:26Z" };
    const t0 = Date.parse("2026-10-09T18:50:00Z");
    expect(portaoEstado(e, alvo({ tagUpdater: "0.4.6" }), t0).abre).toBe(false);
    expect(portaoEstado(e, alvo({ tagUpdater: "0.4.6" }), t0 + 20 * 60_000).abre).toBe(true);
    expect(portaoEstado(e, alvo({ tagUpdater: "0.4.7" }), t0).abre).toBe(true);
  });
  it("beta: não compara tag com versão 0.1.N", () => {
    expect(portaoEstado({ em_andamento: false, versao_atual: "0.1.42" }, alvo({ tag: "beta-0123456789ab", tagUpdater: "beta-0123456789ab" })).abre).toBe(true);
  });
});

describe("SCRIPT_LER_ESTADO", () => {
  it("é constante, de leitura e com caminho fixo", () => {
    expect(SCRIPT_LER_ESTADO).not.toMatch(/\$\{/);
    expect(SCRIPT_LER_ESTADO).not.toMatch(/[>]|rm |mv |cp /);
    expect(SCRIPT_LER_ESTADO).toContain("/host-var/enchat/updater/estado.json");
  });
});
