import { describe, expect, it } from "vitest";
import { resolverAppHostname } from "./installer";
import { enchat } from "./stacks/enchat";
import { enchaTracker } from "./stacks/encha-tracker";
import type { StackDefinition } from "./stacks/types";

// Cobre as mutações M1 (registryAuth) e M4-equivalente (pairing) do
// contrato (Ciclo 20): resolverAppHostname é o ÚNICO ponto que
// installer.ts usa pra obter o hostname antes de chamar
// getOrCreateMachineId/fingerprintEnchat — se um call site voltar a
// hardcodar um hostname (ex.: "enchat-app") em vez de chamar esta função
// com `def`, este teste NÃO pega isso diretamente (é um teste da função,
// não dos call sites) — mas installer.ts's call sites delegam 100% a ela,
// então provar a função certa aqui, com a stack REAL do Tracker, é o que
// garante que appHostname="encha-tracker" (não o default do EnchaT)
// realmente chega em fingerprintEnchat.
describe("resolverAppHostname", () => {
  it("devolve appHostname da stack real do Tracker", () => {
    expect(resolverAppHostname(enchaTracker, "registryAuth")).toBe("encha-tracker");
  });

  it("devolve appHostname da stack real do EnchaT", () => {
    expect(resolverAppHostname(enchat, "pairing")).toBe("enchat-app");
  });

  it("lança se appHostname estiver ausente", () => {
    const semHostname = { ...enchaTracker, appHostname: undefined } as StackDefinition;
    expect(() => resolverAppHostname(semHostname, "registryAuth")).toThrow(/appHostname/);
  });

  it("a mensagem de erro cita o id da stack e o contexto (pairing vs registryAuth)", () => {
    const semHostname = { ...enchaTracker, id: "stack-de-teste-xyz", appHostname: undefined } as StackDefinition;
    expect(() => resolverAppHostname(semHostname, "pairing")).toThrow(/stack-de-teste-xyz/);
    expect(() => resolverAppHostname(semHostname, "pairing")).toThrow(/pairing/);
  });

  // Mutação M3 do Ciclo 20b: o terceiro contexto ("emailActivation",
  // usado pelo bloco de ativação dentro de installStack desde o Ciclo D)
  // tem que ficar sujeito à MESMA checagem — nenhum atalho especial pra ele.
  it("devolve appHostname da stack real do Tracker no contexto emailActivation", () => {
    expect(resolverAppHostname(enchaTracker, "emailActivation")).toBe("encha-tracker");
  });

  it("lança no contexto emailActivation se appHostname estiver ausente", () => {
    const semHostname = { ...enchaTracker, id: "stack-sem-hostname", appHostname: undefined } as StackDefinition;
    expect(() => resolverAppHostname(semHostname, "emailActivation")).toThrow(/stack-sem-hostname/);
    expect(() => resolverAppHostname(semHostname, "emailActivation")).toThrow(/emailActivation/);
  });
});
