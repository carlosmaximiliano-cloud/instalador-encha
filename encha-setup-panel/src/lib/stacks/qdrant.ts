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
  i18n: {
    en: {
      description: "Vector database for semantic search and RAG.",
      fields: {
        ip_vps: {
          label: "VPS IP or Qdrant domain",
          placeholder: "qdrant.encha.ai",
          helpText: "Can be a domain or the VPS IP. Used only to display the dashboard URL.",
        },
        nodes_qdrant: {
          label: "Number of nodes",
          placeholder: "5",
          helpText: "Number of nodes in the Qdrant cluster (recommended: 5).",
        },
      },
      notes: ["Dashboard available at http://<vps-ip>:6333/dashboard", "REST API on port 6333, gRPC on 6334"],
    },
    es: {
      description: "Base de datos vectorial para búsqueda semántica y RAG.",
      fields: {
        ip_vps: {
          label: "IP de la VPS o dominio de Qdrant",
          placeholder: "qdrant.encha.ai",
          helpText: "Puede ser un dominio o la IP de la VPS. Se usa solo para mostrar la URL del dashboard.",
        },
        nodes_qdrant: {
          label: "Cantidad de nodos",
          placeholder: "5",
          helpText: "Número de nodos del clúster Qdrant (recomendado: 5).",
        },
      },
      notes: ["Dashboard disponible en http://<ip-vps>:6333/dashboard", "REST API en el puerto 6333, gRPC en el 6334"],
    },
  },
};
