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

// Só aceita "usuário:grupo" numérico ou alfanumérico simples — vira
// argumento de `chown`, nunca interpolar algo vindo de fora deste arquivo.
const ALLOWED_OWNER_RE = /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/;

export type HostDirSpec = string | { path: string; owner: string };

export async function ensureHostDirs(token: string, endpointId: number, dirsSpec: HostDirSpec[]): Promise<void> {
  if (!dirsSpec.length) return;
  const dirs = dirsSpec.map((d) => (typeof d === "string" ? { path: d, owner: null as string | null } : d));
  for (const d of dirs) {
    if (!ALLOWED_DIR_RE.test(d.path)) throw new Error(`Diretório de host não permitido: "${d.path}"`);
    if (d.owner != null && !ALLOWED_OWNER_RE.test(d.owner)) {
      throw new Error(`Dono de diretório não permitido: "${d.owner}"`);
    }
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
  const linhas = dirs.map((d) => {
    const target = `/host-var${d.path.slice("/var".length)}`;
    // chown só na criação (idempotente do jeito errado: um restart não deve
    // re-chown um diretório que o próprio container já ajustou por dentro,
    // ex. Postgres — por isso `owner` é opt-in por diretório, não global).
    return d.owner != null
      ? `mkdir -p "${target}" && chown -R ${d.owner} "${target}"`
      : `mkdir -p "${target}"`;
  });
  const script = `set -eu\n${linhas.join("\n")}`;

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
