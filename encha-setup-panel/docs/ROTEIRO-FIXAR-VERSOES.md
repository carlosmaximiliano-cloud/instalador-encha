# Roteiro de homologação: sincronização do arquivo da stack (enchat)

O painel mantém o arquivo da stack `enchat` (no Portainer) igual ao que está rodando, para que "Update the
stack" nunca volte versão nem edição. Grava só as 3 linhas `image:` (app, Pinfy, sidecar) com a referência
EXATA do spec em execução (`repo:tag@sha256:…`), **direto no disco** do Portainer (job pontual, CAS por
sha256, temp + `mv`, cópia `.enchat-pre-sync`), sem redeploy: nada reinicia.

- **Automática** (agendador, 3 min depois do boot e a cada 2): atrás da chave remota do Console
  (`GET /api/v1/setup/flags`; desligada por padrão). Só age se repo/tag difere do arquivo, com o sidecar
  ocioso e concordando (estado.json). Kill switch local: `ENCHA_SYNC_STACK=off` na stack do painel.
- **Manual** (botão no card do EnchaT): também acrescenta `ENCHAT_ADMIN_EMAIL`/`ENCHAT_ADMIN_SENHA` vazias.

## Já provado na encha-test (2026-10-09/10, Portainer 2.45.1) — ver notas f0-resultados
- O bug: "Update the stack" com Re-pull ligado devolve app, Pinfy e sidecar à versão do arquivo.
- Re-pull desligado mantém a imagem (orientação imediata). Arquivo fixado por digest + Re-pull ligado: no-op.
- Gravação em disco: `GET /file` enxerga na hora; as 4 tasks continuam as mesmas.
- Código real do painel (`sincronizarStackEnchat`, modo auto) contra o Portainer real: gravou as 3 imagens,
  2ª execução "nada a fazer", e "Update the stack" com Re-pull ligado manteve 0.4.7 sem recriar tasks.

## Para repetir com o painel publicado (VPS de homologação, root)
```bash
snap() { for s in app pinfy updater postgres; do n=enchat_enchat_$s;
  echo "$n $(docker service inspect $n --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' | cut -c1-90)";
  docker service ps $n -f desired-state=running --format '   task {{.ID}}'; done; }
```
1. **Antes:** `snap`; copiar `/var/lib/docker/volumes/portainer_data/_data/compose/<id>/docker-compose.yml`.
2. **Chave desligada (padrão):** esperar 6 min; o arquivo NÃO muda; o botão manual funciona.
3. **Chave `canario`** com o fingerprint da VPS (`SETUP_SINCRONIZAR_STACK_CANARIO`) no Console: depois de
   até 10 min (cache da flag) + 2 min (tick), o arquivo passa a ter as imagens com digest; `snap` igual (mesmas tasks).
4. **Idempotência:** nada de novo no arquivo; auditoria `stack.sincronizar` (Logs do painel) só 1 vez.
5. **O que a correção existe para resolver:** atualizar pelo botão do EnchaT; esperar a sincronização;
   Portainer → Update the stack com Re-pull LIGADO. Versão e edição continuam; `snap` sem tasks novas.
6. **Portão:** durante uma atualização do EnchaT (sidecar ocupado) o auto não grava ("aguardando"). Com
   `estado.json` apontando versão diferente da que roda (ex.: depois de um Update the stack antigo), a tela
   mostra o aviso e o botão fica desabilitado.
7. **Edição regredida** (CRM/Tráfego voltou a Grátis): tela avisa para falar com o suporte, sem clicar Atualizar.
8. **Reset de senha:** botão manual → arquivo ganha `ENCHAT_ADMIN_*` vazias; no Portainer preencher, Update
   the stack (Re-pull desligado ou ligado), entrar, esvaziar.
9. **Backoff:** forçar falha (ex.: `chattr +i` no arquivo): 3 falhas desligam o auto nesta instalação
   (`stack_sync.auto_disabled_reason`); o botão manual continua.
