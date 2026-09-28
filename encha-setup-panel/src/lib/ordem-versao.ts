// Trava de rebaixamento do painel (ciclo painel-rebaixamento). Módulo puro:
// nenhuma dependência de node:*, portainer ou release-info — só a
// comparação numérica de semver.js.
//
// Motivação: o botão "Atualizar" comparava imagem instalada × imagem-alvo
// por DIFERENÇA de texto (`current !== image`). Isso oferece — e, do outro
// lado, `applyReleaseUpdate` chega a APLICAR — uma versão menor sempre que a
// tag instalada e a tag-alvo simplesmente diferem (troca de canal
// beta/estável, instalação manual, tag ilegível). A regra de ordem vale só
// para o caminho do Console (`updateViaRelease`, tag sempre X.Y.Z); o
// caminho de imagem fixa em código (`updatableImages`: Postgres, Evolution,
// EvoCRM) continua por diferença de texto, porque as tags dele (`pg16`,
// `8-alpine`, `1.0.0-rc2`) não são X.Y.Z e nunca seriam "maiores".

import { semverMaior } from "./semver";

// Tag de uma referência de imagem Docker, sem o repositório. Corta o digest
// (tudo a partir do primeiro "@") antes de procurar a tag, e só reconhece
// tag quando o último ":" vem DEPOIS da última "/" — senão o ":" é da porta
// do registro (ex.: "localhost:5000/encha-tracker", sem tag). Tag vazia
// também é null. Não valida o formato da tag (isso é trabalho de semver.ts).
export function tagDaImagem(imagem: string): string | null {
  const semDigest = imagem.split("@")[0];
  const ultimaBarra = semDigest.lastIndexOf("/");
  const ultimosDoisPontos = semDigest.lastIndexOf(":");
  if (ultimosDoisPontos <= ultimaBarra) return null;
  const tag = semDigest.slice(ultimosDoisPontos + 1);
  return tag.length > 0 ? tag : null;
}

// true só quando as duas imagens têm tag X.Y.Z legível e a do alvo é
// ESTRITAMENTE maior que a instalada. O repositório não entra na conta.
// Tag igual, menor, ausente, com sufixo, com "v" ou qualquer coisa ilegível
// em qualquer lado -> false. Usada tanto para oferecer (pendingFromTargets,
// caminho do Console) quanto para aplicar (applyReleaseUpdate) — mesma
// função, mesma regra, um lugar só.
export function ehAtualizacaoPorVersao(atual: string, alvo: string): boolean {
  return semverMaior(tagDaImagem(alvo), tagDaImagem(atual));
}

export type ServicoRecusado = { servico: string; atual: string; alvo: string };

export class RebaixamentoRecusadoError extends Error {
  readonly codigo = "rebaixamento_recusado" as const;
  readonly recusados: readonly ServicoRecusado[];

  constructor(recusados: readonly ServicoRecusado[]) {
    super(
      `Rebaixamento recusado: ${recusados
        .map((r) => `${r.servico} ${r.atual} → ${r.alvo}`)
        .join("; ")} — a versão-alvo não é comprovadamente mais nova que a instalada.`
    );
    this.name = "RebaixamentoRecusadoError";
    this.recusados = recusados;
  }
}
