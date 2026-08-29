// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { TrackerEmailActivation } from "./tracker-email-activation";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// Wrapper que fornece um UseFormReturn de verdade (react-hook-form), do
// mesmo jeito que install-wizard.tsx faz — sem isso form.setValue não
// teria onde escrever.
function Wrapper({ onChave }: { onChave?: (v: unknown) => void }) {
  const form = useForm<Record<string, unknown>>({ defaultValues: { chave_licenca: "" } });
  const chave = form.watch("chave_licenca");
  onChave?.(chave);
  return (
    <TrackerEmailActivation
      stackId="encha-tracker"
      csrfToken="csrf-de-teste"
      spec={{ targetField: "chave_licenca" }}
      form={form}
    />
  );
}

describe("TrackerEmailActivation", () => {
  it("ativa com sucesso e preenche o campo do formulário com a chave devolvida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ chave: "TRACKER-XYZ" }), { status: 200 }))
    );
    let chaveAtual: unknown;
    render(<Wrapper onChave={(v) => (chaveAtual = v)} />);

    await userEvent.type(screen.getByLabelText(/ativar pelo e-mail/i), "cliente@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: /ativar/i }));

    await waitFor(() => expect(screen.getByText(/licença ativada/i)).toBeInTheDocument());
    expect(chaveAtual).toBe("TRACKER-XYZ");
  });

  it("mostra a mensagem de erro do servidor e NÃO preenche o campo em caso de recusa", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "ativacao_recusada", message: "E-mail não reconhecido." }), { status: 409 }))
    );
    render(<Wrapper />);

    await userEvent.type(screen.getByLabelText(/ativar pelo e-mail/i), "desconhecido@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: /ativar/i }));

    await waitFor(() => expect(screen.getByText(/e-mail não reconhecido/i)).toBeInTheDocument());
  });

  // Mutação M4 do contrato (ciclos/ciclo-20b.md): o componente NUNCA pode
  // reusar/reimplementar a máquina de polling de license-pairing.tsx —
  // depois de uma ativação bem-sucedida, nenhum timer pendente e nenhuma
  // segunda chamada de rede, mesmo avançando o relógio.
  it("depois do sucesso, nenhum timer pendente dispara uma segunda chamada", async () => {
    const chamadas = vi.fn(async () => new Response(JSON.stringify({ chave: "TRACKER-XYZ" }), { status: 200 }));
    vi.stubGlobal("fetch", chamadas);
    render(<Wrapper />);

    await userEvent.type(screen.getByLabelText(/ativar pelo e-mail/i), "cliente@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: /ativar/i }));
    await waitFor(() => expect(screen.getByText(/licença ativada/i)).toBeInTheDocument());

    expect(chamadas).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    vi.advanceTimersByTime(10_000);
    vi.useRealTimers();

    // Sem microtasks pendentes de um poll que "esqueceu" de ser cancelado.
    await new Promise((r) => setTimeout(r, 0));
    expect(chamadas).toHaveBeenCalledTimes(1);
  });

  it("o botão fica desabilitado sem e-mail digitado", () => {
    render(<Wrapper />);
    expect(screen.getByRole("button", { name: /ativar/i })).toBeDisabled();
  });
});
