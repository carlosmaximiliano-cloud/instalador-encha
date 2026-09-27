import { describe, expect, it } from "vitest";
import { parseSemver, semverMaiorOuIgual } from "./semver";
import { ENCHAT_VERSAO_MINIMA_SEGREDOS, enchatUsaSegredos } from "./stacks/enchat-segredos";

describe("parseSemver", () => {
  it("aceita só X.Y.Z", () => {
    expect(parseSemver("0.4.1")).toEqual([0, 4, 1]);
    expect(parseSemver("10.20.300")).toEqual([10, 20, 300]);
  });
  it.each(["", "v0.4.1", "0.4", "0.4.1-beta", "0.4.1.2", "latest", " 0.4.1", "0.4.x", "-1.0.0"])(
    "recusa %j",
    (v) => expect(parseSemver(v)).toBeNull()
  );
  it("recusa não-string e inteiro que perde precisão", () => {
    expect(parseSemver(undefined)).toBeNull();
    expect(parseSemver(null)).toBeNull();
    expect(parseSemver(4)).toBeNull();
    expect(parseSemver("99999999999999999999.0.0")).toBeNull();
  });
});

describe("semverMaiorOuIgual", () => {
  it("compara numericamente, não como texto (0.4.10 > 0.4.9; 0.10.0 > 0.9.0)", () => {
    expect(semverMaiorOuIgual("0.4.10", "0.4.9")).toBe(true);
    expect(semverMaiorOuIgual("0.10.0", "0.9.0")).toBe(true);
    expect(semverMaiorOuIgual("0.4.9", "0.4.10")).toBe(false);
  });
  it("igual conta como maior-ou-igual; menor não", () => {
    expect(semverMaiorOuIgual("0.4.1", "0.4.1")).toBe(true);
    expect(semverMaiorOuIgual("0.4.0", "0.4.1")).toBe(false);
    expect(semverMaiorOuIgual("1.0.0", "0.99.99")).toBe(true);
  });
  it("ilegível em qualquer lado → false (nunca lança)", () => {
    expect(semverMaiorOuIgual("abc", "0.4.1")).toBe(false);
    expect(semverMaiorOuIgual("0.4.1", "abc")).toBe(false);
    expect(semverMaiorOuIgual(undefined, "0.4.1")).toBe(false);
  });
});

describe("enchatUsaSegredos (portão por versão)", () => {
  // A 0.4.1 do EnchaT foi publicada SEM o suporte a *_FILE (build anterior ao
  // E5); o E5 sai na 0.4.2. Abrir o portão numa versão que ignora *_FILE
  // derrubaria a stack inteira (app/Pinfy/updater sem chaves).
  it("a constante é 0.4.2 (primeira release do EnchaT que lê *_FILE; a 0.4.1 não lê)", () => {
    expect(ENCHAT_VERSAO_MINIMA_SEGREDOS).toBe("0.4.2");
  });
  it("abaixo do mínimo → formato antigo", () => {
    for (const v of ["0.3.2", "0.4.0", "0.0.999", "0.3.10"]) expect(enchatUsaSegredos(v)).toBe(false);
  });
  it("0.4.1 (publicada sem *_FILE) → formato ANTIGO: é o caso que a correção S4b protege", () => {
    expect(enchatUsaSegredos("0.4.1")).toBe(false);
  });
  it("no mínimo ou acima → segredos", () => {
    for (const v of ["0.4.2", "0.4.3", "0.5.0", "1.0.0", "0.4.10"]) expect(enchatUsaSegredos(v)).toBe(true);
  });
  it("indefinida, vazia ou ilegível → formato antigo (nunca quebra)", () => {
    for (const v of [undefined, null, "", "latest", "stable", "v0.4.2", "0.4.2-rc.1", "0.4.2-rc1", "beta"]) {
      expect(enchatUsaSegredos(v as string | undefined)).toBe(false);
    }
  });
});
