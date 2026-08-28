// Persistência do machine_id/fingerprint de instalação e das sessões de
// pareamento self-service de licença. Ver enchat-fingerprint.ts para a
// fórmula e license-pairing.ts para o cliente HTTP do Console.
import { randomBytes } from "node:crypto";
import { getDb } from "./db";
import { encryptSecret, decryptSecret } from "./crypto";
import { fingerprintEnchat, machineIdNovo } from "./enchat-fingerprint";

export type MachineIdResult = {
  /** Vazio quando a stack já tem uma instalação anterior sem machine_id próprio (ver comentário abaixo) — nesse caso NÃO cunhar um novo. */
  machineId: string;
  fingerprint: string;
  /** true quando esta é uma instalação pré-existente que nunca teve machine_id — o chamador deve oferecer o fallback de colar a chave manualmente em vez de parear. */
  legacy: boolean;
};

// Uma instalação Grátis Swarm anterior a este trabalho nunca teve
// ENCHAT_MACHINE_ID: o fingerprint dela é a constante sha256("|enchat-app")
// (machine_id vazio) porque a imagem alpine não tem /etc/machine-id e o
// hostname do container é fixo. Se ela JÁ estiver ativada, cunhar um
// machine_id novo agora mudaria o fingerprint e derrubaria a licença
// (fingerprint_mismatch permanente — o Console não perdoa, ver
// licenses_fingerprint_imutavel_trg). Por isso: só cunha machine_id novo
// quando não há NENHUM rastro de instalação anterior desta stack (nenhuma
// linha em stack_secrets) — instalação genuinamente nova. Esta checagem só
// entra em jogo quando `stack_machine_ids` ainda não tem linha própria —
// ou seja, é o caso "instalação de antes deste mecanismo existir", não o
// caso normal de reinstall (que já teria uma linha em stack_machine_ids).
function stackJaFoiInstaladaAntes(stackId: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT 1 FROM stack_secrets WHERE stack_name = ?").get(stackId);
  return !!row;
}

// Idempotente: a PRIMEIRA chamada pra uma stack nova cunha e PERSISTE o
// machine_id; toda chamada seguinte (reinstall, nova sessão de pareamento,
// retry) devolve exatamente o mesmo valor — nunca recalcula. É isso que
// torna o repareamento seguro (o Console reconhece o mesmo fingerprint e
// devolve a mesma licença já vinculada) e o que impede o YAML de um
// reinstall divergir do fingerprint que uma sessão de pareamento anterior
// já usou pra vincular a licença.
// hostname é OBRIGATÓRIO (Ciclo 20) — antes era implícito via o default de
// fingerprintEnchat ("enchat-app"), e qualquer stack com hostname de
// container diferente (ex.: "encha-tracker") calculava um fingerprint
// ERRADO em silêncio nos dois caminhos que cunham/recalculam abaixo. Cada
// chamador passa def.appHostname (StackDefinition, ver stacks/types.ts) —
// nunca um valor solto.
export function getOrCreateMachineId(stackId: string, hostname: string): MachineIdResult {
  const db = getDb();
  const existing = db
    .prepare("SELECT machine_id, fingerprint FROM stack_machine_ids WHERE stack_id = ?")
    .get(stackId) as { machine_id: string; fingerprint: string } | undefined;
  if (existing) {
    return { machineId: existing.machine_id, fingerprint: existing.fingerprint, legacy: false };
  }
  if (stackJaFoiInstaladaAntes(stackId)) {
    return { machineId: "", fingerprint: fingerprintEnchat("", hostname), legacy: true };
  }
  const machineId = machineIdNovo();
  const fingerprint = fingerprintEnchat(machineId, hostname);
  const now = Date.now();
  db.prepare(
    "INSERT INTO stack_machine_ids (stack_id, machine_id, fingerprint, created_at) VALUES (?, ?, ?, ?)"
  ).run(stackId, machineId, fingerprint, now);
  return { machineId, fingerprint, legacy: false };
}

function novoPairingId(): string {
  return randomBytes(16).toString("hex");
}

export type PairingStatus = "aberto" | "confirmado" | "consumido" | "falhou";

export type PairingRow = {
  id: string;
  stack_id: string;
  machine_id: string;
  fingerprint: string;
  console_session_id: string | null;
  codigo_exibicao: string | null;
  status: PairingStatus;
  chave_encrypted: string | null;
  wa_link: string | null;
  wa_qr_svg: string | null;
  numero_exibicao: string | null;
  signup_url: string | null;
  plano: string | null;
  created_at: number;
  updated_at: number;
  expires_at: number | null;
};

// O pareamento ATIVO (aberto ou já confirmado, ainda não consumido por um
// install) de uma stack — no máximo 1, imposto por idx_pairing_ativo. É o
// que permite RETOMAR uma sessão em vez de abrir uma segunda ao reabrir o
// wizard (cada sessão nova gasta 1 das 5 tentativas/hora que o Console
// impõe por fingerprint).
export function pareamentoAtivo(stackId: string): PairingRow | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM license_pairings WHERE stack_id = ? AND status IN ('aberto','confirmado') ORDER BY created_at DESC LIMIT 1")
    .get(stackId) as PairingRow | undefined;
  return row ?? null;
}

export function buscarPareamento(pairingId: string): PairingRow | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM license_pairings WHERE id = ?").get(pairingId) as PairingRow | undefined;
  return row ?? null;
}

// Assume que o chamador já verificou pareamentoAtivo(stackId) === null —
// não decide isso aqui, pra deixar essa política na rota (que sabe se quer
// devolver o ativo existente ou recusar).
export function criarPareamento(params: {
  stackId: string;
  machineId: string;
  fingerprint: string;
  consoleSessionId?: string;
  codigoExibicao?: string;
  expiresAt?: number;
  // Campos de exibição da resposta de pair/start — guardados só pra uma
  // RETOMADA (reabrir o wizard antes de confirmar) poder mostrar o mesmo
  // QR/link/número de novo, já que nem o Console nem o poll os reenviam.
  waLink?: string;
  waQrSvg?: string;
  numeroExibicao?: string;
  signupUrl?: string;
}): PairingRow {
  const db = getDb();
  const id = novoPairingId();
  const now = Date.now();
  db.prepare(
    `INSERT INTO license_pairings
      (id, stack_id, machine_id, fingerprint, console_session_id, codigo_exibicao, status, wa_link, wa_qr_svg, numero_exibicao, signup_url, created_at, updated_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'aberto', ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.stackId,
    params.machineId,
    params.fingerprint,
    params.consoleSessionId ?? null,
    params.codigoExibicao ?? null,
    params.waLink ?? null,
    params.waQrSvg ?? null,
    params.numeroExibicao ?? null,
    params.signupUrl ?? null,
    now,
    now,
    params.expiresAt ?? null
  );
  return buscarPareamento(id)!;
}

// Confirmado: a chave já foi entregue pelo Console (pair/poll com
// status="confirmado") — guarda cifrada, nunca em claro. A partir daqui o
// pareamento ainda NÃO está consumido: só o install bem-sucedido consome
// (ver consumirPareamento), pra sobreviver a um Console que caia ou a um
// deploy que falhe DEPOIS da chave já ter sido vinculada no Console.
export function confirmarPareamento(pairingId: string, chave: string, plano?: string): void {
  const db = getDb();
  db.prepare(
    "UPDATE license_pairings SET status = 'confirmado', chave_encrypted = ?, plano = ?, updated_at = ? WHERE id = ?"
  ).run(encryptSecret(chave), plano ?? null, Date.now(), pairingId);
}

export function chaveDoPareamento(pairingId: string): string | null {
  const row = buscarPareamento(pairingId);
  if (!row?.chave_encrypted) return null;
  try {
    return decryptSecret(row.chave_encrypted);
  } catch {
    return null;
  }
}

// Chamado só DEPOIS do deploy da stack ter sucesso (ver installer.ts) — não
// antes, pra um Console que caia entre confirmar e instalar não perder a
// chave (ela continua recuperável via chaveDoPareamento até este ponto).
export function consumirPareamento(pairingId: string): void {
  const db = getDb();
  db.prepare("UPDATE license_pairings SET status = 'consumido', updated_at = ? WHERE id = ?").run(Date.now(), pairingId);
}

// Libera o slot de idx_pairing_ativo (sessão expirada, recusada, ou
// abandonada) sem apagar o histórico — outra sessão nova pode ser aberta
// pra mesma stack depois disto.
export function falharPareamento(pairingId: string): void {
  const db = getDb();
  db.prepare("UPDATE license_pairings SET status = 'falhou', updated_at = ? WHERE id = ?").run(Date.now(), pairingId);
}

// Migração self-service de VPS (.../pair/migrar): a sessão já tinha sido
// marcada 'falhou' pelo poll que recebeu 'ja_ativada_em_outra_vps' — o
// Console reabriu a MESMA sessão (rebind + license_id de volta), então o
// painel precisa voltar a pollá-la em vez de continuar short-circuitando
// em "recusado" pra sempre (ver o guard no início de pair/poll/route.ts).
// Só chamar depois de um pair/migrar bem-sucedido com sessaoReutilizavel:true.
export function reabrirPareamento(pairingId: string): void {
  const db = getDb();
  db.prepare("UPDATE license_pairings SET status = 'aberto', updated_at = ? WHERE id = ?").run(Date.now(), pairingId);
}
