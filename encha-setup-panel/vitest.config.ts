import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Ciclo 20: primeiro test runner deste repositório — antes só havia `tsc
// --noEmit`. Ambiente padrão "node": a maioria dos testes é lógica de
// servidor (fingerprint, geração de YAML, validação de diretórios), sem
// DOM nenhum. Ciclo 20b acrescenta um componente React
// (tracker-email-activation.tsx) — o teste dele tem seu PRÓPRIO
// `// @vitest-environment jsdom` no topo do arquivo, não muda o default
// global (jsdom em todo teste seria mais lento e desnecessário pros
// outros).
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
