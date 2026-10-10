// "Fixar versões" da stack enchat (Encha Setup).
//
// Problema: o YAML que o painel gerou na instalação fixa as imagens do app,
// do Pinfy e do sidecar (enchat-updater) na versão INSTALADA. As atualizações
// de um clique trocam os serviços por fora do YAML; um "Update the stack" no
// Portainer devolve tudo à versão (e à edição) da instalação. O sidecar >=
// 0.4.7 (vigília) repõe o que aplicou, mas só se o sidecar FIXADO no YAML já
// for >= 0.4.7 — instalações antigas não têm essa proteção.
//
// Esta ação reescreve, no compose JÁ guardado no Portainer, só as três linhas
// `image:` para o que está rodando agora (e acrescenta ENCHAT_ADMIN_EMAIL/
// ENCHAT_ADMIN_SENHA vazias se faltarem, para o reset de senha do suporte).
// NÃO regenera o YAML: não toca em segredos, rede, labels nem em variáveis
// que o cliente tenha editado. Ver ciclos de desenho em
// side-session-notes/…/desenho-fixar-stack-enchat.md.

import {
  discoverContext,
  getServiceExact,
  getStackFile,
  listServiceTasks,
  listStacks,
  PortainerError,
  type DockerServiceFull,
  type Stack,
} from "./portainer";
import { semverMaiorOuIgual } from "./semver";

export const STACK_ENCHAT = "enchat";
/** Primeira versão do sidecar com a vigília da stack (restauracao.go). */
export const VERSAO_MINIMA_VIGILIA = "0.4.7";

const SVC_APP = "enchat_enchat_app";
const SVC_PINFY = "enchat_enchat_pinfy";
const SVC_UPDATER = "enchat_enchat_updater";

export type CodigoErroFixacao =
  | "stack_nao_instalada"
  | "nao_convergida"
  | "imagens_invalidas"
  | "versoes_divergentes"
  | "stack_externa"
  | "compose_inesperado"
  | "mudou_durante"
  | "estado_diverge"
  | "edicao_regredida"
  | "gravacao_falhou"
  | "em_andamento";

export class FixarVersoesError extends Error {
  constructor(
    public readonly codigo: CodigoErroFixacao,
    public readonly detalhe?: string
  ) {
    super(detalhe ? `${codigo}: ${detalhe}` : codigo);
    this.name = "FixarVersoesError";
  }
}

// ── Validação das imagens em execução ────────────────────────────────────
// Gramática fechada: só os repos que o EnchaT publica, por dono GHCR.
// O digest (`@sha256:<64 hex>`) é opcional e, quando existe, é copiado como está:
// a referência EXATA do spec em execução é o que torna o redeploy um no-op.
const IMG = /^ghcr\.io\/(carlosmaximiliano-cloud|enchainterno)\/(enchat|enchat-free|pinfy|enchat-updater):(\d+\.\d+\.\d+|beta-[0-9a-f]{12})(@sha256:[0-9a-f]{64})?$/;

type ImagemLida = { dono: string; repo: string; tag: string; ref: string };

function lerImagem(ref: string | undefined): ImagemLida | null {
  if (!ref) return null;
  const m = IMG.exec(ref);
  return m ? { dono: m[1], repo: m[2], tag: m[3], ref } : null;
}

export type Edicao = "full" | "free";

export type AlvoImagens = {
  edicao: Edicao;
  tag: string;
  app: string;
  pinfy: string;
  updater: string;
  /** Tag do sidecar (pode diferir da do app em instalações antigas). */
  tagUpdater: string;
};

/**
 * A partir das imagens em execução (sem digest), valida e devolve o alvo.
 * Regras: app = full (carlosmaximiliano-cloud/enchat) ou free
 * (enchainterno/enchat-free); Pinfy = mesmo dono e MESMA tag do app (o sidecar
 * os atualiza em lockstep); sidecar = enchat-updater de qualquer um dos dois
 * donos (um sidecar ≤0.3.0 não se autoatualiza e pode estar atrás do app).
 */
export function analisarImagens(imgs: { app?: string; pinfy?: string; updater?: string }): AlvoImagens {
  const app = lerImagem(imgs.app);
  const pinfy = lerImagem(imgs.pinfy);
  const updater = lerImagem(imgs.updater);
  if (!app || !pinfy || !updater) throw new FixarVersoesError("imagens_invalidas");

  const full = app.dono === "carlosmaximiliano-cloud" && app.repo === "enchat";
  const free = app.dono === "enchainterno" && app.repo === "enchat-free";
  if (!full && !free) throw new FixarVersoesError("imagens_invalidas", "app");
  if (pinfy.repo !== "pinfy" || pinfy.dono !== app.dono) throw new FixarVersoesError("imagens_invalidas", "pinfy");
  if (updater.repo !== "enchat-updater") throw new FixarVersoesError("imagens_invalidas", "updater");
  if (pinfy.tag !== app.tag) {
    throw new FixarVersoesError("versoes_divergentes", `app ${app.tag} / pinfy ${pinfy.tag}`);
  }
  return {
    edicao: full ? "full" : "free",
    tag: app.tag,
    app: app.ref,
    pinfy: pinfy.ref,
    updater: updater.ref,
    tagUpdater: updater.tag,
  };
}

/** O sidecar rodando tem a vigília? (beta-* é build de main: sim.) */
export function sidecarTemVigilia(tagUpdater: string): boolean {
  if (tagUpdater.startsWith("beta-")) return true;
  return semverMaiorOuIgual(tagUpdater, VERSAO_MINIMA_VIGILIA);
}

// ── Patch cirúrgico do compose guardado ──────────────────────────────────

export type Mudanca = { servico: "enchat_app" | "enchat_pinfy" | "enchat_updater"; de: string; para: string };
export type ResultadoPatch = {
  compose: string;
  mudancas: Mudanca[];
  /** Variáveis ENCHAT_ADMIN_* acrescentadas ao enchat_app. */
  varsAdmin: string[];
  /** Nada a mudar: já fixado e com as variáveis. */
  nadaAFazer: boolean;
};

const RE_SERVICO = /^ {2}([A-Za-z0-9_-]+):\s*$/;
const RE_IMAGE = /^ {4}image:\s*["']?([^"'\s#]+)["']?\s*(#.*)?$/;

function limitesDoServico(linhas: string[], nome: string): { ini: number; fim: number } {
  const ini = linhas.findIndex((l) => {
    const m = RE_SERVICO.exec(l);
    return m !== null && m[1] === nome;
  });
  if (ini === -1) throw new FixarVersoesError("compose_inesperado", `serviço ${nome} ausente`);
  let fim = linhas.length;
  for (let i = ini + 1; i < linhas.length; i++) {
    if (RE_SERVICO.test(linhas[i]) || /^\S/.test(linhas[i])) {
      fim = i;
      break;
    }
  }
  return { ini, fim };
}

export function aplicarPatchCompose(
  composeAtual: string,
  alvo: Pick<AlvoImagens, "app" | "pinfy" | "updater">,
  opts: { inserirAdmin?: boolean } = {}
): ResultadoPatch {
  const inserirAdmin = opts.inserirAdmin ?? true;
  if (composeAtual.includes("\r")) throw new FixarVersoesError("compose_inesperado", "CRLF");
  const linhas = composeAtual.split("\n");
  const mudancas: Mudanca[] = [];

  const pares: [Mudanca["servico"], string][] = [
    ["enchat_app", alvo.app],
    ["enchat_pinfy", alvo.pinfy],
    ["enchat_updater", alvo.updater],
  ];
  for (const [servico, imagem] of pares) {
    const { ini, fim } = limitesDoServico(linhas, servico);
    const achadas: number[] = [];
    for (let i = ini + 1; i < fim; i++) if (RE_IMAGE.test(linhas[i])) achadas.push(i);
    if (achadas.length !== 1) throw new FixarVersoesError("compose_inesperado", `${servico}: image`);
    const atual = RE_IMAGE.exec(linhas[achadas[0]])![1];
    if (atual.includes("$")) throw new FixarVersoesError("compose_inesperado", `${servico}: image interpolada`);
    if (atual !== imagem) {
      linhas[achadas[0]] = `    image: ${imagem}`;
      mudancas.push({ servico, de: atual, para: imagem });
    }
  }

  // ENCHAT_ADMIN_*: só se faltarem, logo abaixo de `environment:` do app.
  const varsAdmin: string[] = [];
  if (inserirAdmin) {
    const { ini, fim } = limitesDoServico(linhas, "enchat_app");
    const envIdx = linhas.findIndex((l, i) => i > ini && i < fim && /^ {4}environment:\s*$/.test(l));
    if (envIdx === -1) throw new FixarVersoesError("compose_inesperado", "enchat_app: environment");
    // Só o formato mapa (`NOME: valor`); lista (`- NOME=valor`) aborta.
    const primeira = linhas.slice(envIdx + 1, fim).find((l) => !/^\s*(#.*)?$/.test(l));
    if (!/^ {6}[A-Za-z_][A-Za-z0-9_]*:/.test(primeira ?? "")) {
      throw new FixarVersoesError("compose_inesperado", "enchat_app: environment fora do formato mapa");
    }
    const corpo = linhas.slice(envIdx + 1, fim);
    const faltam = ["ENCHAT_ADMIN_EMAIL", "ENCHAT_ADMIN_SENHA"].filter(
      (n) => !corpo.some((l) => l.startsWith(`      ${n}:`))
    );
    if (faltam.length > 0) {
      const novas = [
        "      # Reset de senha do Super Admin (suporte): preencher as DUAS, salvar a stack e,",
        "      # depois de entrar, esvaziar a senha. O app só reaplica quando o valor da",
        "      # senha muda (internal/auth/bootstrap.go); vazias = não faz nada.",
        ...faltam.map((n) => `      ${n}: ""`),
      ];
      linhas.splice(envIdx + 1, 0, ...novas);
      varsAdmin.push(...faltam);
    }
  }

  return {
    compose: linhas.join("\n"),
    mudancas,
    varsAdmin,
    nadaAFazer: mudancas.length === 0 && varsAdmin.length === 0,
  };
}

// ── Orquestração (Portainer) ─────────────────────────────────────────────

export type Previa = {
  edicao: Edicao;
  versao: string;
  imagens: { app: string; pinfy: string; updater: string };
  mudancas: Mudanca[];
  varsAdmin: string[];
  nadaAFazer: boolean;
  /** O sidecar em execução já tem a vigília (>= 0.4.7)? */
  protegida: boolean;
  versaoSidecar: string;
};

export type Alvos = "app" | "pinfy" | "updater";
export type Foto = Record<Alvos, { indice: number; imagem: string }>;

export type Leitura = {
  endpointId: number;
  stack: Stack;
  composeAtual: string;
  alvo: AlvoImagens;
  patch: ResultadoPatch;
  foto: Foto;
};

const ESTADOS_ASSENTADOS = new Set(["completed", "rollback_completed"]);

// Lê app/Pinfy/sidecar e só devolve se estiverem ASSENTADOS: sem update em
// curso (`UpdateStatus` ausente ou terminal) e a task desejada rodando
// exatamente a imagem do spec. `running >= desired` NÃO basta: num update
// start-first há duas tasks rodando no meio da troca.
export async function lerServicosAssentados(token: string, endpointId: number): Promise<Foto> {
  const foto = {} as Foto;
  const servicos: [Alvos, string][] = [
    ["app", SVC_APP],
    ["pinfy", SVC_PINFY],
    ["updater", SVC_UPDATER],
  ];
  for (const [chave, nome] of servicos) {
    const svc: DockerServiceFull | null = await getServiceExact(token, endpointId, nome);
    if (!svc) throw new FixarVersoesError("stack_nao_instalada");
    const estado = svc.UpdateStatus?.State;
    if (estado && !ESTADOS_ASSENTADOS.has(estado)) throw new FixarVersoesError("nao_convergida", `${nome}: ${estado}`);
    const imagem = svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "";
    const desejadas = (await listServiceTasks(token, endpointId, svc.ID)).filter((t) => t.DesiredState === "running");
    const ok =
      desejadas.length > 0 &&
      desejadas.every((t) => t.Status?.State === "running" && t.Spec?.ContainerSpec?.Image === imagem);
    if (!ok) throw new FixarVersoesError("nao_convergida", nome);
    foto[chave] = { indice: svc.Version.Index, imagem };
  }
  return foto;
}

export async function ler(token: string, opts: { inserirAdmin?: boolean } = {}): Promise<Leitura> {
  const { endpointId } = await discoverContext(token);
  const foto = await lerServicosAssentados(token, endpointId);
  // A referência EXATA (com digest) do spec em execução: com ela no compose o
  // redeploy não troca imagem nenhuma.
  const alvo = analisarImagens({ app: foto.app.imagem, pinfy: foto.pinfy.imagem, updater: foto.updater.imagem });

  const stacks = await listStacks(token);
  const stack = stacks.find((s) => s.Name === STACK_ENCHAT);
  if (!stack) throw new FixarVersoesError("stack_externa");
  let composeAtual: string;
  try {
    composeAtual = await getStackFile(token, stack.Id);
  } catch (e) {
    if (e instanceof PortainerError && e.status === 404) throw new FixarVersoesError("stack_externa");
    throw e;
  }
  return { endpointId, stack, composeAtual, alvo, patch: aplicarPatchCompose(composeAtual, alvo, opts), foto };
}

export function paraPrevia(alvo: AlvoImagens, patch: ResultadoPatch): Previa {
  return {
    edicao: alvo.edicao,
    versao: alvo.tag,
    imagens: { app: alvo.app, pinfy: alvo.pinfy, updater: alvo.updater },
    mudancas: patch.mudancas,
    varsAdmin: patch.varsAdmin,
    nadaAFazer: patch.nadaAFazer,
    protegida: sidecarTemVigilia(alvo.tagUpdater),
    versaoSidecar: alvo.tagUpdater,
  };
}

export async function preverFixacao(token: string): Promise<Previa> {
  const { alvo, patch } = await ler(token);
  return paraPrevia(alvo, patch);
}
