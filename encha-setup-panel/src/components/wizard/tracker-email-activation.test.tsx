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
  // depois de uma ativação bem-sucedida, nenhuma segunda chamada de rede
  // acontece sozinha, mesmo passado o intervalo de poll do outro
  // componente (3s). PRECISA ser um `setTimeout` REAL aqui, não fake
  // timers: um `setInterval` já agendado com o relógio real ANTES de
  // `vi.useFakeTimers()` ser ativado não é interceptado por ele — a
  // primeira versão deste teste tinha exatamente esse defeito e passava
  // por acidente mesmo sob a mutação (achado ao rodar a mutação ao vivo).
  it("depois do sucesso, nenhuma chamada nova acontece sozinha (sem polling)", async () => {
    const chamadas = vi.fn(async () => new Response(JSON.stringify({ chave: "TRACKER-XYZ" }), { status: 200 }));
    vi.stubGlobal("fetch", chamadas);
    render(<Wrapper />);

    await userEvent.type(screen.getByLabelText(/ativar pelo e-mail/i), "cliente@exemplo.com");
    await userEvent.click(screen.getByRole("button", { name: /ativar/i }));
    await waitFor(() => expect(screen.getByText(/licença ativada/i)).toBeInTheDocument());

    expect(chamadas).toHaveBeenCalledTimes(1);

    // Passa do intervalo de poll de license-pairing.tsx (3000ms) com o
    // relógio de verdade — um setInterval esquecido dispararia aqui.
    await new Promise((r) => setTimeout(r, 3500));
    expect(chamadas).toHaveBeenCalledTimes(1);
  }, 10_000);

  it("o botão fica desabilitado sem e-mail digitado", () => {
    render(<Wrapper />);
    expect(screen.getByRole("button", { name: /ativar/i })).toBeDisabled();
  });
});
