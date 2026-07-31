import { discoverContext, imageExistsLocally, pullImage, runOneShotContainer, PortainerError } from "./portainer";
import { APP_VERSION } from "./version";

// Garante que diretórios existam no node manager antes de um deploy que usa
// bind mounts — o Swarm NÃO cria o diretório de origem de um bind mount
// sozinho (docker/cli não propaga create_host_path na conversão pra Swarm).
// Mesmo padrão do updater de scripts do host (host-updater.ts): container
// avulso via API do Portainer, já que o painel é read-only e sem docker.sock.

const CONTAINER_NAME = "encha-host-dir-init";
const CONTAINER_LABEL = "com.encha.role=host-dir-init";
const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";

// Só diretórios sob /var/enchat/<slug> — mantém o comando do container fixo
// (nunca interpolar caminho de usuário arbitrário aqui).
const ALLOWED_DIR_RE = /^\/var\/enchat\/[a-z0-9_-]+$/;

export async function ensureHostDirs(token: string, endpointId: number, dirs: string[]): Promise<void> {
  if (!dirs.length) return;
  for (const d of dirs) {
    if (!ALLOWED_DIR_RE.test(d)) throw new Error(`Diretório de host não permitido: "${d}"`);
  }

  let image = `${PANEL_IMAGE_REPO}:${APP_VERSION}`;
  const hasLocal = await imageExistsLocally(token, endpointId, image);
  if (!hasLocal) {
    image = FALLBACK_IMAGE;
    const hasFallback = await imageExistsLocally(token, endpointId, image);
    if (!hasFallback) await pullImage(token, endpointId, image);
  }

  // Mapeia /var/X -> /host-var/X (o bind é /var:/host-var, mais estreito que
  // o /root do host-updater).
  const targets = dirs.map((d) => `/host-var${d.slice("/var".length)}`);
  const script = `set -eu\nmkdir -p ${targets.map((t) => `"${t}"`).join(" ")}`;

  try {
    const { exitCode, logs, timedOut } = await runOneShotContainer(token, endpointId, {
      name: CONTAINER_NAME,
      label: CONTAINER_LABEL,
      timeoutMs: 30_000,
      spec: {
        Image: image,
        Entrypoint: ["/bin/sh", "-c"],
        Cmd: [script],
        User: "0",
        Tty: true,
        Labels: { "com.encha.role": "host-dir-init" },
        HostConfig: {
          Binds: ["/var:/host-var"],
          NetworkMode: "bridge",
          Privileged: false,
          RestartPolicy: { Name: "no" },
        },
      },
    });

    if (timedOut) throw new Error("Timeout ao preparar diretórios do host (30s)");
    if (exitCode !== 0) throw new Error(`Falha ao preparar diretórios do host (exit ${exitCode}): ${logs}`);
  } catch (e) {
    if (e instanceof PortainerError) throw new Error(`Portainer ${e.status}: ${e.message}`);
    throw e;
  }
}
