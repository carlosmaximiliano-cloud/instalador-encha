import {
  discoverContext,
  imageExistsLocally,
  pullImage,
  runOneShotContainer,
  PortainerError,
} from "./portainer";
import { APP_VERSION } from "./version";

// Atualiza os scripts do host (/root/main.sh, /root/SetupEnchaAI,
// /root/encha-setup-panel/) via um container avulso criado pela API do
// Portainer — o painel é read-only, sem docker.sock, e só fala Docker através
// do Portainer com o JWT do usuário logado.
//
// Caminho principal: usa a PRÓPRIA imagem do painel (já está no node — zero
// pull, elimina a maior fonte de falha). Fallback: alpine/git, só se por
// algum motivo a imagem do painel não for encontrada localmente.

const CONTAINER_NAME = "encha-host-updater";
const CONTAINER_LABEL = "com.encha.role=host-script-updater";
const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";
const SETUPTESTE_REPO = "enchaaluno/setupteste";

const VERSION_RE = /^\d+\.\d+\.\d+$/;

// Script fixo — nunca interpolar input do usuário aqui. A única variável é a
// versão-alvo (validada por VERSION_RE antes de virar env do container).
const UPDATE_SCRIPT = `
set -eu
TMP=/tmp/encha-src
rm -rf "$TMP"; mkdir -p "$TMP"

fetch() { wget -qO- "https://codeload.github.com/${SETUPTESTE_REPO}/tar.gz/$1"; }
fetch "$ENCHA_SRC_REF" > /tmp/src.tgz 2>/dev/null || fetch refs/heads/main > /tmp/src.tgz
tar xzf /tmp/src.tgz -C "$TMP" --strip-components=1

test -f "$TMP/main.sh"
test -f "$TMP/secondary.sh"
test -d "$TMP/encha-setup-panel"
grep -q '^ENCHA_VERSION=' "$TMP/secondary.sh"

install -m 0755 "$TMP/main.sh" /host-root/.main.sh.new
mv -f /host-root/.main.sh.new /host-root/main.sh

install -m 0755 "$TMP/secondary.sh" /host-root/.SetupEnchaAI.new
mv -f /host-root/.SetupEnchaAI.new /host-root/SetupEnchaAI

rm -rf /host-root/.panel.new
cp -a "$TMP/encha-setup-panel" /host-root/.panel.new
if [ -e /host-root/encha-setup-panel ]; then
  rm -rf /host-root/encha-setup-panel.old
  mv /host-root/encha-setup-panel /host-root/encha-setup-panel.old
fi
mv /host-root/.panel.new /host-root/encha-setup-panel
rm -rf /host-root/encha-setup-panel.old "$TMP" /tmp/src.tgz

grep -m1 '^ENCHA_VERSION=' /host-root/SetupEnchaAI
`.trim();

export type HostUpdateResult =
  | { ok: true; installedVersion: string; logs: string }
  | { ok: false; error: string; logs?: string };

export async function updateHostScripts(
  token: string,
  targetVersion: string
): Promise<HostUpdateResult> {
  if (!VERSION_RE.test(targetVersion)) {
    return { ok: false, error: `Versão-alvo inválida: "${targetVersion}"` };
  }

  try {
    const { endpointId } = await discoverContext(token);

    let image = `${PANEL_IMAGE_REPO}:${APP_VERSION}`;
    const hasLocal = await imageExistsLocally(token, endpointId, image);
    if (!hasLocal) {
      image = FALLBACK_IMAGE;
      const hasFallback = await imageExistsLocally(token, endpointId, image);
      if (!hasFallback) await pullImage(token, endpointId, image);
    }

    const { exitCode, logs, timedOut } = await runOneShotContainer(token, endpointId, {
      name: CONTAINER_NAME,
      label: CONTAINER_LABEL,
      timeoutMs: 120_000,
      spec: {
        Image: image,
        Entrypoint: ["/bin/sh", "-c"],
        Cmd: [UPDATE_SCRIPT],
        Env: [`ENCHA_SRC_REF=refs/tags/v${targetVersion}`],
        User: "0",
        Tty: true,
        Labels: {
          "com.encha.role": "host-script-updater",
          "com.encha.version": targetVersion,
        },
        HostConfig: {
          Binds: ["/root:/host-root"],
          NetworkMode: "bridge",
          Privileged: false,
          RestartPolicy: { Name: "no" },
        },
      },
    });

    if (timedOut) {
      return { ok: false, error: "Timeout ao atualizar os scripts do host (2min)", logs };
    }
    if (exitCode !== 0) {
      return { ok: false, error: `Script de atualização falhou (exit ${exitCode})`, logs };
    }

    const installedVersion = logs
      .split("\n")
      .map((l) => l.trim())
      .reverse()
      .map((l) => /^ENCHA_VERSION=["']?([\d.]+)["']?/.exec(l)?.[1])
      .find(Boolean);

    if (!installedVersion) {
      return { ok: false, error: "Não foi possível confirmar a versão instalada", logs };
    }
    if (installedVersion !== targetVersion) {
      return {
        ok: false,
        error:
          `Versão instalada (${installedVersion}) difere da versão-alvo (${targetVersion}) — ` +
          `provavelmente a tag da release não existe no repositório e caiu no fallback de 'main'.`,
        logs,
      };
    }

    return { ok: true, installedVersion, logs };
  } catch (e) {
    const msg =
      e instanceof PortainerError ? `Portainer ${e.status}: ${e.message}` : (e as Error).message;
    return { ok: false, error: msg };
  }
}
