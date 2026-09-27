// Comparação de versão X.Y.Z — mesmo critério estrito de release-info.ts
// (SEMVER) e de versao_semver_maior em secondary.sh: só três inteiros sem
// sinal, sem prefixo "v", sem pré-release. Qualquer outra coisa é
// "ilegível" e o chamador decide o que fazer (falhar fechado). Espelho em
// shell: versao_semver_maior_ou_igual (secondary.sh).

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseSemver(v: unknown): [number, number, number] | null {
  if (typeof v !== "string") return null;
  const m = SEMVER.exec(v);
  if (!m) return null;
  const partes = [Number(m[1]), Number(m[2]), Number(m[3])] as [number, number, number];
  // Número absurdamente grande perde precisão e compararia errado.
  if (!partes.every((n) => Number.isSafeInteger(n))) return null;
  return partes;
}

// true só se AMBAS as versões são legíveis e `a >= b`. Ilegível → false
// (nunca lança): o portão de segredos do EnchaT usa isto para cair no
// formato antigo em vez de quebrar a instalação.
export function semverMaiorOuIgual(a: unknown, b: unknown): boolean {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return false;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] > pb[i];
  }
  return true;
}
