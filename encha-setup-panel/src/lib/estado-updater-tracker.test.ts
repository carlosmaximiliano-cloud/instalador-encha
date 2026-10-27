import { beforeEach, describe, expect, it, vi } from "vitest";
import { MARCA_AUSENTE, MARCA_FIM, MARCA_INICIO } from "./estado-sidecar";

// Leitor do estado.json do tracker-updater com o Portainer inteiramente simulado.

const MP = "/var/lib/docker/volumes/encha_tracker_updater_data/_data";

const m = vi.hoisted(() => ({
  getServiceExact: vi.fn(),
  listServiceTasks: vi.fn(),
  getVolumeMountpoint: vi.fn(),
  imageExistsLocally: vi.fn(),
  pullImage: vi.fn(),
  runOneShotJob: vi.fn(),
}));
vi.mock("./portainer", () => m);

const logs = (j: unknown) => `${MARCA_INICIO}\r\n${JSON.stringify(j)}\r\n${MARCA_FIM}\r\n`;
const leitor = async () => await import("./estado-updater-tracker");

beforeEach(async () => {
  Object.values(m).forEach((f) => f.mockReset());
  m.getServiceExact.mockResolvedValue({ ID: "svc-upd" });
  m.listServiceTasks.mockResolvedValue([{ ID: "t", DesiredState: "running", NodeID: "no1" }]);
  m.getVolumeMountpoint.mockResolvedValue(MP);
  m.imageExistsLocally.mockResolvedValue(true);
  m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: logs({ em_andamento: true }), timedOut: false });
  (await leitor()).limparCacheEstadoTracker();
});

describe("leitor do tracker-updater", () => {
  it("leitor do tracker-updater: bind somente leitura do mountpoint do volume, caminho e script constantes", async () => {
    const { lerEstadoDoUpdaterTracker, SCRIPT_LER_ESTADO_TRACKER, CAMINHO_ESTADO_TRACKER } = await leitor();
    const r = await lerEstadoDoUpdaterTracker("tok", 7);
    expect(r.estado).toMatchObject({ em_andamento: true });
    expect(m.getVolumeMountpoint).toHaveBeenCalledWith("tok", 7, "encha_tracker_updater_data");
    expect(m.runOneShotJob).toHaveBeenCalledOnce();
    const job = m.runOneShotJob.mock.calls[0][2];
    expect(job.spec.HostConfig.Binds).toEqual([`${MP}:/host-estado:ro`]);
    expect(job.spec.Cmd).toEqual([SCRIPT_LER_ESTADO_TRACKER]);
    expect(SCRIPT_LER_ESTADO_TRACKER).toContain(`F=${CAMINHO_ESTADO_TRACKER}`);
    expect(CAMINHO_ESTADO_TRACKER).toBe("/host-estado/estado.json");
    expect(job.constraints).toEqual(["node.id == no1"]);
    expect(job.spec.HostConfig.Privileged).toBe(false);
  });

  it("leitor do tracker-updater: mountpoint fora do padrão é ilegível e nenhum job roda", async () => {
    const { lerEstadoDoUpdaterTracker, limparCacheEstadoTracker } = await leitor();
    for (const ruim of [`${MP}:rw`, `${MP},readonly=false`, "relativo/x", `${MP}/../x`, null]) {
      limparCacheEstadoTracker();
      m.getVolumeMountpoint.mockResolvedValue(ruim);
      expect(await lerEstadoDoUpdaterTracker("tok", 7)).toEqual({ estado: null, motivo: "ilegivel" });
    }
    expect(m.runOneShotJob).not.toHaveBeenCalled();
  });

  it("serviço ausente, sem task, job com falha ou tempo esgotado: ilegível", async () => {
    const { lerEstadoDoUpdaterTracker, limparCacheEstadoTracker } = await leitor();
    m.getServiceExact.mockResolvedValue(null);
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).motivo).toBe("ilegivel");
    limparCacheEstadoTracker();
    m.getServiceExact.mockResolvedValue({ ID: "svc-upd" });
    m.listServiceTasks.mockResolvedValue([]);
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).motivo).toBe("ilegivel");
    limparCacheEstadoTracker();
    m.listServiceTasks.mockResolvedValue([{ ID: "t", DesiredState: "running", NodeID: "no1" }]);
    m.runOneShotJob.mockResolvedValue({ exitCode: 1, logs: "", timedOut: false });
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).motivo).toBe("ilegivel");
    limparCacheEstadoTracker();
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: "", timedOut: true });
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).motivo).toBe("ilegivel");
    limparCacheEstadoTracker();
    m.getVolumeMountpoint.mockRejectedValue(new Error("rede"));
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).motivo).toBe("ilegivel");
  });

  it("arquivo ausente vira ausente; o cache evita um segundo job em 5 min", async () => {
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: MARCA_AUSENTE, timedOut: false });
    const { lerEstadoDoUpdaterTracker } = await leitor();
    expect(await lerEstadoDoUpdaterTracker("tok", 7, 1000)).toEqual({ estado: null, motivo: "ausente" });
    await lerEstadoDoUpdaterTracker("tok", 7, 2000);
    expect(m.runOneShotJob).toHaveBeenCalledOnce();
  });

  it("devolve a imagem_atual (referência com digest) registrada pelo updater; texto só", async () => {
    const ref = `ghcr.io/cheiodecoisa/encha-tracker:1.5.65@sha256:${"a".repeat(64)}`;
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: logs({ em_andamento: false, imagem_atual: ref }), timedOut: false });
    const { lerEstadoDoUpdaterTracker, limparCacheEstadoTracker } = await leitor();
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).estado?.imagem_atual).toBe(ref);
    limparCacheEstadoTracker();
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: logs({ em_andamento: false, imagem_atual: 42 }), timedOut: false });
    expect((await lerEstadoDoUpdaterTracker("tok", 7)).estado?.imagem_atual).toBeUndefined();
  });

  it("leitura forçada ignora o cache de 5 min (o portão da sincronização precisa do estado de agora)", async () => {
    const { lerEstadoDoUpdaterTracker } = await leitor();
    await lerEstadoDoUpdaterTracker("tok", 7, 1000);
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: logs({ em_andamento: false }), timedOut: false });
    expect((await lerEstadoDoUpdaterTracker("tok", 7, 2000)).estado?.em_andamento).toBe(true); // cache
    expect((await lerEstadoDoUpdaterTracker("tok", 7, 3000, true)).estado?.em_andamento).toBe(false);
    expect(m.runOneShotJob).toHaveBeenCalledTimes(2);
  });
});
