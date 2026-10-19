// Recorte de um serviço dentro de um compose de stack (texto), compartilhado
// pelos patches cirúrgicos do arquivo guardado no Portainer: fixar-versoes.ts
// (imagens) e restart-policy.ts (restart_policy). Sem imports: quem usa decide
// que erro lançar quando o serviço não está lá.

export const RE_SERVICO = /^ {2}([A-Za-z0-9_-]+):\s*$/;

/** Linhas [ini, fim) do serviço `nome` (ini = a linha `  nome:`), ou null se ausente. */
export function limitesDoServicoOuNull(linhas: string[], nome: string): { ini: number; fim: number } | null {
  const ini = linhas.findIndex((l) => {
    const m = RE_SERVICO.exec(l);
    return m !== null && m[1] === nome;
  });
  if (ini === -1) return null;
  let fim = linhas.length;
  for (let i = ini + 1; i < linhas.length; i++) {
    if (RE_SERVICO.test(linhas[i]) || /^\S/.test(linhas[i])) {
      fim = i;
      break;
    }
  }
  return { ini, fim };
}
