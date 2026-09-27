// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallWizard } from "./install-wizard";
import { fireEvent } from "@testing-library/react";
import { MENSAGENS_VALIDACAO } from "@/lib/validacao-campos";
import { installWizardText } from "./install-wizard.i18n";
import { licensePairingText } from "./license-pairing.i18n";
import { LocaleProvider } from "@/components/locale-provider";
import type { Locale } from "@/lib/locale-shared";

// C7 (S10 do plano de segurança do EnchaT) — o card de sucesso mostra o
// link de primeiro acesso (setupUrl) com botão de copiar e a nota de uso
// único. Componente real, fetch falso devolvendo o mesmo shape de
// POST /api/stacks.

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));

const SETUP_URL = "https://crm.exemplo.com/?setup=TOKEN-DE-TESTE-0123456789abcdef";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function instalarAteSucesso(resposta: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(resposta), { status: 200, headers: { "content-type": "application/json" } }))
  );
  const user = userEvent.setup();
  render(
    <InstallWizard
      stack={{ id: "enchat", name: "EnchaT Grátis", description: "teste", fields: [] }}
      open
      onClose={() => {}}
      csrfToken="csrf"
      swarmCtx={{ networkName: "rede", serverName: "vps", email: "" }}
    />
  );
  await user.click(screen.getByRole("button", { name: installWizardText.pt.instalar }));
  await screen.findByText(installWizardText.pt.stackImplantada);
  return user;
}

describe("InstallWizard — link de primeiro acesso", () => {
  it("mostra o setupUrl, a nota de uso único, e o botão copia exatamente o link", async () => {
    const user = await instalarAteSucesso({
      ok: true,
      accessUrl: "https://crm.exemplo.com",
      setupUrl: SETUP_URL,
      notes: [],
      revealSecrets: [],
    });
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    expect(screen.getByText(installWizardText.pt.linkPrimeiroAcesso)).toBeInTheDocument();
    expect(screen.getByText(installWizardText.pt.linkPrimeiroAcessoNota)).toBeInTheDocument();
    const campo = screen.getByDisplayValue(SETUP_URL);
    expect(campo).toHaveAttribute("readonly");

    const bloco = campo.closest("div")!.parentElement!;
    await user.click(bloco.querySelector("button")!);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SETUP_URL));
  });

  it("o botão 'Abrir' abre o link COM o token (o endereço limpo cai na tela bloqueada)", async () => {
    await instalarAteSucesso({
      ok: true,
      accessUrl: "https://crm.exemplo.com",
      setupUrl: SETUP_URL,
      notes: [],
      revealSecrets: [],
    });
    expect(screen.getByRole("link", { name: installWizardText.pt.abrirStack("EnchaT Grátis") })).toHaveAttribute(
      "href",
      SETUP_URL
    );
  });

  it("sem setupUrl o botão 'Abrir' continua no accessUrl", async () => {
    await instalarAteSucesso({ ok: true, accessUrl: "https://x.exemplo.com", notes: [], revealSecrets: [] });
    expect(screen.getByRole("link", { name: installWizardText.pt.abrirStack("EnchaT Grátis") })).toHaveAttribute(
      "href",
      "https://x.exemplo.com"
    );
  });

  it("sem setupUrl (stack que não tem link de setup) o bloco não aparece", async () => {
    await instalarAteSucesso({ ok: true, accessUrl: "https://x.exemplo.com", notes: [], revealSecrets: [] });
    expect(screen.queryByText(installWizardText.pt.linkPrimeiroAcesso)).not.toBeInTheDocument();
  });

  it("os três idiomas têm o rótulo e a nota preenchidos (e diferentes entre si)", () => {
    const rotulos = (["pt", "en", "es"] as const).map((l) => installWizardText[l].linkPrimeiroAcesso);
    const notas = (["pt", "en", "es"] as const).map((l) => installWizardText[l].linkPrimeiroAcessoNota);
    expect(new Set(rotulos).size).toBe(3);
    expect(new Set(notas).size).toBe(3);
  });
});

// Pareamento de licença: sessão morta não pode prender o usuário, e "Instalar"
// sem licença não pode chegar a virar um "Falha na instalação" genérico.
// Componente real (InstallWizard + LicensePairing), fetch falso por rota.

const PAIRING_ID = "a".repeat(32);
const CAMPOS_ENCHAT = [{ name: "chave_licenca", label: "Chave", kind: "text", optional: true }];
const STACK_COM_PAREAMENTO = {
  id: "enchat",
  name: "EnchaT Grátis",
  description: "teste",
  fields: CAMPOS_ENCHAT,
  pairing: { targetField: "chave_licenca", sessionField: "licenca_pareamento_id" },
};

type Chamada = { path: string; body: Record<string, unknown> };

function stubPareamento(respostas: Record<string, () => Record<string, unknown>>): Chamada[] {
  const chamadas: Chamada[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const path = String(url).replace("/api/license/", "");
      chamadas.push({ path, body: JSON.parse(String(init?.body ?? "{}")) });
      const fabrica = respostas[path];
      const corpo = fabrica ? fabrica() : {};
      return new Response(JSON.stringify(corpo), { status: 200, headers: { "content-type": "application/json" } });
    })
  );
  return chamadas;
}

function renderComPareamento() {
  return render(
    <InstallWizard
      stack={STACK_COM_PAREAMENTO}
      open
      onClose={() => {}}
      csrfToken="csrf"
      swarmCtx={{ networkName: "rede", serverName: "vps", email: "" }}
    />
  );
}

const sessaoAberta = (codigo: string) => () => ({
  status: "aberto",
  pairingId: PAIRING_ID,
  codigo,
  codigoExibicao: codigo,
  numeroExibicao: "(61) 90000-0000",
  expiraEm: Math.floor(Date.now() / 1000) + 900,
});

describe("InstallWizard — Instalar só com licença", () => {
  it("com o pareamento pendente e sem chave, o botão fica desabilitado e explica por quê", async () => {
    stubPareamento({ "pair/start": sessaoAberta("ENCHAT-AAAAAA"), "pair/poll": () => ({ status: "aguardando" }) });
    renderComPareamento();

    await screen.findByText("ENCHAT-AAAAAA");
    expect(screen.getByRole("button", { name: installWizardText.pt.instalar })).toBeDisabled();
    expect(screen.getByText(installWizardText.pt.concluaLicencaParaInstalar)).toBeInTheDocument();
  });

  it("habilita quando o usuário cola uma chave à mão", async () => {
    stubPareamento({ "pair/start": sessaoAberta("ENCHAT-AAAAAA"), "pair/poll": () => ({ status: "aguardando" }) });
    const user = userEvent.setup();
    renderComPareamento();
    await screen.findByText("ENCHAT-AAAAAA");

    await user.type(screen.getByRole("textbox"), "CHAVE-EXISTENTE-123");

    expect(screen.getByRole("button", { name: installWizardText.pt.instalar })).toBeEnabled();
    expect(screen.queryByText(installWizardText.pt.concluaLicencaParaInstalar)).not.toBeInTheDocument();
  });

  it("habilita quando o pareamento já está confirmado (retomada)", async () => {
    stubPareamento({
      "pair/start": () => ({ status: "confirmado", pairingId: PAIRING_ID }),
      "pair/poll": () => ({ status: "confirmado" }),
    });
    renderComPareamento();

    await waitFor(() => expect(screen.getByRole("button", { name: installWizardText.pt.instalar })).toBeEnabled());
  });

  it("stack SEM pareamento não é afetada (botão sempre habilitado)", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(
      <InstallWizard
        stack={{ id: "x", name: "X", description: "t", fields: [] }}
        open
        onClose={() => {}}
        csrfToken="csrf"
        swarmCtx={{ networkName: "rede", serverName: "vps", email: "" }}
      />
    );
    expect(screen.getByRole("button", { name: installWizardText.pt.instalar })).toBeEnabled();
  });
});

describe("LicensePairing — sessão morta e 'Gerar outro código'", () => {
  it("'Gerar outro código' pede sessão NOVA (novo:true) e mostra o código novo; a abertura inicial não pede", async () => {
    let n = 0;
    const chamadas = stubPareamento({
      "pair/start": () => sessaoAberta(n++ === 0 ? "ENCHAT-VELHO1" : "ENCHAT-NOVO22")(),
      "pair/poll": () => ({ status: "aguardando" }),
    });
    const user = userEvent.setup();
    renderComPareamento();
    await screen.findByText("ENCHAT-VELHO1");

    await user.click(screen.getByRole("button", { name: licensePairingText.pt.gerarOutroCodigo }));

    await screen.findByText("ENCHAT-NOVO22");
    const starts = chamadas.filter((c) => c.path === "pair/start");
    expect(starts).toHaveLength(2);
    expect(starts[0].body.novo).toBeUndefined();
    expect(starts[1].body.novo).toBe(true);
  });

  it("poll 'expirado' troca o QR morto pela mensagem de expirado, com botão de novo código", async () => {
    stubPareamento({ "pair/start": sessaoAberta("ENCHAT-MORTO1"), "pair/poll": () => ({ status: "expirado" }) });
    renderComPareamento();

    await screen.findByText(licensePairingText.pt.expiradoMensagem, undefined, { timeout: 5000 });
    expect(screen.queryByText("ENCHAT-MORTO1")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: licensePairingText.pt.gerarOutroCodigo })).toBeInTheDocument();
  }, 10000);
});

// O servidor traduz o `group` dos campos por idioma ("Licença" -> "License" /
// "Licencia"), mas o pareamento sempre saiu com o grupo em pt. O wizard
// comparava os dois nomes, então em EN/ES o card de pareamento nunca aparecia
// (e "Instalar" ficava bloqueado esperando um pareamento invisível).

const GRUPOS_POR_IDIOMA: Record<Locale, { dominios: string; licenca: string }> = {
  pt: { dominios: "Domínios", licenca: "Licença" },
  en: { dominios: "Domains", licenca: "License" },
  es: { dominios: "Dominios", licenca: "Licencia" },
};

function stackTraduzida(locale: Locale, alvoPareamento = "chave_licenca") {
  const g = GRUPOS_POR_IDIOMA[locale];
  return {
    id: "enchat",
    name: "EnchaT Grátis",
    description: "teste",
    fields: [
      { name: "url_enchat", label: "Domínio", kind: "text", group: g.dominios },
      { name: "chave_licenca", label: "Chave", kind: "text", optional: true, group: g.licenca },
    ],
    // Payload como o servidor antigo mandava: pairing.group SEMPRE em pt.
    pairing: { targetField: alvoPareamento, sessionField: "licenca_pareamento_id", group: "Licença" },
  };
}

function renderNoIdioma(locale: Locale, stack: ReturnType<typeof stackTraduzida>) {
  return render(
    <LocaleProvider initialLocale={locale}>
      <InstallWizard
        stack={stack}
        open
        onClose={() => {}}
        csrfToken="csrf"
        swarmCtx={{ networkName: "rede", serverName: "vps", email: "" }}
      />
    </LocaleProvider>
  );
}

describe("InstallWizard — card de pareamento em qualquer idioma", () => {
  it.each(["pt", "en", "es"] as const)("%s: o card aparece e o pair/start é chamado", async (locale) => {
    const chamadas = stubPareamento({
      "pair/start": sessaoAberta("ENCHAT-IDIOMA1"),
      "pair/poll": () => ({ status: "aguardando" }),
    });
    renderNoIdioma(locale, stackTraduzida(locale));

    await screen.findByText("ENCHAT-IDIOMA1");
    expect(chamadas.some((c) => c.path === "pair/start")).toBe(true);
  });

  it.each(["en", "es"] as const)("%s: o card fica no grupo da licença, não no dos domínios", async (locale) => {
    stubPareamento({ "pair/start": sessaoAberta("ENCHAT-IDIOMA2"), "pair/poll": () => ({ status: "aguardando" }) });
    renderNoIdioma(locale, stackTraduzida(locale));

    const codigo = await screen.findByText("ENCHAT-IDIOMA2");
    const tituloLicenca = screen.getByText(GRUPOS_POR_IDIOMA[locale].licenca);
    const tituloDominios = screen.getByText(GRUPOS_POR_IDIOMA[locale].dominios);
    // O card vem DEPOIS do título do grupo da licença e ANTES do grupo seguinte/campos dele.
    expect(tituloLicenca.compareDocumentPosition(codigo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tituloDominios.compareDocumentPosition(codigo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tituloLicenca.parentElement!.contains(codigo)).toBe(true);
    expect(tituloDominios.parentElement!.contains(codigo)).toBe(false);
  });

  it("targetField que não existe nos campos: o card não some (cai no primeiro grupo)", async () => {
    stubPareamento({ "pair/start": sessaoAberta("ENCHAT-FALLBK"), "pair/poll": () => ({ status: "aguardando" }) });
    renderNoIdioma("en", stackTraduzida("en", "campo_inexistente"));

    const codigo = await screen.findByText("ENCHAT-FALLBK");
    expect(screen.getByText(GRUPOS_POR_IDIOMA.en.dominios).parentElement!.contains(codigo)).toBe(true);
  });
});

// Painel P1 — validação no formulário: a mesma regra pura do servidor
// (validacao-campos.ts) decide, de forma síncrona, se "Instalar" habilita e
// qual mensagem aparece embaixo de cada campo. Componente real, fetch falso.

const M = MENSAGENS_VALIDACAO;
const SENHA_FORTE = "Senha#Forte123";
const DOMINIO = "tracker.exemplo.com";
const EMAIL = "cliente@exemplo.com";

const STACK_TRACKER = {
  id: "encha-tracker",
  name: "Encha Tracker",
  description: "teste",
  fields: [
    { name: "dominio_tracker", label: "Domínio do Tracker", kind: "domain" },
    { name: "email_ativacao", label: "E-mail da compra", kind: "email" },
    { name: "senha_admin", label: "Senha de acesso ao painel", kind: "password", regra: "senha_forte_yaml" as const },
  ],
};

type RespostaStub = { status: number; body: unknown } | Error;

/** fetch falso: conta as chamadas a /api/stacks e responde `resposta`. */
function stubInstall(resposta: RespostaStub = { status: 200, body: { ok: true, notes: [], revealSecrets: [] } }) {
  const chamadas: { body: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url) === "/api/stacks") chamadas.push({ body: JSON.parse(String(init?.body ?? "{}")) });
      if (resposta instanceof Error) throw resposta;
      return new Response(JSON.stringify(resposta.body), {
        status: resposta.status,
        headers: { "content-type": "application/json" },
      });
    })
  );
  return chamadas;
}

function renderStack(stack: { id: string; name: string; description: string; fields: unknown[] }, locale: Locale = "pt") {
  return render(
    <LocaleProvider initialLocale={locale}>
      <InstallWizard
        stack={stack as never}
        open
        onClose={() => {}}
        csrfToken="csrf"
        swarmCtx={{ networkName: "rede", serverName: "vps", email: "" }}
      />
    </LocaleProvider>
  );
}

const botaoInstalar = (locale: Locale = "pt") => screen.getByRole("button", { name: installWizardText[locale].instalar });
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
const erroDe = (id: string) => document.getElementById(`${id}-erro`);
/** Envia o formulário mesmo com o botão desabilitado (o navegador não deixaria clicar, mas Enter no campo dispara submit). */
const enviarForm = (locale: Locale = "pt") => fireEvent.submit(botaoInstalar(locale).closest("form")!);

async function preencherTudo(user: ReturnType<typeof userEvent.setup>, senha = SENHA_FORTE) {
  await user.type(input("dominio_tracker"), DOMINIO);
  await user.type(input("email_ativacao"), EMAIL);
  await user.type(input("senha_admin"), senha);
}

describe("InstallWizard — validação no formulário (Painel P1)", () => {
  it("senha vazia: Instalar desabilitado e submit não chama fetch", async () => {
    const chamadas = stubInstall();
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);

    // Tudo vazio: desabilitado, com o porquê explicado.
    expect(botaoInstalar()).toBeDisabled();
    expect(screen.getByText(installWizardText.pt.corrijaCamposParaInstalar)).toBeInTheDocument();

    // Domínio e e-mail preenchidos, senha vazia: continua desabilitado.
    await user.type(input("dominio_tracker"), DOMINIO);
    await user.type(input("email_ativacao"), EMAIL);
    expect(botaoInstalar()).toBeDisabled();

    enviarForm();
    await waitFor(() => expect(erroDe("senha_admin")).toHaveTextContent(M.pt.obrigatorio));
    expect(chamadas).toHaveLength(0);
  });

  it("senha fraca: erro embaixo do campo enquanto digita, submit não chama fetch; senha forte limpa o erro", async () => {
    const chamadas = stubInstall();
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);
    await user.type(input("dominio_tracker"), DOMINIO);
    await user.type(input("email_ativacao"), EMAIL);

    await user.type(input("senha_admin"), "abc");

    await waitFor(() => expect(erroDe("senha_admin")).not.toBeNull());
    const erro = erroDe("senha_admin")!;
    expect(erro).toHaveAttribute("role", "alert");
    expect(erro).toHaveTextContent(M.pt.min_12);
    expect(erro).toHaveTextContent(M.pt.maiuscula);
    expect(erro).toHaveTextContent(M.pt.numero);
    expect(erro).toHaveTextContent(M.pt.simbolo);
    expect(erro.textContent).not.toContain(M.pt.minuscula);
    expect(input("senha_admin")).toHaveAttribute("aria-invalid", "true");
    expect(input("senha_admin")).toHaveAttribute("aria-describedby", "senha_admin-erro");
    expect(botaoInstalar()).toBeDisabled();

    enviarForm();
    await waitFor(() => expect(erroDe("senha_admin")).toHaveTextContent(M.pt.min_12));
    expect(chamadas).toHaveLength(0);

    // Senha forte: o erro some e o botão habilita.
    await user.clear(input("senha_admin"));
    await user.type(input("senha_admin"), SENHA_FORTE);
    await waitFor(() => expect(erroDe("senha_admin")).toBeNull());
    expect(input("senha_admin")).not.toHaveAttribute("aria-invalid");
    expect(botaoInstalar()).toBeEnabled();
    expect(screen.queryByText(installWizardText.pt.corrijaCamposParaInstalar)).not.toBeInTheDocument();
  });

  it("en: as mensagens do campo saem em inglês", async () => {
    stubInstall();
    const user = userEvent.setup();
    renderStack(STACK_TRACKER, "en");

    await user.type(input("senha_admin"), "abc");

    await waitFor(() => expect(erroDe("senha_admin")).not.toBeNull());
    const erro = erroDe("senha_admin")!;
    expect(erro).toHaveTextContent(M.en.min_12);
    expect(erro).toHaveTextContent(M.en.maiuscula);
    expect(erro.textContent).not.toContain(M.pt.min_12);
    expect(erro.textContent).not.toContain(M.pt.maiuscula);
    expect(screen.getByText(installWizardText.en.corrijaCamposParaInstalar)).toBeInTheDocument();
  });

  it("Tracker: caractere proibido aparece antes de enviar", async () => {
    const chamadas = stubInstall();
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);
    await user.type(input("dominio_tracker"), DOMINIO);
    await user.type(input("email_ativacao"), EMAIL);

    // Passa nas cinco classes da senha forte: só o `"` a recusa.
    await user.type(input("senha_admin"), 'Senha"Forte#123');

    await waitFor(() => expect(erroDe("senha_admin")).not.toBeNull());
    expect(erroDe("senha_admin")).toHaveTextContent(M.pt.caractere_proibido);
    expect(erroDe("senha_admin")!.textContent).not.toContain(M.pt.min_12);
    expect(botaoInstalar()).toBeDisabled();
    enviarForm();
    await waitFor(() => expect(erroDe("senha_admin")).toHaveTextContent(M.pt.caractere_proibido));
    expect(chamadas).toHaveLength(0);
  });

  it("obrigatório sem regra bloqueia; opcional vazio não bloqueia", async () => {
    const chamadas = stubInstall();
    const user = userEvent.setup();
    renderStack({
      id: "outra",
      name: "Outra",
      description: "t",
      fields: [
        { name: "nome", label: "Nome", kind: "text" },
        { name: "apelido", label: "Apelido", kind: "text", optional: true },
      ],
    });

    expect(botaoInstalar()).toBeDisabled();
    enviarForm();
    await waitFor(() => expect(erroDe("nome")).toHaveTextContent(M.pt.obrigatorio));
    expect(erroDe("apelido")).toBeNull();
    expect(chamadas).toHaveLength(0);

    // Preenche só o obrigatório: o opcional vazio não segura o botão.
    await user.type(input("nome"), "Fulano");
    await waitFor(() => expect(botaoInstalar()).toBeEnabled());
    expect(erroDe("nome")).toBeNull();
  });

  it("erro de campo do servidor: fica no formulário, com a mensagem embaixo do campo e os valores preservados", async () => {
    const chamadas = stubInstall({
      status: 400,
      body: {
        error: "campos_invalidos",
        message: "Corrija os campos destacados.",
        campos: [{ campo: "email_ativacao", mensagens: ["E-mail inválido"] }],
      },
    });
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);
    await preencherTudo(user);
    await user.click(botaoInstalar());

    await waitFor(() => expect(erroDe("email_ativacao")).toHaveTextContent("E-mail inválido"));
    expect(chamadas).toHaveLength(1);
    expect(screen.queryByText(installWizardText.pt.falhaNaInstalacao)).not.toBeInTheDocument();
    // O formulário continua lá, com o que a pessoa digitou.
    expect(input("dominio_tracker")).toHaveValue(DOMINIO);
    expect(input("email_ativacao")).toHaveValue(EMAIL);
    expect(input("senha_admin")).toHaveValue(SENHA_FORTE);
    expect(input("email_ativacao")).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById("erro-formulario")).toBeNull();
  });

  it("erro de campo sem input: aparece no aviso do formulário", async () => {
    stubInstall({
      status: 400,
      body: {
        error: "campos_invalidos",
        message: "Corrija os campos destacados.",
        campos: [{ campo: "chave_licenca", mensagens: ["Chave de licença inválida"] }],
      },
    });
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);
    await preencherTudo(user);
    await user.click(botaoInstalar());

    await waitFor(() => expect(document.getElementById("erro-formulario")).not.toBeNull());
    const aviso = document.getElementById("erro-formulario")!;
    expect(aviso).toHaveAttribute("role", "alert");
    expect(aviso).toHaveTextContent(installWizardText.pt.servidorRecusouDados);
    expect(aviso).toHaveTextContent("Chave de licença inválida");
    expect(screen.queryByText(installWizardText.pt.falhaNaInstalacao)).not.toBeInTheDocument();
    expect(input("dominio_tracker")).toHaveValue(DOMINIO);
  });

  it("400 sem campos (ativação recusada) continua na tela de falha", async () => {
    stubInstall({
      status: 400,
      body: { error: "Ativação recusada", message: "Ativação recusada", reason: "ativacao_recusada" },
    });
    const user = userEvent.setup();
    renderStack(STACK_TRACKER);
    await preencherTudo(user);
    await user.click(botaoInstalar());

    await screen.findByText(installWizardText.pt.falhaNaInstalacao);
    expect(screen.getByText("Ativação recusada")).toBeInTheDocument();
    expect(screen.getByText(/ativacao_recusada/)).toBeInTheDocument();
    expect(document.getElementById("erro-formulario")).toBeNull();
  });

  it("erro de rede sai no idioma da tela", async () => {
    stubInstall(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    renderStack(STACK_TRACKER, "en");
    await preencherTudo(user);
    await user.click(botaoInstalar("en"));

    await screen.findByText(installWizardText.en.falhaNaInstalacao);
    expect(screen.getByText(installWizardText.en.erroDeRede)).toBeInTheDocument();
    expect(screen.queryByText("Erro de rede")).not.toBeInTheDocument();
  });
});
