import { defineConfig } from "vitest/config";

// Ciclo 20: primeiro test runner deste repositório — antes só havia `tsc
// --noEmit`. Ambiente "node" (não "jsdom"): os testes deste ciclo são só
// lógica de servidor (fingerprint, geração de YAML, validação de
// diretórios), sem DOM nenhum.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
