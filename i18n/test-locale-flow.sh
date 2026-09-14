#!/bin/bash
# Testa o fluxo de persistência do idioma escolhido (Fase 1):
# main.sh escolhe e grava /root/dados_vps/encha_locale, secondary.sh lê de
# volta quando roda sozinho (processo novo, sem ENCHA_LANG herdado).
# Roda com: bash i18n/test-locale-flow.sh
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

DV="$(mktemp -d)"
trap 'rm -rf "$DV"' EXIT

# --- Simula escolher_idioma() + salvar_idioma_escolhido() (main.sh) ---
simular_main_escolhe() {
    local resposta="$1"
    ENCHA_LANG_VEIO_DO_AMBIENTE=0
    case "$resposta" in
        2) ENCHA_LANG="en" ;;
        3) ENCHA_LANG="es" ;;
        *) ENCHA_LANG="pt" ;;
    esac
    mkdir -p "$DV/dados_vps"
    echo "$ENCHA_LANG" > "$DV/dados_vps/encha_locale"
}

# --- Mesma lógica de leitura de secondary.sh, mas apontando pro $DV de teste ---
ler_locale_standalone() {
    unset ENCHA_LANG
    local locale_file="$DV/dados_vps/encha_locale"
    if [ -z "${ENCHA_LANG:-}" ] && [ -f "$locale_file" ]; then
        ENCHA_LANG="$(cat "$locale_file" 2>/dev/null)"
    fi
    ENCHA_LANG="${ENCHA_LANG:-pt}"
    echo "$ENCHA_LANG"
}

simular_main_escolhe "2"
assert_eq "main.sh grava a escolha (en) em encha_locale" "en" "$(cat "$DV/dados_vps/encha_locale")"
assert_eq "secondary.sh standalone lê 'en' persistido" "en" "$(ler_locale_standalone)"

rm -f "$DV/dados_vps/encha_locale"
assert_eq "arquivo ausente (instalação anterior à Fase 1) cai em pt" "pt" "$(ler_locale_standalone)"

simular_main_escolhe "3"
ENCHA_LANG="pt"  # já herdado de main.sh (source no mesmo processo)
locale_file="$DV/dados_vps/encha_locale"
if [ -z "${ENCHA_LANG:-}" ] && [ -f "$locale_file" ]; then
    ENCHA_LANG="$(cat "$locale_file" 2>/dev/null)"
fi
ENCHA_LANG="${ENCHA_LANG:-pt}"
assert_eq "ENCHA_LANG já setado (sourced) não é sobrescrito pelo arquivo" "pt" "$ENCHA_LANG"

echo ""
if [ "$falhas" -eq 0 ]; then
    echo "Todos os testes de persistência de idioma passaram."
    exit 0
else
    echo "$falhas teste(s) falharam."
    exit 1
fi
