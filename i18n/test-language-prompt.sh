#!/bin/bash
# Testa escolher_idioma()/salvar_idioma_escolhido() de verdade — extraídas
# via awk de main.sh (não reimplementadas à mão), pra pegar regressão se
# alguém editar a função e esquecer de manter o contrato. main.sh não pode
# ser `source`ado inteiro pra testar isso: ele tem código de execução de
# topo (instala pacotes, mexe em /etc/hosts) que rodaria junto.
#
# Roda com: bash i18n/test-language-prompt.sh
# Escreve em /root/dados_vps — rode dentro de um container/VM descartável,
# nunca numa máquina de verdade (é exatamente o que o CI faz).
set -u
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
falhas=0

assert_eq() {
    local descricao="$1" esperado="$2" obtido="$3"
    if [ "$esperado" != "$obtido" ]; then
        echo "❌ FALHOU: $descricao (esperado='$esperado' obtido='$obtido')"
        falhas=$((falhas + 1))
    else
        echo "✅ $descricao"
    fi
}

extraidas="$(mktemp)"
trap 'rm -f "$extraidas"' EXIT
awk '
  /^t\(\) \{/ { capturando=1 }
  /^escolher_idioma\(\) \{/ { capturando=1 }
  /^salvar_idioma_escolhido\(\) \{/ { capturando=1 }
  capturando { print }
  capturando && /^\}/ { capturando=0; print "" }
' "$repo_root/main.sh" > "$extraidas"

if ! grep -q "^escolher_idioma() {" "$extraidas" || ! grep -q "^salvar_idioma_escolhido() {" "$extraidas"; then
    echo "❌ Não consegui extrair escolher_idioma()/salvar_idioma_escolhido() de main.sh — nome ou formato da função mudou?"
    exit 1
fi

# shellcheck source=/dev/null
source "$extraidas"
roxo=""; reset=""; negrito=""; ciano=""  # sem cor no teste

ENCHA_LANG_VEIO_DO_AMBIENTE=0; ENCHA_LANG="pt"
echo "2" | { escolher_idioma; assert_eq "resposta '2' escolhe en" "en" "$ENCHA_LANG"; }

ENCHA_LANG_VEIO_DO_AMBIENTE=0; ENCHA_LANG="pt"
echo "3" | { escolher_idioma; assert_eq "resposta '3' escolhe es" "es" "$ENCHA_LANG"; }

ENCHA_LANG_VEIO_DO_AMBIENTE=0; ENCHA_LANG="xx"
echo "1" | { escolher_idioma; assert_eq "resposta '1' escolhe pt" "pt" "$ENCHA_LANG"; }

ENCHA_LANG_VEIO_DO_AMBIENTE=0; ENCHA_LANG="xx"
echo "" | { escolher_idioma; assert_eq "Enter vazio escolhe pt (default)" "pt" "$ENCHA_LANG"; }

ENCHA_LANG_VEIO_DO_AMBIENTE=0; ENCHA_LANG="xx"
echo "banana" | { escolher_idioma; assert_eq "resposta inválida cai em pt, nunca quebra" "pt" "$ENCHA_LANG"; }

ENCHA_LANG_VEIO_DO_AMBIENTE=1; ENCHA_LANG="es"
saida=$(echo "2" | { escolher_idioma; echo "$ENCHA_LANG"; })
assert_eq "ENCHA_LANG do ambiente pula a pergunta e não consome stdin" "es" "$saida"

ENCHA_LANG="en"
salvar_idioma_escolhido
assert_eq "salvar_idioma_escolhido grava /root/dados_vps/encha_locale" "en" "$(cat /root/dados_vps/encha_locale 2>/dev/null)"

echo ""
if [ "$falhas" -eq 0 ]; then
    echo "Todos os testes do prompt de idioma passaram."
    exit 0
else
    echo "$falhas teste(s) falharam."
    exit 1
fi
