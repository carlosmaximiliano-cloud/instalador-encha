#!/bin/bash
# Ciclo painel-portas-banco: o Docker fura o UFW, então porta publicada num
# compose do instalador é porta aberta para a internet. Este teste cobre os
# heredocs de compose do secondary.sh (o vitest portas-publicadas.test.ts cobre
# os templates do painel). Só as portas da ALLOWLIST, exatas e com protocolo,
# podem aparecer em um bloco `ports:` ativo (traefik 80/443, azuracast 2022 e
# 8005, rustdesk 21115, 21116/udp, 21118/udp). Qualquer outra falha com a porta
# e a linha: MySQL (3306), MongoDB (27017) e Qdrant (6333...) não publicam.
#
# Também prova que o detector pega: uma amostra com porta de banco TEM que
# ser acusada, e uma amostra com as portas permitidas não.
#
# Roda com: bash tests/test-portas-banco.sh
set -u
cd "$(dirname "$0")/.." || exit 1

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

ALLOWLIST="80/tcp 443/tcp 2022/tcp 8005/tcp 21115/tcp 21116/udp 21118/udp"

# Imprime uma violação por linha ("porta publicada X (linha N)"); vazio = conforme.
violacoes() {
  awk -v allow="$ALLOWLIST" '
    BEGIN { n = split(allow, a, " "); for (i = 1; i <= n; i++) ok[a[i]] = 1 }
    function confere(pub, proto, lin) {
      if (pub == "") return
      chave = pub "/" (proto == "" ? "tcp" : proto)
      if (!(chave in ok)) print "porta publicada " pub " (" chave ") fora da allowlist (linha " lin ")"
    }
    function flush() { if (pend != "") confere(pend, pproto, plin); pend = ""; pproto = "tcp" }
    {
      linha = $0
      t = linha; sub(/^[[:space:]]+/, "", t)
      ind = length(linha) - length(t)
      if (em) {
        if (t == "" || t ~ /^#/) next
        if (ind <= recuo && t !~ /^-/) { flush(); em = 0 }
        else if (t ~ /^-[[:space:]]+(target|published|protocol|mode):/ || t ~ /^(target|published|protocol|mode):/) {
          if (t ~ /^-/) flush()
          sub(/^-[[:space:]]+/, "", t)
          if (t ~ /^published:/) { v = t; sub(/^published:[[:space:]]*/, "", v); gsub(/["\047]/, "", v); pend = v; plin = NR }
          if (t ~ /^protocol:/) { v = t; sub(/^protocol:[[:space:]]*/, "", v); pproto = v }
          next
        } else if (t ~ /^-/) {
          flush()
          v = t; sub(/^-[[:space:]]+/, "", v); sub(/[[:space:]]+#.*$/, "", v); gsub(/["\047]/, "", v)
          proto = "tcp"
          if (v ~ /\//) { proto = v; sub(/^.*\//, "", proto); sub(/\/.*$/, "", v) }
          np = split(v, p, ":")
          pub = (np == 1) ? p[1] : p[np - 1]
          confere(pub, proto, NR)
          next
        } else { flush(); em = 0 }
      }
      if (t ~ /^ports:[[:space:]]*$/) { em = 1; recuo = ind; pend = ""; pproto = "tcp" }
    }
    END { flush() }
  ' "$1"
}

# ── 1. o secondary.sh real ──────────────────────────────────────────────
v="$(violacoes secondary.sh)"
if [ -z "$v" ]; then ok "secondary.sh: nenhuma porta publicada fora da allowlist"
else falha "secondary.sh publica porta fora da allowlist:"; echo "$v" | sed 's/^/   /'; fi

# a allowlist cobre o que o instalador de fato publica (não pode estar vazia de efeito)
n="$(grep -cE '^[[:space:]]+ports:[[:space:]]*$' secondary.sh)"
[ "$n" -ge 4 ] && ok "secondary.sh tem $n blocos ports: ativos (traefik, azuracast, rustdesk...)" \
  || falha "esperava ao menos 4 blocos ports: ativos em secondary.sh, achei $n (a varredura sumiu?)"

# ── 2. o detector tem que pegar ─────────────────────────────────────────
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
printf '  svc:\n    ports:\n      - "3306:3306"\n      - "$((6333 + i * 10)):6333"\n      - "27017:27017" # nota\n' > "$TMP/ruim.yaml"
printf '  svc:\n    ports:\n      - 21115:21115\n      - 21116:21116/udp\n      - target: 80\n        published: 80\n        mode: host\n      #- 9999:9999\n    environment:\n      - A=1\n' > "$TMP/bom.yaml"
r="$(violacoes "$TMP/ruim.yaml")"
for p in 3306 6333 27017; do
  echo "$r" | grep -q "$p" && ok "o detector acusa a porta $p" || falha "o detector NÃO acusa a porta $p"
done
[ -z "$(violacoes "$TMP/bom.yaml")" ] && ok "o detector aceita a allowlist (e ignora comentário)" \
  || falha "o detector acusou porta permitida: $(violacoes "$TMP/bom.yaml")"

if [ "$falhas" -gt 0 ]; then
  echo "❌ FALHOU: $falhas verificação(ões) com problema"
  exit 1
fi
exit 0
