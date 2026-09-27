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
         enchat_url_banco_pinfy enchat_valor_segredo enchat_criar_segredos_docker enchat_limpar_segredos_antigos \
         enchat_imagens_da_stack enchat_label_tem_token enchat_imagem_declara_segredos_arquivo \
         enchat_imagens_declaram_segredos enchat_portao_segredos; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  eval "$corpo"
done
eval "$(grep -E '^(ENCHAT_VERSAO_MINIMA_SEGREDOS=|ENCHAT_SEGREDOS_CHAVES=|ENCHAT_LABEL_RECURSOS=|ENCHAT_RECURSO_SEGREDOS_ARQUIVO=)' secondary.sh)"

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
  "pull "*)
    # S4c: FALHAR_PULL=<trecho do nome> faz o pull dessa imagem falhar.
    if [ -n "${FALHAR_PULL:-}" ] && [[ "$2" == *"$FALHAR_PULL"* ]]; then exit 1; fi
    ;;
  "image inspect")
    # S4c: o label vem de LABEL_APP / LABEL_UPD / LABEL_PINFY (ausente = declara
    # o recurso); LABEL_<X>=SEM_LABEL imprime vazio (imagem sem o label);
    # FALHAR_INSPECT=<trecho> faz a inspeção dessa imagem falhar (imagem ausente).
    img="$3"
    if [ -n "${FALHAR_INSPECT:-}" ] && [[ "$img" == *"$FALHAR_INSPECT"* ]]; then exit 1; fi
    case "$img" in
      *enchat-free*) v="${LABEL_APP-segredos-arquivo}" ;;
      *enchat-updater*) v="${LABEL_UPD-segredos-arquivo}" ;;
      *pinfy*) v="${LABEL_PINFY-segredos-arquivo}" ;;
      *) exit 1 ;;
    esac
    [ "$v" = "SEM_LABEL" ] && v=""
    printf '%s\n' "$v"
    exit 0
    ;;
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

zera() {
  rm -rf "$ESTADO"; mkdir -p "$ESTADO/servicos"
  unset FALHAR_NA_CRIACAO FALHAR_PULL FALHAR_INSPECT LABEL_APP LABEL_UPD LABEL_PINFY
}

# --- 1. portão por versão ---------------------------------------------------
for v in 0.4.3 0.4.4 0.4.10 0.5.0 1.0.0; do
  enchat_versao_usa_segredos "$v" && ok "versão $v usa segredos" || falha "versão $v deveria usar segredos"
done
# 0.4.1 e 0.4.2: publicadas SEM *_FILE (o E5 sai na 0.4.3) — o portão tem que ficar fechado (S4b/S4d).
for v in 0.4.0 0.4.1 0.4.2 0.3.9 0.0.999 "" latest stable v0.4.3 0.4.3-rc.1 0.4 abc; do
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
l_portao="$(linha 'enchat_portao_segredos "\$versao_enchat"')"
l_login="$(linha 'docker login ghcr.io')"
l_criar="$(linha '^[0-9]+:     if enchat_criar_segredos_docker; then')"
l_blocos="$(linha '^[0-9]+:   enchat_montar_blocos_yaml$')"
l_yaml="$(linha 'cat > enchat.yaml <<EOL')"
l_deploy="$(linha '^[0-9]+:   stack_editavel$')"
l_wait="$(linha '^[0-9]+:   wait_stack enchat_enchat_app')"
l_limpar="$(linha '^[0-9]+:     enchat_limpar_segredos_antigos ')"
# S4c: o pull das imagens (dentro do portão) precisa da credencial do GHCR já na sessão.
if [ -n "$l_login" ] && [ -n "$l_portao" ] && [ "$l_login" -lt "$l_portao" ]; then
  ok "ferramenta_enchat: docker login -> portão (o pull das imagens usa a credencial)"
else
  falha "o portão roda antes do docker login (login=$l_login portão=$l_portao)"
fi
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


# --- 5. S4c: portão por LABEL das imagens (com.enchat.recursos) --------------
APP="ghcr.io/enchainterno/enchat-free:0.4.3"
UPD="ghcr.io/enchainterno/enchat-updater:0.4.3"
PINFY="ghcr.io/enchainterno/pinfy:0.4.3"

# 5a. as três declaram: abre; o pull e a inspeção das 3 acontecem; sem lista de faltantes
zera
if enchat_portao_segredos 0.4.3; then ok "labels: 3 de 3 declaram (0.4.3) -> portão aberto"; else falha "3 de 3 deveriam abrir o portão"; fi
[ "${#ENCHAT_IMAGENS_SEM_SUPORTE[@]}" -eq 0 ] && [ "${#ENCHAT_IMAGENS_SEM_LEITURA[@]}" -eq 0 ] || falha "listas de imagens problemáticas deveriam estar vazias"
for img in "$APP" "$UPD" "$PINFY"; do
  grep -qx "pull $img" "$ESTADO/chamadas.log" || falha "não puxou $img antes de ler o label"
  grep -q "^image inspect $img " "$ESTADO/chamadas.log" || falha "não inspecionou $img"
done
# o pull vem ANTES da inspeção de cada imagem
for img in "$APP" "$UPD" "$PINFY"; do
  lp="$(grep -nx "pull $img" "$ESTADO/chamadas.log" | head -1 | cut -d: -f1)"
  li="$(grep -n "^image inspect $img " "$ESTADO/chamadas.log" | head -1 | cut -d: -f1)"
  [ -n "$lp" ] && [ -n "$li" ] && [ "$lp" -lt "$li" ] || falha "$img: inspeção antes do pull (pull=$lp inspect=$li)"
done
ok "labels: cada imagem é puxada ANTES de ter o label lido"
# o formato lido é o do Docker: {{index .Config.Labels "com.enchat.recursos"}}
grep -qF '{{index .Config.Labels "com.enchat.recursos"}}' "$ESTADO/chamadas.log" && ok "labels: lê Config.Labels[com.enchat.recursos]" || falha "formato de leitura do label inesperado"

# 5b. UMA sem label (app / updater / Pinfy): fecha e nomeia a imagem
for par in "LABEL_APP:$APP" "LABEL_UPD:$UPD" "LABEL_PINFY:$PINFY"; do
  var="${par%%:*}"; img="${par#*:}"
  zera; export "$var=SEM_LABEL"
  if enchat_portao_segredos 0.4.3; then falha "$var sem label deveria fechar o portão"; else
    [ "$ENCHAT_PORTAO_MOTIVO" = "imagens" ] && [ "${ENCHAT_IMAGENS_SEM_SUPORTE[*]}" = "$img" ] && [ "${#ENCHAT_IMAGENS_SEM_LEITURA[@]}" -eq 0 ] \
      && ok "labels: só $img sem label -> fechado, nomeada" || falha "$var sem label: motivo='$ENCHAT_PORTAO_MOTIVO' sem_suporte='${ENCHAT_IMAGENS_SEM_SUPORTE[*]}'"
  fi
done

# 5c. valores que NÃO valem (outro recurso, substring de outro token, caixa, glob, vazio)
for valor in "outro-recurso" "nao-segredos-arquivo-x" "segredos-arquivo2" "x-segredos-arquivo" "SEGREDOS-ARQUIVO" "*" "segredos-*" "segredos-arquivo,x"; do
  zera; export LABEL_PINFY="$valor"
  enchat_portao_segredos 0.4.3 && falha "label '$valor' não deveria abrir o portão" || ok "labels: '$valor' não vale (fechado)"
done
# e a lista com outras palavras, separada por espaço/tab, vale
for valor in "segredos-arquivo outro" "outro segredos-arquivo mais" $'a\tsegredos-arquivo'; do
  zera; export LABEL_UPD="$valor"
  enchat_portao_segredos 0.4.3 && ok "labels: lista '$valor' contém o token (aberto)" || falha "lista '$valor' com o token deveria abrir"
done

# 5c'. Paridade com o painel: o MESMO vetor que imagens-recursos.test.ts lê
# (labelTemToken). Cada valor tem de dar a mesma decisão nos dois caminhos.
VETOR="encha-setup-panel/src/lib/stacks/label-recursos-vetor.tsv"
n_vetor=0; falhas_antes_vetor=$falhas
while IFS= read -r linha_vetor; do
  case "$linha_vetor" in ''|'#'*) continue ;; esac
  esperado="$(printf '%s' "$linha_vetor" | cut -f1)"
  hex="$(printf '%s' "$linha_vetor" | cut -f2)"
  descricao="$(printf '%s' "$linha_vetor" | cut -f3)"
  valor=""
  [ "$hex" = "-" ] || printf -v valor '%b' "$(printf '%s' "$hex" | sed 's/../\\x&/g')"
  if enchat_label_tem_token "$valor" "segredos-arquivo"; then obtido=abre; else obtido=fecha; fi
  [ "$obtido" = "$esperado" ] || falha "vetor de paridade: '$descricao' deu $obtido, o painel dá $esperado"
  n_vetor=$((n_vetor + 1))
done < "$VETOR"
[ "$n_vetor" -gt 15 ] && [ "$falhas" -eq "$falhas_antes_vetor" ] && ok "labels: vetor de paridade com o painel ($n_vetor casos) dá a mesma decisão" || falha "vetor de paridade: divergência acima ou vetor lido pela metade ($n_vetor casos)"

# 5c''. A função de UMA imagem, sozinha: inspeção que falha (inclusive só a
# com --format, ex.: template recusado) = NÃO declara — nunca "true" na dúvida.
# (O pré-cheque de enchat_imagens_declaram_segredos esconderia um erro aqui.)
zera; export FALHAR_INSPECT="pinfy"
enchat_imagem_declara_segredos_arquivo "$PINFY" && falha "inspeção que falha fez a imagem 'declarar'" || ok "labels: inspeção que falha -> a imagem não declara"
zera
( docker() { [ "$1 $2" = "image inspect" ] && [ "${4:-}" = "--format" ] && return 1; command docker "$@"; }
  enchat_imagem_declara_segredos_arquivo "$APP" ) && falha "falha só no inspect --format fez a imagem 'declarar'" || ok "labels: falha só no inspect --format -> não declara"
( docker() { [ "$1 $2" = "image inspect" ] && [ "${4:-}" = "--format" ] && return 1; command docker "$@"; }
  enchat_portao_segredos 0.4.3 ) && falha "falha só no inspect --format abriu o portão" || ok "labels: falha só no inspect --format -> portão fechado"
zera

# 5d. falha ao ler: pull falhou / inspeção falhou / docker inexistente -> fechado, listado como "sem leitura"
zera; export FALHAR_PULL="pinfy"
if enchat_portao_segredos 0.4.3; then falha "pull falho deveria fechar"; else
  [ "${ENCHAT_IMAGENS_SEM_LEITURA[*]}" = "$PINFY" ] && [ "$ENCHAT_PORTAO_MOTIVO" = "imagens" ] && ok "labels: falha no pull -> fechado (sem leitura: Pinfy)" || falha "pull falho: lista errada '${ENCHAT_IMAGENS_SEM_LEITURA[*]}'"
fi
zera; export FALHAR_INSPECT="enchat-updater"
if enchat_portao_segredos 0.4.3; then falha "inspeção falha deveria fechar"; else
  [ "${ENCHAT_IMAGENS_SEM_LEITURA[*]}" = "$UPD" ] && ok "labels: falha na inspeção -> fechado (sem leitura: updater)" || falha "inspeção falha: lista errada '${ENCHAT_IMAGENS_SEM_LEITURA[*]}'"
fi
( docker() { return 127; }; enchat_portao_segredos 0.4.3 ) && falha "sem docker nenhum deveria fechar" || ok "labels: docker indisponível -> fechado"
zera

# 5e. a versão manda também, e sem versão suficiente NEM consulta o Docker
for v in 0.4.1 0.4.2 0.4.0 latest ""; do
  zera; : > "$ESTADO/chamadas.log"
  if enchat_portao_segredos "$v"; then falha "versão '$v' com labels OK deveria fechar"; else
    [ "$ENCHAT_PORTAO_MOTIVO" = "versao" ] && ! grep -qE '^(pull|image inspect)' "$ESTADO/chamadas.log" \
      && ok "versão '$v': fechado por versão, sem pull nem inspeção" || falha "versão '$v': motivo='$ENCHAT_PORTAO_MOTIVO' ou consultou o Docker"
  fi
done

# 5f. nenhuma credencial/segredo vai ao argv do pull/inspeção (só nomes de imagem)
zera; enchat_portao_segredos 0.4.3
grep -E '^(pull|image inspect)' "$ESTADO/chamadas.log" | grep -qiE 'token|senha|password|--password' && falha "credencial no argv do pull/inspeção" || ok "labels: pull/inspeção só levam nome de imagem"

# 5g. mensagens novas nos 3 idiomas
for chave in ferramenta_enchat_segredos_imagem_sem_suporte ferramenta_enchat_segredos_imagem_sem_leitura; do
  for idioma in PT EN ES; do
    grep -qE "^MSG_$idioma\[$chave\]=" secondary.sh || falha "mensagem $chave sem $idioma"
  done
done
ok "mensagens do portão por label presentes em PT/EN/ES"

if [ "$falhas" -eq 0 ]; then
  ok "opção 84: criação e limpeza dos segredos do Docker"
else
  exit 1
fi
