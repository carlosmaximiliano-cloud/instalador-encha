#!/bin/bash
# Testa a mecânica de t()/MSG_* isoladamente, sem depender de main.sh ou
# secondary.sh inteiros (que fariam apt/docker/rede). Roda com:
#   bash i18n/test-t-function.sh
set -u
falhas=0

assert_eq() {
    local descricao="$1" esperado="$2" obtido="$3"
    if [ "$esperado" != "$obtido" ]; then
        echo "❌ FALHOU: $descricao"
        echo "   esperado: $esperado"
        echo "   obtido:   $obtido"
        falhas=$((falhas + 1))
    else
        echo "✅ $descricao"
    fi
}

ENCHA_LANG="pt"
declare -A MSG_PT=()
declare -A MSG_EN=()
declare -A MSG_ES=()

t() {
    local chave="$1"; shift
    local template
    case "$ENCHA_LANG" in
        en) template="${MSG_EN[$chave]:-${MSG_PT[$chave]:-$chave}}" ;;
        es) template="${MSG_ES[$chave]:-${MSG_PT[$chave]:-$chave}}" ;;
        *)  template="${MSG_PT[$chave]:-$chave}" ;;
    esac
    if [ "$#" -gt 0 ]; then
        printf -- "$template" "$@"
    else
        printf '%s' "$template"
    fi
}

MSG_PT[saudacao]="Olá, %s!"
MSG_EN[saudacao]="Hello, %s!"
MSG_ES[saudacao]="¡Hola, %s!"

ENCHA_LANG="pt"; assert_eq "pt resolve direto"        "Olá, Carlos!"   "$(t saudacao Carlos)"
ENCHA_LANG="en"; assert_eq "en resolve direto"         "Hello, Carlos!" "$(t saudacao Carlos)"
ENCHA_LANG="es"; assert_eq "es resolve direto"         "¡Hola, Carlos!" "$(t saudacao Carlos)"

ENCHA_LANG="en"
MSG_PT[so_pt]="Só existe em pt: %s"
assert_eq "chave ausente em en cai para pt" "Só existe em pt: X" "$(t so_pt X)"

ENCHA_LANG="pt"
assert_eq "chave totalmente inexistente devolve a própria chave" "chave_fantasma" "$(t chave_fantasma)"

ENCHA_LANG="fr"
assert_eq "idioma não catalogado (fr) cai para pt" "Olá, Maria!" "$(t saudacao Maria)"

ENCHA_LANG="pt"
MSG_PT[sem_placeholder]="Texto fixo sem variável"
assert_eq "sem argumentos não quebra por causa de printf" "Texto fixo sem variável" "$(t sem_placeholder)"

echo ""
if [ "$falhas" -eq 0 ]; then
    echo "Todos os testes de t() passaram."
    exit 0
else
    echo "$falhas teste(s) falharam."
    exit 1
fi
