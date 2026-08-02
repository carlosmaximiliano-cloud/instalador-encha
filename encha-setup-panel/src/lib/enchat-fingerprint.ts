// Fingerprint de instalação do EnchaT — fórmula isolada aqui de propósito.
//
// É a 3ª cópia da MESMA fórmula: autoritativa em Go
// (internal/license/license.go, func Fingerprint, repo ENCHAT), replicada em
// Python por ENCHAT GRÁTIS/instalador/painel.py (o instalador single-curl,
// que pareia ANTES do primeiro boot do app — mesmo motivo de existir desta
// cópia aqui: o painel Encha Setup também pareia antes de existir container).
// As três têm que concordar byte a byte, OU o fingerprint que o app calcula
// no boot diverge do que foi usado para vincular a licença, e
// licenses_fingerprint_imutavel_trg (Console) torna esse mismatch
// IRREVERSÍVEL — não existe correção depois do bind.
//
// A fórmula: sha256(machineId + "|" + hostname)[:16 bytes], hex. O hostname
// é SEMPRE "enchat-app" — fixo em todo docker-stack.yaml/docker-compose.yml
// do EnchaT Grátis (nunca o hostname real do host Docker), porque é o nome
// do CONTAINER do app, não da VPS.
//
// VETOR DOURADO — este repo não tem test runner configurado (só `tsc`), e
// os outros dois (internal/license/license_test.go e painel.py, repo
// ENCHAT) estavam sob edição concorrente no momento em que este arquivo foi
// escrito, então o vetor fica documentado aqui para checagem manual/futura
// em vez de um teste automatizado cross-repo:
//
//   machineId = "0123456789abcdef0123456789abcdef"
//   hostname  = "enchat-app"
//   fingerprint esperado = "81d4ffe1db36fb2a555810df47d1079e"
//
// Conferido manualmente batendo Node (esta função), Python
// (hashlib.sha256(f"{mid}|enchat-app".encode()).digest()[:16].hex()) e Go
// (sha256.Sum256([]byte(mid+"|enchat-app")), hex.EncodeToString(sum[:16])) —
// os três produziram o mesmo valor acima. Se qualquer um dos três arquivos
// mudar a fórmula, reconferir este vetor nos três antes de mesclar.
import { createHash, randomBytes } from "node:crypto";

export const ENCHAT_APP_HOSTNAME = "enchat-app";

/** 16 bytes hex — mesmo formato que `openssl rand -hex 16` gera no instalador shell. */
export function machineIdNovo(): string {
  return randomBytes(16).toString("hex");
}

export function fingerprintEnchat(machineId: string, hostname: string = ENCHAT_APP_HOSTNAME): string {
  const digest = createHash("sha256").update(`${machineId}|${hostname}`, "utf8").digest();
  return digest.subarray(0, 16).toString("hex");
}
