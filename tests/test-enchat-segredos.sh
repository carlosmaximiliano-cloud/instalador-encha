#!/bin/bash
# S4 (achado 2), opção 84: as funções que falam com o Docker — criar os segredos
# versionados ANTES do deploy e remover as versões antigas DEPOIS —
# exercitadas com um `docker` FALSO no PATH (as REAIS, extraídas de secondary.sh):
#   - enchat_criar_segredos_docker: 10 segredos, nome enchat_<chave>_<época>,
#     labels da stack/base, valor por STDIN (nunca no argv); uma falha no meio
#     desfaz os criados nesta rodada e retorna 1 (o chamador cai no formato antigo);
#   - enchat_limpar_segredos_antigos: só remove com prova de que o spec novo foi
#     aplicado, nunca o que o Spec atual OU o PreviousSpec (rollback) referencia,
#     e não remove NADA se qualquer inspeção falhar;
#   - portão por versão (semver >=, numérico, ilegível = fechado).
# Roda com: bash tests/test-enchat-segredos.sh
set -u
cd "$(dirname "$0")/.." || exit 1
falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

extrair_funcao() {
  awk -v alvo="$1" '
    $0 ~ "^" alvo "\\(\\) \\{$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}
for f in versao_semver_maior versao_semver_maior_ou_igual enchat_versao_usa_segredos enchat_url_banco_app \
         enchat_url_banco_pinfy enchat_valor_segredo enchat_criar_segredos_docker enchat_limpar_segredos_antigos; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  eval "$corpo"
done
eval "$(grep -E '^(ENCHAT_VERSAO_MINIMA_SEGREDOS=|ENCHAT_SEGREDOS_CHAVES=)' secondary.sh)"

# --- docker falso -----------------------------------------------------------
DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT
mkdir -p "$DIR/bin" "$DIR/estado/servicos"
export ESTADO="$DIR/estado"
cat > "$DIR/bin/docker" <<'EODOCKER'
#!/bin/bash
# Registra tudo em $ESTADO; nunca toca num Docker de verdade.
echo "$*" >> "$ESTADO/chamadas.log"
case "$1 $2" in
  "secret create")
    nome="$3"
    n=$(($(cat "$ESTADO/n_create" 2>/dev/null || echo 0) + 1)); echo "$n" > "$ESTADO/n_create"
    if [ -n "${FALHAR_NA_CRIACAO:-}" ] && [ "$n" -eq "$FALHAR_NA_CRIACAO" ]; then cat >/dev/null; exit 1; fi
    cat > "$ESTADO/valor_$nome"           # o valor chega por STDIN
    echo "$nome $*" >> "$ESTADO/criados.log"
    echo "$nome" >> "$ESTADO/segredos.txt"
    ;;
  "secret rm") echo "$3" >> "$ESTADO/removidos.log" ;;
  "secret ls") cat "$ESTADO/segredos.txt" 2>/dev/null ;;
  "service inspect")
    svc="$3"
    [ -f "$ESTADO/servicos/$svc.falha" ] && exit 1
    if printf '%s' "$*" | grep -q PreviousSpec; then cat "$ESTADO/servicos/$svc.anteriores" 2>/dev/null
    else cat "$ESTADO/servicos/$svc.atuais" 2>/dev/null; fi
    ;;
esac
exit 0
EODOCKER
chmod +x "$DIR/bin/docker"
PATH="$DIR/bin:$PATH"

zera() { rm -rf "$ESTADO"; mkdir -p "$ESTADO/servicos"; unset FALHAR_NA_CRIACAO; }

# --- 1. portão por versão ---------------------------------------------------
for v in 0.4.1 0.4.2 0.4.10 0.5.0 1.0.0; do
  enchat_versao_usa_segredos "$v" && ok "versão $v usa segredos" || falha "versão $v deveria usar segredos"
done
for v in 0.4.0 0.3.9 0.0.999 "" latest v0.4.1 0.4.1-rc1 0.4 abc; do
  enchat_versao_usa_segredos "$v" && falha "versão '$v' não deveria usar segredos" || ok "versão '$v' fica no formato antigo"
done

# --- 2. criação -------------------------------------------------------------
postgres_password="PG-SENT"; enchat_master_key="MK-SENT"; pinfy_master_key="PMK-SENT"; pinfy_webhook_token="PWT-SENT"
pinfy_panel_password="PPP-SENT"; pinfy_db_password="PDB-SENT"; pinfy_session_key="PSK-SENT"; enchat_setup_token="ST-SENT"
ENCHAT_EPOCA_SEGREDOS=1758900000

zera
if enchat_criar_segredos_docker; then ok "criação: sucesso"; else falha "criação falhou sem motivo"; fi
[ "${#ENCHAT_SEGREDOS_CRIADOS[@]}" -eq 10 ] || falha "esperava 10 segredos criados, achei ${#ENCHAT_SEGREDOS_CRIADOS[@]}"
for chave in "${ENCHAT_SEGREDOS_CHAVES[@]}"; do
  nome="enchat_${chave}_1758900000"
  grep -qx "$nome" "$ESTADO/segredos.txt" || falha "segredo $nome não criado"
  grep -q -- "--label com.encha.segredo-stack=enchat --label com.encha.segredo-base=enchat_${chave} -" "$ESTADO/criados.log" || falha "labels ausentes em $nome"
done
# valor por stdin, exato (sem \n) — e NUNCA no argv do docker.
[ "$(cat "$ESTADO/valor_enchat_master_key_1758900000")" = "MK-SENT" ] || falha "valor do master_key errado"
[ "$(cat "$ESTADO/valor_enchat_postgres_password_1758900000")" = "PG-SENT" ] || falha "valor da senha do postgres errado"
[ "$(cat "$ESTADO/valor_enchat_database_url_1758900000")" = "postgresql://enchat:PG-SENT@enchat_postgres:5432/enchat?sslmode=disable" ] || falha "URL do app errada"
[ "$(cat "$ESTADO/valor_enchat_pinfy_database_url_1758900000")" = "postgresql://pinfy:PDB-SENT@enchat_postgres:5432/enchat?schema=pinfy&sslmode=disable" ] || falha "URL do pinfy errada"
[ "$(wc -c < "$ESTADO/valor_enchat_master_key_1758900000" | tr -d ' ')" = "7" ] || falha "valor com \\n/lixo no fim"
for s in PG-SENT MK-SENT PMK-SENT PWT-SENT PPP-SENT PDB-SENT PSK-SENT ST-SENT; do
  grep -q -- "$s" "$ESTADO/chamadas.log" && falha "valor $s apareceu no argv do docker"
done
ok "criação: nomes, labels e valores por stdin corretos"

# falha no meio: desfaz os já criados
zera
export FALHAR_NA_CRIACAO=4
if enchat_criar_segredos_docker; then falha "criação deveria ter falhado"; else ok "criação: retorna 1 quando um segredo falha"; fi
[ "${#ENCHAT_SEGREDOS_CRIADOS[@]}" -eq 0 ] || falha "ENCHAT_SEGREDOS_CRIADOS deveria esvaziar na falha"
[ "$(wc -l < "$ESTADO/removidos.log" | tr -d ' ')" = "3" ] || falha "deveria remover os 3 criados antes da falha (achei $(wc -l < "$ESTADO/removidos.log" 2>/dev/null))"
# Um nome por iteração (entre aspas, o "$(...)" virava UMA string de 3 linhas,
# e o grep aceitava se QUALQUER um dos 3 tivesse sido removido).
while read -r n; do
  grep -qxF -- "$n" "$ESTADO/removidos.log" || falha "$n criado e não desfeito"
done < <(sed -n 1,3p "$ESTADO/criados.log" | awk '{print $1}')
[ "$(sort -u "$ESTADO/removidos.log" | wc -l | tr -d ' ')" = "3" ] || falha "o desfazer não removeu 3 nomes DISTINTOS"
ok "criação: falha no meio desfaz os criados nesta rodada"
unset FALHAR_NA_CRIACAO

# --- 3. limpeza -------------------------------------------------------------
NOVO=(enchat_master_key_2 enchat_postgres_password_2)
servico() { # nome, atuais, anteriores
  printf '%s' "$2" | tr ' ' '\n' > "$ESTADO/servicos/$1.atuais"
  printf '%s' "$3" | tr ' ' '\n' > "$ESTADO/servicos/$1.anteriores"
}
todos_servicos() { # atuais, anteriores para os 3
  servico enchat_enchat_app "$1" "$2"; servico enchat_enchat_pinfy "" ""; servico enchat_enchat_postgres "" ""
}

zera; todos_servicos "enchat_master_key_2 enchat_postgres_password_2" ""
printf '%s\n' enchat_master_key_1 enchat_master_key_2 enchat_postgres_password_2 enchat_postgres_password_1 > "$ESTADO/segredos.txt"
enchat_limpar_segredos_antigos "${NOVO[@]}"
sort "$ESTADO/removidos.log" | tr '\n' ' ' | grep -qx "enchat_master_key_1 enchat_postgres_password_1 " && ok "limpeza: remove só as versões antigas sem referência" || falha "limpeza removeu o conjunto errado: $(tr '\n' ' ' < "$ESTADO/removidos.log")"

# PreviousSpec (rollback) protege a versão anterior
zera; todos_servicos "enchat_master_key_2" "enchat_master_key_1"
printf '%s\n' enchat_master_key_1 enchat_master_key_2 enchat_postgres_password_1 > "$ESTADO/segredos.txt"
enchat_limpar_segredos_antigos "${NOVO[@]}"
grep -qx enchat_master_key_1 "$ESTADO/removidos.log" 2>/dev/null && falha "removeu segredo do PreviousSpec (alvo do rollback)" || ok "limpeza: não remove o que o PreviousSpec referencia"
grep -qx enchat_postgres_password_1 "$ESTADO/removidos.log" 2>/dev/null || falha "deveria remover o antigo sem referência"

# sem prova de spec novo aplicado: nada é removido
zera; todos_servicos "enchat_master_key_1" ""
printf '%s\n' enchat_master_key_1 enchat_master_key_0 enchat_master_key_2 > "$ESTADO/segredos.txt"
enchat_limpar_segredos_antigos "${NOVO[@]}"
[ ! -s "$ESTADO/removidos.log" ] && ok "limpeza: sem prova de spec novo aplicado não remove nada" || falha "removeu sem o spec novo aplicado"

# inspeção falhou: nada é removido
zera; todos_servicos "enchat_master_key_2" ""
touch "$ESTADO/servicos/enchat_enchat_pinfy.falha"
printf '%s\n' enchat_master_key_1 enchat_master_key_2 > "$ESTADO/segredos.txt"
enchat_limpar_segredos_antigos "${NOVO[@]}"
[ ! -s "$ESTADO/removidos.log" ] && ok "limpeza: inspeção falhou, nada removido" || falha "removeu com a inspeção falhando"

# a versão mantida nunca é removida, mesmo sem referência de serviço nenhuma
zera; todos_servicos "enchat_master_key_2" ""
printf '%s\n' enchat_master_key_2 enchat_postgres_password_2 > "$ESTADO/segredos.txt"
enchat_limpar_segredos_antigos "${NOVO[@]}"
[ ! -s "$ESTADO/removidos.log" ] && ok "limpeza: nunca remove as versões mantidas" || falha "removeu uma versão mantida"

# só consulta segredos com o label da stack
grep -q "label=com.encha.segredo-stack=enchat" "$ESTADO/chamadas.log" || falha "a limpeza não filtra pelo label da stack"

# --- 4. ordem dentro de ferramenta_enchat: criar -> deploy -> limpar -------------
corpo="$(awk '/^ferramenta_enchat\(\)\{/ { f = 1 } f { print NR ": " $0 } f && /^\}$/ { exit }' secondary.sh)"
linha() { printf '%s\n' "$corpo" | grep -E -m1 -- "$1" | cut -d: -f1; }
l_portao="$(linha 'enchat_versao_usa_segredos "\$versao_enchat"')"
l_criar="$(linha '^[0-9]+:     if enchat_criar_segredos_docker; then')"
l_blocos="$(linha '^[0-9]+:   enchat_montar_blocos_yaml$')"
l_yaml="$(linha 'cat > enchat.yaml <<EOL')"
l_deploy="$(linha '^[0-9]+:   stack_editavel$')"
l_wait="$(linha '^[0-9]+:   wait_stack enchat_enchat_app')"
l_limpar="$(linha '^[0-9]+:     enchat_limpar_segredos_antigos ')"
if [ -n "$l_portao" ] && [ -n "$l_criar" ] && [ -n "$l_blocos" ] && [ -n "$l_yaml" ] && [ -n "$l_deploy" ] && [ -n "$l_wait" ] && [ -n "$l_limpar" ]; then
  [ "$l_portao" -lt "$l_criar" ] && [ "$l_criar" -lt "$l_blocos" ] && [ "$l_blocos" -lt "$l_yaml" ] && [ "$l_yaml" -lt "$l_deploy" ] \
    && [ "$l_deploy" -lt "$l_wait" ] && [ "$l_wait" -lt "$l_limpar" ] \
    && ok "ferramenta_enchat: portão -> criar segredos -> montar YAML -> deploy -> wait_stack -> limpar" \
    || falha "ordem errada em ferramenta_enchat (portão $l_portao, criar $l_criar, blocos $l_blocos, yaml $l_yaml, deploy $l_deploy, wait $l_wait, limpar $l_limpar)"
else
  falha "não achei todos os marcos de ordem em ferramenta_enchat (portão=$l_portao criar=$l_criar blocos=$l_blocos yaml=$l_yaml deploy=$l_deploy wait=$l_wait limpar=$l_limpar)"
fi
# A limpeza só roda com segredos ligados E o wait_stack em 0 (deploy confirmado).
printf '%s\n' "$corpo" | grep -B1 -E -- 'enchat_limpar_segredos_antigos ' | grep -q 'ENCHAT_USA_SEGREDOS" = true \]' && \
  printf '%s\n' "$corpo" | grep -B1 -E -- 'enchat_limpar_segredos_antigos ' | grep -q 'enchat_stack_ok" -eq 0' \
  && ok "a limpeza é condicionada aos segredos ligados e ao wait_stack em 0" \
  || falha "a limpeza não está condicionada a ENCHAT_USA_SEGREDOS e wait_stack em 0"
# Falha na criação cai no formato antigo (nunca deixa ENCHAT_USA_SEGREDOS=true).
printf '%s\n' "$corpo" | grep -A2 -E -- 'if enchat_criar_segredos_docker; then' | grep -q 'ENCHAT_USA_SEGREDOS=true' \
  && ok "só liga ENCHAT_USA_SEGREDOS quando a criação deu certo" || falha "ENCHAT_USA_SEGREDOS não depende do sucesso da criação"

if [ "$falhas" -eq 0 ]; then
  ok "opção 84: criação e limpeza dos segredos do Docker"
else
  exit 1
fi
