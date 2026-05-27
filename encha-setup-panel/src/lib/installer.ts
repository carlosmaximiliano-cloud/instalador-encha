import { z } from "zod";
import { getStack } from "./stacks/registry";
import { deploySwarmStack, discoverContext, listStacks, type Stack } from "./portainer";
import { logAudit } from "./audit";
import { encryptSecret } from "./crypto";
import { getDb } from "./db";
import type { SwarmContext, GeneratedSecret } from "./stacks/types";

export type InstallInput = {
  stackId: string;
  values: Record<string, unknown>;
  swarmCtx: SwarmContext;
  token: string;
  user: string;
  ip: string;
};

export type InstallResult = {
  ok: boolean;
  stack?: Stack;
  error?: string;
  generatedSecrets?: GeneratedSecret[];
};

function shouldEncryptField(name: string): boolean {
  return /pass|senha|secret|token|key|apikey/i.test(name);
}

function buildSecretMap(secrets: GeneratedSecret[], reused: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of secrets) {
    if (s.value === "REUSE_POSTGRES") {
      out[s.name] = reused.senha_postgres ?? "";
    } else if (s.value === "REUSE_MINIO") {
      out[s.name] = reused.minio_access ?? "";
    } else {
      out[s.name] = s.value;
    }
  }
  return out;
}

async function loadReusedSecrets(): Promise<Record<string, string>> {
  const db = getDb();
  const row = db
    .prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?")
    .get("__shared__") as { encrypted_envs: string } | undefined;
  if (!row) return {};
  try {
    const { decryptSecret } = await import("./crypto");
    return JSON.parse(decryptSecret(row.encrypted_envs));
  } catch {
    return {};
  }
}

function saveSharedSecrets(secrets: Record<string, string>): void {
  const db = getDb();
  const blob = encryptSecret(JSON.stringify(secrets));
  const now = Date.now();
  db.prepare(
    `INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(stack_name) DO UPDATE SET encrypted_envs = excluded.encrypted_envs, updated_at = excluded.updated_at`
  ).run("__shared__", blob, now, now);
}

function saveStackSecrets(stackName: string, envs: Record<string, unknown>, generated: GeneratedSecret[]): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(envs)) {
    safe[k] = shouldEncryptField(k) ? "[encrypted]" : v;
  }
  const payload = { values: safe, generated_count: generated.length };
  const db = getDb();
  const blob = encryptSecret(JSON.stringify({ values: envs, generated }));
  const now = Date.now();
  db.prepare(
    `INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(stack_name) DO UPDATE SET encrypted_envs = excluded.encrypted_envs, updated_at = excluded.updated_at`
  ).run(stackName, blob, now, now);
  logAudit({
    user: "system",
    ip: "local",
    action: "stack.install",
    target: stackName,
    result: "ok",
    meta: payload,
  });
}

export async function installStack(input: InstallInput): Promise<InstallResult> {
  const def = getStack(input.stackId);
  if (!def) return { ok: false, error: "Stack desconhecida" };

  const parsed = def.schema.safeParse(input.values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e: z.ZodIssue) => e.message).join("; ") };
  }

  try {
    const reused = await loadReusedSecrets();
    const generated = def.generateSecrets?.(parsed.data) ?? [];
    const secretMap = buildSecretMap(generated, reused);

    const sharedToPersist: Record<string, string> = { ...reused };
    for (const g of generated) {
      if (g.value === "REUSE_POSTGRES" || g.value === "REUSE_MINIO") continue;
      if (def.id === "postgres" && g.name === "senha_postgres") sharedToPersist.senha_postgres = g.value;
      if (def.id === "minio" && g.name === "minio_access") sharedToPersist.minio_access = g.value;
    }

    const yaml = def.generateYaml(parsed.data, secretMap, input.swarmCtx);
    const { endpointId, swarmId } = await discoverContext(input.token);
    const stack = await deploySwarmStack({
      token: input.token,
      name: input.stackId.replace(/-/g, "_"),
      yaml,
      swarmId,
      endpointId,
    });

    saveStackSecrets(input.stackId, parsed.data, generated);
    if (Object.keys(sharedToPersist).length > 0) saveSharedSecrets(sharedToPersist);

    logAudit({
      user: input.user,
      ip: input.ip,
      action: "stack.install",
      target: input.stackId,
      result: "ok",
      meta: { portainer_stack_id: stack.Id },
    });

    return { ok: true, stack, generatedSecrets: generated };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    logAudit({
      user: input.user,
      ip: input.ip,
      action: "stack.install.fail",
      target: input.stackId,
      result: "error",
      meta: { error: msg },
    });
    return { ok: false, error: msg };
  }
}

export async function listInstalledStacks(token: string): Promise<Stack[]> {
  return listStacks(token);
}
