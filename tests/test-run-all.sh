#!/bin/bash
# S5-C: tests/run-all.sh não pode esconder falha. Roda o run-all REAL contra um
# diretório de testes falsos (ENCHA_TESTS_DIR) e confere: falha => saída != 0,
# skip aparece barulhento no resumo (nunca some, nunca vira verde calado),
# falso-verde ("❌ FALHOU" com saída 0) conta como falha, diretório vazio =
# falha, skip estrito = falha, ENCHA_RUN_ALL_SKIP pula pelo nome.
# Roda com: bash tests/test-run-all.sh
set -u
cd "$(dirname "$0")/.." || exit 1
falhas=0
falha() { echo "❌ FALHOU: $1"; falhas=$((falhas + 1)); }
ok() { echo "✅ $1"; }

DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT
# Variáveis que o run-all exporta/lê não podem vazar do ambiente que rodou ESTE teste.
unset ENCHA_RUN_ALL ENCHA_RUN_ALL_SKIP ENCHA_RUN_ALL_SEM_SKIP

mk() { # $1 = dir, $2 = nome, $3 = corpo
  mkdir -p "$1"; printf '#!/bin/bash\n%s\n' "$3" > "$1/$2"
}
rodar() { # $1 = dir ; demais = env extra (VAR=valor)
  local d="$1"; shift
  env "$@" ENCHA_TESTS_DIR="$d" bash tests/run-all.sh > "$DIR/saida.log" 2>&1
  echo $? > "$DIR/rc"
}

# 1) Mistura: 1 passa, 1 falha, 1 pula, 1 falso-verde.
D1="$DIR/mistura"
mk "$D1" test-a-ok.sh 'echo "✅ tudo certo"; exit 0'
mk "$D1" test-b-skip.sh 'echo "ferramenta X ausente neste ambiente"; exit 77'
mk "$D1" test-c-falha.sh 'echo "❌ FALHOU: o invariante quebrou"; exit 1'
mk "$D1" test-d-falso-verde.sh 'echo "❌ FALHOU: imprimiu a falha mas esqueceu do exit"; exit 0'
rodar "$D1" X=1
[ "$(cat "$DIR/rc")" != "0" ] && ok "com falha no meio, run-all sai != 0" || falha "run-all engoliu a falha (saiu 0)"
grep -qx "1 passaram, 2 falharam, 1 puladas (test-b-skip.sh: ferramenta X ausente neste ambiente)" "$DIR/saida.log" \
  && ok "resumo 'N passaram, M falharam, K puladas (motivo)' exato" || { falha "resumo errado:"; tail -4 "$DIR/saida.log"; }
grep -q "PULADO: test-b-skip.sh" "$DIR/saida.log" && ok "o skip é barulhento (linha própria com o motivo)" || falha "skip silencioso"
grep -q "o invariante quebrou" "$DIR/saida.log" && ok "a saída do teste que falhou é mostrada" || falha "a saída do teste que falhou sumiu"
grep -q "test-d-falso-verde.sh — saiu 0 mas imprimiu falha" "$DIR/saida.log" && ok "falso-verde (saída 0 com ❌ FALHOU) conta como falha" || falha "falso-verde passou"
grep -q "testes que falharam: test-c-falha.sh test-d-falso-verde.sh" "$DIR/saida.log" && ok "lista os nomes dos que falharam" || falha "não listou os que falharam"

# 2) Tudo verde + um skip: sai 0, mas o skip continua no resumo.
D2="$DIR/verde"
mk "$D2" test-a-ok.sh 'echo "✅ a"'
mk "$D2" test-b-ok.sh 'echo "✅ b"'
mk "$D2" test-c-skip.sh 'echo "sem docker"; exit 77'
rodar "$D2" X=1
[ "$(cat "$DIR/rc")" = "0" ] && ok "tudo passou/pulou: sai 0" || falha "saiu $(cat "$DIR/rc") sem falhas"
grep -qx "2 passaram, 0 falharam, 1 puladas (test-c-skip.sh: sem docker)" "$DIR/saida.log" && ok "o skip aparece no resumo mesmo no verde" || { falha "skip sumiu do resumo:"; tail -3 "$DIR/saida.log"; }

# 3) Skip estrito: skip vira falha.
rodar "$D2" ENCHA_RUN_ALL_SEM_SKIP=1
[ "$(cat "$DIR/rc")" != "0" ] && grep -q "não aceita skip" "$DIR/saida.log" && ok "ENCHA_RUN_ALL_SEM_SKIP=1: skip conta como falha" || falha "skip estrito não falhou"

# 4) Diretório sem testes: falha (glob quebrado não pode dar verde).
mkdir -p "$DIR/vazio"
rodar "$DIR/vazio" X=1
[ "$(cat "$DIR/rc")" != "0" ] && ok "diretório sem testes: falha" || falha "diretório vazio deu verde"

# 5) ENCHA_RUN_ALL_SKIP pula pelo nome (e avisa); os outros seguem.
rodar "$D1" ENCHA_RUN_ALL_SKIP="test-c-falha.sh test-d-falso-verde.sh"
[ "$(cat "$DIR/rc")" = "0" ] && grep -q "excluído por ENCHA_RUN_ALL_SKIP" "$DIR/saida.log" \
  && ok "ENCHA_RUN_ALL_SKIP pula pelo nome e avisa" || falha "ENCHA_RUN_ALL_SKIP não funcionou"

# 6) Teste que quebra por sintaxe/exit de shell é falha (não some).
D6="$DIR/quebrado"; mk "$D6" test-x.sh 'this_command_does_not_exist_zzz'
rodar "$D6" X=1
[ "$(cat "$DIR/rc")" != "0" ] && ok "teste que quebra (comando inexistente) é falha" || falha "teste quebrado deu verde"

# 7) run-all real enxerga os testes de verdade deste repo (e não a si mesmo).
ls tests/test-*.sh | grep -qx "tests/test-enchat-84-reinstalacao.sh" && ok "o glob do run-all cobre os testes reais do repo" || falha "glob não achou os testes reais"

if [ "$falhas" -eq 0 ]; then echo "✅ run-all.sh: falha, skip e falso-verde tratados como devem"; else exit 1; fi
