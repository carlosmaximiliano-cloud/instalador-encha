import { semverMaiorOuIgual } from "../semver";

// Portão por versão dos segredos do Docker no EnchaT (plano de segurança,
// achado 2). O app, o Pinfy e o updater só leem `NOME_FILE` (caminho de
// arquivo) a partir da release 0.4.1 do EnchaT, e o Postgres oficial lê
// `POSTGRES_PASSWORD_FILE` desde sempre. Antes da 0.4.1 essas imagens IGNORAM
// `*_FILE` e exigem a variável direta — montar a stack com `*_FILE` numa
// imagem antiga subiria o app sem ENCHAT_MASTER_KEY/DATABASE_URL e o boot
// abortaria. Por isso o formato novo só é emitido quando a imagem a instalar é
// >= esta versão; qualquer outra coisa (menor, ilegível, indefinida) mantém o
// formato de hoje (variáveis em texto), que nunca quebra.
//
// Só aumentar esta constante se um contrato futuro exigir; NUNCA rebaixar
// sem a release do EnchaT que entende `*_FILE` estar publicada.
export const ENCHAT_VERSAO_MINIMA_SEGREDOS = "0.4.1";

// `imageTag` é a tag REALMENTE puxada (ctx.release.imageTag, já validada como
// X.Y.Z por release-info.ts) — app, Pinfy e updater usam a mesma tag, então
// uma decisão vale para os três.
export function enchatUsaSegredos(imageTag: string | null | undefined): boolean {
  return semverMaiorOuIgual(imageTag, ENCHAT_VERSAO_MINIMA_SEGREDOS);
}
