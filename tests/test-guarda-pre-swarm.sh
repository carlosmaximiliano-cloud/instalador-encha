#!/bin/bash
# Ciclo S1 (achado 5 da auditoria 2 de segurança): aplicar_guarda_pre_swarm
# (secondary.sh) aplica a tabela nftables "inet encha_guard" ANTES do
# "docker swarm init", para fechar a janela de ~2 min em que 2377/7946/4789
# ficam abertas à Internet até o serviço encha-guard do painel subir.
#
# Roda a função REAL (extraída de secondary.sh) com sudo/docker FALSOS no PATH
# que gravam o argv de cada chamada. Nada toca Docker ou nftables de verdade.
#
# Roda com: bash tests/test-guarda-pre-swarm.sh
set -u
cd "$(dirname "$0")/.." || exit 1
falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

extrair_funcao() {
  local nome="$1"
  awk -v alvo="$nome" '
    $0 ~ "^" alvo "\\(\\) \\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}

fn_guarda="$(extrair_funcao aplicar_guarda_pre_swarm)"
if [ -z "$fn_guarda" ]; then
  echo "❌ FALHOU: função aplicar_guarda_pre_swarm não encontrada em secondary.sh"
  exit 1
fi

# t() mínimo com o texto REAL de MSG_PT das chaves usadas.
t() {
  local nomevar="MSG_${1}"
  local template="${!nomevar}"
  [ -z "$template" ] && template="$1"
  printf '%s' "$template"
}
for chave in aplicar_guarda_pre_swarm_aplicando aplicar_guarda_pre_swarm_falha; do
  valor="$(grep -m1 "^MSG_PT\[$chave\]=" secondary.sh | sed -E "s/^MSG_PT\[$chave\]=//")"
  if [ -z "$valor" ]; then
    echo "❌ FALHOU: MSG_PT[$chave] não encontrada em secondary.sh"
    exit 1
  fi
  eval "MSG_${chave}=$valor"
done

BINDIR="$(mktemp -d)"
LOG="$BINDIR/docker.log"
trap 'rm -rf "$BINDIR"' EXIT

cat > "$BINDIR/sudo" <<'EOF2'
#!/bin/bash
exec "$@"
EOF2
# docker falso: grava um argumento por linha ("--" separa chamadas). Estado do
# Swarm em FAKE_SWARM; FAKE_PULL_FALHA=1 faz o pull falhar.
cat > "$BINDIR/docker" <<'EOF2'
#!/bin/bash
{ echo "--"; for a in "$@"; do printf '%s\n' "$a"; done; } >> "$DOCKER_LOG"
case "$1" in
  info) echo "${FAKE_SWARM:-inactive}"; exit 0 ;;
  pull) [ "${FAKE_PULL_FALHA:-0}" = 1 ] && exit 1; exit 0 ;;
  run)  exit 0 ;;
esac
exit 0
EOF2
chmod +x "$BINDIR/sudo" "$BINDIR/docker"
export PATH="$BINDIR:$PATH" DOCKER_LOG="$LOG"
export FAKE_SWARM FAKE_PULL_FALHA
ENCHA_VERSION="9.9.9"
unset ENCHA_PANEL_IMAGE_TAG
eval "$fn_guarda"

# --- (a) Swarm inativo: pull + run com as flags exatas -----------------------
: > "$LOG"; FAKE_SWARM=inactive; FAKE_PULL_FALHA=0
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_a" 2>&1; rc=$?
[ "$rc" -eq 0 ] && ok "(a) retorna 0" || falha "(a) retorno $rc, esperado 0"
img="ghcr.io/enchaaluno/setup-panel:9.9.9"
grep -qx "pull" "$LOG" && grep -qx "$img" "$LOG" && ok "(a) docker pull da imagem do painel na tag da versão" || falha "(a) docker pull $img não chamado"
run="$(awk '/^--$/{if(b ~ /^run/)print b; b=""; next}{b=b (b==""?"":" ") $0}END{if(b ~ /^run/)print b}' "$LOG")"
[ -n "$run" ] && ok "(a) docker run chamado" || falha "(a) docker run não chamado"
for flag in "--rm" "--network host" "--user 0" "--cap-drop ALL" "--cap-add NET_ADMIN" "-e ENCHA_GUARD_PEERS=203.0.113.7" "--entrypoint sh $img" "-c /usr/local/bin/encha-guard --render | nft -f -"; do
  case "$run" in
    *"$flag"*) ok "(a) run contém: $flag" ;;
    *) falha "(a) run sem '$flag' — argv: $run" ;;
  esac
done
n_run="$(grep -c '^run$' "$LOG")"
[ "$n_run" -eq 1 ] && ok "(a) docker run exatamente UMA vez" || falha "(a) docker run chamado $n_run vezes"

# ENCHA_PANEL_IMAGE_TAG tem precedência sobre ENCHA_VERSION
: > "$LOG"; ENCHA_PANEL_IMAGE_TAG="sha-abc" aplicar_guarda_pre_swarm "203.0.113.7" >/dev/null 2>&1
grep -qx "ghcr.io/enchaaluno/setup-panel:sha-abc" "$LOG" && ok "(a) ENCHA_PANEL_IMAGE_TAG sobrescreve a tag" || falha "(a) tag de teste ignorada"

# --- (b) Swarm ativo: nenhum pull/run ---------------------------------------
: > "$LOG"; FAKE_SWARM=active
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_b" 2>&1; rc=$?
[ "$rc" -eq 0 ] && ok "(b) retorna 0" || falha "(b) retorno $rc"
if grep -qx "run" "$LOG" || grep -qx "pull" "$LOG"; then
  falha "(b) Swarm ativo mas houve docker pull/run"
else
  ok "(b) Swarm ativo: nenhum docker pull/run"
fi

# --- (c) pull falha: retorna 0, avisa, não roda ------------------------------
: > "$LOG"; FAKE_SWARM=inactive; FAKE_PULL_FALHA=1
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_c" 2>&1; rc=$?
[ "$rc" -eq 0 ] && ok "(c) pull falhou: retorna 0 (não aborta a instalação)" || falha "(c) retorno $rc, esperado 0"
grep -q "Não foi possível aplicar o guarda" "$BINDIR/out_c" && ok "(c) imprime aviso" || falha "(c) sem aviso: $(cat "$BINDIR/out_c")"
grep -qx "run" "$LOG" && falha "(c) docker run chamado apesar do pull falhar" || ok "(c) docker run não chamado"

# (c2) docker ausente / run falha também não abortam
: > "$LOG"; FAKE_PULL_FALHA=0
cat > "$BINDIR/docker" <<'EOF2'
#!/bin/bash
case "$1" in info) echo inactive; exit 0 ;; pull) exit 0 ;; run) exit 1 ;; esac
exit 0
EOF2
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_c2" 2>&1; rc=$?
[ "$rc" -eq 0 ] && grep -q "Não foi possível aplicar o guarda" "$BINDIR/out_c2" \
  && ok "(c2) run/nft falhou: retorna 0 e avisa" || falha "(c2) rc=$rc out=$(cat "$BINDIR/out_c2")"

# --- (d) estático: chamada ANTES do swarm init nas duas funções -------------
for fn in ferramenta_traefik_e_portainer instalar_traefik_e_portainer; do
  corpo="$(extrair_funcao "$fn")"
  l_guarda="$(printf '%s\n' "$corpo" | grep -n '^[[:space:]]*aplicar_guarda_pre_swarm "\$ip"' | head -1 | cut -d: -f1)"
  l_init="$(printf '%s\n' "$corpo" | grep -n 'docker swarm init' | head -1 | cut -d: -f1)"
  if [ -z "$l_guarda" ] || [ -z "$l_init" ]; then
    falha "(d) $fn: chamada ($l_guarda) ou swarm init ($l_init) não encontrado"
  elif [ "$l_guarda" -lt "$l_init" ]; then
    ok "(d) $fn: aplicar_guarda_pre_swarm (linha $l_guarda) antes do swarm init (linha $l_init)"
  else
    falha "(d) $fn: aplicar_guarda_pre_swarm (linha $l_guarda) NÃO vem antes do swarm init (linha $l_init)"
  fi
done
n_init="$(grep -v '^[[:space:]]*#' secondary.sh | grep -c 'docker swarm init')"
n_call="$(grep -c '^[[:space:]]*aplicar_guarda_pre_swarm "\$ip"' secondary.sh)"
[ "$n_init" -eq "$n_call" ] && ok "(d) toda chamada de swarm init ($n_init) tem a chamada do guarda antes" || falha "(d) swarm init=$n_init mas chamadas do guarda=$n_call"

# --- (e) nftables nunca é instalado no host ---------------------------------
if grep -nE '(apt-get|apt|dpkg|yum|dnf|apk)[^#]*(install|add)[^#]*[[:space:]]nftables([[:space:]]|$)' secondary.sh main.sh | grep -v '^\s*#' | grep -q .; then
  falha "(e) há instalação do pacote nftables no host"
else
  ok "(e) nenhuma instalação do pacote nftables em main.sh/secondary.sh"
fi
if printf '%s\n' "$fn_guarda" | grep -qE 'apt|install'; then
  falha "(e) aplicar_guarda_pre_swarm contém apt/install"
else
  ok "(e) aplicar_guarda_pre_swarm não usa apt/install"
fi

echo
if [ "$falhas" -eq 0 ]; then echo "Tudo certo."; exit 0; else echo "$falhas falha(s)."; exit 1; fi
