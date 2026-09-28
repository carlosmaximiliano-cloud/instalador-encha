import type { SwarmContext } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// Blocos de YAML para segredos do Docker (Swarm), compartilhados entre o
// EnchaT (enchat.ts) e o Encha Tracker (encha-tracker.ts). Extraído de
// enchat.ts no ciclo painel-secret — ver o comentário "Segredos do Docker"
// em enchat.ts para o desenho completo (portão por versão, nome versionado,
// installer que cria antes do deploy e limpa depois).
//
// uid/gid entre aspas e mode 0400: lição do C9 no painel. O Swarm monta o
// arquivo do segredo como root:root por padrão; sem uid/gid explícitos (o
// dono de quem RODA o processo dentro do container), um processo não-root
// leva EACCES ao tentar ler o arquivo montado com 0400, e o serviço sobe
// sem o segredo e trava. As aspas em "uid"/"gid" são as mesmas que o YAML
// original do EnchaT sempre usou — não é estilo, é o formato que o
// Portainer/Swarm já aceitava antes desta extração.
//
// Nenhuma função aqui ordena o que recebe: a ordem é sempre a que o
// chamador passou. O golden do YAML do EnchaT (enchat.test.ts, describe
// "com segredos (0.4.3)") depende da ordem de inserção de CHAVES_POR_SERVICO/
// chavesAtivas — reordenar aqui muda a saída dele.
// ─────────────────────────────────────────────────────────────────────────

// Época (só dígitos) que versiona o nome de todo segredo desta instalação.
// Preenchida pelo installer no ctx antes de generateYaml, só quando a stack
// declara `dockerSecrets`. Ausente/ilegível com o portão de segredos ligado
// é bug no installer, não estado válido — por isso lança, em vez de cair
// silenciosamente em algum default.
export function exigeVersaoSegredos(ctx: SwarmContext): string {
  if (!ctx.versaoSegredos || !/^\d{1,20}$/.test(ctx.versaoSegredos)) {
    throw new Error("ctx.versaoSegredos ausente/ inválida com segredos do Docker ligados — bug no installer.");
  }
  return ctx.versaoSegredos;
}

// Segredo do Docker é imutável: trocar o VALOR exige um NOME novo. O nome
// versionado é o que o YAML referencia em `external: true`; `base` (sem a
// época) é o que vai no label do segredo, para o installer achar versões
// antigas depois (ver docker-secrets.ts).
export function nomeSegredoVersionado(base: string, versao: string): string {
  return `${base}_${versao}`;
}

// Linha de env de um valor sensível no formato NOVO: `NOME_FILE` apontando
// para o caminho onde o Swarm monta o segredo. Seis espaços de recuo — a
// mesma indentação de toda linha de `environment:` neste projeto.
export function linhaEnvArquivo(env: string, base: string): string {
  return `      ${env}_FILE: "/run/secrets/${base}"`;
}

export type MontagemSegredo = { base: string; uid: string; gid: string };

// Bloco `secrets:` de um serviço, montando cada segredo ativo daquele
// serviço. `source` e `target` são sempre o mesmo nome-base (o container
// não precisa saber a época). Ordem preservada de propósito.
export function blocoMontagensSegredos(montagens: readonly MontagemSegredo[]): string {
  return (
    "    secrets:\n" +
    montagens
      .map(
        (m) =>
          `      - source: ${m.base}\n        target: ${m.base}\n        uid: "${m.uid}"\n        gid: "${m.gid}"\n        mode: 0400\n`
      )
      .join("")
  );
}

export type SegredoExterno = { base: string; nome: string };

// Bloco `secrets:` de topo do YAML, declarando cada segredo como externo —
// o installer já os criou no Swarm antes do deploy (ver docker-secrets.ts).
// Linha em branco antes: mesma posição que o YAML de sempre usava para
// separar o bloco de topo do resto do arquivo. Ordem preservada de
// propósito (ver nota de topo do arquivo).
export function blocoSegredosTopo(segredos: readonly SegredoExterno[]): string {
  return (
    "\nsecrets:\n" +
    segredos.map((s) => `  ${s.base}:\n    external: true\n    name: ${s.nome}\n`).join("")
  );
}
