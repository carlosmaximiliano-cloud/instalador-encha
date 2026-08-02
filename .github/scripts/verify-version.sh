#!/bin/bash
# Falha se os 5 lugares de versão não baterem entre si. Roda no fim de
# release.yml (depois de set-version.sh) e como aviso não-bloqueante em
# build.yml, pra deriva ficar visível assim que entrar em vez de só ser
# descoberta na hora de publicar.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

main_v=$(grep -m1 '^ENCHA_VERSION=' "$ROOT/main.sh" | sed -E 's/^ENCHA_VERSION="([^"]*)"/\1/')
secondary_v=$(grep -m1 '^ENCHA_VERSION=' "$ROOT/secondary.sh" | sed -E 's/^ENCHA_VERSION="([^"]*)"/\1/')
version_ts_v=$(grep -m1 '^export const APP_VERSION' "$ROOT/encha-setup-panel/src/lib/version.ts" | sed -E 's/.*"([^"]*)".*/\1/')
package_json_v=$(node -p "require('$ROOT/encha-setup-panel/package.json').version")
lockfile_v=$(node -p "require('$ROOT/encha-setup-panel/package-lock.json').version")

echo "main.sh:           $main_v"
echo "secondary.sh:       $secondary_v"
echo "version.ts:          $version_ts_v"
echo "package.json:      $package_json_v"
echo "package-lock.json: $lockfile_v"

if [ "$main_v" = "$secondary_v" ] && [ "$secondary_v" = "$version_ts_v" ] \
   && [ "$version_ts_v" = "$package_json_v" ] && [ "$package_json_v" = "$lockfile_v" ]; then
    echo "OK: os 5 lugares batem em $main_v"
    exit 0
fi

echo "ERRO: divergência de versão entre os 5 arquivos — ver acima." >&2
exit 1
