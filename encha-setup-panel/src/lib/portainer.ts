import { Agent, fetch as undiciFetch, FormData, File } from "undici";

const PORTAINER_URL = process.env.PORTAINER_URL ?? "http://portainer:9000";
const TLS_INSECURE =
  process.env.PORTAINER_TLS_INSECURE === "1" && process.env.NODE_ENV !== "production";

const insecureAgent = TLS_INSECURE
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : undefined;

type FetchOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInit = Record<string, any>;

async function call<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  let body: string | FormData | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const init: AnyInit = {
    method: opts.method ?? "GET",
    headers,
  };
  if (body !== undefined) init.body = body;
  if (insecureAgent) init.dispatcher = insecureAgent;

  const res = await undiciFetch(`${PORTAINER_URL}${path}`, init);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new PortainerError(res.status, text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

// Variante que nunca faz JSON.parse do corpo — necessária para endpoints do Docker
// Engine que respondem `Content-Type: application/json` mas com corpo em NDJSON
// (várias linhas JSON), como `POST /images/create`. `call()` quebraria em `res.json()`
// mesmo num pull bem-sucedido; aqui devolvemos o texto cru para quem chama decidir.
async function callRaw(path: string, opts: FetchOpts = {}): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  let body: string | FormData | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const init: AnyInit = {
    method: opts.method ?? "GET",
    headers,
  };
  if (body !== undefined) init.body = body;
  if (insecureAgent) init.dispatcher = insecureAgent;

  const res = await undiciFetch(`${PORTAINER_URL}${path}`, init);
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new PortainerError(res.status, text || `HTTP ${res.status}`);
  return { status: res.status, text };
}

export class PortainerError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "PortainerError";
  }
}

export type AuthResult = { jwt: string };
export type Endpoint = { Id: number; Name: string; Type: number };
export type SwarmInfo = { ID: string };
export type Stack = {
  Id: number;
  Name: string;
  EndpointId: number;
  Status: number;
  CreationDate: number;
};

export async function authenticate(username: string, password: string): Promise<string> {
  const r = await call<AuthResult>("/api/auth", {
    method: "POST",
    body: { username, password },
  });
  return r.jwt;
}

export async function listEndpoints(token: string): Promise<Endpoint[]> {
  return call<Endpoint[]>("/api/endpoints", { token });
}

export async function getSwarm(token: string, endpointId: number): Promise<SwarmInfo> {
  return call<SwarmInfo>(`/api/endpoints/${endpointId}/docker/swarm`, { token });
}

export async function listStacks(token: string): Promise<Stack[]> {
  return call<Stack[]>("/api/stacks", { token });
}

export async function deploySwarmStack(args: {
  token: string;
  name: string;
  yaml: string;
  swarmId: string;
  endpointId: number;
}): Promise<Stack> {
  const fd = new FormData();
  fd.append("Name", args.name);
  fd.append("SwarmID", args.swarmId);
  fd.append("endpointId", String(args.endpointId));
  fd.append("file", new File([args.yaml], `${args.name}.yaml`, { type: "text/yaml" }));
  return call<Stack>("/api/stacks/create/swarm/file", {
    method: "POST",
    token: args.token,
    formData: fd,
  });
}

type DockerService = {
  Spec?: { Labels?: Record<string, string> };
  ServiceStatus?: { RunningTasks?: number; DesiredTasks?: number };
};

export type SwarmStackStatus = {
  name: string;
  desired: number;
  running: number;
  ready: boolean;
};

export async function listSwarmStackStatuses(
  token: string,
  endpointId: number
): Promise<SwarmStackStatus[]> {
  const services = await call<DockerService[]>(
    `/api/endpoints/${endpointId}/docker/services?status=true`,
    { token }
  );
  const byStack = new Map<string, { desired: number; running: number }>();
  for (const svc of services) {
    const ns = svc.Spec?.Labels?.["com.docker.stack.namespace"];
    if (!ns) continue;
    const cur = byStack.get(ns) ?? { desired: 0, running: 0 };
    cur.desired += svc.ServiceStatus?.DesiredTasks ?? 0;
    cur.running += svc.ServiceStatus?.RunningTasks ?? 0;
    byStack.set(ns, cur);
  }
  return Array.from(byStack.entries()).map(([name, s]) => ({
    name,
    desired: s.desired,
    running: s.running,
    ready: s.desired === 0 || s.running >= s.desired,
  }));
}

// Service completo do Docker Engine API (subset que usamos para o self-update).
export type DockerServiceFull = {
  ID: string;
  Version: { Index: number };
  Spec: {
    Name?: string;
    Labels?: Record<string, string>;
    TaskTemplate?: {
      ContainerSpec?: { Image?: string };
      // demais campos preservados via spread ao reenviar
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
};

// Encontra um service Swarm pelo nome (ex: "encha-panel_panel"), via proxy Docker do Portainer.
export async function getServiceByName(
  token: string,
  endpointId: number,
  name: string
): Promise<DockerServiceFull | null> {
  const filters = encodeURIComponent(JSON.stringify({ name: [name] }));
  const services = await call<DockerServiceFull[]>(
    `/api/endpoints/${endpointId}/docker/services?filters=${filters}`,
    { token }
  );
  // O filtro `name` do Docker é prefixo; casa exatamente pelo Spec.Name.
  return services.find((s) => s.Spec?.Name === name) ?? services[0] ?? null;
}

// Atualiza a imagem de um service preservando o restante do Spec (rolling update no Swarm).
export async function updateServiceImage(
  token: string,
  endpointId: number,
  service: DockerServiceFull,
  newImage: string
): Promise<void> {
  const spec = {
    ...service.Spec,
    TaskTemplate: {
      ...service.Spec.TaskTemplate,
      ContainerSpec: {
        ...service.Spec.TaskTemplate?.ContainerSpec,
        Image: newImage,
      },
    },
  };
  await call(
    `/api/endpoints/${endpointId}/docker/services/${service.ID}/update?version=${service.Version.Index}`,
    { method: "POST", token, body: spec }
  );
}

export async function ensureSwarmVolume(
  token: string,
  endpointId: number,
  name: string
): Promise<void> {
  try {
    await call(`/api/endpoints/${endpointId}/docker/volumes/create`, {
      method: "POST",
      token,
      body: { Name: name, Driver: "local" },
    });
  } catch (e) {
    // 409 = volume já existe, ok
    if (!(e instanceof PortainerError) || e.status !== 409) throw e;
  }
}

type DockerContainer = { Id: string; State?: string };
type ExecCreateResponse = { Id: string };
type ExecInspect = { ExitCode: number | null };

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Acha o container em execução de um service Swarm (ex: "postgres_postgres") via label do Docker.
async function findRunningContainerId(
  token: string,
  endpointId: number,
  serviceName: string
): Promise<string | null> {
  const filters = encodeURIComponent(
    JSON.stringify({
      label: [`com.docker.swarm.service.name=${serviceName}`],
      status: ["running"],
    })
  );
  const containers = await call<DockerContainer[]>(
    `/api/endpoints/${endpointId}/docker/containers/json?filters=${filters}`,
    { token }
  );
  return containers[0]?.Id ?? null;
}

// Espera o container do service ficar `running` (mitiga corrida no deploy em 2 estágios).
async function waitForRunningContainer(
  token: string,
  endpointId: number,
  serviceName: string,
  opts: { retries?: number; delayMs?: number } = {}
): Promise<string> {
  const retries = opts.retries ?? 10;
  const delayMs = opts.delayMs ?? 3000;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const id = await findRunningContainerId(token, endpointId, serviceName);
    if (id) return id;
    if (attempt < retries) await sleep(delayMs);
  }
  throw new Error(
    `Serviço ${serviceName} não está rodando — instale/aguarde a stack correspondente antes de continuar`
  );
}

// Roda um comando dentro de um container via Docker exec (proxy Docker do Portainer).
async function dockerExec(
  token: string,
  endpointId: number,
  containerId: string,
  cmd: string[]
): Promise<{ exitCode: number; output: string }> {
  const created = await call<ExecCreateResponse>(
    `/api/endpoints/${endpointId}/docker/containers/${containerId}/exec`,
    {
      method: "POST",
      token,
      body: { AttachStdout: true, AttachStderr: true, Tty: false, Cmd: cmd },
    }
  );
  const output = await call<string>(`/api/endpoints/${endpointId}/docker/exec/${created.Id}/start`, {
    method: "POST",
    token,
    body: { Detach: false, Tty: false },
  });
  const inspect = await call<ExecInspect>(`/api/endpoints/${endpointId}/docker/exec/${created.Id}/json`, {
    token,
  });
  return { exitCode: inspect.ExitCode ?? 0, output: typeof output === "string" ? output : "" };
}

const POSTGRES_SERVICE_NAME = "postgres_postgres";

// Garante que um banco exista no Postgres compartilhado — idempotente, nunca dropa dados.
export async function ensurePostgresDatabase(
  token: string,
  endpointId: number,
  dbName: string
): Promise<void> {
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Nome de banco inválido: "${dbName}"`);
  }

  const containerId = await waitForRunningContainer(token, endpointId, POSTGRES_SERVICE_NAME);

  const sql =
    `psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${dbName}'" | grep -q 1 ` +
    `|| psql -U postgres -c "CREATE DATABASE ${dbName}"`;
  const { exitCode, output } = await dockerExec(token, endpointId, containerId, ["sh", "-c", sql]);

  if (exitCode !== 0) {
    throw new PortainerError(500, `Falha ao criar banco '${dbName}': ${output || `exit code ${exitCode}`}`);
  }
}

export async function pingPortainer(): Promise<boolean> {
  try {
    const init: AnyInit = {};
    if (insecureAgent) init.dispatcher = insecureAgent;
    const res = await undiciFetch(`${PORTAINER_URL}/api/system/status`, init);
    return res.ok;
  } catch {
    return false;
  }
}

export async function discoverContext(
  token: string
): Promise<{ endpointId: number; swarmId: string }> {
  const endpoints = await listEndpoints(token);
  if (!endpoints.length) throw new Error("Nenhum endpoint Portainer encontrado");
  const endpointId = endpoints[0].Id;
  const swarm = await getSwarm(token, endpointId);
  return { endpointId, swarmId: swarm.ID };
}

// ─────────────────────────────────────────────────────────────────────────
// Containers avulsos (one-shot) — usado pelo updater de scripts do host
// (src/lib/host-updater.ts). O painel não tem docker.sock nem é privilegiado;
// tudo isto passa pela API do Portainer com o JWT do usuário logado.
// ─────────────────────────────────────────────────────────────────────────

// Confere se uma imagem já está presente no node (evita pull desnecessário —
// o caminho principal do updater de scripts usa a própria imagem do painel,
// que por definição já está no node que está atendendo a requisição).
export async function imageExistsLocally(
  token: string,
  endpointId: number,
  image: string
): Promise<boolean> {
  try {
    await call(`/api/endpoints/${endpointId}/docker/images/${encodeURIComponent(image)}/json`, {
      token,
    });
    return true;
  } catch (e) {
    if (e instanceof PortainerError && e.status === 404) return false;
    throw e;
  }
}

// Pull de imagem (fallback — só usado se imageExistsLocally() for false para
// a imagem principal). `POST /images/create` responde 200 com um stream NDJSON
// mesmo quando o pull falha no meio; a falha aparece como uma linha com chave
// "error". callRaw() é obrigatório aqui — call() quebraria em res.json().
export async function pullImage(token: string, endpointId: number, image: string): Promise<void> {
  const [repo, tag = "latest"] = image.split(":");
  const { text } = await callRaw(
    `/api/endpoints/${endpointId}/docker/images/create` +
      `?fromImage=${encodeURIComponent(repo)}&tag=${encodeURIComponent(tag)}`,
    { method: "POST", token }
  );
  const lines = text.split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj?.error) throw new PortainerError(500, `Falha no pull de ${image}: ${obj.error}`);
    } catch (e) {
      if (e instanceof PortainerError) throw e;
      // linha não-JSON isolada — ignora, não é indicativo de erro
    }
  }
}

export type ContainerSpec = {
  Image: string;
  Entrypoint?: string[];
  Cmd?: string[];
  Env?: string[];
  User?: string;
  Tty?: boolean;
  Labels?: Record<string, string>;
  HostConfig: {
    Binds?: string[];
    AutoRemove?: boolean;
    NetworkMode?: string;
    Privileged?: boolean;
    RestartPolicy?: { Name: string };
  };
};

export async function createContainer(
  token: string,
  endpointId: number,
  name: string,
  spec: ContainerSpec
): Promise<{ Id: string }> {
  return call<{ Id: string }>(
    `/api/endpoints/${endpointId}/docker/containers/create?name=${encodeURIComponent(name)}`,
    { method: "POST", token, body: spec }
  );
}

export async function startContainer(token: string, endpointId: number, id: string): Promise<void> {
  await call(`/api/endpoints/${endpointId}/docker/containers/${id}/start`, {
    method: "POST",
    token,
  });
}

type ContainerInspect = {
  State?: { Running?: boolean; ExitCode?: number; Status?: string; Error?: string };
};

export async function inspectContainer(
  token: string,
  endpointId: number,
  id: string
): Promise<ContainerInspect> {
  return call<ContainerInspect>(`/api/endpoints/${endpointId}/docker/containers/${id}/json`, {
    token,
  });
}

// Espera o container sair via polling (NÃO usa `POST /containers/{id}/wait`,
// que bloqueia a requisição HTTP sem timeout configurado — arriscado atrás de
// Traefik/Portainer). Teto de ~2min; em timeout, força remoção e devolve exitCode -1.
export async function waitForContainerExit(
  token: string,
  endpointId: number,
  id: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<{ exitCode: number; timedOut: boolean }> {
  const timeoutMs = opts.timeoutMs ?? 120_000;
  const intervalMs = opts.intervalMs ?? 2000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const info = await inspectContainer(token, endpointId, id);
    if (info.State?.Running === false) {
      return { exitCode: info.State.ExitCode ?? -1, timedOut: false };
    }
    await sleep(intervalMs);
  }
  return { exitCode: -1, timedOut: true };
}

export async function getContainerLogs(
  token: string,
  endpointId: number,
  id: string,
  tail = 200
): Promise<string> {
  const { text } = await callRaw(
    `/api/endpoints/${endpointId}/docker/containers/${id}/logs?stdout=1&stderr=1&tail=${tail}`,
    { token }
  );
  return text;
}

export async function removeContainer(
  token: string,
  endpointId: number,
  id: string
): Promise<void> {
  try {
    await call(`/api/endpoints/${endpointId}/docker/containers/${id}?force=1&v=1`, {
      method: "DELETE",
      token,
    });
  } catch (e) {
    // 404 = já não existe — ok, alvo era remover.
    if (!(e instanceof PortainerError) || e.status !== 404) throw e;
  }
}

// Varre containers órfãos de execuções anteriores que travaram e nunca foram
// removidos (crash do painel a meio do passo, timeout, etc.) — evita que o
// nome fixo do container fique permanentemente "ocupado" (409 no create).
export async function listContainersByLabel(
  token: string,
  endpointId: number,
  label: string
): Promise<Array<{ Id: string; Names?: string[]; Created?: number }>> {
  const filters = encodeURIComponent(JSON.stringify({ label: [label], all: ["true"] }));
  return call(`/api/endpoints/${endpointId}/docker/containers/json?all=1&filters=${filters}`, {
    token,
  });
}

// Cria, roda até o fim, coleta logs e remove um container avulso (one-shot).
// Sempre remove em `finally` — mesmo em erro/timeout — para não vazar o nome
// nem deixar processo root-equivalente pendurado no host.
export async function runOneShotContainer(
  token: string,
  endpointId: number,
  args: { name: string; label: string; spec: ContainerSpec; timeoutMs?: number }
): Promise<{ exitCode: number; logs: string; timedOut: boolean }> {
  // Varredura de órfãos com o mesmo label antes de criar um novo.
  const orphans = await listContainersByLabel(token, endpointId, args.label);
  for (const o of orphans) {
    await removeContainer(token, endpointId, o.Id);
  }

  const { Id } = await createContainer(token, endpointId, args.name, {
    ...args.spec,
    HostConfig: { ...args.spec.HostConfig, AutoRemove: false },
  });

  try {
    await startContainer(token, endpointId, Id);
    const { exitCode, timedOut } = await waitForContainerExit(token, endpointId, Id, {
      timeoutMs: args.timeoutMs,
    });
    const logs = await getContainerLogs(token, endpointId, Id).catch(() => "");
    return { exitCode, logs, timedOut };
  } finally {
    await removeContainer(token, endpointId, Id).catch(() => {});
  }
}
