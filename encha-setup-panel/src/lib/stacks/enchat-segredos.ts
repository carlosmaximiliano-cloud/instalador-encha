import { semverMaiorOuIgual } from "../semver";

// Portão por versão dos segredos do Docker no EnchaT (plano de segurança,
// achado 2). O app, o Pinfy e o updater só leem `NOME_FILE` (caminho de
// arquivo) a partir da release 0.4.2 do EnchaT, e o Postgres oficial lê
// `POSTGRES_PASSWORD_FILE` desde sempre. Antes da 0.4.2 essas imagens IGNORAM
// `*_FILE` e exigem a variável direta — montar a stack com `*_FILE` numa
// imagem antiga subiria o app sem ENCHAT_MASTER_KEY/DATABASE_URL e o boot
// abortaria. Por isso o formato novo só é emitido quando a imagem a instalar é
// >= esta versão; qualquer outra coisa (menor, ilegível, indefinida) mantém o
// formato de hoje (variáveis em texto), que nunca quebra.
//
// Por que 0.4.2 e não 0.4.1: a 0.4.1 foi publicada sem o suporte a *_FILE;
// o E5 sai na 0.4.2 (full e free). Uma 0.4.1 real IGNORA `*_FILE`, então ligar
// os segredos para ela subiria o app/Pinfy/updater sem ENCHAT_MASTER_KEY,
// SESSION_KEY e DATABASE_URL e a stack inteira quebraria.
//
// Só aumentar esta constante se um contrato futuro exigir; NUNCA rebaixar
// sem a release do EnchaT que entende `*_FILE` estar publicada — e conferir a
// premissa contra a release PUBLICADA (não contra o plano): o portão só pode
// abrir numa versão que contenha o E5. O teste enchat-segredos-contrato.test.ts
// fixa este valor ao lado de __fixtures__/enchat-segredos-contrato.tsv.
export const ENCHAT_VERSAO_MINIMA_SEGREDOS = "0.4.2";

// `imageTag` é a tag REALMENTE puxada (ctx.release.imageTag, já validada como
// X.Y.Z por release-info.ts) — app, Pinfy e updater usam a mesma tag, então
// uma decisão vale para os três.
export function enchatUsaSegredos(imageTag: string | null | undefined): boolean {
  return semverMaiorOuIgual(imageTag, ENCHAT_VERSAO_MINIMA_SEGREDOS);
}

// Portão por LABEL (S4c) — além da versão. Cada imagem da stack (app, Pinfy,
// updater) precisa declarar o recurso no LABEL abaixo (valor: lista de
// palavras separada por espaço; nome e valor exatos, minúsculas). A leitura
// dos labels é I/O e acontece no installer, DEPOIS do pull das três imagens
// (imagens-recursos.ts); o resultado entra no contexto como
// `ctx.imagensSuportamSegredos` para o generateYaml continuar PURO.
export const LABEL_RECURSOS_ENCHAT = "com.enchat.recursos";
export const RECURSO_SEGREDOS_ARQUIVO = "segredos-arquivo";

// Portão final: versão >= mínima E as três imagens declaram o recurso. Só o
// booleano estrito `true` abre; ausente/undefined = fechado (formato antigo).
export function enchatPortaoSegredos(
  imageTag: string | null | undefined,
  imagensSuportamSegredos: boolean | undefined
): boolean {
  return imagensSuportamSegredos === true && enchatUsaSegredos(imageTag);
}
