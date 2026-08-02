#!/bin/bash
# Reescreve a versão nos 5 lugares que precisam andar juntos. Chamado só
# pelo workflow release.yml, no momento do publish — nunca à mão. É
# exatamente essa disciplina que evita a deriva que já aconteceu uma vez
# neste repo (package.json em 0.1.9 enquanto os outros 4 ficaram em 0.1.5).
#
# Uso: set-version.sh X.Y.Z
set -euo pipefail

VERSION="${1:?uso: set-version.sh X.Y.Z}"
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "ERRO: versão precisa ser X.Y.Z (sem prefixo 'v', sem pré-release): '$VERSION'" >&2
    exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# main.sh e secondary.sh: ancorar nas primeiras 20 linhas. Os dois arquivos
# têm centenas de USOS de $ENCHA_VERSION (interpolação) além da atribuição
# — um sed sem âncora combinaria com essas linhas também e corromperia o
# script (ex: secondary.sh:20515 usa --arg tag "$ENCHA_VERSION").
sed -i.bak "1,20s/^ENCHA_VERSION=\".*\"/ENCHA_VERSION=\"$VERSION\"/" "$ROOT/main.sh"
sed -i.bak "1,20s/^ENCHA_VERSION=\".*\"/ENCHA_VERSION=\"$VERSION\"/" "$ROOT/secondary.sh"
rm -f "$ROOT/main.sh.bak" "$ROOT/secondary.sh.bak"

sed -i.bak "s/^export const APP_VERSION = \".*\";/export const APP_VERSION = \"$VERSION\";/" \
    "$ROOT/encha-setup-panel/src/lib/version.ts"
rm -f "$ROOT/encha-setup-panel/src/lib/version.ts.bak"

# npm version cuida de package.json E package-lock.json (o campo "version"
# aparece duas vezes no lockfile) num só comando — não fazer os dois com
# sed separado, é fácil esquecer o lockfile e ele ficar divergente.
(cd "$ROOT/encha-setup-panel" && npm version "$VERSION" --no-git-tag-version --allow-same-version)

echo "Versão $VERSION aplicada nos 5 arquivos."
