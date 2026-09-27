#!/bin/bash
# Roda TODOS os tests/test-*.sh e devolve um resumo honesto.
#
# POR QUE EXISTE (S5-C): o workflow .github/workflows/test.yml só executava
# 2 testes de shell por nome; os outros nunca rodavam no CI, e falso-verdes
# do S1-S4 já passaram por isso (teste escrito, nunca executado por ninguém).
#
# FORMA CORRETA (D): o workflow chamar ESTE script diretamente, num único step
# (`bash tests/run-all.sh`), em vez de listar teste por teste — um teste novo
# em tests/ passa a valer no CI sem editar o workflow. ISSO DEPENDE DE O CARLOS
# AUTORIZAR editar .github/workflows/test.yml (regra deste repo: nenhuma sessão
# de segurança mexe em workflow). Enquanto isso não acontece, o teste que o CI
# JÁ executa (tests/test-enchat-yaml-pinfy.sh) chama este script ao final, então
# a cobertura completa já vale sem mudar o workflow.
#
# PROTOCOLO:
#   - saída 0            = passou;
#   - saída 77           = PULADO, decisão do PRÓPRIO teste (ferramenta que só
#                          existe fora do CI, ex.: bash 3.2 do macOS sem Docker).
#                          O motivo é a última linha impressa pelo teste. Todo
#                          skip aparece BARULHENTO no resumo — nunca some;
#   - qualquer outra     = FALHOU (o teste é mostrado por inteiro);
#   - saída 0 mas com uma linha "❌ FALHOU" na saída = FALHOU também (teste
#     que imprime a falha e esquece de sair != 0 é um falso-verde);
#   - nenhum teste encontrado = FALHOU (um glob que quebrou não pode dar verde).
# O resumo final é "N passaram, M falharam, K puladas (motivo)"; sai != 0 se
# algum falhou. ENCHA_RUN_ALL_SEM_SKIP=1 faz skip contar como falha (para um
# ambiente onde nada deveria ser pulado).
#
# Guardas de recursão: este script exporta ENCHA_RUN_ALL=1 para os testes
# (test-enchat-yaml-pinfy.sh, que chama este script, não o chama de volta quando
# a variável está setada); quem o chama pode pular testes com
# ENCHA_RUN_ALL_SKIP="test-a.sh test-b.sh" (nomes de arquivo). ENCHA_TESTS_DIR
# troca o diretório de testes (usado por tests/test-run-all.sh).
#
# Roda com: bash tests/run-all.sh
set -u
cd "$(dirname "$0")/.." || exit 1
dir_testes="${ENCHA_TESTS_DIR:-tests}"
export ENCHA_RUN_ALL=1

LOGS="$(mktemp -d)"
trap 'rm -rf "$LOGS"' EXIT

# Prazo por teste: um teste pendurado vira FALHA explícita em vez de segurar o
# job do CI até o limite dele (6 h no GitHub). -k: quem ignora o TERM leva
# KILL 10 s depois. Sem `timeout` (macOS sem coreutils) roda sem prazo.
prazo="${ENCHA_RUN_ALL_PRAZO:-600}"
com_prazo() {
  if command -v timeout >/dev/null 2>&1; then timeout -k 10 "$prazo" "$@"; else "$@"; fi
}

passaram=0; falharam=0; puladas=0
nomes_falha=""; motivos_skip=""
total=0

for t in $(ls "$dir_testes"/test-*.sh 2>/dev/null | sort); do
  base="$(basename "$t")"
  case " ${ENCHA_RUN_ALL_SKIP:-} " in *" $base "*) echo "⏭️  $base — excluído por ENCHA_RUN_ALL_SKIP (quem chamou o roda por conta própria)"; continue ;; esac
  total=$((total + 1))
  log="$LOGS/$base.log"
  # stdin = /dev/null: um `read` esquecido num teste recebe EOF na hora, em vez
  # de esperar um terminal que o CI não tem (ou o do dev, para sempre).
  com_prazo bash "$t" < /dev/null > "$log" 2>&1
  rc=$?
  if [ "$rc" -eq 77 ]; then
    motivo="$(grep -v '^[[:space:]]*$' "$log" | tail -1)"
    if [ -n "${ENCHA_RUN_ALL_SEM_SKIP:-}" ]; then
      echo "❌ FALHOU: $base — PULADO, mas ENCHA_RUN_ALL_SEM_SKIP=1 não aceita skip ($motivo)"
      falharam=$((falharam + 1)); nomes_falha="$nomes_falha $base"
    else
      echo "⚠️  PULADO: $base — $motivo"
      puladas=$((puladas + 1)); motivos_skip="${motivos_skip:+$motivos_skip; }$base: $motivo"
    fi
  elif [ "$rc" -eq 0 ] && grep -q '^❌ FALHOU' "$log"; then
    echo "❌ FALHOU: $base — saiu 0 mas imprimiu falha (falso-verde); saída abaixo"
    sed 's/^/    | /' "$log"
    falharam=$((falharam + 1)); nomes_falha="$nomes_falha $base"
  elif [ "$rc" -eq 0 ]; then
    echo "✅ $base ($(grep -c '^✅' "$log") verificações)"
    passaram=$((passaram + 1))
  elif [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
    echo "❌ FALHOU: $base — estourou o prazo de ${prazo}s (pendurado?); saída até ali abaixo"
    sed 's/^/    | /' "$log"
    falharam=$((falharam + 1)); nomes_falha="$nomes_falha $base"
  else
    echo "❌ FALHOU: $base — saída $rc; saída abaixo"
    sed 's/^/    | /' "$log"
    falharam=$((falharam + 1)); nomes_falha="$nomes_falha $base"
  fi
done

if [ "$total" -eq 0 ]; then
  echo "❌ FALHOU: nenhum $dir_testes/test-*.sh encontrado — um glob quebrado não pode dar verde"
  exit 1
fi

echo ""
resumo="$passaram passaram, $falharam falharam, $puladas puladas"
[ "$puladas" -gt 0 ] && resumo="$resumo ($motivos_skip)"
echo "$resumo"
[ "$falharam" -eq 0 ] || { echo "❌ testes que falharam:$nomes_falha"; exit 1; }
exit 0
