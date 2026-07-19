import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_redisinsight: fqdn,
});

export const redisinsight: StackDefinition = {
  id: "redisinsight",
  repoUrl: "https://github.com/RedisInsight/RedisInsight",
  logoUrl: "https://raw.githubusercontent.com/RedisInsight/RedisInsight/main/docs/static/logo.svg",
  name: "RedisInsight",
  description: "UI oficial para inspecionar e gerenciar instâncias Redis.",
  category: "database",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "redis"],
  optionNumber: 75,
  installVia: "panel",
  fields: [
    { name: "url_redisinsight", label: "Domínio do RedisInsight", kind: "domain", placeholder: "redisins.suaempresa.com" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_redisinsight", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  redisinsight:
    image: redislabs/redisinsight:latest
    volumes:
      - redisinsight_data:/db
      - redisinsight_logs:/data/logs
    networks:
      - ${net}
    environment:
      - RI_APP_PORT=5540
      - RI_APP_HOST=0.0.0.0
      - RI_ENCRYPTION_KEY=${secrets.key_redisinsight}
      - RI_LOG_LEVEL=info
      - RI_FILES_LOGGER=false
      - RI_STDOUT_LOGGER=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.redisinsight.rule=Host(\`${v.url_redisinsight}\`)
        - traefik.http.services.redisinsight.loadbalancer.server.port=5540
        - traefik.http.routers.redisinsight.service=redisinsight
        - traefik.http.routers.redisinsight.tls.certresolver=letsencryptresolver
        - traefik.http.routers.redisinsight.entrypoints=websecure
        - traefik.http.routers.redisinsight.tls=true

volumes:
  redisinsight_data:
    external: true
    name: redisinsight_data
  redisinsight_logs:
    external: true
    name: redisinsight_logs

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_redisinsight: string }).url_redisinsight}`,
    notes: ["Para conectar ao seu Redis, use o host 'redis' e a porta '6379'."],
  },
};
