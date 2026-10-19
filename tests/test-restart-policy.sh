#!/bin/bash
# Incidente de 16/10/2026: `restart_policy: on-failure` + Postgres que sai com
# exit 0 no shutdown da VPS = task "Complete", nunca religada; e `max_attempts`
# no app esgotava as tentativas. Regra única de todo serviço de vida longa que
# este repo instala:
#   - restart_policy.condition: any
#   - sem max_attempts
#   - banco (volume em /var/lib/postgresql/data) nunca com order: start-first.
# Jobs de uma execução (replicated-job/global-job, condition: none) ficam de fora.
#
# Este teste cobre os textos que o vitest (src/lib/stacks/restart-policy-
# templates.test.ts) NÃO enxerga: os heredocs de secondary.sh.
#   1. o enchat.yaml da opção 84 (ferramenta_enchat);
#   2. o heredoc fallback do docker-stack.yaml do painel (espelho);
#   3. o golden da 84 e o docker-stack.yaml rastreado.
# Depois aplica as mutações do plano sobre cópias e exige que o detector as
# pegue — sem isso o verde acima seria decorativo.
#
# Roda com: bash tests/test-restart-policy.sh
set -u
cd "$(dirname "$0")/.." || exit 1

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Imprime uma violação por linha ("servico: motivo"); vazio = conforme.
violacoes() {
  awk '
    function fecha() {
      if (nome == "") return
      if (ehjob) { nome = ""; return }
      if (!temrp) print nome ": sem restart_policy"
      else {
        if (cond != "any") print nome ": condition diferente de any (" cond ")"
        if (maxatt) print nome ": max_attempts"
      }
      if (banco && startfirst) print nome ": banco com order: start-first"
      nome = ""
    }
    /^services:[[:space:]]*$/ { em = 1; next }
    em && /^[A-Za-z]/ { fecha(); em = 0 }
    !em { next }
    /^  [A-Za-z0-9_-]+:[[:space:]]*$/ {
      fecha()
      nome = $1; sub(/:$/, "", nome)
      ehjob = 0; temrp = 0; cond = ""; maxatt = 0; banco = 0; startfirst = 0; emrp = 0; nserv++
      next
    }
    nome == "" { next }
    /^[[:space:]]*#/ { next }
    /mode:[[:space:]]*(replicated-job|global-job)/ { ehjob = 1 }
    /condition:[[:space:]]*none([[:space:]]|$)/ { ehjob = 1 }
    /\/var\/lib\/postgresql\/data/ { banco = 1 }
    /order:[[:space:]]*start-first/ { startfirst = 1 }
    /^      restart_policy:[[:space:]]*$/ { temrp = 1; emrp = 1; next }
    emrp && /^        [^ ]/ {
      if ($1 == "condition:") cond = $2
      if ($1 == "max_attempts:") maxatt = 1
      next
    }
    emrp { emrp = 0 }
    END { fecha(); if (nserv == 0) print "nenhum serviço encontrado" }
  ' "$1"
}

checar() { # $1 = rótulo, $2 = arquivo
  local v
  v="$(violacoes "$2")"
  if [ -z "$v" ]; then ok "$1: restart_policy any, sem max_attempts, banco sem start-first"
  else falha "$1 fora da regra:"; printf '%s\n' "$v" | sed 's/^/    /'; fi
}

# ── 1. enchat.yaml da opção 84 ──────────────────────────────────────────
awk '
  /^ferramenta_enchat\(\)\{/ { f = 1 }
  f && /^  cat > enchat.yaml <<EOL$/ { p = 1; next }
  p && /^EOL$/ { exit }
  p { print }
' secondary.sh > "$TMP/enchat-84.yaml"
[ -s "$TMP/enchat-84.yaml" ] || { echo "❌ FALHOU: heredoc do enchat.yaml não encontrado em ferramenta_enchat()"; exit 1; }
checar "heredoc da opção 84 (secondary.sh)" "$TMP/enchat-84.yaml"

# ── 2. espelho do docker-stack.yaml do painel ───────────────────────────
awk '
  /cat > "\$stack_template" <<.TEMPLATE.$/ { f = 1; next }
  f && /^TEMPLATE$/ { exit }
  f { print }
' secondary.sh > "$TMP/painel-espelho.yaml"
[ -s "$TMP/painel-espelho.yaml" ] || { echo "❌ FALHOU: heredoc TEMPLATE do painel não encontrado em secondary.sh"; exit 1; }
checar "espelho do painel (secondary.sh)" "$TMP/painel-espelho.yaml"

# ── 3. golden da 84 e docker-stack.yaml rastreado ───────────────────────
checar "golden da opção 84" tests/golden/enchat-84-formato-antigo.yaml
checar "encha-setup-panel/docker-stack.yaml" encha-setup-panel/docker-stack.yaml

# ── 4. mutações: o detector TEM que pegar cada uma ──────────────────────
# awk (não sed): `0,/re/` e `\n` na substituição não existem no sed do macOS.
muta() { # $1 = rótulo, $2 = arquivo-base, $3 = esperado (regex), $4 = programa awk
  local rotulo="$1" base="$2" esperado="$3" prog="$4"
  awk "$prog" "$base" > "$TMP/mutado.yaml"
  if cmp -s "$base" "$TMP/mutado.yaml"; then falha "mutação '$rotulo' não alterou o arquivo (padrão velho?)"; return; fi
  if violacoes "$TMP/mutado.yaml" | grep -Eq "$esperado"; then ok "mutação pega: $rotulo"
  else falha "mutação NÃO pega pelo detector: $rotulo"; fi
}

PRIMEIRO_ANY='!feito && /^        condition: any$/ { sub(/any/, "on-failure"); feito = 1 } { print }'
MAX_ATTEMPTS='{ print } /^        condition: any$/ { print "        max_attempts: 5" }'
START_FIRST_PG='/^  enchat_postgres:/ { pg = 1 } pg && /deploy:$/ { print; print "      update_config:"; print "        order: start-first"; pg = 0; next } { print }'

muta "um any volta a on-failure (heredoc da 84)" "$TMP/enchat-84.yaml" "condition diferente de any" "$PRIMEIRO_ANY"
muta "max_attempts: 5 no espelho do painel" "$TMP/painel-espelho.yaml" "panel: max_attempts" "$MAX_ATTEMPTS"
muta "max_attempts: 5 no docker-stack.yaml" encha-setup-panel/docker-stack.yaml "panel: max_attempts" "$MAX_ATTEMPTS"
muta "start-first no enchat_postgres (heredoc da 84)" "$TMP/enchat-84.yaml" "enchat_postgres: banco com order: start-first" "$START_FIRST_PG"
muta "on-failure no golden" tests/golden/enchat-84-formato-antigo.yaml "condition diferente de any" "$PRIMEIRO_ANY"

if [ "$falhas" -gt 0 ]; then
  echo "❌ FALHOU: $falhas verificação(ões) com problema"
  exit 1
fi
exit 0
