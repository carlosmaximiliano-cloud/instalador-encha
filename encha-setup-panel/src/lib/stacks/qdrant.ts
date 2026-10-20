import { z } from "zod";
import { type StackDefinition } from "./types";

const schema = z.object({
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
    notes: [
      "Endpoint interno (dentro do Swarm): http://qdrant_node_0:6333 (REST) e qdrant_node_0:6334 (gRPC)",
      "Nenhuma porta é publicada na VPS e não há API key: o Qdrant só responde na rede interna, por segurança",
      "Painel web: na VPS, rode docker run --rm -p 127.0.0.1:6333:6333 --network <rede-interna> alpine/socat tcp-listen:6333,fork,reuseaddr tcp-connect:qdrant_node_0:6333",
      "No seu computador, abra o túnel ssh -L 6333:127.0.0.1:6333 usuario@<ip-vps> e acesse http://localhost:6333/dashboard",
    ],
  },
  i18n: {
    en: {
      description: "Vector database for semantic search and RAG.",
      fields: {
        nodes_qdrant: {
          label: "Number of nodes",
          placeholder: "5",
          helpText: "Number of nodes in the Qdrant cluster (recommended: 5).",
        },
      },
      notes: [
        "Internal endpoint (inside the Swarm): http://qdrant_node_0:6333 (REST) and qdrant_node_0:6334 (gRPC)",
        "No port is published on the VPS and there is no API key: Qdrant only answers on the internal network, for security",
        "Web panel: on the VPS, run docker run --rm -p 127.0.0.1:6333:6333 --network <internal-network> alpine/socat tcp-listen:6333,fork,reuseaddr tcp-connect:qdrant_node_0:6333",
        "On your computer, open the tunnel ssh -L 6333:127.0.0.1:6333 user@<vps-ip> and go to http://localhost:6333/dashboard",
      ],
    },
    es: {
      description: "Base de datos vectorial para búsqueda semántica y RAG.",
      fields: {
        nodes_qdrant: {
          label: "Cantidad de nodos",
          placeholder: "5",
          helpText: "Número de nodos del clúster Qdrant (recomendado: 5).",
        },
      },
      notes: [
        "Endpoint interno (dentro del Swarm): http://qdrant_node_0:6333 (REST) y qdrant_node_0:6334 (gRPC)",
        "Ningún puerto se publica en la VPS y no hay API key: Qdrant solo responde en la red interna, por seguridad",
        "Panel web: en la VPS, ejecute docker run --rm -p 127.0.0.1:6333:6333 --network <red-interna> alpine/socat tcp-listen:6333,fork,reuseaddr tcp-connect:qdrant_node_0:6333",
        "En su computadora, abra el túnel ssh -L 6333:127.0.0.1:6333 usuario@<ip-vps> y entre a http://localhost:6333/dashboard",
      ],
    },
  },
};
