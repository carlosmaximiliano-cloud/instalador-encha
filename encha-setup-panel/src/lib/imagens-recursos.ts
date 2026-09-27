import { inspectImage } from "./portainer";

// Portão por LABEL das imagens (S4c). A versão da release sozinha é frágil (a
// 0.4.1 foi publicada sem `*_FILE`; upgrade free→full; tags diferentes do
// Pinfy/updater), então o painel também exige que a PRÓPRIA imagem declare, no
// LABEL `com.enchat.recursos` (lista separada por espaço), o recurso
// `segredos-arquivo` — as três imagens da stack (app, Pinfy, updater).
//
// Contrato de segurança desta leitura: qualquer dúvida = "não declara". Nunca
// lança, nunca devolve true por falha de leitura (imagem ausente, 404, rede,
// JSON inesperado, label ausente, valor de outro tipo).

export type EstadoLabelImagem = "declara" | "sem_label" | "erro_leitura";

export type ResultadoLabelsImagens = {
  /** true SOMENTE se há ao menos uma imagem e TODAS declaram o recurso. */
  declaram: boolean;
  detalhes: { image: string; estado: EstadoLabelImagem }[];
};

// Token EXATO (por palavra): "segredos-arquivo" vale; "nao-segredos-arquivo-x"
// ou "segredos-arquivo2" não. Separadores: SÓ espaço, tab e quebra de linha —
// o IFS padrão do bash, que é o que enchat_label_tem_token (secondary.sh,
// opção 84) usa. `\s` do JS aceitaria também CR, tab vertical, form feed e
// espaços Unicode (U+00A0, U+2003...), e os dois caminhos dariam decisões
// diferentes para o mesmo label. Vetor comum: stacks/label-recursos-vetor.tsv.
export function labelTemToken(valor: unknown, token: string): boolean {
  if (typeof valor !== "string" || token === "") return false;
  return valor.split(/[ \t\n]+/).some((t) => t === token);
}

// `GET /images/{name}/json` devolve os labels em `Config.Labels` (objeto
// string→string, ou null quando a imagem não tem nenhum). Só isso é lido: o
// resto do JSON (ContainerConfig etc.) descreve o contêiner de build, não a
// imagem publicada.
function lerLabel(json: unknown, label: string): unknown {
  if (typeof json !== "object" || json === null) return undefined;
  const config = (json as { Config?: unknown }).Config;
  if (typeof config !== "object" || config === null) return undefined;
  const labels = (config as { Labels?: unknown }).Labels;
  if (typeof labels !== "object" || labels === null || Array.isArray(labels)) return undefined;
  return Object.prototype.hasOwnProperty.call(labels, label) ? (labels as Record<string, unknown>)[label] : undefined;
}

export async function imagensDeclaramRecurso(input: {
  token: string;
  endpointId: number;
  /** Imagens repo:tag JÁ puxadas (o pull vem antes). */
  images: string[];
  label: string;
  recurso: string;
}): Promise<ResultadoLabelsImagens> {
  const detalhes: ResultadoLabelsImagens["detalhes"] = [];
  for (const image of input.images) {
    let estado: EstadoLabelImagem;
    try {
      const json = await inspectImage(input.token, input.endpointId, image);
      estado = labelTemToken(lerLabel(json, input.label), input.recurso) ? "declara" : "sem_label";
    } catch {
      estado = "erro_leitura";
    }
    detalhes.push({ image, estado });
  }
  return { declaram: detalhes.length > 0 && detalhes.every((d) => d.estado === "declara"), detalhes };
}

// Texto para o card final do wizard (InstallResult.aviso). Sem segredo: só o
// nome repo:tag das imagens (público) e a causa.
export function avisoSegredosNaoAtivados(detalhes: ResultadoLabelsImagens["detalhes"]): string | undefined {
  const partes: string[] = [];
  for (const d of detalhes) {
    if (d.estado === "sem_label") partes.push(`a imagem ${d.image} ainda não declara suporte`);
    else if (d.estado === "erro_leitura") partes.push(`não foi possível ler os labels da imagem ${d.image}`);
  }
  if (partes.length === 0) return undefined;
  return (
    `Segredos do Docker não ativados: ${partes.join("; ")}. ` +
    "A instalação seguiu no formato antigo (variáveis em texto); nada quebrou. " +
    "Atualize para uma release cujas imagens declaram suporte e reinstale para ligar os segredos."
  );
}
