#!/bin/bash
# Auditoria C7 (S10 do plano de segurança do EnchaT): /root/dados_vps é
# bind-montado (755) dentro do contêiner do painel, que roda como uid 1001
# e fica exposto à Internet (ver o comentário do chmod de dados_portainer
# em secondary.sh). Por isso todo arquivo com segredo ali precisa ser 600
# — dados_enchat guarda a ENCHAT_MASTER_KEY, a senha do Postgres, a senha
# do papel restrito "pinfy" e a PINFY_SESSION_KEY (S12), e o link de
# primeiro acesso (?setup=<token>).
#
# Roda a função REAL que grava dados_enchat (enchat_gravar_dados_enchat,
# extraída de secondary.sh, só com /root/dados_vps trocado por um diretório
# temporário), com a umask padrão do root (022), e confere o modo final —
# inclusive quando o arquivo já existia com 644 (reinstalação). Confere
# também que ferramenta_enchat() a chama ANTES do deploy e no passo 5/5.
# Roda com: bash tests/test-dados-enchat-permissao.sh
set -u
cd "$(dirname "$0")/.."
falhas=0

modo() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1"; }

bloco="$(awk '
  /^enchat_gravar_dados_enchat\(\) \{$/ { p = 1 }
  p { print }
  p && /^\}$/ { exit }
' secondary.sh)"

if ! printf '%s\n' "$bloco" | grep -q 'cat > dados_enchat'; then
  echo "❌ FALHOU: função enchat_gravar_dados_enchat (grava dados_enchat) não encontrada em secondary.sh"
  exit 1
fi

# A função só protege se ferramenta_enchat() a chamar ANTES do deploy
# (stack_editavel) — e de novo no passo 5/5.
corpo_84="$(awk '/^ferramenta_enchat\(\)\{/ { f = 1 } f { print } f && /^\}$/ { exit }' secondary.sh)"
l_grava="$(printf '%s\n' "$corpo_84" | grep -n '^  enchat_gravar_dados_enchat || return 1$' | head -1 | cut -d: -f1)"
l_deploy="$(printf '%s\n' "$corpo_84" | grep -n '^  stack_editavel$' | head -1 | cut -d: -f1)"
n_grava="$(printf '%s\n' "$corpo_84" | grep -c '^  enchat_gravar_dados_enchat || return 1$')"
if [ -n "$l_grava" ] && [ -n "$l_deploy" ] && [ "$l_grava" -lt "$l_deploy" ] && [ "$n_grava" -ge 2 ]; then
  echo "✅ ferramenta_enchat grava dados_enchat antes do deploy (linha $l_grava < $l_deploy) e no passo 5/5"
else
  echo "❌ FALHOU: ferramenta_enchat precisa chamar enchat_gravar_dados_enchat ANTES de stack_editavel e no passo 5/5 (grava=${l_grava:-?}, deploy=${l_deploy:-?}, chamadas=$n_grava)"
  falhas=$((falhas + 1))
fi

rodar() {
  local dv="$1"
  (
    umask 022
    url_enchat="crm.exemplo.com"
    enchat_setup_token="TOKEN-DE-TESTE-0123456789abcdef"
    versao_enchat="0.3.2"
    enchat_master_key="MASTER-DE-TESTE"
    postgres_password="PG-DE-TESTE"
    pinfy_panel_password="PINFY-DE-TESTE"
    pinfy_db_password="PINFY-DB-DE-TESTE"
    pinfy_session_key="PINFY-SESSION-DE-TESTE"
    eval "$(printf '%s\n' "$bloco" | sed "s#\${ENCHA_ROOT_DIR:-/root}/dados_vps#$dv#g")"
    enchat_gravar_dados_enchat
  )
}

for caso in novo reinstalacao; do
  DV="$(mktemp -d)"
  if [ "$caso" = reinstalacao ]; then
    echo "conteúdo antigo" > "$DV/dados_enchat"
    chmod 644 "$DV/dados_enchat"
  fi
  rodar "$DV"
  obtido="$(modo "$DV/dados_enchat")"
  if [ "$obtido" != "600" ]; then
    echo "❌ FALHOU ($caso): dados_enchat ficou com modo $obtido, esperado 600"
    falhas=$((falhas + 1))
  elif ! grep -q "?setup=TOKEN-DE-TESTE-0123456789abcdef" "$DV/dados_enchat"; then
    echo "❌ FALHOU ($caso): dados_enchat sem o link de primeiro acesso"
    falhas=$((falhas + 1))
  elif ! grep -q "PINFY-DB-DE-TESTE" "$DV/dados_enchat"; then
    echo "❌ FALHOU ($caso): dados_enchat sem a senha do papel Pinfy no Postgres (S12)"
    falhas=$((falhas + 1))
  elif ! grep -q "PINFY-SESSION-DE-TESTE" "$DV/dados_enchat"; then
    echo "❌ FALHOU ($caso): dados_enchat sem a PINFY_SESSION_KEY (S12)"
    falhas=$((falhas + 1))
  else
    echo "✅ ($caso) dados_enchat gravado com modo 600 e com o link"
  fi
  rm -rf "$DV"
done

[ "$falhas" -eq 0 ] || exit 1
