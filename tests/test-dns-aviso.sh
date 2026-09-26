#!/bin/bash
# Ciclo S3 (achado 7 da auditoria 2 de segurança): no teste real o operador
# digitou 'potainer.alunaencha.shop' (sem o "r", sem registro DNS); o
# instalador só validava o FORMATO, instalou tudo e anunciou no resumo final um
# endereço que nunca abre nem obtém certificado. Agora todo caminho que pede
# domínio chama checar_dns_dominio (secondary.sh), que só AVISA — nunca bloqueia
# — e o resumo final marca o endereço problemático (dns_marca_resumo, main.sh).
#
# Roda as funções REAIS (extraídas de secondary.sh/main.sh) com getent/curl
# FALSOS no PATH — nenhuma consulta de rede de verdade. Precisa de bash >= 4
# (arrays associativos, como o próprio instalador na VPS Debian/Ubuntu); no
# bash 3.2 do macOS o teste se reexecuta num contêiner debian:12.
#
# Roda com: bash tests/test-dns-aviso.sh
set -u
cd "$(dirname "$0")/.." || exit 1

if [ "${BASH_VERSINFO[0]}" -lt 4 ]; then
  if [ -z "${ENCHA_TEST_EM_DOCKER:-}" ] && command -v docker >/dev/null 2>&1; then
    echo "ℹ️  bash ${BASH_VERSION%%(*} < 4: reexecutando em debian:12 (Docker)"
    exec docker run --rm -e ENCHA_TEST_EM_DOCKER=1 -v "$PWD":/w -w /w debian:12 bash tests/test-dns-aviso.sh
  fi
  echo "❌ FALHOU: este teste precisa de bash >= 4 (ou Docker para reexecutar em debian:12)"
  exit 1
fi

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

# extrai `nome() {` … `}` (coluna 0) de um arquivo; aceita `nome(){` também.
extrair_funcao() {
  local nome="$1" arquivo="$2"
  awk -v alvo="$nome" '
    $0 ~ "^" alvo "\\(\\) ?\\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' "$arquivo"
}

exigir_funcao() {
  local nome="$1" arquivo="$2" corpo
  corpo="$(extrair_funcao "$nome" "$arquivo")"
  if [ -z "$corpo" ]; then
    echo "❌ FALHOU: função $nome não encontrada em $arquivo"
    exit 1
  fi
  printf '%s' "$corpo"
}

# --- funções reais ------------------------------------------------------------
fn_ip="$(exigir_funcao dns_ip_publico_vps secondary.sh)"
fn_estado="$(exigir_funcao dns_estado_dominio secondary.sh)"
fn_imprimir="$(exigir_funcao dns_imprimir_aviso secondary.sh)"
fn_checar="$(exigir_funcao checar_dns_dominio secondary.sh)"
fn_hosts="$(exigir_funcao dns_checar_hosts_da_stack secondary.sh)"
fn_validar="$(exigir_funcao validar_dominio secondary.sh)"
fn_marca="$(exigir_funcao dns_marca_resumo main.sh)"
fn_resumo="$(exigir_funcao mostrar_resumo_final main.sh)"
fn_t="$(exigir_funcao t secondary.sh)"

# Cores e catálogo REAIS (mesmas linhas dos arquivos).
for c in roxo azul ciano amarelo verde vermelho negrito reset cinza; do
  linha="$(grep -m1 -E "^$c=" main.sh)"
  [ -n "$linha" ] && eval "$linha"
done
declare -A MSG_PT MSG_EN MSG_ES
carregar_msg() { # <arquivo> <chave>: eval das 3 linhas MSG_PT/EN/ES[chave]=…
  local arq="$1" chave="$2" cat linha
  for cat in PT EN ES; do
    linha="$(grep -m1 "^MSG_$cat\[$chave\]=" "$arq")"
    if [ -z "$linha" ]; then
      echo "❌ FALHOU: MSG_$cat[$chave] não encontrada em $arq"
      exit 1
    fi
    eval "$linha"
  done
}
for chave in $(grep -oE '^MSG_PT\[dns_[a-z0-9_]+\]' secondary.sh | sed -E 's/^MSG_PT\[(.*)\]$/\1/'); do
  carregar_msg secondary.sh "$chave"
done
for chave in $(grep -oE '^MSG_PT\[mostrar_resumo_[a-z0-9_]+\]' main.sh | sed -E 's/^MSG_PT\[(.*)\]$/\1/'); do
  carregar_msg main.sh "$chave"
done

ENCHA_LANG=pt
eval "$fn_t"
eval "$fn_ip"
# todo helper dns_* de secondary.sh (inclusive os que vierem depois)
for nome_fn in $(grep -oE '^dns_[a-z0-9_]+\(\)' secondary.sh | tr -d '()'); do
  eval "$(exigir_funcao "$nome_fn" secondary.sh)"
done
eval "$fn_estado"
eval "$fn_imprimir"
eval "$fn_checar"
eval "$fn_hosts"
eval "$fn_validar"
eval "$fn_marca"
eval "$fn_resumo"
declare -gA DNS_ESTADO_CACHE DNS_IPS_CACHE DNS_AVISADO_CACHE

# --- ambiente falso -------------------------------------------------------------
BINDIR="$(mktemp -d)"
DNSDIR="$BINDIR/dns"; mkdir -p "$DNSDIR"
LOG_GETENT="$BINDIR/getent.log"
LOG_CURL="$BINDIR/curl.log"
trap 'rm -rf "$BINDIR"' EXIT

# getent falso: registra a chamada; devolve o conteúdo de $DNSDIR/<dominio>
# (formato real do `getent ahostsv4`: 3 linhas por IP) ou sai 2 (não achou).
# Um arquivo com "TIMEOUT" simula o exit 124 do `timeout`. `ahostsv6` lê
# $DNSDIR/<dominio>.v6 (registros AAAA), separado dos A.
cat > "$BINDIR/getent" <<'EOF2'
#!/bin/bash
echo "$*" >> "$FAKE_LOG_GETENT"
arq="$FAKE_DNSDIR/$2"
[ "$1" = ahostsv6 ] && arq="$arq.v6"
[ -f "$arq" ] || exit 2
if grep -qx TIMEOUT "$arq"; then exit 124; fi
rc_forcado="$(sed -n 's/^RC=//p' "$arq")"
[ -n "$rc_forcado" ] && exit "$rc_forcado"
while read -r ip; do
  printf '%s     STREAM %s\n%s     DGRAM  \n%s     RAW    \n' "$ip" "$2" "$ip" "$ip"
done < "$arq"
exit 0
EOF2
# curl falso: só o IP público da VPS (icanhazip); FAKE_CURL_FALHA=1 = sem rede.
# Imita uma VPS dual-stack de verdade (Hostinger, Hetzner, DO...): sem -4 o
# icanhazip responde pelo IPv6 (FAKE_IP_VPS6), como na VPS de teste real;
# com -4 responde o IPv4 (FAKE_IP_VPS) — ou falha, se ele estiver vazio (VPS
# só IPv6).
cat > "$BINDIR/curl" <<'EOF2'
#!/bin/bash
echo "$*" >> "$FAKE_LOG_CURL"
[ "${FAKE_CURL_FALHA:-0}" = 1 ] && exit 6
so4=0
for a in "$@"; do case "$a" in -4|--ipv4) so4=1 ;; esac; done
if [ "$so4" = 1 ]; then
  [ -n "${FAKE_IP_VPS:-}" ] || exit 7
  echo "$FAKE_IP_VPS"
else
  echo "${FAKE_IP_VPS6:-$FAKE_IP_VPS}"
fi
EOF2
# sshd falso: o resumo consulta `sshd -T`; sem saída = nenhum aviso de SSH.
cat > "$BINDIR/sshd" <<'EOF2'
#!/bin/bash
exit 0
EOF2
# hostname falso: `hostname -I` = IPs das interfaces desta máquina (IP privado
# atrás de NAT, bridges do Docker, IP flutuante...).
cat > "$BINDIR/hostname" <<'EOF2'
#!/bin/bash
echo "$*" >> "$FAKE_LOG_HOSTNAME"
[ "$1" = "-I" ] && echo "${FAKE_IPS_LOCAIS:-}"
exit 0
EOF2
chmod +x "$BINDIR/getent" "$BINDIR/curl" "$BINDIR/sshd" "$BINDIR/hostname"
export PATH="$BINDIR:$PATH"
export FAKE_LOG_GETENT="$LOG_GETENT" FAKE_LOG_CURL="$LOG_CURL" FAKE_DNSDIR="$DNSDIR"
export FAKE_LOG_HOSTNAME="$BINDIR/hostname.log" FAKE_IPS_LOCAIS="10.0.0.2 172.17.0.1"
export FAKE_IP_VPS="203.0.113.7" FAKE_IP_VPS6="2001:db8::7" FAKE_CURL_FALHA=0

# Stubs de tela usados pelo resumo (a função real chama clear/centralizar).
clear() { :; }
centralizar() { echo "$1"; }
PROTECAO_SSH_OK=1

reset_dns() {
  DNS_ESTADO_CACHE=(); DNS_IPS_CACHE=(); DNS_AVISADO_CACHE=()
  DNS_IP_PUBLICO_CONSULTADO=0; DNS_IP_PUBLICO_VPS=""
  : > "$LOG_GETENT"; : > "$LOG_CURL"
  FAKE_CURL_FALHA=0; FAKE_IP_VPS="203.0.113.7"; FAKE_IP_VPS6="2001:db8::7"
  FAKE_IPS_LOCAIS="10.0.0.2 172.17.0.1"; DNS_IPS_LOCAIS_CONSULTADO=0; DNS_IPS_LOCAIS_VPS=""
  rm -f "$DNSDIR"/*
}
n_getent() { grep -c '^ahostsv4 ' "$LOG_GETENT" || true; }   # resoluções (A)
n_getent_total() { grep -c . "$LOG_GETENT" || true; }        # qualquer consulta
n_curl() { grep -c . "$LOG_CURL" || true; }
sem_cor() { sed -E 's/\x1b\[[0-9;]*m//g' <<<"$1"; }

# --- (a) resolve para o IP da VPS: silêncio, retorno 0 -------------------------
reset_dns
echo "203.0.113.7" > "$DNSDIR/portainer.exemplo.com"
saida="$(checar_dns_dominio portainer.exemplo.com)"; rc=$?
[ -z "$saida" ] && ok "(a) domínio apontando para a VPS: nenhuma saída" || falha "(a) saída inesperada: $saida"
[ "$rc" -eq 0 ] && ok "(a) retorna 0" || falha "(a) retorno $rc"

# --- (b) não resolve: aviso com o domínio ---------------------------------------
reset_dns
saida="$(checar_dns_dominio potainer.exemplo.com)"; rc=$?
case "$saida" in
  *potainer.exemplo.com*"ainda não resolve"*) ok "(b) domínio sem DNS: aviso 'não resolve' com o domínio" ;;
  *) falha "(b) sem aviso de não resolve: '$saida'" ;;
esac
[ "$(printf '%s\n' "$saida" | grep -c .)" -eq 1 ] && ok "(b) exatamente UMA linha de aviso" || falha "(b) mais/menos de uma linha: $saida"
[ "$rc" -eq 0 ] && ok "(b) retorna 0 (nunca bloqueia)" || falha "(b) retorno $rc"
case "$saida" in *"Let's Encrypt"*"depois"*) ok "(b) explica o Let's Encrypt e que dá para corrigir depois" ;; *) falha "(b) texto sem Let's Encrypt/depois: $saida" ;; esac

# --- (c) resolve para outro IP: aviso 'aponta para' ------------------------------
reset_dns
echo "198.51.100.9" > "$DNSDIR/portainer.exemplo.com"
saida="$(checar_dns_dominio portainer.exemplo.com)"; rc=$?
case "$saida" in
  *"aponta para 198.51.100.9"*"203.0.113.7"*) ok "(c) outro IP: 'aponta para X' e o IP da VPS" ;;
  *) falha "(c) sem aviso de outro IP: '$saida'" ;;
esac
case "$saida" in *"ainda não resolve"*) falha "(c) usou a mensagem de 'não resolve'" ;; *) ok "(c) mensagem diferente da de 'não resolve'" ;; esac
case "$saida" in *"Cloudflare"*|*"proxy"*) ok "(c) texto neutro sobre proxy/CDN" ;; *) falha "(c) sem menção a proxy/CDN: $saida" ;; esac
# Com proxy/CDN o Let's Encrypt emite normalmente (o proxy repassa o desafio):
# o texto não pode dizer, sem ressalva, que só emite "quando aponta para cá".
case "$saida" in
  *"Cloudflare), isso é esperado. Se não"*) ok "(c) a exigência do Let's Encrypt vale só para quem NÃO usa proxy/CDN" ;;
  *) falha "(c) texto contradiz o caso proxy/CDN: $saida" ;;
esac
# vários IPs no aviso: separados por ", " (legível), não por "," colado
reset_dns
printf '198.51.100.9\n198.51.100.10\n' > "$DNSDIR/rr.exemplo.com"
saida="$(checar_dns_dominio rr.exemplo.com)"
case "$saida" in *"198.51.100.10, 198.51.100.9"*) ok "(c) vários IPs no aviso separados por ', '" ;; *) falha "(c) lista de IPs ilegível: $saida" ;; esac
# DNS recém-criado/alterado: o texto lembra da propagação, nos 3 idiomas
reset_dns
echo "198.51.100.9" > "$DNSDIR/errado.exemplo.com"
for par in "pt:propagação" "en:propagation" "es:propagación"; do
  ENCHA_LANG="${par%%:*}"; palavra="${par#*:}"
  DNS_AVISADO_CACHE=()
  s1="$(checar_dns_dominio sumiu.exemplo.com)"; s2="$(checar_dns_dominio errado.exemplo.com)"
  case "$s1" in *"$palavra"*) ok "(b) [$ENCHA_LANG] 'não resolve' cita a $palavra" ;; *) falha "(b) [$ENCHA_LANG] sem '$palavra': $s1" ;; esac
  case "$s2" in *"$palavra"*) ok "(c) [$ENCHA_LANG] 'outro IP' cita a $palavra" ;; *) falha "(c) [$ENCHA_LANG] sem '$palavra': $s2" ;; esac
done
ENCHA_LANG=pt
[ "$rc" -eq 0 ] && ok "(c) retorna 0" || falha "(c) retorno $rc"
# vários IPs (round-robin) e um deles é o da VPS: ok
reset_dns
printf '198.51.100.9\n203.0.113.7\n' > "$DNSDIR/portainer.exemplo.com"
saida="$(checar_dns_dominio portainer.exemplo.com)"
[ -z "$saida" ] && ok "(c) vários IPs, um é o da VPS: silêncio" || falha "(c) falso alarme com IP da VPS entre vários: $saida"

# --- (d) sem IP público (curl falha): silêncio, nem consulta o DNS ------------------
reset_dns; FAKE_CURL_FALHA=1
saida="$(checar_dns_dominio potainer.exemplo.com)"; rc=$?
[ -z "$saida" ] && [ "$rc" -eq 0 ] && ok "(d) IP público indisponível: silêncio, retorno 0" || falha "(d) saída/rc inesperados: '$saida' rc=$rc"
# getent chamado dentro de $( ) não conta o log? conta (arquivo) — confere:
[ "$(n_getent_total)" -eq 0 ] && ok "(d) sem IP público não consulta o DNS" || falha "(d) consultou o DNS sem ter o IP público"
# VPS só IPv6 (o icanhazip só responde IPv6; com -4 falha): 'indisponível'
reset_dns; FAKE_IP_VPS=""; FAKE_IP_VPS6="2001:db8::1"
saida="$(checar_dns_dominio potainer.exemplo.com)"
[ -z "$saida" ] && ok "(d) VPS sem IPv4 público: silêncio" || falha "(d) falso alarme sem IPv4 público: $saida"
# VPS dual-stack (o caso comum — a VPS de teste real): o icanhazip sem -4
# responde IPv6, e aí a checagem inteira ficava muda. O aviso TEM que sair.
reset_dns
saida="$(checar_dns_dominio potainer.exemplo.com)"
case "$saida" in
  *potainer.exemplo.com*"ainda não resolve"*) ok "(d) VPS dual-stack: IPv4 público obtido com -4, o aviso sai" ;;
  *) falha "(d) VPS dual-stack: checagem muda (IP público='$DNS_IP_PUBLICO_VPS'): '$saida'" ;;
esac
grep -qE '(^| )(-4|--ipv4)( |$)' "$LOG_CURL" && ok "(d) o IP público é pedido só por IPv4 (-4)" || falha "(d) curl do IP público sem -4: $(cat "$LOG_CURL")"
# resolvedor lento (timeout, exit 124): não é 'sem DNS'
reset_dns
echo TIMEOUT > "$DNSDIR/lento.exemplo.com"
saida="$(checar_dns_dominio lento.exemplo.com)"
[ -z "$saida" ] && ok "(d) resolução expirada (timeout): silêncio" || falha "(d) falso alarme por timeout: $saida"
# getent/timeout falhando por OUTRO motivo que não "domínio não existe" (só o
# exit 2 do getent significa isso): 127 = getent/timeout ausente, 126 = não
# executável, 125 = o próprio timeout falhou, 1/3 = uso/enumeração, 137 = morto.
# Nenhum é "domínio sem DNS": silêncio.
for rc_x in 1 3 125 126 127 137; do
  reset_dns
  echo "RC=$rc_x" > "$DNSDIR/quebrado.exemplo.com"
  saida="$(checar_dns_dominio quebrado.exemplo.com)"
  [ -z "$saida" ] && ok "(d) getent/timeout saiu $rc_x (não é 'não existe'): silêncio" || falha "(d) falso alarme com getent saindo $rc_x: $saida"
done
# domínio fora do formato: silêncio e nem chega ao getent
reset_dns
saida="$(checar_dns_dominio '-x.exemplo.com'; checar_dns_dominio 'a b.com'; checar_dns_dominio '')"
[ -z "$saida" ] && [ "$(n_getent_total)" -eq 0 ] && ok "(d) domínio inválido/vazio: silêncio, sem getent" || falha "(d) reagiu a domínio inválido: '$saida' getent=$(n_getent_total)"

# /etc/hosts com o hostname da VPS em loopback (Hostinger: "127.0.1.1
# srv721194.hstgr.cloud", visto na VPS de teste real — e esse hostname é um
# domínio público que muita gente usa). getent lê o /etc/hosts antes do DNS, e
# 127.0.1.1 não diz nada sobre o DNS público: silêncio, nunca "aponta para
# 127.0.1.1".
reset_dns
echo "127.0.1.1" > "$DNSDIR/srv123.hstgr.cloud"
saida="$(checar_dns_dominio srv123.hstgr.cloud)"
[ -z "$saida" ] && ok "(d) resolve só para loopback (/etc/hosts): silêncio" || falha "(d) falso alarme com loopback do /etc/hosts: $saida"
[ "${DNS_ESTADO_CACHE[srv123.hstgr.cloud]:-}" != "nao_resolve" ] || falha "(d) loopback virou 'não resolve'"
checar_dns_dominio srv123.hstgr.cloud >/dev/null
[ "$(dns_marca_resumo srv123.hstgr.cloud)" = "" ] && ok "(d) loopback: sem marca no resumo" || falha "(d) loopback marcado no resumo"
# loopback junto com um IP de verdade: o loopback nunca aparece no aviso
reset_dns
printf '127.0.1.1\n198.51.100.9\n' > "$DNSDIR/misto.exemplo.com"
saida="$(checar_dns_dominio misto.exemplo.com)"
case "$saida" in
  *127.0.1.1*) falha "(d) loopback citado no aviso: $saida" ;;
  *"aponta para 198.51.100.9"*) ok "(d) loopback + IP público: avisa só com o IP público" ;;
  *) falha "(d) loopback + outro IP sem aviso: '$saida'" ;;
esac

# Domínio só com AAAA (IPv6), sem registro A: `getent ahostsv4` não acha nada,
# mas dizer "ainda não resolve" é mentira — ele resolve, só não por IPv4. O
# aviso tem que ser o de "sem registro A", citando o IPv4 desta VPS.
reset_dns
echo "2001:db8::99" > "$DNSDIR/so6.exemplo.com.v6"
saida="$(checar_dns_dominio so6.exemplo.com)"; rc=$?
case "$saida" in
  *"ainda não resolve"*) falha "(d) AAAA sem A: aviso diz 'não resolve': $saida" ;;
  *so6.exemplo.com*"registro A"*"203.0.113.7"*) ok "(d) só AAAA: aviso de 'sem registro A (IPv4)' com o IPv4 da VPS" ;;
  *) falha "(d) só AAAA: aviso errado/ausente: '$saida'" ;;
esac
[ "$rc" -eq 0 ] && ok "(d) só AAAA: retorna 0" || falha "(d) só AAAA: retorno $rc"
checar_dns_dominio so6.exemplo.com >/dev/null
[ -n "$(dns_marca_resumo so6.exemplo.com)" ] && ok "(d) só AAAA: marcado no resumo" || falha "(d) só AAAA: sem marca no resumo"
# sem A e sem AAAA: continua 'não resolve'; com A: nem pergunta pelo AAAA
reset_dns
saida="$(checar_dns_dominio nada.exemplo.com)"
case "$saida" in *"ainda não resolve"*) ok "(d) sem A e sem AAAA: 'não resolve'" ;; *) falha "(d) sem A/AAAA: '$saida'" ;; esac
reset_dns
echo "203.0.113.7" > "$DNSDIR/tem4.exemplo.com"
checar_dns_dominio tem4.exemplo.com >/dev/null
grep -q '^ahostsv6 ' "$LOG_GETENT" && falha "(d) consultou AAAA de domínio que já tem A" || ok "(d) com registro A não consulta AAAA"

# IP flutuante/adicional configurado numa interface desta VPS: o icanhazip vê
# o IP principal (saída), o domínio aponta para o flutuante. É este servidor —
# silêncio. Os IPs locais só servem para "bate"; nunca viram "o IP desta VPS"
# no aviso (atrás de NAT o IP local é privado — o erro que o S3 removeu).
reset_dns; FAKE_IPS_LOCAIS="203.0.113.7 198.51.100.50 172.17.0.1"
echo "198.51.100.50" > "$DNSDIR/flutuante.exemplo.com"
saida="$(checar_dns_dominio flutuante.exemplo.com)"
[ -z "$saida" ] && ok "(d) domínio no IP flutuante desta VPS (em uma interface): silêncio" || falha "(d) falso alarme com IP flutuante local: $saida"
reset_dns
echo "198.51.100.9" > "$DNSDIR/errado.exemplo.com"
saida="$(checar_dns_dominio errado.exemplo.com)"
case "$saida" in
  *10.0.0.2*|*172.17.0.1*) falha "(d) IP privado/local exibido no aviso: $saida" ;;
  *"aponta para 198.51.100.9"*"203.0.113.7"*) ok "(d) IP local nunca aparece como 'IP desta VPS' no aviso" ;;
  *) falha "(d) aviso de outro IP ausente com IPs locais: '$saida'" ;;
esac
# sem IP público, o IP local NÃO vira referência: silêncio
reset_dns; FAKE_CURL_FALHA=1
echo "198.51.100.9" > "$DNSDIR/errado.exemplo.com"
saida="$(checar_dns_dominio errado.exemplo.com)"
[ -z "$saida" ] && ok "(d) sem IP público: IP local não substitui (silêncio)" || falha "(d) usou IP local no lugar do público: $saida"

# --- (e) cache: o mesmo domínio duas vezes = uma consulta -----------------------------
reset_dns
checar_dns_dominio potainer.exemplo.com > "$BINDIR/e1"
checar_dns_dominio potainer.exemplo.com > "$BINDIR/e2"
[ "$(n_getent)" -eq 1 ] && ok "(e) 2 chamadas do mesmo domínio = 1 getent" || falha "(e) getent chamado $(n_getent) vezes"
[ -s "$BINDIR/e1" ] && [ ! -s "$BINDIR/e2" ] && ok "(e) o aviso sai uma vez só por domínio (sem duplicar)" || falha "(e) aviso duplicado/ausente: 1ª=$(wc -c <"$BINDIR/e1") 2ª=$(wc -c <"$BINDIR/e2") bytes"
checar_dns_dominio --sempre potainer.exemplo.com > "$BINDIR/e3"
[ -s "$BINDIR/e3" ] && [ "$(n_getent)" -eq 1 ] && ok "(e) --sempre reimprime sem nova consulta" || falha "(e) --sempre: saída vazia ou nova consulta ($(n_getent))"
checar_dns_dominio outro.exemplo.com > /dev/null
[ "$(n_curl)" -eq 1 ] && ok "(e) IP público consultado uma vez só, para todos os domínios" || falha "(e) curl chamado $(n_curl) vezes"
[ "$(n_getent)" -eq 2 ] && ok "(e) domínio novo = nova consulta" || falha "(e) getent=$(n_getent), esperado 2"
# sem rede: a falha também é cacheada (não repete o timeout de 5 s a cada domínio)
reset_dns; FAKE_CURL_FALHA=1
checar_dns_dominio a.exemplo.com >/dev/null; checar_dns_dominio b.exemplo.com >/dev/null
[ "$(n_curl)" -eq 1 ] && ok "(e) falha ao obter o IP público também é cacheada" || falha "(e) curl repetido: $(n_curl) vezes"

# --- (h) NUNCA aborta o instalador (set -e) ------------------------------------------------
reset_dns
echo "198.51.100.9" > "$DNSDIR/errado.exemplo.com"
yaml="$BINDIR/stack.yaml"
cat > "$yaml" <<'EOF2'
        - "traefik.http.routers.a.rule=Host(`errado.exemplo.com`)"
        - "traefik.http.routers.b.rule=Host(`sumiu.exemplo.com`) || Host(`errado.exemplo.com`)"
        - "traefik.http.routers.c.rule=Host(`${url_variavel}`)"
EOF2
saida="$(
  set -e
  checar_dns_dominio errado.exemplo.com
  checar_dns_dominio sumiu.exemplo.com
  checar_dns_dominio --sempre sumiu.exemplo.com
  validar_dominio sumiu.exemplo.com
  dns_checar_hosts_da_stack "$yaml"
  dns_checar_hosts_da_stack /nao/existe.yaml
  echo VIVO
)"; rc=$?
case "$saida" in *VIVO) ok "(h) sob 'set -e' avisos de DNS nunca abortam (rc=$rc)" ;; *) falha "(h) o script abortou sob set -e: $saida" ;; esac
validar_dominio sumiu.exemplo.com >/dev/null; rc=$?
[ "$rc" -eq 0 ] && ok "(h) validar_dominio continua devolvendo 0 com DNS ruim" || falha "(h) validar_dominio devolveu $rc"
validar_dominio 'inválido' >/dev/null; rc=$?
[ "$rc" -eq 1 ] && ok "(h) validar_dominio ainda rejeita formato inválido" || falha "(h) validar_dominio aceitou formato inválido (rc=$rc)"

# stack: só Host() válidos, sem duplicar, ignora \${variável}
reset_dns
echo "198.51.100.9" > "$DNSDIR/errado.exemplo.com"
saida="$(dns_checar_hosts_da_stack "$yaml")"
[ "$(printf '%s\n' "$saida" | grep -c "errado.exemplo.com")" -eq 1 ] && ok "(h) stack: domínio repetido avisado uma vez" || falha "(h) stack: $saida"
case "$saida" in *sumiu.exemplo.com*) ok "(h) stack: todos os Host() da linha são checados" ;; *) falha "(h) stack: sumiu.exemplo.com não checado: $saida" ;; esac
grep -q 'variavel' "$LOG_GETENT" && falha "(h) stack: consultou \${variável}" || ok "(h) stack: \${variável} ignorada"

# --- (f) resumo final marca só o domínio problemático -------------------------------------------
resumo() {
  url_portainer="$1"; url_painel="$2"; user_portainer="admin1"; user_painel="root1"
  # o caminho real: checagens durante a coleta, resumo no fim
  checar_dns_dominio "$url_portainer" >/dev/null
  checar_dns_dominio "$url_painel" >/dev/null
  mostrar_resumo_final
}
linha_de() { printf '%s\n' "$1" | grep -F "$2"; }

reset_dns
echo "203.0.113.7" > "$DNSDIR/painel.exemplo.com"      # painel ok; portainer sem DNS
saida="$(resumo potainer.exemplo.com painel.exemplo.com)"
lp="$(linha_de "$saida" potainer.exemplo.com)"; ln="$(linha_de "$saida" painel.exemplo.com)"
case "$lp" in *"DNS ainda não aponta para este servidor"*) ok "(f) Portainer sem DNS: linha marcada" ;; *) falha "(f) Portainer sem marca: '$lp'" ;; esac
case "$ln" in *"DNS ainda"*) falha "(f) painel ok marcado por engano: '$ln'" ;; *) ok "(f) painel com DNS ok: sem marca" ;; esac
[ "$(printf '%s\n' "$saida" | grep -c "DNS ainda não aponta")" -eq 1 ] && ok "(f) só UMA marca no resumo" || falha "(f) número de marcas errado"

# tudo ok: linhas do resumo idênticas às de antes (sem nada anexado)
reset_dns
echo "203.0.113.7" > "$DNSDIR/potainer.exemplo.com"; echo "203.0.113.7" > "$DNSDIR/painel.exemplo.com"
saida="$(resumo potainer.exemplo.com painel.exemplo.com)"
esperado_p="$(t mostrar_resumo_portainer potainer.exemplo.com)"
esperado_n="$(t mostrar_resumo_painel painel.exemplo.com)"
[ "$(linha_de "$saida" potainer.exemplo.com)" = "$(echo -e "$esperado_p")" ] && [ "$(linha_de "$saida" painel.exemplo.com)" = "$(echo -e "$esperado_n")" ] \
  && ok "(f) tudo ok: linhas de Portainer/Painel idênticas às de antes" || falha "(f) tudo ok mas as linhas mudaram: $(sem_cor "$saida")"

# checagem indisponível (sem rede): idêntico também
reset_dns; FAKE_CURL_FALHA=1
saida="$(resumo potainer.exemplo.com painel.exemplo.com)"
[ "$(linha_de "$saida" potainer.exemplo.com)" = "$(echo -e "$esperado_p")" ] && [ "$(linha_de "$saida" painel.exemplo.com)" = "$(echo -e "$esperado_n")" ] \
  && ok "(f) checagem indisponível: resumo idêntico ao de antes" || falha "(f) sem rede mas o resumo mudou"
case "$saida" in *"DNS ainda"*) falha "(f) marca sem checagem" ;; *) ok "(f) sem checagem: nenhuma marca" ;; esac

# DNS propagou durante a instalação: a marca some (reavaliação no resumo)
reset_dns
url_portainer=potainer.exemplo.com; url_painel=painel.exemplo.com
checar_dns_dominio potainer.exemplo.com >/dev/null      # sem DNS na coleta
echo "203.0.113.7" > "$DNSDIR/potainer.exemplo.com"      # propagou depois
user_portainer=a; user_painel=b
saida="$(mostrar_resumo_final)"
case "$saida" in *"DNS ainda"*) falha "(f) marca ficou apesar do DNS já apontar" ;; *) ok "(f) DNS que propagou até o resumo: sem marca" ;; esac

# marca também nos 3 idiomas (paridade real já vem do check-parity.sh)
ENCHA_LANG=en; [ -n "$(dns_marca_resumo x.exemplo.com)" ] && falha "(f) marca sem cache" || ok "(f) domínio nunca checado: sem marca"
ENCHA_LANG=pt

# --- (g) estático: TODOS os caminhos que pedem domínio chamam a checagem ----------------------
tem_chamada() { # <funcao> <arquivo> <padrão> <descrição>
  local corpo
  corpo="$(extrair_funcao "$1" "$2")"
  if [ -z "$corpo" ]; then falha "(g) função $1 não encontrada em $2"; return; fi
  if printf '%s\n' "$corpo" | grep -v '^[[:space:]]*#' | grep -qE "$3"; then
    ok "(g) $1 chama $4"
  else
    falha "(g) $1 NÃO chama $4"
  fi
}
tem_chamada coletar_inputs_so_painel main.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada checar_dns_e_portas main.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada ferramenta_traefik_e_portainer secondary.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada instalar_traefik_e_portainer secondary.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada instalar_ambiente_completo secondary.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada ferramenta_encha_panel secondary.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada validar_dominio secondary.sh 'checar_dns_dominio' checar_dns_dominio
tem_chamada stack_editavel secondary.sh 'dns_checar_hosts_da_stack' dns_checar_hosts_da_stack
tem_chamada mostrar_resumo_final main.sh 'dns_marca_resumo' dns_marca_resumo
# o caminho de infra completa continua passando pela pré-checagem
grep -v '^[[:space:]]*#' main.sh | grep -qE '^\s*checar_dns_e_portas\s*$' && ok "(g) fluxo de infra completa ainda chama checar_dns_e_portas" || falha "(g) checar_dns_e_portas não é mais chamada"

echo ""
if [ "$falhas" -eq 0 ]; then
  echo "✅ Todos os testes de aviso de DNS passaram."
  exit 0
fi
echo "❌ $falhas falha(s)."
exit 1
