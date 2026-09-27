#!/bin/bash
# Auditoria S4: a opção 84 (ferramenta_enchat, secondary.sh) contra a MESMA
# tabela-contrato que o painel confere
# (encha-setup-panel/src/lib/stacks/__fixtures__/enchat-segredos-contrato.tsv,
# só as linhas opcao84=sim). Os testes do S4 conferiam as peças soltas e
# deixavam passar, em verde:
#   - MASTER_KEY_FILE do Pinfy apontando para o arquivo da pinfy_panel_password
#     (e vice-versa) — o app perde a autenticação com o Pinfy;
#   - SESSION_KEY_FILE sem o segredo montado no Pinfy — o Pinfy não sobe;
#   - o segredo pinfy_session_key criado com o valor da pinfy_master_key —
#     sessões cifradas com uma chave diferente da gravada em dados_enchat.
# Aqui, por serviço: *_FILE exatamente os da tabela, cada um montado NESSE
# serviço com o uid/gid da tabela e mode 0400; externos enchat_<segredo>_<época>
# = ENCHAT_SEGREDOS_CHAVES; e o valor que enchat_valor_segredo manda ao
# `docker secret create` é, byte a byte, o da mesma variável no formato antigo.
# Roda o heredoc REAL e as funções REAIS extraídos de secondary.sh.
# Roda com: bash tests/test-enchat-segredos-contrato.sh
set -u
cd "$(dirname "$0")/.." || exit 1

CONTRATO="encha-setup-panel/src/lib/stacks/__fixtures__/enchat-segredos-contrato.tsv"
[ -f "$CONTRATO" ] || { echo "❌ FALHOU: $CONTRATO não encontrado"; exit 1; }

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

heredoc="$(awk '
  /^ferramenta_enchat\(\)\{/ { f = 1 }
  f && /^  cat > enchat.yaml <<EOL$/ { p = 1 }
  p { print }
  p && /^EOL$/ { exit }
' secondary.sh)"
[ -n "$heredoc" ] || { echo "❌ FALHOU: heredoc do enchat.yaml não encontrado em ferramenta_enchat()"; exit 1; }

extrair_funcao() {
  awk -v alvo="$1" '
    $0 ~ "^" alvo "\\(\\) \\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}
funcoes=""
for f in versao_semver_maior versao_semver_maior_ou_igual enchat_versao_usa_segredos enchat_url_banco_app \
         enchat_url_banco_pinfy enchat_valor_segredo enchat_linha_env enchat_bloco_montagens enchat_montar_blocos_yaml; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  funcoes+="$corpo"$'\n'
done
constantes="$(grep -E '^(ENCHAT_VERSAO_MINIMA_SEGREDOS=|ENCHAT_SEGREDOS_CHAVES=)' secondary.sh)"

DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT

# Valores DISTINTOS por segredo, com caracteres que o base64 da master key
# real tem (+ / =), para a comparação byte a byte não passar por coincidência.
definir_valores() {
  url_enchat="crm.exemplo.com"; nome_rede_interna="rede_traefik"
  postgres_password="pg0123456789abcdef"; enchat_master_key="k+/Base64==MK"; pinfy_master_key="pmk0123456789"
  pinfy_webhook_token="pwt0123456789"; pinfy_panel_password="ppp0123456789"; pinfy_db_password="pdb0123456789"
  pinfy_session_key="psk0123456789"; enchat_setup_token="st0123456789"
}

# $1 = versão, $2 = subdiretório de saída. Mesmo fluxo de ferramenta_enchat.
renderizar() {
  mkdir -p "$DIR/$2"
  (
    set +u
    cd "$DIR/$2" || exit 1
    eval "$constantes"; eval "$funcoes"; definir_valores
    versao_enchat="$1"
    ENCHAT_USA_SEGREDOS=false
    ENCHAT_EPOCA_SEGREDOS=1758900000
    enchat_versao_usa_segredos "$versao_enchat" && ENCHAT_USA_SEGREDOS=true
    enchat_montar_blocos_yaml
    eval "$heredoc"
  )
}
renderizar 0.4.2 novo
renderizar 0.4.0 antigo
NOVO="$DIR/novo/enchat.yaml"; ANTIGO="$DIR/antigo/enchat.yaml"
grep -q '^secrets:$' "$NOVO" || { echo "❌ FALHOU: o YAML com 0.4.2 não usa segredos"; exit 1; }

# Valor que o menu manda ao `docker secret create` (stdin) para o segredo $1.
valor_do_segredo() { ( set +u; eval "$funcoes"; definir_valores; enchat_valor_segredo "$1" ); }

bloco() { # $1 = arquivo, $2 = serviço (chave do YAML); para no bloco de topo
  awk -v nome="  $2:" '
    /^secrets:$/ { exit }
    $0 == nome { p = 1; next }
    p && /^  [A-Za-z_][A-Za-z0-9_]*:$/ { exit }
    p && /^[A-Za-z]/ { exit }
    p { print }
  ' "$1"
}
# "VAR=valor" de cada env `      VAR: "valor"` do bloco (stdin).
envs() { sed -nE 's/^      ([A-Z0-9_]+): "(.*)"$/\1=\2/p'; }
# "source target uid gid mode" de cada montagem completa do bloco (stdin).
montagens() {
  awk '
    /^      - source: / { src = $3; s = 1; next }
    s == 1 && /^        target: / { tgt = $2; s = 2; next }
    s == 2 && /^        uid: / { uid = $2; gsub(/"/, "", uid); s = 3; next }
    s == 3 && /^        gid: / { gid = $2; gsub(/"/, "", gid); s = 4; next }
    s == 4 && /^        mode: / { print src, tgt, uid, gid, $2; s = 0; next }
    { s = 0 }
  '
}

linhas_menu="$(awk -F'\t' '!/^#/ && NF == 6 && $1 != "servico" && $6 == "sim"' "$CONTRATO")"
[ "$(printf '%s\n' "$linhas_menu" | grep -c .)" -eq 11 ] || falha "esperava 11 linhas opcao84=sim no contrato"

for servico in app pinfy postgres; do
  b_novo="$(bloco "$NOVO" "enchat_$servico")"; b_antigo="$(bloco "$ANTIGO" "enchat_$servico")"
  [ -n "$b_novo" ] && [ -n "$b_antigo" ] || { falha "serviço enchat_$servico não encontrado"; continue; }
  linhas="$(printf '%s\n' "$linhas_menu" | awk -F'\t' -v s="$servico" '$1 == s')"

  # 1. *_FILE: exatamente os da tabela (tudo que aponta para /run/secrets/).
  esperado="$(printf '%s\n' "$linhas" | awk -F'\t' '{ print $2 "_FILE=/run/secrets/enchat_" $3 }' | sort)"
  achado="$(printf '%s\n' "$b_novo" | envs | grep -E '=/run/secrets/|^[A-Z0-9_]+_FILE=' | grep -v '^STATE_FILE=' | sort)"
  if [ "$achado" = "$esperado" ]; then ok "enchat_$servico: *_FILE exatamente os da tabela"
  else falha "enchat_$servico: *_FILE diferente da tabela"; diff <(printf '%s\n' "$esperado") <(printf '%s\n' "$achado") | head -10; fi
  while IFS=$'\t' read -r _ var _ _ _ _; do
    printf '%s\n' "$b_novo" | envs | grep -q "^${var}=" && falha "enchat_$servico: $var ainda em texto ao lado do _FILE"
  done <<< "$linhas"

  # 2. Montagens: exatamente os arquivos lidos, com uid/gid da tabela, mode 0400.
  esperado="$(printf '%s\n' "$linhas" | awk -F'\t' '{ print "enchat_" $3, "enchat_" $3, $4, $5, "0400" }' | sort -u)"
  achado="$(printf '%s\n' "$b_novo" | montagens | sort)"
  n_src="$(printf '%s\n' "$b_novo" | grep -c '^      - source: ')"
  if [ "$achado" = "$esperado" ] && [ "$n_src" -eq "$(printf '%s\n' "$achado" | grep -c .)" ]; then
    ok "enchat_$servico: monta exatamente os segredos que lê (uid/gid da tabela, mode 0400)"
  else
    falha "enchat_$servico: montagens diferentes da tabela"; diff <(printf '%s\n' "$esperado") <(printf '%s\n' "$achado") | head -10
  fi

  # 3. Valor do segredo == valor da variável no formato antigo, byte a byte.
  while IFS=$'\t' read -r _ var segredo _ _ _; do
    antigo_valor="$(printf '%s\n' "$b_antigo" | envs | sed -n "s/^${var}=//p")"
    [ -n "$antigo_valor" ] || { falha "enchat_$servico: $var ausente no formato antigo"; continue; }
    if [ "$(valor_do_segredo "$segredo")" = "$antigo_valor" ]; then :
    else falha "enchat_$servico: valor do segredo $segredo difere de $var no formato antigo"; fi
  done <<< "$linhas"
done

# 4. Externos do topo e ENCHAT_SEGREDOS_CHAVES = os segredos da tabela (opcao84).
esperado="$(printf '%s\n' "$linhas_menu" | awk -F'\t' '{ print "enchat_" $3 " enchat_" $3 "_1758900000" }' | sort -u)"
achado="$(awk '/^secrets:$/ { p = 1; next } p && /^  [a-z_]+:$/ { a = $1; sub(/:$/, "", a); next } p && /^    name: / { print a, $2 }' "$NOVO" | sort)"
[ "$achado" = "$esperado" ] && ok "externos do topo = segredos da tabela, nome enchat_<segredo>_<época>" \
  || { falha "externos do topo diferentes da tabela"; diff <(printf '%s\n' "$esperado") <(printf '%s\n' "$achado") | head -10; }
chaves="$( (eval "$constantes"; printf '%s\n' "${ENCHAT_SEGREDOS_CHAVES[@]}") | sort)"
[ "$chaves" = "$(printf '%s\n' "$linhas_menu" | cut -f3 | sort -u)" ] && ok "ENCHAT_SEGREDOS_CHAVES = segredos da tabela (o que se cria = o que se monta)" \
  || falha "ENCHAT_SEGREDOS_CHAVES difere dos segredos da tabela"

# 5. O portão olha uma versão só: app e Pinfy usam a MESMA tag informada.
imgs="$(sed -nE 's/^    image: (ghcr\.io\/enchainterno\/[a-z-]+):(.*)$/\1 \2/p' "$NOVO" | sort)"
[ "$imgs" = "$(printf '%s\n' 'ghcr.io/enchainterno/enchat-free 0.4.2' 'ghcr.io/enchainterno/pinfy 0.4.2')" ] \
  && ok "app e Pinfy usam a versão informada (a mesma que abre o portão)" || falha "imagens do EnchaT com tag diferente da versão: $imgs"

if [ "$falhas" -eq 0 ]; then
  ok "opção 84: segredos do Docker conforme a tabela-contrato"
else
  exit 1
fi
