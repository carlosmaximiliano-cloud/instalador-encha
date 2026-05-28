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
