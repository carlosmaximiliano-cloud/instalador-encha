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
  # Só responde o estado quando pedem EXATAMENTE .Swarm.LocalNodeState — ler
  # outro campo (ex.: .Swarm.NodeID) daria um valor que nunca é "active".
  info) case "$*" in
          *"--format {{.Swarm.LocalNodeState}}"*) echo "${FAKE_SWARM:-inactive}" ;;
          *) echo "campo-inesperado" ;;
        esac
        exit 0 ;;
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

# (b2) Nó já membro de um Swarm mas não "active" (locked = autolock após
# reinício; pending = entrando; error): a tabela pré-swarm só teria o IP deste
# nó como par e, aplicada por cima da do serviço, descartaria o 2377/7946/4789
# dos OUTROS nós do cluster. Só "inactive" (ou docker sem resposta) age.
for estado in locked pending error; do
  : > "$LOG"; FAKE_SWARM="$estado"
  aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_b2" 2>&1; rc=$?
  if [ "$rc" -eq 0 ] && ! grep -qx "run" "$LOG" && ! grep -qx "pull" "$LOG"; then
    ok "(b2) Swarm '$estado': nenhum docker pull/run"
  else
    falha "(b2) Swarm '$estado' (rc=$rc): a função agiu num nó que já é membro de um Swarm"
  fi
done

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

# --- (f) comportamento do "-c" de verdade: guarda REAL + nft falso ----------
# O docker falso executa a string do "-c" com o script REAL do guarda
# (encha-setup-panel/guard/encha-guard.sh no lugar de /usr/local/bin/encha-
# guard), só com as env vars passadas por "-e" (como no contêiner), e um nft
# falso que grava cada ruleset recebido e recusa o que contém NFT_RECUSA.
GUARD_REAL="$PWD/encha-setup-panel/guard/encha-guard.sh"
NFT_LOG="$BINDIR/nft.log"
cat > "$BINDIR/docker" <<'EOF2'
#!/bin/bash
case "$1" in
  info) echo inactive; exit 0 ;;
  pull) exit 0 ;;
  run)
    shift
    envs=(); script=""
    while [ $# -gt 0 ]; do
      case "$1" in
        -e) envs+=("$2"); shift 2 ;;
        -c) script="$2"; shift 2 ;;
        *) shift ;;
      esac
    done
    rep="sh '$GUARD_REAL'"
    script="${script//\/usr\/local\/bin\/encha-guard/$rep}"
    exec env -i PATH="$PATH" NFT_LOG="$NFT_LOG" NFT_RECUSA="$NFT_RECUSA" ${envs[@]+"${envs[@]}"} sh -c "$script"
    ;;
esac
exit 0
EOF2
cat > "$BINDIR/nft" <<'EOF2'
#!/bin/bash
entrada="$(cat)"
{ echo "=== nft $*"; printf '%s\n' "$entrada"; } >> "$NFT_LOG"
if [ -n "$NFT_RECUSA" ] && printf '%s' "$entrada" | grep -q "$NFT_RECUSA"; then
  echo "=== RECUSADO" >> "$NFT_LOG"; exit 1
fi
echo "=== ACEITO" >> "$NFT_LOG"; exit 0
EOF2
chmod +x "$BINDIR/docker" "$BINDIR/nft"
export GUARD_REAL NFT_LOG NFT_RECUSA
# Ruleset do último "nft -f -" aceito.
ultimo_aceito() {
  awk '/^=== nft /{b=""; next} /^=== ACEITO$/{a=b; next} /^=== RECUSADO$/{next} {b=b $0 "\n"} END{printf "%s", a}' "$NFT_LOG"
}

# (f1) kernel aceita tudo: UMA aplicação, completa, com o par.
: > "$NFT_LOG"; NFT_RECUSA=""
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_f1" 2>&1; rc=$?
n_nft="$(grep -c '^=== nft ' "$NFT_LOG")"
aceito="$(ultimo_aceito)"
if [ "$rc" -eq 0 ] && [ "$n_nft" -eq 1 ] \
   && printf '%s' "$aceito" | grep -q 'elements = { 203.0.113.7 }' \
   && printf '%s' "$aceito" | grep -q 'tcp dport { 2377, 7946 } counter drop' \
   && ! grep -q "Não foi possível aplicar o guarda" "$BINDIR/out_f1"; then
  ok "(f1) nft aceita: ruleset completo (par 203.0.113.7 + drops) aplicado uma vez, sem aviso"
else
  falha "(f1) rc=$rc n_nft=$n_nft out=$(cat "$BINDIR/out_f1") nft.log=$(cat "$NFT_LOG")"
fi

# (f2) kernel recusa o limite de SSH (set dinâmico com limit — o próprio
# serviço encha-guard cai na versão mínima nesse caso): as portas do Swarm
# NÃO podem ficar abertas por causa de uma mitigação de SSH.
: > "$NFT_LOG"; NFT_RECUSA="ssh_limite"
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_f2" 2>&1; rc=$?
aceito="$(ultimo_aceito)"
if [ "$rc" -eq 0 ] \
   && printf '%s' "$aceito" | grep -q 'tcp dport { 2377, 7946 } counter drop' \
   && printf '%s' "$aceito" | grep -q 'udp dport { 4789, 7946 } counter drop' \
   && ! printf '%s' "$aceito" | grep -q 'ssh_limite'; then
  ok "(f2) nft recusa o limite de SSH: aplica a versão mínima (drops do Swarm)"
else
  falha "(f2) nft recusou o limite de SSH e nenhuma versão com os drops do Swarm foi aplicada — nft.log: $(cat "$NFT_LOG")"
fi

# (f3) nft recusa tudo (sem nf_tables no kernel): avisa e segue.
: > "$NFT_LOG"; NFT_RECUSA="encha_guard"
aplicar_guarda_pre_swarm "203.0.113.7" > "$BINDIR/out_f3" 2>&1; rc=$?
[ "$rc" -eq 0 ] && grep -q "Não foi possível aplicar o guarda" "$BINDIR/out_f3" \
  && ok "(f3) nft recusa tudo: retorna 0 e avisa" || falha "(f3) rc=$rc out=$(cat "$BINDIR/out_f3")"

# --- (d) estático: chamada ANTES do swarm init nas duas funções -------------
# As três linhas (ignorando comentário/linha em branco) têm de ser VIZINHAS e
# nesta ordem: ip=$(hostname -I ...) -> aplicar_guarda_pre_swarm "$ip" ->
# docker swarm init --advertise-addr "$ip". Assim o guarda recebe o MESMO IP
# do init (nunca um "ip" ainda não calculado) e não fica dentro de um if/
# desvio que o pule.
for fn in ferramenta_traefik_e_portainer instalar_traefik_e_portainer; do
  corpo="$(extrair_funcao "$fn" | grep -vE '^[[:space:]]*(#|$)')"
  l_ip="$(printf '%s\n' "$corpo" | grep -n '^[[:space:]]*ip=\$(hostname -I' | head -1 | cut -d: -f1)"
  l_guarda="$(printf '%s\n' "$corpo" | grep -n '^[[:space:]]*aplicar_guarda_pre_swarm "\$ip"[[:space:]]*$' | head -1 | cut -d: -f1)"
  l_init="$(printf '%s\n' "$corpo" | grep -n '^[[:space:]]*sudo docker swarm init --advertise-addr "\$ip"' | head -1 | cut -d: -f1)"
  if [ -z "$l_ip" ] || [ -z "$l_guarda" ] || [ -z "$l_init" ]; then
    falha "(d) $fn: ip= ($l_ip), chamada do guarda ($l_guarda) ou swarm init --advertise-addr \"\$ip\" ($l_init) não encontrado"
  elif [ "$l_guarda" -eq $((l_ip + 1)) ] && [ "$l_init" -eq $((l_guarda + 1)) ]; then
    ok "(d) $fn: ip= -> aplicar_guarda_pre_swarm \"\$ip\" -> swarm init, vizinhas e nessa ordem"
  else
    falha "(d) $fn: esperado ip= ($l_ip), guarda ($l_guarda), swarm init ($l_init) em linhas vizinhas e nessa ordem"
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
