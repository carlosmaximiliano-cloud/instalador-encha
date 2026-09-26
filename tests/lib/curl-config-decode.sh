#!/bin/bash
# Decodificador de teste do "arquivo de configuração do curl" que
# curl_portainer (secondary.sh) manda por STDIN (`curl -K -`). Serve aos
# docker/curl FALSOS dos testes: como os segredos não estão mais no argv, é
# daqui que o falso lê o Authorization, o corpo e o campo Env.
#
# Uso:  curl-config-decode.sh <diretório-de-saída>   (config em stdin)
# Grava em <dir>: raw (stdin cru), header (valor do header), data (valor de
# data-raw) e form_env (valor de form-string sem o prefixo "Env="). Cada
# arquivo só existe se a chave apareceu. O desescape é o do curl entre aspas:
# \\ \" \n \r \t \v.
set -u
dir="${1:?diretório de saída}"
mkdir -p "$dir"
cat > "$dir/raw"
awk -v dir="$dir" '
function unesc(v,    i, c, n, out) {
  out = ""; n = length(v)
  for (i = 1; i <= n; i++) {
    c = substr(v, i, 1)
    if (c == "\\" && i < n) {
      i++; c = substr(v, i, 1)
      if (c == "n") out = out "\n"
      else if (c == "r") out = out "\r"
      else if (c == "t") out = out "\t"
      else if (c == "v") out = out "\v"
      else out = out c
    } else out = out c
  }
  return out
}
{
  if (match($0, /^[a-z-]+ = "/)) {
    chave = substr($0, 1, index($0, " =") - 1)
    resto = substr($0, RLENGTH + 1)
    sub(/"$/, "", resto)
    val = unesc(resto)
    if (chave == "header") arq = dir "/header"
    else if (chave == "data-raw") arq = dir "/data"
    else if (chave == "form-string") { arq = dir "/form_env"; sub(/^Env=/, "", val) }
    else next
    printf "%s", val > arq
    close(arq)
  }
}
' "$dir/raw"
exit 0
