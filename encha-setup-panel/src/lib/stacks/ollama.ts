import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_ollama: fqdn,
  gpu_enabled: z.boolean().default(false),
});

export const ollama: StackDefinition = {
  id: "ollama",
  repoUrl: "https://github.com/ollama/ollama",
  logoUrl: "https://raw.githubusercontent.com/ollama/ollama/main/docs/static/ollama.svg",
  name: "Ollama",
  description: "Servidor local de LLMs (Llama, Mistral, Gemma, etc.). Compatível com API OpenAI.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 30,
  fields: [
    { name: "url_ollama", label: "Domínio", kind: "domain", placeholder: "ollama.suaempresa.com", group: "Domínios" },
    { name: "gpu_enabled", label: "Habilitar GPU NVIDIA", kind: "checkbox", optional: true, default: false, group: "Hardware" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const gpuBlock = v.gpu_enabled
      ? `      resources:
        reservations:
          generic_resources:
            - discrete_resource_spec:
                kind: "NVIDIA-GPU"
                value: 1`
      : "";
    return `version: "3.7"
services:
  ollama:
    image: ollama/ollama:latest
    networks:
      - ${net}
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
${gpuBlock}
      labels:
        - traefik.enable=true
        - traefik.http.routers.ollama.rule=Host(\`${v.url_ollama}\`)
        - traefik.http.routers.ollama.entrypoints=websecure
        - traefik.http.routers.ollama.tls.certresolver=letsencryptresolver
        - traefik.http.services.ollama.loadbalancer.server.port=11434

volumes:
  ollama_data:
    external: true
    name: ollama_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_ollama: string }).url_ollama}`,
    notes: ["Baixe modelos rodando `ollama pull llama3.1` no shell do container"],
  },
};
