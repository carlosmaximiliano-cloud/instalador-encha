#!/bin/bash
# S2 (achado 6 da auditoria de segurança do instalador): a senha e o JWT do
# Portainer, e o token do GHCR, NUNCA podem aparecer na linha de comando de
# nenhum processo (`ps` do host, /proc/<pid>/cmdline: visível a qualquer
# usuário local enquanto o processo vive). Eles vão por STDIN (curl -K -) ou
# por variável de ambiente (jq env.X) — ver curl_portainer/
# portainer_json_login em secondary.sh.
#
# Este teste:
#  (a) roda as funções REAIS de secondary.sh (renomear admin, laço de
#      candidatos, stack_editavel, registrar_registry_portainer,
#      deploy_stack_painel_via_portainer — PUT e POST — e o trecho de login de
#      coletar_inputs_so_painel, extraído de main.sh) com docker/curl/jq
#      FALSOS no PATH que gravam o argv e o stdin de cada chamada, e confere
#      que as sentinelas NUNCA estão no argv e ESTÃO no stdin;
#  (b) varre estaticamente secondary.sh/main.sh atrás de padrões que voltariam
#      o segredo para o argv (allowlist explícita e comentada);
#  (c) confere que senha com aspas/barra/controle gera JSON válido e que o
#      escape do arquivo de config faz o round-trip pelo curl REAL.
#
# Roda com: bash tests/test-credencial-fora-argv.sh
set -u
cd "$(dirname "$0")/.." || exit 1
falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

# Sentinelas: o prefixo comum "SENTINELA-9f3" é o que se procura nos logs —
# sobrevive a qualquer escape (aspas/barras vêm DEPOIS dele).
MARCA='SENTINELA-9f3'
SENHA_PORTAINER="SENHA-${MARCA}\"q\\z"     # com aspas e barra, de propósito
SENHA_PAINEL="PAINEL-${MARCA}"
JWT_FAKE="JWT-${MARCA}"
TOKEN_GHCR="GHCR-${MARCA}"

extrair_funcao() {
  # Casa "nome() {" e "nome(){" (stack_editavel é escrita sem espaço).
  local nome="$1"
  awk -v alvo="$nome" '
    $0 ~ "^" alvo "\\(\\) ?\\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}

ENCHA_CURL_IMAGE="$(grep -oE '^ENCHA_CURL_IMAGE="[^"]+"' secondary.sh | head -1 | sed -E 's/^ENCHA_CURL_IMAGE="([^"]+)"$/\1/')"
[ -n "$ENCHA_CURL_IMAGE" ] || { echo "❌ FALHOU: ENCHA_CURL_IMAGE não encontrada"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ FALHOU: este teste precisa de jq real no PATH"; exit 1; }
JQ_REAL="$(command -v jq)"

FUNCS="curl_portainer_escapar curl_portainer curl_portainer_http portainer_json_login \
renomear_admin_portainer_se_necessario finalizar_admin_portainer stack_editavel \
registrar_registry_portainer imagem_painel_tem_label_credenciais_arquivo \
garantir_segredos_credenciais_painel limpar_segredos_antigos_painel \
deploy_stack_painel_via_portainer"
CODIGO=""
for f in $FUNCS; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  CODIGO+="$corpo"$'\n'
done
# As funções leem /root/dados_vps/dados_portainer (caminho fixo, sempre root
# em produção). No teste vira um diretório temporário.
DV="$(mktemp -d)"
CODIGO="${CODIGO//\/root\/dados_vps/$DV}"

BINDIR="$(mktemp -d)"
WORK="$(mktemp -d)"
trap 'rm -rf "$BINDIR" "$DV" "$WORK"; [ -n "${SRV_PID:-}" ] && kill "$SRV_PID" 2>/dev/null' EXIT
ARGV_LOG="$WORK/argv.log"; STDIN_LOG="$WORK/stdin.log"
: > "$ARGV_LOG"; : > "$STDIN_LOG"
export ARGV_LOG STDIN_LOG

cp tests/lib/curl-config-decode.sh "$BINDIR/curl-config-decode"
chmod +x "$BINDIR/curl-config-decode"

# --- Falsos: gravam o argv (uma linha "ARG ..." por argumento) e o stdin ---
cat > "$BINDIR/sudo" <<'EOF'
#!/bin/bash
exec "$@"
EOF
cat > "$BINDIR/jq" <<EOF
#!/bin/bash
{ echo "CMD jq"; for a in "\$@"; do printf 'ARG %s\n' "\$a"; done; } >> "\$ARGV_LOG"
exec "$JQ_REAL" "\$@"
EOF
cat > "$BINDIR/openssl" <<'EOF'
#!/bin/bash
printf 'conteudo-descartavel'
EOF
# Resposta comum do "Portainer" falso (docker run e curl do host usam a mesma).
cat > "$BINDIR/resposta-portainer" <<'EOF'
#!/bin/bash
# uso: resposta-portainer <url> <método> ; imprime o corpo; código em $HTTP_CODE_FILE
url="$1" metodo="$2" corpo="" http=200
case "$url" in
  */api/system/status) corpo='{}' ;;
  */api/auth) corpo="{\"jwt\":\"$FAKE_JWT\"}" ;;
  */api/users/1) corpo='{}' ;;
  */api/endpoints/*/docker/swarm) corpo='{"ID":"swarm123"}' ;;
  */api/endpoints) corpo='[{"Id":1}]' ;;
  */api/registries/*) corpo='{}' ;;
  */api/registries)
    if [ "$metodo" = "GET" ]; then corpo="${FAKE_REGISTRIES:-[]}"; else corpo='{}'; http=201; fi ;;
  */api/stacks/create/swarm/file) corpo='{"Id":1}'; http=201 ;;
  */api/stacks)
    if [ "${FAKE_STACK_EXISTS:-false}" = true ]; then corpo='[{"Id":1,"Name":"encha-panel","Env":[]}]'; else corpo='[]'; fi ;;
  */api/stacks/*) corpo='{"Id":1}' ;;
esac
printf '%s' "$http" > "$HTTP_CODE_FILE"
printf '%s' "$corpo"
EOF
# Núcleo compartilhado: lê o stdin (config do curl) e o registra.
cat > "$BINDIR/nucleo-curl" <<'EOF'
#!/bin/bash
# uso: nucleo-curl <argumentos do curl...>. Registra stdin (se veio -K -) e
# responde como o Portainer, honrando -o <arq> e -w '%{http_code}' no fim.
url="" metodo="GET" out="" wfmt="" prev=""
case " $* " in
  *" -K - "*)
    dec="$(mktemp -d)"
    "$(dirname "$0")/curl-config-decode" "$dec"
    cat "$dec/raw" >> "$STDIN_LOG"; echo >> "$STDIN_LOG"
    rm -rf "$dec" ;;
esac
for a in "$@"; do
  case "$prev" in -X) metodo="$a" ;; -o) out="$a" ;; -w) wfmt="$a" ;; esac
  case "$a" in http://*|https://*) url="$a" ;; esac
  prev="$a"
done
export HTTP_CODE_FILE="$(mktemp)"
corpo="$("$(dirname "$0")/resposta-portainer" "$url" "$metodo")"
http="$(cat "$HTTP_CODE_FILE")"; rm -f "$HTTP_CODE_FILE"
if [ -n "$out" ] && [ "$out" != /dev/null ]; then
  # Comportamento do curl DENTRO do contêiner: só grava no host se o
  # arquivo estiver acessível (aqui sempre está) — o corpo não vai a stdout.
  printf '%s' "$corpo" > "$out"
elif [ -z "$out" ]; then
  printf '%s' "$corpo"
fi
# -w: expande %{http_code} no formato dado (o helper usa $'\n%{http_code}').
[ -n "$wfmt" ] && printf '%s' "${wfmt//%\{http_code\}/$http}"
exit 0
EOF
cat > "$BINDIR/docker" <<'EOF'
#!/bin/bash
{ echo "CMD docker"; for a in "$@"; do printf 'ARG %s\n' "$a"; done; } >> "$ARGV_LOG"
case "${1:-}" in
  run)
    shift
    # Como o docker de verdade: sem -i/--interactive ANTES da imagem, o stdin
    # do host NÃO chega ao processo do contêiner — o `curl -K -` leria config
    # vazia (sem Authorization, sem corpo). Sem isto, um curl_portainer que
    # perdesse o -i passaria em todos os cenários e quebraria na VPS.
    interativo=false
    for a in "$@"; do
      [ "$a" = "$ENCHA_CURL_IMAGE" ] && break
      case "$a" in -i|--interactive|-it|-ti) interativo=true ;; esac
    done
    if [ "$interativo" = true ]; then
      exec "$(dirname "$0")/nucleo-curl" "$@"
    fi
    exec "$(dirname "$0")/nucleo-curl" "$@" </dev/null ;;
  image) printf '%s' "${FAKE_IMAGE_LABEL:-}"; exit 0 ;;
  secret)
    case "${2:-}" in
      create) cat >/dev/null; exit 0 ;;
      inspect) exit 1 ;;
    esac
    exit 0 ;;
  info) printf 'swarm-cluster-id'; exit 0 ;;
esac
exit 0
EOF
cat > "$BINDIR/curl" <<'EOF'
#!/bin/bash
{ echo "CMD curl"; for a in "$@"; do printf 'ARG %s\n' "$a"; done; } >> "$ARGV_LOG"
exec "$(dirname "$0")/nucleo-curl" "$@"
EOF
chmod +x "$BINDIR"/*

t() { printf '%s' "$1"; }

# reinicia os logs e devolve o número de linhas do argv que contêm a marca
zera_logs() { : > "$ARGV_LOG"; : > "$STDIN_LOG"; }
confere() {
  # $1 = cenário; $2... = marcas que DEVEM estar no stdin
  local cen="$1"; shift
  local n
  n="$(grep -c -- "$MARCA" "$ARGV_LOG")"
  if [ "$n" -eq 0 ]; then
    ok "$cen: nenhuma sentinela no argv de docker/curl/jq"
  else
    falha "$cen: $n linha(s) do argv contêm segredo: $(grep -- "$MARCA" "$ARGV_LOG" | head -3 | tr '\n' '|')"
  fi
  local m
  for m in "$@"; do
    if grep -qF -- "$m" "$STDIN_LOG"; then
      ok "$cen: '$m' chegou pelo stdin"
    else
      falha "$cen: '$m' NÃO aparece no stdin gravado — o segredo não chegou ao curl"
    fi
  done
  # sanidade: o argv foi mesmo registrado (senão o teste passaria no vazio)
  [ -s "$ARGV_LOG" ] || falha "$cen: argv vazio — os falsos não foram chamados"
  # todo `docker run` que lê config por stdin (-K -) precisa de -i antes da
  # imagem — é o que faz o stdin do host chegar ao curl do contêiner.
  local sem_i
  sem_i="$(awk -v img="$ENCHA_CURL_IMAGE" '
    function fecha() { if (dr && k && !i) n++; dr = 0; k = 0; i = 0; pos = 0 }
    /^CMD / { fecha(); cmd = $2; nargs = 0; next }
    cmd == "docker" && /^ARG / {
      a = substr($0, 5); nargs++
      if (nargs == 1 && a == "run") dr = 1
      if (dr && !pos && (a == "-i" || a == "--interactive" || a == "-it" || a == "-ti")) i = 1
      if (a == img) pos = 1
      if (pos && a == "-K") k = 1
    }
    END { fecha(); print n + 0 }
  ' "$ARGV_LOG")"
  if [ "$sem_i" -eq 0 ]; then
    ok "$cen: todo docker run com -K - tem -i (stdin chega ao contêiner)"
  else
    falha "$cen: $sem_i docker run com '-K -' SEM -i — o config nunca chegaria ao curl do contêiner"
  fi
}

rodar() {
  # $1 = corpo (código shell a rodar num subshell com PATH falso)
  (
    set +u
    export PATH="$BINDIR:$PATH"
    export ARGV_LOG STDIN_LOG ENCHA_CURL_IMAGE FAKE_JWT="$JWT_FAKE" FAKE_STACK_EXISTS \
           FAKE_REGISTRIES FAKE_IMAGE_LABEL
    eval "$CODIGO"
    eval "$1"
  ) > "$WORK/saida.txt" 2>&1
}

# ============================================================
# (a1) renomear admin: PUT /users/1 (Bearer) + reautenticação (senha)
# ============================================================
zera_logs
rodar 'renomear_admin_portainer_se_necessario rede-teste novoadm "$SENHA_PORTAINER" "$JWT_FAKE" admin'
confere "renomear admin" "Authorization: Bearer $JWT_FAKE" "$MARCA"

# ============================================================
# (a2) laço de candidatos (finalizar_admin_portainer): login com a senha
# ============================================================
zera_logs
rodar 'finalizar_admin_portainer rede-teste "$SENHA_PORTAINER" novoadm false'
confere "laço de candidatos (finalizar_admin_portainer)" "$MARCA"

# ============================================================
# (a3) stack_editavel (curl do host): login, Bearer x3, multipart
# ============================================================
cat > "$DV/dados_portainer" <<EOF
[ PORTAINER ]
Domain: https://portainer.exemplo.com
Username: svcuser
Password: $SENHA_PORTAINER
EOF
mkdir -p "$WORK/cwd"
printf 'version: "3.7"\nservices: {}\n' > "$WORK/cwd/minhastack.yaml"
zera_logs
rodar 'cd "'"$WORK"'/cwd" && STACK_NAME=minhastack && stack_editavel'
confere "stack_editavel" "Authorization: Bearer $JWT_FAKE" "$MARCA"

# ============================================================
# (a4) registrar_registry_portainer: token do GHCR no corpo (POST e PUT)
# ============================================================
export GHCR_USER="ghcruser" GHCR_TOKEN="$TOKEN_GHCR"
zera_logs; FAKE_REGISTRIES='[]'
rodar 'registrar_registry_portainer'
confere "registrar GHCR (POST)" "Authorization: Bearer $JWT_FAKE" "$TOKEN_GHCR"
zera_logs; FAKE_REGISTRIES='[{"Id":7,"URL":"ghcr.io"}]'
rodar 'registrar_registry_portainer'
confere "registrar GHCR (PUT)" "Authorization: Bearer $JWT_FAKE" "$TOKEN_GHCR"
grep -q 'api/registries/7' "$ARGV_LOG" && ok "registrar GHCR (PUT): a rota /registries/7 (não secreta) segue no argv" \
  || falha "registrar GHCR (PUT): não chamou /api/registries/7"
unset GHCR_USER GHCR_TOKEN

# ============================================================
# (a5) deploy do painel: PUT (stack existe) e POST create (stack nova).
# Sem o label da imagem, as duas senhas vão em TEXTO no Env — o pior caso.
# ============================================================
DUMMY_STACK="$WORK/stack.yml"; printf 'version: "3.7"\nservices: {}\n' > "$DUMMY_STACK"
export user_portainer="svcuser" pass_portainer="$SENHA_PORTAINER" \
       user_painel="admin" pass_painel="$SENHA_PAINEL" url_painel="painel.exemplo.com" \
       nome_rede_interna="rede-teste" ENCHA_VERSION="0.3.5"
zera_logs; FAKE_STACK_EXISTS=true
rodar 'deploy_stack_painel_via_portainer "'"$DUMMY_STACK"'" 0.3.5'
confere "deploy do painel (PUT)" "Authorization: Bearer $JWT_FAKE" "$SENHA_PAINEL" "$MARCA"
grep -qF "deploy_stack_painel_via_portainer_sucesso" "$WORK/saida.txt" \
  && ok "deploy do painel (PUT): terminou com sucesso (o caminho todo foi exercitado)" \
  || falha "deploy do painel (PUT): não chegou ao sucesso: $(cat "$WORK/saida.txt")"
zera_logs; FAKE_STACK_EXISTS=false
rodar 'deploy_stack_painel_via_portainer "'"$DUMMY_STACK"'" 0.3.5'
confere "deploy do painel (POST create)" "Authorization: Bearer $JWT_FAKE" "$SENHA_PAINEL" "$MARCA"
grep -qF "deploy_stack_painel_via_portainer_sucesso" "$WORK/saida.txt" \
  && ok "deploy do painel (POST create): terminou com sucesso (o caminho todo foi exercitado)" \
  || falha "deploy do painel (POST create): não chegou ao sucesso: $(cat "$WORK/saida.txt")"
unset user_portainer pass_portainer user_painel pass_painel

# ============================================================
# (a6) main.sh: o trecho REAL que valida o login antes de gerar a stack do
# painel (dentro de coletar_inputs_so_painel, interativa demais para rodar
# inteira). Extrai a instrução `resp=$(curl_portainer ... )` e a executa.
# ============================================================
trecho_main="$(awk '
  /resp=\$\(curl_portainer / { f = 1 }
  f { print }
  f && /2>\/dev\/null\)$/ { exit }
' main.sh)"
if [ -z "$trecho_main" ]; then
  falha "main.sh: instrução de login (resp=\$(curl_portainer ...)) não encontrada em coletar_inputs_so_painel"
else
  zera_logs
  (
    set +u
    export PATH="$BINDIR:$PATH"
    export ARGV_LOG STDIN_LOG ENCHA_CURL_IMAGE FAKE_JWT="$JWT_FAKE"
    eval "$CODIGO"
    nome_rede_interna="rede-teste"; user_portainer="svcuser"; pass_portainer="$SENHA_PORTAINER"
    eval "$trecho_main"
    echo "resp=$resp"
  ) > "$WORK/saida.txt" 2>&1
  confere "main.sh (login do painel)" "$MARCA"
  grep -q '^resp=200$' "$WORK/saida.txt" && ok "main.sh: o login continua devolvendo o código HTTP (200)" \
    || falha "main.sh: esperava resp=200, saída: $(cat "$WORK/saida.txt")"
fi

# ============================================================
# (b) Varredura estática: nada que volte o segredo ao argv.
# ============================================================
# Junta continuações "\" em linhas lógicas e ignora comentários.
logicas() {
  awk '
    function flush() { if (acc != "") { print ini "\t" acc; acc = "" } }
    {
      linha = $0
      if (acc == "") { if (linha ~ /^[[:space:]]*#/) next; ini = NR }
      if (linha ~ /\\$/) { sub(/\\$/, "", linha); acc = acc " " linha; next }
      acc = acc " " linha
      flush()
    }
    END { flush() }
  ' "$1"
}
varre() {
  local arq="$1" achados=""
  local linhas; linhas="$(logicas "$arq" | grep -v 'MSG_')"
  # R1: "Bearer" (sem diferenciar maiúsculas: pega também --oauth2-bearer) em
  # qualquer linha de código, e cabeçalho de credencial de outro esquema
  # ("Authorization: token/Basic ...", "X-API-Key:", "X-Setup-Token:") numa
  # linha com -H/--header/curl/wget (fora disso é texto de heredoc, ex. o
  # dados_ntfy) — só o helper monta esse header (ALLOWLIST: a linha
  # `cfg+="header = ..."` dentro de curl_portainer, que escreve no stdin do
  # curl, nunca num argv).
  achados+="$(printf '%s\n' "$linhas" | grep -i 'bearer' \
    | grep -vF 'cfg+="header = \"Authorization: Bearer $(curl_portainer_escapar' || true)"$'\n'
  achados+="$(printf '%s\n' "$linhas" \
    | grep -E '[[:space:]](-H|--header)[[:space:]=]|(^|[^[:alnum:]_])(curl|wget)([[:space:]]|$)|ENCHA_CURL_IMAGE' \
    | grep -iE 'authorization[[:space:]]*:|x-api-key[[:space:]]*:|x-setup-token[[:space:]]*:' \
    | grep -vF 'cfg+="header = \"Authorization: Bearer $(curl_portainer_escapar' || true)"$'\n'
  # R2: jq --arg/--argjson com nome de credencial (p, pp, sp, senha*, pass*,
  # token*, ghcr*, jwt) ou o Env inteiro (--argjson env) — OU com VALOR vindo
  # de variável de nome de credencial (`--arg x "$pass_portainer"`) — e
  # --args/--jsonargs (valores posicionais também vão no argv). Credencial
  # vai por variável de ambiente (env.X).
  achados+="$(printf '%s\n' "$linhas" | grep -iE -- '--arg(json)?[[:space:]]+(p|pp|sp|pass[a-z_]*|senha[a-z_]*|token[a-z_]*|ghcr[a-z_]*|jwt|env)[[:space:]]' || true)"$'\n'
  achados+="$(printf '%s\n' "$linhas" | grep -iE -- '--arg(json)?[[:space:]]+[a-z_][a-z0-9_]*[[:space:]]+"?\$\{?[a-z0-9_]*(pass|senha|token|jwt|secret|segredo|pwd|chave|key)' || true)"$'\n'
  achados+="$(printf '%s\n' "$linhas" | grep -E '(^|[^[:alnum:]_])jq[[:space:]]' | grep -E -- '--(json)?args([[:space:]]|$)' || true)"$'\n'
  # R3: curl/wget/contêiner-curl com corpo/credencial no argv: -d, --data*,
  # --json, -u, --user, --proxy-user, --oauth2-bearer, --form-string, -F/--form
  # de campo com nome de credencial ou "Env", --post-data/--body-data e
  # --password/--http-password do wget. ALLOWLIST: `--data @-` (corpo lido de
  # stdin, sem segredo no argv) e `tr -d` (não é curl). Chamadas por
  # curl_portainer não entram: usam --body/--form-env, cujo valor vai para o
  # stdin.
  achados+="$(printf '%s\n' "$linhas" \
    | grep -E '(^|[^[:alnum:]_])(curl|wget)([[:space:]]|$)|ENCHA_CURL_IMAGE' \
    | sed -E 's/tr -d +[^ ]+//g; s/--data @-//g' \
    | grep -iE '[[:space:]](-d|-u|--user|--proxy-user|--data[a-z-]*|--json|--oauth2-bearer|--form-string|--post-data|--body-data|--password|--http-password)[[:space:]=]|[[:space:]](-F|--form)[[:space:]]+"?[a-z_]*(env|pass|senha|token|secret|segredo|jwt|chave|key)[a-z_]*=' || true)"$'\n'
  # R5: variável que carrega credencial do Portainer/painel/GHCR/licença
  # (lista abaixo — acrescente aqui toda variável nova desse tipo) usada numa
  # linha que chama comando EXTERNO (processo novo, argv público) fora das
  # formas seguras. Formas seguras, removidas antes do teste: argumentos de
  # portainer_json_login/curl_portainer_escapar (funções do shell), valores de
  # --token/--body/--form-env do curl_portainer (vão ao stdin), atribuição —
  # inclusive o prefixo `VAR="$x" cmd`, que vira AMBIENTE do processo, não
  # argv — e `printf '...' "$x" |` / `echo "$x" |` (builtins alimentando stdin).
  # Pega o que as outras regras não enxergam: `docker exec -e SENHA="$x"`,
  # `docker service update --env-add "...=$x"`, `htpasswd -nb u "$x"`, etc.
  local segredos='pass_portainer|pass_painel|SENHA|senha|GHCR_TOKEN|TOKEN|token|token_admin|novo_token|JSON_PAYLOAD|json_payload|reg_payload|env_json|body|panel_pass_val|panel_pass_env_val|sp_env_val|stacks_json|current_env_json|chave_licenca|AUTH_JSON'
  local externos='curl|wget|docker|jq|sshpass|htpasswd|openssl|python3?|node|psql|mysql|mongosh|redis-cli|sudo|env|xargs|ssh|git|mc|nsenter|setpriv|su|runuser|bash|sh'
  achados+="$(printf '%s\n' "$linhas" \
    | sed -E \
        -e 's/(portainer_json_login|curl_portainer_escapar)([[:space:]]+"[^"]*")*//g' \
        -e 's/--(token|body|form-env)[[:space:]]+"[^"]*"//g' \
        -e 's/\$\{[A-Za-z_][A-Za-z0-9_]*:-//g' \
        -e 's/(^|\$\(|[;|&(]|[[:digit:]]+[[:space:]])[[:space:]]*((local|export|readonly)[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*="[^"]*"[[:space:]]*)+/\1 /g' \
        -e "s/(printf[[:space:]]+'[^']*'|echo)([[:space:]]+-[a-zA-Z]+)?[[:space:]]+\"[^\"]*\"[[:space:]]*\\|//g" \
    | grep -E "(^|[^[:alnum:]_./-])($externos)([[:space:]]|\$)" \
    | grep -E "\\\$\\{?($segredos)\\}?([^A-Za-z0-9_]|\$)" || true)"$'\n'
  # R4: chave JSON "password" (literal "password" ou `{...,password:`) numa
  # linha que monta JSON via jq/curl sem ler de env.X. ALLOWLIST:
  # portainer_json_login (`password:env.P`) e o corpo do registry
  # (`Password:env.P`). Nomes de variável como pass_portainer não casam.
  achados+="$(printf '%s\n' "$linhas" | grep -E '(jq|curl)' \
    | grep -iE '"password"|\\"password\\"|[{,][[:space:]]*password[[:space:]]*:' \
    | grep -viE 'password:env\.' || true)"$'\n'
  achados="$(printf '%s' "$achados" | sed '/^$/d')"
  if [ -z "$achados" ]; then
    ok "varredura estática: $arq sem segredo em argv de curl/docker/jq"
  else
    falha "varredura estática: $arq tem padrão que põe segredo no argv:"
    printf '%s\n' "$achados" | cut -c1-220
  fi
}
varre secondary.sh
varre main.sh

# ============================================================
# (c1) JSON de login válido para senha com aspas, barra, $, crase, tab, nl.
# ============================================================
export PATH="$BINDIR:$PATH"
eval "$(extrair_funcao portainer_json_login)"
: > "$ARGV_LOG"
for senha in "$SENHA_PORTAINER" $'a"b\\c $x `y` \'z\' ;&|\ttab\nnl é ü' '\\' '"'; do
  json="$(portainer_json_login 'us"r' "$senha")"
  if [ "$(printf '%s' "$json" | "$JQ_REAL" -r .password; echo x)" = "$senha"$'\n'x ] \
     && [ "$(printf '%s' "$json" | "$JQ_REAL" -r .username)" = 'us"r' ]; then
    ok "portainer_json_login: JSON válido e senha idêntica ao voltar (${#senha} bytes)"
  else
    falha "portainer_json_login: senha não sobreviveu ao JSON: $json"
  fi
done
grep -q -- "$MARCA" "$ARGV_LOG" && falha "portainer_json_login: senha apareceu no argv do jq" \
  || ok "portainer_json_login: senha não apareceu no argv do jq (vai por env)"
# a versão antiga (--arg) reproduzia o vazamento: prova de que o teste enxerga
: > "$ARGV_LOG"; jq -nc --arg u x --arg p "$SENHA_PORTAINER" '{username:$u,password:$p}' >/dev/null
grep -q -- "$MARCA" "$ARGV_LOG" && ok "controle: 'jq --arg p' deixaria a senha no argv (o teste detecta)" \
  || falha "controle: o falso de jq não registrou o argv com --arg — teste cego"

# ============================================================
# (c2) round-trip do escape pelo curl REAL (não pelo decodificador do teste).
# ============================================================
if command -v python3 >/dev/null 2>&1; then
  cat > "$WORK/eco.py" <<'PYEOF'
import http.server, json, socketserver, sys
class H(http.server.BaseHTTPRequestHandler):
    def _do(self):
        n = int(self.headers.get('Content-Length') or 0)
        corpo = self.rfile.read(n).decode('utf-8', 'replace')
        out = json.dumps({"auth": self.headers.get("Authorization"), "body": corpo}).encode()
        self.send_response(200); self.send_header("Content-Length", str(len(out))); self.end_headers(); self.wfile.write(out)
    do_POST = do_PUT = do_GET = _do
    def log_message(self, *a): pass
class S(http.server.ThreadingHTTPServer):
    # server_bind padrão faz getfqdn() (DNS reverso, segundos nesta máquina).
    def server_bind(self):
        socketserver.TCPServer.server_bind(self)
        self.server_name = 'localhost'; self.server_port = self.server_address[1]
srv = S(('127.0.0.1', 0), H)
open(sys.argv[1], 'w').write(str(srv.server_address[1]))
srv.serve_forever()
PYEOF
  python3 "$WORK/eco.py" "$WORK/porta" >/dev/null 2>&1 &
  SRV_PID=$!
  for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do [ -s "$WORK/porta" ] && break; sleep 0.25; done
  PORTA="$(cat "$WORK/porta" 2>/dev/null)"
  if [ -n "$PORTA" ]; then
    # usa o curl REAL, sem os falsos (PATH original)
    PATH_SEM_FALSOS="${PATH#"$BINDIR":}"
    eval "$(extrair_funcao curl_portainer_escapar)"; eval "$(extrair_funcao curl_portainer)"
    corpo_grande="$(head -c 30000 /dev/zero | tr '\0' 'x')"
    for corpo in "$(portainer_json_login 'us"r' "$SENHA_PORTAINER")" \
                 $'linha1\nlinha2\r\n\ttab \\ barra "aspas" \v fim' \
                 "$corpo_grande"; do
      tokenx=$'tok"en\\com$especiais'
      resp="$(PATH="$PATH_SEM_FALSOS" curl_portainer --token "$tokenx" --body "$corpo" -- \
        -s -X POST -H 'Content-Type: application/json' "http://127.0.0.1:$PORTA/x")"
      if [ "$(printf '%s' "$resp" | "$JQ_REAL" -r '.auth')" = "Bearer $tokenx" ] \
         && [ "$(printf '%s' "$resp" | "$JQ_REAL" -r '.body'; echo x)" = "$corpo"$'\n'x ]; then
        ok "curl real: header e corpo (${#corpo} bytes) chegam idênticos pelo config em stdin"
      else
        falha "curl real: header/corpo não fizeram round-trip (corpo ${#corpo} bytes): $(printf '%s' "$resp" | cut -c1-200)"
      fi
    done
    # curl_portainer_http (S2, commit 2): código e corpo capturados no host.
    eval "$(extrair_funcao curl_portainer_http)"
    PATH="$PATH_SEM_FALSOS" curl_portainer_http --token T1 --body '{"a":1}' -- \
      -s -X POST -H 'Content-Type: application/json' "http://127.0.0.1:$PORTA/x"
    if [ "$PORTAINER_HTTP_CODE" = "200" ] \
       && [ "$(printf '%s' "$PORTAINER_HTTP_BODY" | "$JQ_REAL" -r .body)" = '{"a":1}' ]; then
      ok "curl real: curl_portainer_http separa código (200) e corpo no host"
    else
      falha "curl real: curl_portainer_http: código='$PORTAINER_HTTP_CODE' corpo='$PORTAINER_HTTP_BODY'"
    fi
    PATH="$PATH_SEM_FALSOS" curl_portainer_http -- -s "http://127.0.0.1:1/x"
    [ "$PORTAINER_HTTP_CODE" = "000" ] && ok "curl real: conexão recusada devolve código 000" \
      || falha "curl real: conexão recusada deveria dar 000, deu '$PORTAINER_HTTP_CODE'"
  else
    echo "⚠️  servidor de eco não subiu — round-trip pelo curl real PULADO"
  fi
else
  echo "⚠️  python3 ausente — round-trip pelo curl real PULADO"
fi

echo
if [ "$falhas" -eq 0 ]; then
  echo "✅ todos os testes de credencial-fora-do-argv passaram"
  exit 0
fi
echo "❌ $falhas falha(s)"
exit 1
