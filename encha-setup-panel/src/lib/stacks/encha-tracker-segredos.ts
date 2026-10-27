// A senha do admin do Tracker NÃO é mais Docker secret (Ciclo 100, decisão
// D1 de ciclos/ciclo-100-decisoes.md do Tracker): vai sempre em texto na env
// `TRACKER_ADMIN_SENHA` do serviço `app`, em qualquer tag da imagem. O motivo
// é operacional: a env vence o `_FILE` no bootstrap do admin (F1 do Ciclo
// 100), então o cliente troca a senha só editando essa variável no Portainer;
// com o segredo do Docker imutável a troca exigia recriar o segredo à mão.
//
// Sobrou aqui só o nome-base do segredo ANTIGO (criado pelas instalações
// entre o ciclo painel-secret e este). Ele não é mais criado nem montado; o
// installer só o usa para varrer das VPS da frota o segredo que ficou
// órfão (StackDefinition.basesDeSegredoObsoletas, docker-secrets.ts). O
// portão por versão (1.2.1) e o dono uid/gid 1000 da montagem saíram junto
// com o código que os usava.
export const BASE_SEGREDO_SENHA_ADMIN = "encha_tracker_senha_admin";
