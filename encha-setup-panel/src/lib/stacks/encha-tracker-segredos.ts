import { semverMaiorOuIgual } from "../semver";

// Portão por versão da senha do admin como Docker secret (ciclo
// painel-secret). Espelha enchat-segredos.ts, mas SEM portão por LABEL —
// decisão deliberada, ver abaixo.
//
// Por que 1.2.1: é a primeira tag do Tracker que contém `LerSenhaBootstrap`
// (TRACKER_ADMIN_SENHA_FILE, Ciclo 63 do Tracker, commit 53584bb). A v1.2.0
// não contém esse ciclo.
//
// História das tags publicadas: as betas usaram `beta-<sha12>` até o Ciclo
// 44 do Tracker (tag ilegível para semverMaiorOuIgual — nunca abriria o
// portão por acidente), depois `1.0.<n>` do 45 ao 64 (abaixo da mínima),
// depois `1.3.<n>` a partir do 65 — já posterior ao Ciclo 63.
//
// Por que NÃO há portão por LABEL aqui (diferente do EnchaT,
// LABEL_RECURSOS_ENCHAT em enchat-segredos.ts): o risco que criou o label
// no EnchaT foi a 0.4.1 e a 0.4.2 terem sido publicadas SEM suporte a
// `*_FILE`, com uma versão que sugeria o contrário. No Tracker isso nunca
// aconteceu: nenhuma imagem com tag X.Y.Z >= 1.2.1 foi publicada sem
// LerSenhaBootstrap. Exigir label hoje fecharia o portão para sempre na
// 1.2.1 (a imagem do Tracker não declara nenhum LABEL — ver
// deploy/Dockerfile do Tracker) e obrigaria mudar o Tracker e publicar
// outra release, fora do escopo deste ciclo. Além disso a falha, se o
// portão abrisse errado, é recuperável: uma imagem sem `_FILE` sobe
// normalmente, só sem bootstrap do admin (a env de senha simplesmente some
// do YAML) — o sintoma numa instalação nova é "não consigo entrar", e se
// resolve reinstalando. Não é um boot quebrado por falta de DATABASE_URL.
//
// Regra para o futuro: só AUMENTAR esta constante se um contrato exigir;
// NUNCA rebaixar. Se um dia o Tracker publicar uma imagem >= 1.2.1 sem
// `_FILE` (não deveria), aí o label passa a ser necessário — e isso é
// outro ciclo, com mudança no Dockerfile do Tracker.
export const TRACKER_VERSAO_MINIMA_SEGREDOS = "1.2.1";

// `imageTag` é a tag REALMENTE puxada (ctx.release.imageTag).
export function trackerUsaSegredos(imageTag: string | null | undefined): boolean {
  return semverMaiorOuIgual(imageTag, TRACKER_VERSAO_MINIMA_SEGREDOS);
}

// Nome-base do único segredo deste ciclo: a senha do admin do painel do
// Tracker. "senha_admin" (não "admin_senha") é o nome do campo do
// formulário — encha-tracker.test.ts já trava que o segredo GERADO
// "admin_senha" (que saiu no Ciclo 25) nunca volte.
export const BASE_SEGREDO_SENHA_ADMIN = "encha_tracker_senha_admin";

// Dono do arquivo montado no serviço `app`: uid/gid 1000, o mesmo do
// processo que roda dentro do container (deploy/Dockerfile do Tracker:
// `adduser -D -u 1000 tracker` + `USER tracker`). Sem isso o arquivo nasce
// root:root e, com mode 0400, o processo não-root leva EACCES.
export const DONO_SEGREDOS_TRACKER = { app: { uid: "1000", gid: "1000" } } as const;
