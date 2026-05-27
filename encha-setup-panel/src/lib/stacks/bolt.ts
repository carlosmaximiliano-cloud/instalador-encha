import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_bolt: fqdn,
});

export const bolt: StackDefinition = {
  id: "bolt",
  repoUrl: "https://github.com/stackblitz-labs/bolt.diy",
  name: "Bolt.diy",
  description: "IDE web open-source para gerar apps com LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 60,
  installVia: "panel",
  fields: [
    {
      name: "url_bolt",
      label: "Domínio do Bolt",
      kind: "domain",
      placeholder: "bolt.encha.ai",
    },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  bolt:
    image: docker.io/hipnologo/bolt.diy:latest
    volumes:
      - bolt_data:/app/data
    networks:
      - ${net}
    environment:
      - NODE_ENV=development
      - VITE_HMR_PROTOCOL=ws
      - VITE_HMR_HOST=localhost
      - VITE_HMR_PORT=5173
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
      - PORT=5173
      - VITE_LOG_LEVEL=debug
      - DEFAULT_NUM_CTX=32768
      - RUNNING_IN_DOCKER=true
      - NODE_OPTIONS=--max-old-space-size=4096
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "2"
          memory: 4096M
      labels:
        - traefik.enable=true
        - traefik.http.routers.bolt.rule=Host(\`${v.url_bolt}\`)
        - traefik.http.services.bolt.loadbalancer.server.port=5173
        - traefik.http.routers.bolt.service=bolt
        - traefik.http.routers.bolt.tls.certresolver=letsencryptresolver
        - traefik.http.routers.bolt.entrypoints=websecure
        - traefik.http.routers.bolt.tls=true

volumes:
  bolt_data:
    external: true
    name: bolt_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_bolt}`,
  },
};
