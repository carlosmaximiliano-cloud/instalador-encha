#!/bin/bash
# Callback assinado pro Monitor durante o publish (release.yml). Chamado até
# 3x: 'running' assim que o workflow começa (é como o Monitor aprende o
# run_url, já que a API de workflow_dispatch não devolve run id), e
# 'done'/'failed' no fim.
#
# Uso: report-publish.sh <phase: running|done|failed> <version> <commit_sha> [error_message] [image_digest]
# Env obrigatória: BUILDS_INGEST_SECRET
set -euo pipefail

PHASE="${1:?uso: report-publish.sh <phase> <version> <commit_sha> [error] [image_digest]}"
VERSION="${2:?}"
COMMIT_SHA="${3:?}"
ERROR_MSG="${4:-}"
IMAGE_DIGEST="${5:-}"

if [ -z "${BUILDS_INGEST_SECRET:-}" ]; then
    echo "::warning::BUILDS_INGEST_SECRET não configurado — Monitor não será notificado ($PHASE)."
    exit 0
fi

RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}"

BODY=$(jq -n \
    --arg sha "$COMMIT_SHA" \
    --arg version "$VERSION" \
    --arg phase "$PHASE" \
    --arg run_url "$RUN_URL" \
    --arg error "$ERROR_MSG" \
    --arg digest "$IMAGE_DIGEST" \
    '{commit_sha:$sha, version:$version, phase:$phase, run_url:$run_url}
     + (if $error != "" then {error:$error} else {} end)
     + (if $digest != "" then {image_digest:$digest} else {} end)')

TS=$(date +%s)
SIG=$(printf '%s.%s' "$TS" "$BODY" | openssl dgst -sha256 -hmac "$BUILDS_INGEST_SECRET" | sed 's/^.* //')

# --fail faz o curl retornar erro em HTTP >=400, mas não usamos -f puro aqui
# porque um callback perdido não deve necessariamente abortar o workflow
# inteiro (o passo que chama isso decide, via `|| true` ou não).
curl -sf -X POST "https://monitor.encha.com.br/api/v1/builds/publish-result" \
    -H "Content-Type: application/json" \
    -H "x-encha-signature: $SIG" \
    -H "x-encha-timestamp: $TS" \
    --data "$BODY"
