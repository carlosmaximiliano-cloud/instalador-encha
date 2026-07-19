import { z } from "zod";
import { type StackDefinition } from "./types";

const schema = z.object({
  ip_vps: z.string().min(3).max(253),
  nodes_qdrant: z.coerce.number().int().min(1).max(20),
});

export const qdrant: StackDefinition = {
  id: "qdrant",
  repoUrl: "https://github.com/qdrant/qdrant",
  logoUrl: "https://raw.githubusercontent.com/qdrant/qdrant/master/docs/logo.svg",
  name: "Qdrant",
  description: "Banco de vetores para busca semântica e RAG.",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 21,
  installVia: "panel",
  fields: [
    {
      name: "ip_vps",
      label: "IP da VPS ou domínio do Qdrant",
      kind: "domain",
      placeholder: "qdrant.encha.ai",
      helpText: "Pode ser um domínio ou o IP da VPS. Usado apenas para exibir a URL do dashboard.",
    },
    {
      name: "nodes_qdrant",
      label: "Quantidade de nodes",
      kind: "port",
      placeholder: "5",
      helpText: "Número de nodes do cluster Qdrant (recomendado: 5).",
    },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const nodes = Number(v.nodes_qdrant);

    let services = `version: "3.7"
services:
`;

    for (let i = 0; i < nodes; i++) {
      const nodeName = `qdrant_node_${i}`;
      const volumeName = `qdrant_data_${i}`;
      const restPort = 6333 + i * 10;
      const grpcPort = 6334 + i * 10;
      const command =
        i === 0
          ? `    command: ./qdrant --uri 'http://qdrant_node_0:6335'`
          : `    command: bash -c "sleep ${10 + i * 3} && ./qdrant --bootstrap 'http://qdrant_node_0:6335' --uri 'http://qdrant_node_${i}:6335'"`;

      services += `
  ${nodeName}:
    image: qdrant/qdrant:latest
    volumes:
      - ${volumeName}:/qdrant
    networks:
      - ${net}
    ports:
      - "${restPort}:6333"
      - "${grpcPort}:6334"
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__CLUSTER__ENABLED=true
      - QDRANT__CLUSTER__P2P__PORT=6335
      - QDRANT__CLUSTER__CONSENSUS__MAX_MESSAGE_QUEUE_SIZE=5000
      - QDRANT__LOG_LEVEL=debug,raft=info
    deploy:
      resources:
        limits:
          cpus: "0.3"
${command}

`;
    }

    services += `volumes:
`;
    for (let i = 0; i < nodes; i++) {
      services += `  qdrant_data_${i}:\n`;
    }

    services += `
networks:
  ${net}:
    external: true
    name: ${net}
`;

    return services;
  },
  postInstall: {
    accessUrl: (v) => `http://${(v as { ip_vps: string }).ip_vps}:6333/dashboard`,
    notes: ["Dashboard disponível em http://<ip-vps>:6333/dashboard", "REST API na porta 6333, gRPC na 6334"],
  },
};
