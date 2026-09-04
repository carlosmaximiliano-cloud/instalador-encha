import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Ciclo 20: primeiro test runner deste repositório — antes só havia `tsc
// --noEmit`. Ambiente padrão "node": todos os testes são lógica de
// servidor (fingerprint, geração de YAML, validação de diretórios,
// orquestração de installStack), sem DOM nenhum — nenhum teste deste
// repositório usa `// @vitest-environment jsdom` hoje (o único que usava,
// do componente TrackerEmailActivation, foi removido no Ciclo D junto com
// o componente).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mesmo mapeamento de tsconfig.json (paths."@/*") — o Next.js resolve
    // isso sozinho no build real, mas o Vite (por baixo do vitest) precisa
    // do alias explícito.
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/testes-setup.ts"],
  },
});
