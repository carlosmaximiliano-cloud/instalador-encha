#!/bin/bash
# S5-B: opção 84 do menu (ferramenta_enchat em secondary.sh), o que acontece ao
# rodar de novo por cima de uma instalação existente e qual versão ela sugere.
# Roda a função REAL e os helpers REAIS (extraídos de secondary.sh) com
# docker/curl FALSOS no PATH e /root e /var/enchat trocados por diretórios
# temporários (ENCHA_ROOT_DIR / ENCHA_DATA_DIR — as costuras do próprio script):
#   - banco existente (PG_VERSION) SEM credenciais legíveis: ABORTA antes de
#     perguntar qualquer coisa, sem chamar docker/curl, sem gravar nada;
#   - dados_enchat com credenciais (com ou sem banco): REUSA os mesmos valores
#     (senha do Postgres, ENCHAT_MASTER_KEY, PINFY_SESSION_KEY, senhas do
#     Pinfy, token de primeiro acesso) no enchat.yaml e no dados_enchat novo;
#   - instalação nova: sorteia valores novos, como sempre;
#   - versão: Enter usa a estável REAL do Console; sem resposta do Console não
#     há default (nunca "1.0.0") e o menu pergunta de novo.
# Precisa de bash >= 4 (arrays associativos, como na VPS); no bash 3.2 do macOS
# o teste se reexecuta num contêiner debian:12.
# Roda com: bash tests/test-enchat-84-reinstalacao.sh
set -u
cd "$(dirname "$0")/.." || exit 1

if [ "${BASH_VERSINFO[0]}" -lt 4 ]; then
  if [ -z "${ENCHA_TEST_EM_DOCKER:-}" ] && command -v docker >/dev/null 2>&1; then
    echo "ℹ️  bash ${BASH_VERSION%%(*} < 4: reexecutando em debian:12 (Docker)"
    exec docker run --rm -e ENCHA_TEST_EM_DOCKER=1 -v "$PWD":/w -w /w debian:12 \
      bash -c 'apt-get update -qq >/dev/null && apt-get install -y -qq jq openssl >/dev/null && bash tests/test-enchat-84-reinstalacao.sh'
  fi
  # 77 = PULADO (tests/run-all.sh mostra o motivo no resumo; nunca vira verde calado).
  echo "PULADO: precisa de bash >= 4 (ou Docker para reexecutar em debian:12) — nem um nem outro disponível"
  exit 77
fi
# jq é do fluxo real (a função parseia a resposta do Console com ele); sem jq o
# instalador tentaria apt-get. O runner do CI tem jq (o test.yml não o instala,
# mas o ubuntu-latest já vem com ele).
command -v jq >/dev/null 2>&1 || { echo "PULADO: jq não encontrado neste ambiente"; exit 77; }

falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

extrair_funcao() {
  awk -v alvo="$1" '
    $0 ~ "^" alvo "\\(\\) ?\\{[[:space:]]*$" { f = 1 }
    f { print }
    f && /^\}$/ { exit }
  ' secondary.sh
}

fns=""
for f in t versao_semver_maior versao_semver_maior_ou_igual enchat_versao_usa_segredos enchat_url_banco_app \
         enchat_url_banco_pinfy enchat_valor_segredo enchat_criar_segredos_docker enchat_linha_env \
         enchat_bloco_montagens enchat_montar_blocos_yaml enchat_limpar_segredos_antigos \
         enchat_arquivo_dados enchat_dir_postgres enchat_arquivo_pg_version enchat_ler_campo_dados \
         enchat_avaliar_credenciais_existentes enchat_definir_credenciais enchat_versao_estavel_console \
         enchat_perguntar_versao enchat_gravar_dados_enchat ferramenta_enchat; do
  corpo="$(extrair_funcao "$f")"
  [ -n "$corpo" ] || { echo "❌ FALHOU: função $f não encontrada em secondary.sh"; exit 1; }
  fns+="$corpo"$'\n'
done
constantes="$(grep -E '^(ENCHAT_VERSAO_MINIMA_SEGREDOS=|ENCHAT_SEGREDOS_CHAVES=|ENCHAT_SEGREDOS_CRIADOS=)' secondary.sh)"
mensagens="$(grep -E '^MSG_(PT|EN|ES)\[ferramenta_enchat_' secondary.sh)"
[ -n "$mensagens" ] || { echo "❌ FALHOU: mensagens ferramenta_enchat_* não encontradas"; exit 1; }

DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT
mkdir -p "$DIR/bin"

# docker e curl FALSOS: registram cada chamada; nada sai da máquina.
cat > "$DIR/bin/docker" <<'EODOCKER'
#!/bin/bash
echo "docker $*" >> "$CHAMADAS"
case "$1 $2" in
  "stack ls") echo "enchat" ;;
  "login "*|"login ghcr.io") cat >/dev/null ;;
esac
[ "$1" = "login" ] && cat >/dev/null
exit 0
EODOCKER
cat > "$DIR/bin/curl" <<'EOCURL'
#!/bin/bash
echo "curl $*" >> "$CHAMADAS"
case "$*" in
  *installs/registry-auth*) cat >/dev/null; echo '{"username":"u","token":"t"}' ;;
  *api/version*)
    case "${FAKE_VERSAO:-}" in
      FALHA) exit 22 ;;
      *) printf '{"latest_version":"%s","image_repo":"ghcr.io/x/y"}' "$FAKE_VERSAO" ;;
    esac ;;
  *) exit 22 ;;
esac
EOCURL
# openssl: usa o real quando existe; imagem mínima sem openssl (ubuntu/debian de
# contêiner) ganha um substituto que sorteia via /dev/urandom com a mesma
# interface que ferramenta_enchat usa (`rand -hex N` / `rand -base64 N`).
if ! command -v openssl >/dev/null 2>&1; then
  cat > "$DIR/bin/openssl" <<'EOSSL'
#!/bin/bash
[ "$1" = "rand" ] || exit 2
case "$2" in
  -hex) od -An -N"$3" -tx1 /dev/urandom | tr -d ' \n'; echo ;;
  -base64) head -c "$3" /dev/urandom | base64 ;;
  *) exit 2 ;;
esac
EOSSL
  chmod +x "$DIR/bin/openssl"
fi
chmod +x "$DIR/bin/docker" "$DIR/bin/curl"

# Roda ferramenta_enchat REAL. $1 = raiz do caso (contém root/ e data/), $2 = stdin.
# Saída completa em $1/saida.log; código de retorno em $1/rc.
rodar_84() {
  local caso="$1" entrada="$2"
  mkdir -p "$caso/root/dados_vps" "$caso/data" "$caso/home" "$caso/work"
  : > "$caso/chamadas.log"
  (
    cd "$caso/work" || exit 99
    export HOME="$caso/home" PATH="$DIR/bin:$PATH" CHAMADAS="$caso/chamadas.log"
    export ENCHA_ROOT_DIR="$caso/root" ENCHA_DATA_DIR="$caso/data"
    declare -A MSG_PT MSG_EN MSG_ES
    ENCHA_LANG=pt
    eval "$constantes"
    eval "$mensagens"
    eval "$fns"
    # Substitutos do que o instalador completo provê (menus, Portainer, Swarm).
    # Entrada esgotada = falha determinística. Sem isto, um `read` em EOF faz os
    # `while true` do menu girarem para sempre (foi o que uma mutação provocou).
    read() { builtin read "$@" || exit 98; }
    msg_enchat() { :; }; dados() { nome_rede_interna="rede_teste"; }
    validar_dominio() { return 0; }; esconder_senha() { SENHAOCULTA="***"; }
    clear() { :; }; sleep() { :; }; msg_retorno_menu() { echo "[msg_retorno_menu]"; }
    registrar_registry_portainer() { return 0; }; stack_editavel() { :; }
    pull() { :; }; msg_resumo_informacoes() { :; }
    # FAKE_INTERROMPER_ESPERA=1: a sessão cai (Ctrl-C/SSH) enquanto espera os
    # serviços — DEPOIS do deploy, quando o Postgres já pode ter inicializado.
    wait_stack() { [ -n "${FAKE_INTERROMPER_ESPERA:-}" ] && exit 97; return 0; }
    printf '%b' "$entrada" | ferramenta_enchat
  ) > "$caso/saida.log" 2>&1
  echo $? > "$caso/rc"
}

dados_escrever() { # $1 = arquivo; sem argumentos extras: conteúdo padrão do dados_enchat
  cat > "$1" <<EOD
[ ENCHAT GRÁTIS ]

Painel: https://crm.antigo.com
Primeiro acesso (criar o administrador, uso único): https://crm.antigo.com/?setup=TOKENANTIGO0123456789abcdef
Versão: 0.4.0
ENCHAT_MASTER_KEY: MASTER+ANTIGA/do=banco==
Senha do Postgres: SENHAPGANTIGA1234567890abcdef
Senha do painel Pinfy: PAINELPINFYANTIGA1234
Senha do papel Pinfy no Postgres: PAPELPINFYANTIGA5678
PINFY_SESSION_KEY: SESSAOPINFYANTIGA9999

⚠️ GUARDE a ENCHAT_MASTER_KEY em local seguro! Sem ela, os segredos
   gravados no banco são irrecuperáveis.
EOD
}

campo() { awk -v r="$2: " 'index($0, r) == 1 { print substr($0, length(r) + 1); exit }' "$1"; }
modo() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1"; }

# ---------------------------------------------------------------------------
# 1) Banco existente SEM dados_enchat: aborta, não chama nada, não grava nada.
# ---------------------------------------------------------------------------
C="$DIR/c1"; mkdir -p "$C/data/postgres"; echo 16 > "$C/data/postgres/PG_VERSION"
FAKE_VERSAO=0.9.7 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
if [ "$(cat "$C/rc")" = "1" ]; then ok "banco sem dados_enchat: retorna 1"; else falha "banco sem dados_enchat: rc=$(cat "$C/rc"), esperado 1"; fi
grep -q "Já existe um banco do EnchaT" "$C/saida.log" && ok "banco sem dados_enchat: mensagem de aborto" || falha "sem a mensagem de aborto"
grep -qF "$C/data/postgres" "$C/saida.log" && grep -qF "$C/root/dados_vps/dados_enchat" "$C/saida.log" \
  && ok "a mensagem cita o diretório do banco e o arquivo de credenciais" || falha "mensagem sem os caminhos"
[ ! -s "$C/chamadas.log" ] && ok "aborta ANTES de qualquer docker/curl" || { falha "chamou docker/curl: $(cat "$C/chamadas.log")"; }
[ ! -e "$C/work/enchat.yaml" ] && [ ! -e "$C/root/dados_vps/dados_enchat" ] && ok "não gravou enchat.yaml nem dados_enchat" || falha "gravou arquivos ao abortar"
[ "$(cat "$C/data/postgres/PG_VERSION")" = "16" ] && ok "o banco existente ficou intocado" || falha "mexeu no banco"
grep -qiE "apagar|deleting|rm -rf" "$C/saida.log" && falha "a mensagem NÃO pode oferecer apagar dados automaticamente" || ok "a mensagem não apaga nada por conta própria"

# 1b) Banco existente + dados_enchat SEM a chave-mestra / sem a senha: também aborta.
for faltando in "ENCHAT_MASTER_KEY" "Senha do Postgres"; do
  C="$DIR/c1b-${faltando// /_}"; mkdir -p "$C/data/postgres" "$C/root/dados_vps"; echo 16 > "$C/data/postgres/PG_VERSION"
  dados_escrever "$C/root/dados_vps/dados_enchat"
  grep -vF "$faltando: " "$C/root/dados_vps/dados_enchat" > "$C/x" && mv "$C/x" "$C/root/dados_vps/dados_enchat"
  antes="$(cat "$C/root/dados_vps/dados_enchat")"
  rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
  if [ "$(cat "$C/rc")" = "1" ] && [ ! -s "$C/chamadas.log" ] && [ "$(cat "$C/root/dados_vps/dados_enchat")" = "$antes" ]; then
    ok "banco + dados_enchat sem '$faltando': aborta e preserva o arquivo"
  else
    falha "banco + dados_enchat sem '$faltando' não abortou direito (rc=$(cat "$C/rc"))"
  fi
done

# ---------------------------------------------------------------------------
# 2) Reuso: dados_enchat completo (com banco, e também sem banco).
# ---------------------------------------------------------------------------
for variante in com-banco sem-banco crlf; do
  C="$DIR/c2-$variante"; mkdir -p "$C/data" "$C/root/dados_vps"
  [ "$variante" != "sem-banco" ] && { mkdir -p "$C/data/postgres"; echo 16 > "$C/data/postgres/PG_VERSION"; }
  dados_escrever "$C/root/dados_vps/dados_enchat"
  [ "$variante" = "crlf" ] && sed -i.bak 's/$/\r/' "$C/root/dados_vps/dados_enchat" && rm -f "$C/root/dados_vps/dados_enchat.bak"
  FAKE_VERSAO=0.4.0 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
  y="$C/work/enchat.yaml"; d="$C/root/dados_vps/dados_enchat"
  if [ "$(cat "$C/rc")" != "0" ] || [ ! -f "$y" ]; then falha "reuso ($variante): não concluiu (rc=$(cat "$C/rc"))"; tail -5 "$C/saida.log"; continue; fi
  ok "reuso ($variante): concluiu"
  [ "$(campo "$d" ENCHAT_MASTER_KEY)" = "MASTER+ANTIGA/do=banco==" ] && ok "reuso ($variante): ENCHAT_MASTER_KEY igual" || falha "reuso ($variante): ENCHAT_MASTER_KEY mudou: $(campo "$d" ENCHAT_MASTER_KEY)"
  [ "$(campo "$d" "Senha do Postgres")" = "SENHAPGANTIGA1234567890abcdef" ] && ok "reuso ($variante): senha do Postgres igual" || falha "reuso ($variante): senha do Postgres mudou"
  [ "$(campo "$d" PINFY_SESSION_KEY)" = "SESSAOPINFYANTIGA9999" ] && ok "reuso ($variante): PINFY_SESSION_KEY igual" || falha "reuso ($variante): PINFY_SESSION_KEY mudou"
  [ "$(campo "$d" "Senha do painel Pinfy")" = "PAINELPINFYANTIGA1234" ] && ok "reuso ($variante): senha do painel Pinfy igual" || falha "reuso ($variante): senha do painel Pinfy mudou"
  [ "$(campo "$d" "Senha do papel Pinfy no Postgres")" = "PAPELPINFYANTIGA5678" ] && ok "reuso ($variante): senha do papel Pinfy igual" || falha "reuso ($variante): senha do papel Pinfy mudou"
  grep -q '?setup=TOKENANTIGO0123456789abcdef$' "$d" && ok "reuso ($variante): token de primeiro acesso igual" || falha "reuso ($variante): token mudou"
  grep -qF 'POSTGRES_PASSWORD: "SENHAPGANTIGA1234567890abcdef"' "$y" && ok "reuso ($variante): o YAML sobe o Postgres com a senha do volume" || falha "reuso ($variante): YAML com senha do Postgres diferente"
  grep -qF 'MASTER+ANTIGA/do=banco==' "$y" && grep -qF 'SESSAOPINFYANTIGA9999' "$y" && ok "reuso ($variante): o YAML leva a chave-mestra e a chave de sessão antigas" || falha "reuso ($variante): YAML sem as chaves antigas"
  grep -q "Reaproveitando as credenciais" "$C/saida.log" && ok "reuso ($variante): avisa que reaproveitou" || falha "reuso ($variante): sem aviso de reaproveitamento"
  [ "$(modo "$d")" = "600" ] && ok "reuso ($variante): dados_enchat continua 600" || falha "reuso ($variante): modo $(modo "$d")"
done

# 2b) Arquivo de uma versão antiga, sem PINFY_SESSION_KEY: reusa o que tem, sorteia só o que falta.
C="$DIR/c2b"; mkdir -p "$C/data/postgres" "$C/root/dados_vps"; echo 16 > "$C/data/postgres/PG_VERSION"
dados_escrever "$C/root/dados_vps/dados_enchat"
grep -v '^PINFY_SESSION_KEY: ' "$C/root/dados_vps/dados_enchat" > "$C/x" && mv "$C/x" "$C/root/dados_vps/dados_enchat"
FAKE_VERSAO=0.4.0 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
d="$C/root/dados_vps/dados_enchat"
if [ "$(campo "$d" ENCHAT_MASTER_KEY)" = "MASTER+ANTIGA/do=banco==" ] && [ -n "$(campo "$d" PINFY_SESSION_KEY)" ]; then
  ok "arquivo sem PINFY_SESSION_KEY: reusa a chave-mestra e sorteia só a que faltava"
else
  falha "arquivo sem PINFY_SESSION_KEY: master='$(campo "$d" ENCHAT_MASTER_KEY)' sessão='$(campo "$d" PINFY_SESSION_KEY)'"
fi

# ---------------------------------------------------------------------------
# 3) Instalação nova: sorteia valores novos e diferentes entre si/entre rodadas.
# ---------------------------------------------------------------------------
C="$DIR/c3a"; FAKE_VERSAO=0.4.0 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
C2="$DIR/c3b"; FAKE_VERSAO=0.4.0 rodar_84 "$C2" "crm.exemplo.com\n\nCHAVE\nY\n"
d="$C/root/dados_vps/dados_enchat"; d2="$C2/root/dados_vps/dados_enchat"
if [ "$(cat "$C/rc")" = "0" ] && [ -f "$d" ]; then
  vazio=0
  for r in ENCHAT_MASTER_KEY "Senha do Postgres" PINFY_SESSION_KEY "Senha do painel Pinfy" "Senha do papel Pinfy no Postgres"; do
    [ -n "$(campo "$d" "$r")" ] || vazio=1
  done
  [ "$vazio" = 0 ] && ok "instalação nova: todas as credenciais foram sorteadas" || falha "instalação nova: credencial vazia"
  [ "$(campo "$d" ENCHAT_MASTER_KEY)" != "$(campo "$d2" ENCHAT_MASTER_KEY)" ] && ok "instalação nova: valores diferentes a cada instalação" || falha "instalação nova: valores repetidos"
  grep -q "Reaproveitando" "$C/saida.log" && falha "instalação nova não devia dizer que reaproveitou" || ok "instalação nova: não diz que reaproveitou"
else
  falha "instalação nova não concluiu (rc=$(cat "$C/rc"))"; tail -5 "$C/saida.log"
fi

# ---------------------------------------------------------------------------
# 3b) Sessão interrompida DEPOIS do deploy (esperando os serviços): as
#     credenciais que o banco recém-criado usa já têm de estar no dados_enchat
#     (0600). Senão elas se perdem e a próxima execução, vendo o PG_VERSION
#     que o Postgres criou, aborta — numa instalação nova que a própria opção
#     84 começou.
# ---------------------------------------------------------------------------
C="$DIR/c3i"; FAKE_INTERROMPER_ESPERA=1 FAKE_VERSAO=0.4.0 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
d="$C/root/dados_vps/dados_enchat"; y="$C/work/enchat.yaml"
if [ "$(cat "$C/rc")" = "97" ] && [ -f "$y" ]; then
  pg_yaml="$(sed -n 's/^ *POSTGRES_PASSWORD: "\(.*\)"$/\1/p' "$y" | head -1)"
  if [ -f "$d" ] && [ "$(modo "$d")" = "600" ] && [ -n "$pg_yaml" ] && [ "$(campo "$d" "Senha do Postgres")" = "$pg_yaml" ] \
     && [ -n "$(campo "$d" ENCHAT_MASTER_KEY)" ] && grep -qF "$(campo "$d" ENCHAT_MASTER_KEY)" "$y"; then
    ok "interrompida depois do deploy: dados_enchat (600) já tem as credenciais que o YAML usou"
    mk_antes="$(campo "$d" ENCHAT_MASTER_KEY)"
    mkdir -p "$C/data/postgres"; echo 16 > "$C/data/postgres/PG_VERSION" # o Postgres inicializou
    : > "$C/chamadas.log"; rm -f "$y"
    FAKE_VERSAO=0.4.0 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
    if [ "$(cat "$C/rc")" = "0" ] && [ "$(campo "$d" ENCHAT_MASTER_KEY)" = "$mk_antes" ] && grep -qF "POSTGRES_PASSWORD: \"$pg_yaml\"" "$y"; then
      ok "a execução seguinte reaproveita as MESMAS credenciais em vez de abortar"
    else
      falha "execução seguinte não reaproveitou (rc=$(cat "$C/rc"))"; tail -5 "$C/saida.log"
    fi
  else
    falha "interrompida depois do deploy: credenciais do banco recém-criado não foram salvas (dados_enchat: $( [ -f "$d" ] && echo existe || echo ausente))"
  fi
else
  falha "cenário de interrupção não chegou ao deploy (rc=$(cat "$C/rc"))"; tail -5 "$C/saida.log"
fi

# ---------------------------------------------------------------------------
# 4) Versão: Enter = estável real do Console; sem Console = sem default.
# ---------------------------------------------------------------------------
C="$DIR/c4a"; FAKE_VERSAO=0.9.7 rodar_84 "$C" "crm.exemplo.com\n\nCHAVE\nY\n"
if grep -q 'enchat-free:0.9.7$' "$C/work/enchat.yaml" 2>/dev/null; then ok "Enter usa a versão estável REAL informada pelo Console (0.9.7)"; else falha "Enter não usou a estável do Console"; fi
grep -q "estável atual: 0.9.7" "$C/saida.log" && ok "o prompt mostra a estável atual" || falha "prompt sem a estável atual"
grep -q "api/version?app=enchat&edicao=free&canal=stable" "$C/chamadas.log" && ok "consulta a rota /api/version do Console (edição free, canal stable)" || falha "não consultou o Console"

C="$DIR/c4b"; FAKE_VERSAO=FALHA rodar_84 "$C" "crm.exemplo.com\n\ncrm.exemplo.com\n0.4.0\nCHAVE\nY\n"
if ! grep -Eq 'image: .*:1\.0\.0$' "$C/work/enchat.yaml" 2>/dev/null && grep -q 'enchat-free:0.4.0$' "$C/work/enchat.yaml" 2>/dev/null; then
  ok "Console fora do ar + Enter: NÃO cai em 1.0.0; pergunta de novo e usa o que foi digitado"
else
  falha "Console fora do ar + Enter: usou versão default inexistente"
fi
grep -q "Use uma versão fixa" "$C/saida.log" && ok "Console fora do ar + Enter: mostra a mensagem pedindo a versão" || falha "sem mensagem pedindo a versão"
grep -q "\[1.0.0\]" "$C/saida.log" && falha "o prompt ainda anuncia [1.0.0]" || ok "o prompt não anuncia mais [1.0.0]"

for lixo in latest "1.0" "<html>"; do
  C="$DIR/c4c-${lixo//[^a-z0-9]/_}"; FAKE_VERSAO="$lixo" rodar_84 "$C" "crm.exemplo.com\n\ncrm.exemplo.com\n0.4.0\nCHAVE\nY\n"
  if grep -q 'enchat-free:0.4.0$' "$C/work/enchat.yaml" 2>/dev/null && ! grep -q "estável atual" "$C/saida.log"; then
    ok "Console devolveu '$lixo': ignorado, sem sugestão"
  else
    falha "Console devolveu '$lixo' e foi aceito como sugestão"
  fi
done

# ---------------------------------------------------------------------------
# 5) Sem chamar o Console quando o banco é abortado, i18n: mensagens nos 3 idiomas.
# ---------------------------------------------------------------------------
for chave in ferramenta_enchat_banco_sem_chaves ferramenta_enchat_credenciais_reaproveitadas \
             ferramenta_enchat_versao_prompt_sugerida ferramenta_enchat_versao_prompt_sem_sugestao; do
  for idioma in PT EN ES; do
    grep -qE "^MSG_$idioma\[$chave\]=" secondary.sh || falha "mensagem $chave sem $idioma"
  done
done
ok "mensagens novas presentes em PT/EN/ES"

if [ "$falhas" -eq 0 ]; then
  echo "✅ Opção 84: reinstalação reaproveita credenciais, aborta sem elas e não inventa versão"
else
  exit 1
fi
