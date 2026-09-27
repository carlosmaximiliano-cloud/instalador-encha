#!/bin/bash
# O caminho do EnchaT em secondary.sh (ferramenta_enchat, opção 84) monta o
# enchat.yaml num heredoc. Garantias que nenhum outro teste cobria — um nome de
# variável errado ali (ex.: "$pinfy_sesion_key") vira string vazia em silêncio:
#
# Auditoria S12 (formato antigo, variáveis em texto):
#   - enchat_app recebe PINFY_DB_PASSWORD (o app cria o papel "pinfy" com ela);
#   - enchat_pinfy conecta como "pinfy" com a MESMA senha, nunca como "enchat";
#   - enchat_pinfy recebe SESSION_KEY, e só ele.
#
# S4 (segredos do Docker, achado 2):
#   - portão FECHADO (versão < 0.4.1, ilegível): o YAML é BYTE A BYTE o de antes
#     do S4 (tests/golden/enchat-84-formato-antigo.yaml, capturado do heredoc
#     antigo);
#   - portão ABERTO: nenhum valor de segredo em texto, *_FILE em todo valor
#     sensível, secrets externos com nome versionado, mounts com uid/gid/mode
#     do usuário que roda cada imagem, e o resto (deploy/restart/labels)
#     idêntico ao formato antigo.
# Roda o heredoc REAL e as funções REAIS (extraídos de secondary.sh) com
# valores marcados.
# Roda com: bash tests/test-enchat-yaml-pinfy.sh
set -u
cd "$(dirname "$0")/.."

heredoc="$(awk '
  /^ferramenta_enchat\(\)\{/ { f = 1 }
  f && /^  cat > enchat.yaml <<EOL$/ { p = 1 }
  p { print }
  p && /^EOL$/ { exit }
' secondary.sh)"

if [ -z "$heredoc" ]; then
  echo "❌ FALHOU: heredoc do enchat.yaml não encontrado em ferramenta_enchat()"
  exit 1
fi

extrair_funcao() {
  awk -v alvo="$1" '
    $0 ~ "^" alvo "\\(\\) \\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}

funcoes=""
for f in versao_semver_maior versao_semver_maior_ou_igual enchat_versao_usa_segredos enchat_url_banco_app \
         enchat_url_banco_pinfy enchat_linha_env enchat_bloco_montagens enchat_montar_blocos_yaml; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  funcoes+="$corpo"$'\n'
done
constantes="$(grep -E '^(ENCHAT_VERSAO_MINIMA_SEGREDOS=|ENCHAT_SEGREDOS_CHAVES=)' secondary.sh)"
[ "$(printf '%s\n' "$constantes" | wc -l | tr -d ' ')" -eq 2 ] || { echo "❌ FALHOU: constantes dos segredos não encontradas em secondary.sh"; exit 1; }

DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT

# Renderiza o YAML: $1 = versão do EnchaT, $2 = arquivo de saída. Usa o mesmo
# fluxo de ferramenta_enchat: decide o portão, monta os blocos, roda o heredoc.
renderizar() {
  local versao="$1" saida="$2"
  mkdir -p "$DIR/$saida"
  (
    set +u
    cd "$DIR/$saida"
    eval "$constantes"
    eval "$funcoes"
    url_enchat="crm.exemplo.com"; versao_enchat="$versao"; nome_rede_interna="rede_traefik"
    postgres_password="SENT-postgres-pw"; enchat_master_key="SENT-master-key"; pinfy_master_key="SENT-pinfy-master"
    pinfy_webhook_token="SENT-pinfy-webhook"; pinfy_panel_password="SENT-pinfy-panel"; pinfy_db_password="SENT-pinfy-dbpw"
    pinfy_session_key="SENT-pinfy-session"; enchat_setup_token="SENT-setup-token"
    ENCHAT_USA_SEGREDOS=false
    ENCHAT_EPOCA_SEGREDOS=1758900000
    enchat_versao_usa_segredos "$versao_enchat" && ENCHAT_USA_SEGREDOS=true
    enchat_montar_blocos_yaml
    eval "$heredoc"
  )
}

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

bloco() { # $1 = arquivo, $2 = serviço
  awk -v nome="  $2:" '
    $0 == nome { p = 1; next }
    p && /^  [A-Za-z_][A-Za-z0-9_]*:$/ { exit }
    p && /^[A-Za-z]/ { exit }
    p { print }
  ' "$1"
}

SENTINELAS="SENT-postgres-pw SENT-master-key SENT-pinfy-master SENT-pinfy-webhook SENT-pinfy-panel SENT-pinfy-dbpw SENT-pinfy-session SENT-setup-token"

# ---------------------------------------------------------------------------
# Portão FECHADO: byte a byte o YAML de antes do S4 (golden).
# ---------------------------------------------------------------------------
for v in 0.4.0 0.3.9 0.0.1 latest 0.4.1-rc1 "" abc; do
  renderizar "$v" "fechado-$v"
  # O golden foi capturado com a tag 0.4.0; a tag da imagem é a única diferença esperada.
  sed -E "s#^(    image: ghcr.io/enchainterno/[a-z-]+):${v//./\\.}\$#\\1:0.4.0#" "$DIR/fechado-$v/enchat.yaml" > "$DIR/fechado-$v/normalizado.yaml"
  if cmp -s "$DIR/fechado-$v/normalizado.yaml" tests/golden/enchat-84-formato-antigo.yaml; then
    ok "versão '$v': YAML idêntico ao formato antigo (portão fechado)"
  else
    falha "versão '$v': o YAML mudou com o portão fechado (diff abaixo)"
    diff "$DIR/fechado-$v/normalizado.yaml" tests/golden/enchat-84-formato-antigo.yaml | head -20
  fi
done

# ---------------------------------------------------------------------------
# Formato antigo: papel pinfy e SESSION_KEY nos serviços certos (S12).
# ---------------------------------------------------------------------------
antigo="$DIR/fechado-0.4.0/enchat.yaml"
app="$(bloco "$antigo" enchat_app)"
pinfy="$(bloco "$antigo" enchat_pinfy)"
[ -n "$app" ] || falha "serviço enchat_app não encontrado no YAML"
[ -n "$pinfy" ] || falha "serviço enchat_pinfy não encontrado no YAML"

printf '%s\n' "$app" | grep -q 'PINFY_DB_PASSWORD: "SENT-pinfy-dbpw"' ||
  falha "enchat_app sem PINFY_DB_PASSWORD com a senha gerada"
printf '%s\n' "$app" | grep -q 'SENT-pinfy-session' &&
  falha "enchat_app recebendo a chave da sessão (é só do Pinfy)"
printf '%s\n' "$pinfy" | grep -q 'DATABASE_URL: "postgresql://pinfy:SENT-pinfy-dbpw@enchat_postgres:5432/enchat?schema=pinfy' ||
  falha "enchat_pinfy não conecta como pinfy com a PINFY_DB_PASSWORD"
printf '%s\n' "$pinfy" | grep -q 'postgresql://enchat:' &&
  falha "enchat_pinfy ainda conecta como o superusuário enchat"
printf '%s\n' "$pinfy" | grep -q 'SESSION_KEY: "SENT-pinfy-session"' ||
  falha "enchat_pinfy sem SESSION_KEY com a chave gerada"

# ---------------------------------------------------------------------------
# Portão ABERTO (>= 0.4.1): segredos do Docker.
# ---------------------------------------------------------------------------
for v in 0.4.1 0.4.2 0.5.0 1.0.0 0.4.10; do
  renderizar "$v" "aberto-$v"
done
novo="$DIR/aberto-0.4.1/enchat.yaml"

for s in $SENTINELAS; do
  grep -q -- "$s" "$novo" && falha "segredo em texto no YAML aberto: $s"
done
grep -q 'postgresql://' "$novo" && falha "URL de conexão (com credencial) em texto no YAML aberto"

for nome in DATABASE_URL PINFY_MASTER_KEY PINFY_WEBHOOK_TOKEN PINFY_DB_PASSWORD ENCHAT_MASTER_KEY ENCHAT_SETUP_TOKEN MASTER_KEY PANEL_PASSWORD SESSION_KEY POSTGRES_PASSWORD; do
  grep -qE "^      ${nome}: " "$novo" && falha "$nome ainda em texto no YAML aberto"
  grep -qE "^      ${nome}_FILE: \"/run/secrets/enchat_[a-z_]+\"$" "$novo" || falha "${nome}_FILE ausente no YAML aberto"
done

app="$(bloco "$novo" enchat_app)"; pinfy="$(bloco "$novo" enchat_pinfy)"; pg="$(bloco "$novo" enchat_postgres)"
printf '%s\n' "$pinfy" | grep -q 'DATABASE_URL_FILE: "/run/secrets/enchat_pinfy_database_url"' ||
  falha "o Pinfy não usa o segredo da URL dele (usuário pinfy)"
printf '%s\n' "$pinfy" | grep -q 'enchat_database_url' && falha "o Pinfy recebendo o segredo da URL do app"
printf '%s\n' "$app" | grep -q 'SESSION_KEY' && falha "enchat_app recebendo SESSION_KEY (é só do Pinfy)"
printf '%s\n' "$pg" | grep -q 'POSTGRES_PASSWORD_FILE: "/run/secrets/enchat_postgres_password"' ||
  falha "o Postgres não usa POSTGRES_PASSWORD_FILE"

# Nome versionado nos externos; alias == alvo montado.
n_ext="$(awk '/^secrets:$/ { p = 1; next } p && /^    name: enchat_[a-z_]+_1758900000$/ { n++ } END { print n + 0 }' "$novo")"
[ "$n_ext" = "10" ] || falha "esperava 10 segredos externos versionados, achei $n_ext"
grep -q '^secrets:$' "$novo" || falha "sem bloco secrets: de topo"
while read -r alias; do
  grep -qE "^  ${alias}:$" "$novo" || falha "source $alias montado sem declaração no bloco de topo"
done < <(grep -E '^      - source: ' "$novo" | sed -E 's/^      - source: //' | sort -u)

# Mounts: uid/gid/mode por serviço (app/pinfy 1000, postgres 0), mode 0400.
checa_mounts() { # serviço uid gid
  local b n_src n_ok
  b="$(bloco "$novo" "$1")"
  n_src="$(printf '%s\n' "$b" | grep -c '^      - source: ')"
  n_ok="$(printf '%s\n' "$b" | awk -v u="$2" -v g="$3" '
    /^      - source: / { s = 1; next }
    s == 1 && /^        target: / { s = 2; next }
    s == 2 && $0 == "        uid: \"" u "\"" { s = 3; next }
    s == 3 && $0 == "        gid: \"" g "\"" { s = 4; next }
    s == 4 && $0 == "        mode: 0400" { n++; s = 0; next }
    END { print n + 0 }')"
  [ "$n_src" -gt 0 ] || falha "$1 sem montagens de segredo"
  [ "$n_src" = "$n_ok" ] || falha "$1: $n_src montagens, mas só $n_ok com uid $2/gid $3/mode 0400"
}
checa_mounts enchat_app 1000 1000
checa_mounts enchat_pinfy 1000 1000
checa_mounts enchat_postgres 0 0

# O que não é segredo é IDÊNTICO ao formato antigo (deploy/restart/labels/imagem).
normaliza() {
  awk '
    /^secrets:$/ { exit }
    /^    secrets:$/ { pula = 1; next }
    pula && /^      / { next }
    { pula = 0 }
    /^      (DATABASE_URL|PINFY_MASTER_KEY|PINFY_WEBHOOK_TOKEN|PINFY_DB_PASSWORD|ENCHAT_MASTER_KEY|ENCHAT_SETUP_TOKEN|MASTER_KEY|PANEL_PASSWORD|SESSION_KEY|POSTGRES_PASSWORD)(_FILE)?: / { next }
    { print }
  ' "$1" | sed -e 's/:0\.4\.[01]$/:TAG/'
}
if [ "$(normaliza "$novo" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')" = "$(normaliza "$antigo" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')" ]; then
  ok "fora dos segredos, o YAML aberto é idêntico ao antigo (deploy, restart, labels)"
else
  falha "o YAML aberto difere do antigo além dos segredos"
  diff <(normaliza "$novo") <(normaliza "$antigo") | head -20
fi

# Versões acima de 0.4.1 também abrem; a comparação é numérica, não textual (0.4.10 > 0.4.9).
for v in 0.4.2 0.5.0 1.0.0 0.4.10; do
  grep -q '^secrets:$' "$DIR/aberto-$v/enchat.yaml" || falha "versão $v deveria usar segredos"
done

# Os outros dois testes da opção 84 com segredos do Docker rodam DAQUI: este é
# o único deles que o CI (.github/workflows/test.yml) chama — sem isso a
# criação/limpeza (docker falso) e a tabela-contrato nunca rodariam num push.
for t in tests/test-enchat-segredos.sh tests/test-enchat-segredos-contrato.sh; do
  if bash "$t" > "$DIR/saida-$(basename "$t").log" 2>&1; then
    ok "$t"
  else
    falha "$t (saída abaixo)"
    grep -F "FALHOU" "$DIR/saida-$(basename "$t").log" | head -20
  fi
done

if [ "$falhas" -eq 0 ]; then
  ok "enchat.yaml: papel pinfy/SESSION_KEY nos serviços certos e segredos do Docker sem valor em texto"
else
  exit 1
fi
