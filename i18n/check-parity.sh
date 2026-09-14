#!/bin/bash
# Verificador de paridade de tradução — falha se MSG_EN ou MSG_ES tiverem
# menos (ou mais) chaves que MSG_PT em main.sh/secondary.sh, ou se alguma
# chave existir só de um lado. Roda em CI a cada commit que toque esses dois
# arquivos, a partir da Fase 1 (quando o catálogo passa a ter conteúdo de
# verdade — hoje os três ainda começam vazios, então roda limpo).
#
# Uso: bash i18n/check-parity.sh
set -u
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
falhas=0

# Extrai as chaves de um catálogo (MSG_PT[chave]=...) de um arquivo, uma por
# linha. Não avalia o bash — só faz parsing textual, então funciona mesmo com
# valores contendo aspas/variáveis não resolvidas. Ignora linhas comentadas
# (ex.: o exemplo de uso no cabeçalho de t() em main.sh/secondary.sh) — senão
# um exemplo de documentação vira falso positivo de paridade.
extrair_chaves() {
    local arquivo="$1" catalogo="$2"
    grep -v '^[[:space:]]*#' "$arquivo" \
        | grep -oE "${catalogo}\[[a-zA-Z0-9_]+\]=" \
        | sed -E "s/${catalogo}\[([a-zA-Z0-9_]+)\]=/\1/" \
        | sort -u
}

checar_arquivo() {
    local arquivo="$1"
    if [ ! -f "$arquivo" ]; then
        echo "⚠️  $arquivo não encontrado — pulando."
        return
    fi

    local chaves_pt chaves_en chaves_es
    chaves_pt=$(extrair_chaves "$arquivo" "MSG_PT")
    chaves_en=$(extrair_chaves "$arquivo" "MSG_EN")
    chaves_es=$(extrair_chaves "$arquivo" "MSG_ES")

    local total_pt
    total_pt=$(echo -n "$chaves_pt" | grep -c . || true)

    for par in "en:$chaves_en" "es:$chaves_es"; do
        local idioma="${par%%:*}"
        local chaves_idioma="${par#*:}"

        local faltando_no_idioma
        faltando_no_idioma=$(comm -23 <(echo "$chaves_pt") <(echo "$chaves_idioma") 2>/dev/null | grep -v '^$' || true)
        if [ -n "$faltando_no_idioma" ]; then
            echo "❌ $arquivo: chave(s) em MSG_PT ausente(s) em MSG_${idioma^^}:"
            echo "$faltando_no_idioma" | sed 's/^/   - /'
            falhas=$((falhas + 1))
        fi

        local sobrando_no_idioma
        sobrando_no_idioma=$(comm -13 <(echo "$chaves_pt") <(echo "$chaves_idioma") 2>/dev/null | grep -v '^$' || true)
        if [ -n "$sobrando_no_idioma" ]; then
            echo "❌ $arquivo: chave(s) em MSG_${idioma^^} sem correspondente em MSG_PT (typo ou chave morta):"
            echo "$sobrando_no_idioma" | sed 's/^/   - /'
            falhas=$((falhas + 1))
        fi
    done

    echo "ℹ️  $arquivo: $total_pt chave(s) em MSG_PT."
}

checar_arquivo "$repo_root/main.sh"
checar_arquivo "$repo_root/secondary.sh"

echo ""
if [ "$falhas" -eq 0 ]; then
    echo "✅ Paridade de tradução OK."
    exit 0
else
    echo "❌ $falhas problema(s) de paridade encontrado(s)."
    exit 1
fi
