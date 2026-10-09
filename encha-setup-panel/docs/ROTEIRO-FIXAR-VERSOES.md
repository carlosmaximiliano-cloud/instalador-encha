# Roteiro de homologação: "Fixar versões da stack" (enchat)

Ação nova do painel (Catálogo → card EnchaT → **Fixar versões da stack**). Reescreve, no compose
guardado no Portainer, só as 3 linhas `image:` (app, Pinfy, sidecar) para o que está rodando, e
acrescenta `ENCHAT_ADMIN_EMAIL`/`ENCHAT_ADMIN_SENHA` vazias se faltarem. Não regenera o YAML.

Rodar numa VPS de homologação (a `encha-test`, com autorização do Carlos: está em uso), com o painel
da build deste branch, depois de publicado pela esteira do Monitor (ou imagem de teste).
Tudo como root. `APP=enchat_enchat_app`.

## 0. Antes (guardar para comparar)
```bash
docker service ls | grep enchat
for s in app pinfy updater postgres; do docker service inspect enchat_enchat_$s --format '{{.Spec.Name}} {{.Spec.TaskTemplate.ContainerSpec.Image}} {{.Version.Index}}'; done
docker service ps $APP --format '{{.ID}} {{.CreatedAt}} {{.CurrentState}}' | head
cat /var/enchat/updater/estado.json
```
Portainer → Stacks → enchat → Editor: copiar o YAML atual (backup) e anotar as `image:`.

## 1. Prévia
Abrir o diálogo. Conferir: edição e versão certas; lista das 3 trocas (ou "nada a fazer"); aviso
verde/amarelo conforme o sidecar (>= 0.4.7 ou não). Cancelar: nada muda (confirmar `Version.Index`).

## 2. Aplicar
Confirmar. Esperado: "Pronto". Depois:
- Portainer → Editor: só as `image:` mudaram (e as 2 vars ADMIN foram adicionadas); variáveis que
  você editou continuam; `docker secret ls` igual.
- **Reinício:** anotar se app/Pinfy/sidecar reiniciaram (`docker service ps`). O PUT usa `PullImage:false`;
  se o Swarm recriar as tasks por diferença de digest, o app usa `start-first`. Registrar o que ocorreu.
- Healthz ok: `curl -sS https://DOMINIO/api/healthz`.
- Se aparecer "could not be accessed on a registry to record its digest": é a credencial
  cruzada de edição (ver docs/PRODUTO-P2 do ENCHAT, risco 1). Anotar a saída e reverter o YAML pelo
  backup do passo 0 se algum serviço ficou preso.

## 3. Idempotência
Abrir o diálogo de novo: deve dizer "já fixada, nada a fazer" e o botão Fixar não aparece (só Fechar).

## 4. O que a ação existe para resolver
Portainer → Update the stack (com Re-pull image). Esperado: versão **e edição** continuam (sem
regressão a Grátis); `docker service ps` sem tasks novas para uma versão antiga.

## 5. Vigília depois da próxima atualização (precisa de versão nova do ENCHAT; se houver)
Atualizar pelo botão do EnchaT (Configurações → Atualizações). Em seguida Update the stack:
o app volta à versão fixada no YAML e, em 1 a 3 min, o sidecar (>= 0.4.7) repõe a versão aplicada
(`docker service logs enchat_enchat_updater --tail 50`: "reaplicando a imagem que o sidecar tinha aplicado").

## 6. Reset de senha (ENCHAT_ADMIN_*)
Portainer → editar a stack: preencher e-mail e senha do Super Admin → Update the stack → entrar com a
senha nova → esvaziar a senha → Update the stack de novo.

## 7. Sidecar < 0.4.7 (só se houver uma VPS assim)
A prévia mostra o aviso amarelo; aplicar mesmo assim fixa as imagens. Depois atualizar pelo botão (o
sidecar se autoatualiza) e rodar a ação de novo: a prévia deve mostrar só a troca da linha do sidecar.

## 8. Recusas (opcional, bom ter visto uma vez)
- Durante uma atualização de um clique (serviços subindo): "ainda não está estável", nada muda.
- Com o YAML editado à mão para `environment:` em formato lista: "não sabe tratar", nada muda.
