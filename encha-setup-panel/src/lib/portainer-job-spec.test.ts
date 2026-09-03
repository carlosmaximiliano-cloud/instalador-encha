import { describe, expect, it } from "vitest";
import { containerSpecToServiceSpec, taskOutcome, type ContainerSpec, type SwarmTask } from "./portainer";

// Cobre a conversão ContainerSpec -> SwarmJobSpec e a classificação de tasks
// do Swarm — as duas funções puras introduzidas para substituir
// createContainer+startContainer (container avulso) por services/create com
// Mode.ReplicatedJob, contornando um 400 do proxy Portainer/agent num
// POST .../containers/{id}/start sem corpo (ver host-updater.ts).

const baseSpec: ContainerSpec = {
  Image: "ghcr.io/enchaaluno/setup-panel:0.2.9",
  Entrypoint: ["/bin/sh", "-c"],
  Cmd: ["echo ok"],
  Env: ["ENCHA_SRC_REF=refs/tags/v0.2.9"],
  User: "0",
  Tty: true,
  Labels: { "com.encha.role": "host-script-updater" },
  HostConfig: {
    Binds: ["/root:/host-root"],
    NetworkMode: "bridge",
    Privileged: false,
    RestartPolicy: { Name: "no" },
  },
};

describe("containerSpecToServiceSpec", () => {
  it("mapeia imagem, entrypoint/cmd, env, user e tty", () => {
    const job = containerSpecToServiceSpec("encha-host-updater", baseSpec, []);
    expect(job.Name).toBe("encha-host-updater");
    expect(job.TaskTemplate.ContainerSpec.Image).toBe(baseSpec.Image);
    expect(job.TaskTemplate.ContainerSpec.Command).toEqual(["/bin/sh", "-c"]);
    expect(job.TaskTemplate.ContainerSpec.Args).toEqual(["echo ok"]);
    expect(job.TaskTemplate.ContainerSpec.Env).toEqual(["ENCHA_SRC_REF=refs/tags/v0.2.9"]);
    expect(job.TaskTemplate.ContainerSpec.User).toBe("0");
    expect(job.TaskTemplate.ContainerSpec.TTY).toBe(true);
  });

  it("converte HostConfig.Binds em Mounts do tipo bind", () => {
    const job = containerSpecToServiceSpec("x", baseSpec, []);
    expect(job.TaskTemplate.ContainerSpec.Mounts).toEqual([
      { Type: "bind", Source: "/root", Target: "/host-root", ReadOnly: false },
    ]);
  });

  it("marca ReadOnly quando o bind termina em :ro", () => {
    const spec: ContainerSpec = {
      ...baseSpec,
      HostConfig: { ...baseSpec.HostConfig, Binds: ["/var/enchat/media:/host-var/media:ro"] },
    };
    const job = containerSpecToServiceSpec("x", spec, []);
    expect(job.TaskTemplate.ContainerSpec.Mounts).toEqual([
      { Type: "bind", Source: "/var/enchat/media", Target: "/host-var/media", ReadOnly: true },
    ]);
  });

  it("mapeia /var:/host-var (bind do host-dirs.ts) sem :ro", () => {
    const spec: ContainerSpec = {
      ...baseSpec,
      HostConfig: { ...baseSpec.HostConfig, Binds: ["/var:/host-var"] },
    };
    const job = containerSpecToServiceSpec("x", spec, []);
    expect(job.TaskTemplate.ContainerSpec.Mounts).toEqual([
      { Type: "bind", Source: "/var", Target: "/host-var", ReadOnly: false },
    ]);
  });

  it("propaga labels em Spec.Labels e ContainerSpec.Labels", () => {
    const job = containerSpecToServiceSpec("x", baseSpec, []);
    expect(job.Labels).toEqual(baseSpec.Labels);
    expect(job.TaskTemplate.ContainerSpec.Labels).toEqual(baseSpec.Labels);
  });

  it("fixa RestartPolicy.Condition none e Mode.ReplicatedJob de execução única", () => {
    const job = containerSpecToServiceSpec("x", baseSpec, []);
    expect(job.TaskTemplate.RestartPolicy).toEqual({ Condition: "none" });
    expect(job.Mode).toEqual({ ReplicatedJob: { MaxConcurrent: 1, TotalCompletions: 1 } });
  });

  it("propaga as constraints de placement quando informadas", () => {
    const job = containerSpecToServiceSpec("x", baseSpec, ["node.id == abc123"]);
    expect(job.TaskTemplate.Placement).toEqual({ Constraints: ["node.id == abc123"] });
  });

  it("omite Placement quando não há constraints", () => {
    const job = containerSpecToServiceSpec("x", baseSpec, []);
    expect(job.TaskTemplate.Placement).toBeUndefined();
  });

  it("omite Mounts quando não há binds", () => {
    const spec: ContainerSpec = { ...baseSpec, HostConfig: { ...baseSpec.HostConfig, Binds: undefined } };
    const job = containerSpecToServiceSpec("x", spec, []);
    expect(job.TaskTemplate.ContainerSpec.Mounts).toBeUndefined();
  });
});

function task(state: string, exitCode: number | undefined, timestamp: string): SwarmTask {
  return {
    ID: `t-${timestamp}`,
    ServiceID: "s1",
    Status: { State: state, Timestamp: timestamp, ContainerStatus: { ExitCode: exitCode } },
  };
}

describe("taskOutcome", () => {
  it("não terminal enquanto a task ainda está em andamento", () => {
    for (const state of ["new", "allocated", "pending", "assigned", "accepted", "preparing", "starting", "running"]) {
      expect(taskOutcome([task(state, undefined, "1")])).toEqual({ done: false });
    }
  });

  it("sem tasks ainda é não terminal", () => {
    expect(taskOutcome([])).toEqual({ done: false });
  });

  it("complete com exit code 0 é sucesso", () => {
    expect(taskOutcome([task("complete", 0, "1")])).toEqual({ done: true, exitCode: 0 });
  });

  it("complete sem ContainerStatus assume exit code 0", () => {
    const t: SwarmTask = { ID: "t1", ServiceID: "s1", Status: { State: "complete", Timestamp: "1" } };
    expect(taskOutcome([t])).toEqual({ done: true, exitCode: 0 });
  });

  it("failed/rejected/shutdown/orphaned são terminais com o exit code reportado", () => {
    expect(taskOutcome([task("failed", 1, "1")])).toEqual({ done: true, exitCode: 1 });
    expect(taskOutcome([task("rejected", 2, "1")])).toEqual({ done: true, exitCode: 2 });
    expect(taskOutcome([task("shutdown", 3, "1")])).toEqual({ done: true, exitCode: 3 });
    expect(taskOutcome([task("orphaned", 4, "1")])).toEqual({ done: true, exitCode: 4 });
  });

  it("estado terminal sem ContainerStatus vira exit code -1", () => {
    const t: SwarmTask = { ID: "t1", ServiceID: "s1", Status: { State: "failed", Timestamp: "1" } };
    expect(taskOutcome([t])).toEqual({ done: true, exitCode: -1 });
  });

  it("escolhe a task mais recente por Timestamp entre um par de retry do Swarm", () => {
    // Task antiga falhou, o Swarm criou uma nova que ainda está rodando — o
    // resultado tem que refletir a mais nova, não a mais antiga já terminada.
    const older = task("failed", 1, "2024-01-01T00:00:00.000000000Z");
    const newer = task("running", undefined, "2024-01-01T00:00:05.000000000Z");
    expect(taskOutcome([older, newer])).toEqual({ done: false });
  });

  it("a mais nova, se terminal, decide o resultado mesmo com uma mais antiga também terminal", () => {
    const older = task("failed", 1, "2024-01-01T00:00:00.000000000Z");
    const newer = task("complete", 0, "2024-01-01T00:00:05.000000000Z");
    expect(taskOutcome([older, newer])).toEqual({ done: true, exitCode: 0 });
  });
});
