import { randomBytes } from "node:crypto";
import { getStackFile } from "./portainer";
import { logAudit } from "./audit";
import {
  FixarVersoesError,
  STACK_ENCHAT,
  ler,
  lerServicosAssentados,
  paraPrevia,
  type Mudanca,
  type Previa,
} from "./fixar-versoes";
import { gravarComposeEmDisco, StackDiscoError } from "./stack-disco";
import { lerEstadoDoSidecar, portaoEstado } from "./estado-sidecar";
import { desligarAuto, liberarLease, registrarResultado, tentarLease } from "./stack-sync-store";

// Mantém o arquivo da stack `enchat` (Portainer) IGUAL ao que está rodando, para
// que "Update the stack" nunca volte versão nem edição. Escreve só as 3 linhas
// `image:` (referência exata do spec, com digest) DIRETO no disco do Portainer —
// sem redeploy, então nada reinicia (um PUT logo após uma atualização por fora
// do YAML recriava sidecar/Pinfy; ver F0 em side-session-notes).
//
// Modos:
//  - auto  (agendador): só age se repo/tag de algum serviço difere do arquivo
//    (diferença só de digest não dispara), com o portão do estado.json aberto,
//    e NÃO acrescenta variáveis.
//  - manual (botão): também acrescenta ENCHAT_ADMIN_*; se o estado.json não
//    puder ser lido segue (o admin viu a prévia), mas se o sidecar discordar do
//    que roda (regressão) RECUSA.

export type ModoSync = "auto" | "manual";

export type ResultadoSincronizacao = Previa & {
  aplicada: boolean;
  /** Por que não aplicou (modo auto). */
  motivo?: string;
  estado: "ok" | "ausente" | "ilegivel";
};

const DONO = `${process.pid}-${randomBytes(4).toString("hex")}`;
const LEASE_MS = 10 * 60_000;

// Dentro do MESMO processo o lease do SQLite deixa o mesmo dono renovar, então a
// exclusão entre agendador e botão manual é feita aqui; o lease cobre o outro
// processo (painel antigo e novo coexistindo na autoatualização dele).
let emAndamentoLocal = false;

const semDigest = (ref: string): string => ref.replace(/@.*$/, "");

/** Alguma troca muda repo ou tag (e não só o digest)? */
export function diferemRepoTag(mudancas: Mudanca[]): boolean {
  return mudancas.some((m) => semDigest(m.de) !== semDigest(m.para));
}

export async function sincronizarStackEnchat(input: {
  token: string;
  modo: ModoSync;
  user: string;
  ip: string;
}): Promise<ResultadoSincronizacao> {
  const { token, modo, user, ip } = input;
  if (emAndamentoLocal || !tentarLease(STACK_ENCHAT, DONO, LEASE_MS)) throw new FixarVersoesError("em_andamento");
  emAndamentoLocal = true;
  try {
    const { endpointId, stack, composeAtual, alvo, patch, foto } = await ler(token, { inserirAdmin: modo === "manual" });
    const previa = paraPrevia(alvo, patch);

    if (patch.nadaAFazer || (modo === "auto" && !diferemRepoTag(patch.mudancas))) {
      registrarResultado(STACK_ENCHAT, "sincronizada", null);
      return { ...previa, aplicada: false, estado: "ok" };
    }

    // Portão do estado.json do sidecar.
    const leitura = await lerEstadoDoSidecar(token, endpointId);
    const estado: ResultadoSincronizacao["estado"] = leitura.estado ? "ok" : (leitura.motivo ?? "ilegivel");
    if (leitura.estado) {
      const portao = portaoEstado(leitura.estado, alvo);
      if (!portao.abre) {
        if (modo === "auto") {
          registrarResultado(STACK_ENCHAT, "aguardando", portao.motivo ?? null);
          return { ...previa, aplicada: false, motivo: portao.motivo, estado };
        }
        throw new FixarVersoesError("estado_diverge", portao.motivo);
      }
    } else if (modo === "auto") {
      registrarResultado(STACK_ENCHAT, "aguardando", `estado do sidecar ${estado}`);
      return { ...previa, aplicada: false, motivo: `estado do sidecar ${estado}`, estado };
    }

    // Reconfere os serviços logo antes de gravar (atualização de um clique,
    // autoatualização do sidecar, rollback…): qualquer mudança aborta.
    const depois = await lerServicosAssentados(token, endpointId);
    for (const k of ["app", "pinfy", "updater"] as const) {
      if (depois[k].imagem !== foto[k].imagem || depois[k].indice !== foto[k].indice) {
        throw new FixarVersoesError("mudou_durante");
      }
    }

    try {
      await gravarComposeEmDisco(token, endpointId, stack, composeAtual, patch.compose, () => getStackFile(token, stack.Id));
    } catch (e) {
      if (e instanceof StackDiscoError) throw new FixarVersoesError("gravacao_falhou", e.codigo);
      throw e;
    }

    registrarResultado(STACK_ENCHAT, "aplicada", null, {
      highWater: { app: alvo.app, pinfy: alvo.pinfy, updater: alvo.updater },
    });
    logAudit({
      user,
      ip,
      action: "stack.sincronizar",
      target: STACK_ENCHAT,
      result: "ok",
      meta: {
        modo,
        versao: alvo.tag,
        edicao: alvo.edicao,
        mudancas: patch.mudancas.map((m) => `${m.servico}: ${m.de} → ${m.para}`),
        varsAdmin: patch.varsAdmin,
        protegida: previa.protegida,
        estado,
      },
    });
    return { ...previa, aplicada: true, estado };
  } catch (e) {
    const codigo = e instanceof FixarVersoesError ? e.codigo : e instanceof Error ? e.message : "erro";
    // "em andamento" é só concorrência; os demais bloqueios de segurança do modo
    // auto já viram "aguardando" acima. Falha real conta para o backoff.
    const transitorio = e instanceof FixarVersoesError && (e.codigo === "nao_convergida" || e.codigo === "mudou_durante");
    // Só o agendador conta para o backoff/desligamento: um clique manual que
    // deu errado não pode desligar a sincronização automática.
    if (modo === "auto") {
      if (e instanceof FixarVersoesError && e.codigo === "stack_nao_instalada") {
        // Painel sem a stack enchat: nada a sincronizar, e isso não é falha.
      } else if (e instanceof FixarVersoesError && e.codigo === "stack_externa") {
        // Sem arquivo para editar (criada fora do Portainer): desliga, não adianta insistir.
        desligarAuto(STACK_ENCHAT, "stack_externa");
      } else {
        registrarResultado(STACK_ENCHAT, transitorio ? "aguardando" : "falhou", codigo);
      }
    }
    logAudit({ user, ip, action: "stack.sincronizar.fail", target: STACK_ENCHAT, result: "error", meta: { modo, error: codigo } });
    throw e;
  } finally {
    emAndamentoLocal = false;
    liberarLease(STACK_ENCHAT, DONO);
  }
}
