import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_firecrawl: fqdn,
  api_firecrawl: z.string().min(1),
});

export const firecrawl: StackDefinition = {
  id: "firecrawl",
  repoUrl: "https://github.com/mendableai/firecrawl",
  logoUrl: "https://raw.githubusercontent.com/mendableai/firecrawl/main/logo.png",
  name: "Firecrawl",
  description: "Crawler que transforma sites em markdown pronto para LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer", "redis"],
  optionNumber: 77,
  installVia: "panel",
  fields: [
    {
      name: "url_firecrawl",
      label: "Domínio da API Firecrawl",
      kind: "domain",
      placeholder: "firecrawl.encha.ai",
    },
    {
      name: "api_firecrawl",
      label: "API Key da OpenAI",
      kind: "password",
      placeholder: "sk-...",
      sensitive: true,
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "apikey_firecrawl", value: `fc-${randomBytes(16).toString("hex")}` },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.8"
services:

  firecrawl_api:
    image: encha/firecrawl-api:latest
    command: ["pnpm", "run", "start:production"]
    networks:
      - ${net}
    environment:
      - FIRECRAWL_API_KEY=${secrets.apikey_firecrawl}
      - REDIS_URL=redis://redis:6379
      - REDIS_RATE_LIMIT_URL=redis://redis:6379
      - OPENAI_API_KEY=${v.api_firecrawl}
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - MODEL_NAME=gpt-4o
      - SCRAPING_BEE_API_KEY=
      - HOST=0.0.0.0
      - SELF_HOSTED_WEBHOOK_URL=
      - LOGGING_LEVEL=DEBUG
      - USE_DB_AUTHENTICATION=false
      - PORT=3002
      - NUM_WORKERS_PER_QUEUE=8
      - FLY_PROCESS_GROUP=app
      - PLAYWRIGHT_MICROSERVICE_URL=http://firecrawl_playwright:3000
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
        - traefik.http.routers.firecrawl_api.rule=Host(\`${v.url_firecrawl}\`)
        - traefik.http.services.firecrawl_api.loadbalancer.server.port=3002
        - traefik.http.routers.firecrawl_api.service=firecrawl_api
        - traefik.http.routers.firecrawl_api.tls.certresolver=letsencryptresolver
        - traefik.http.routers.firecrawl_api.entrypoints=websecure
        - traefik.http.routers.firecrawl_api.tls=true

  firecrawl_worker:
    image: encha/firecrawl-api:latest
    command: ["pnpm", "run", "workers"]
    networks:
      - ${net}
    environment:
      - FIRECRAWL_API_KEY=${secrets.apikey_firecrawl}
      - REDIS_URL=redis://redis:6379
      - REDIS_RATE_LIMIT_URL=redis://redis:6379
      - OPENAI_API_KEY=${v.api_firecrawl}
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - MODEL_NAME=gpt-4o
      - SCRAPING_BEE_API_KEY=
      - HOST=0.0.0.0
      - SELF_HOSTED_WEBHOOK_URL=
      - LOGGING_LEVEL=DEBUG
      - USE_DB_AUTHENTICATION=false
      - PORT=3002
      - NUM_WORKERS_PER_QUEUE=8
      - FLY_PROCESS_GROUP=worker
      - PLAYWRIGHT_MICROSERVICE_URL=http://firecrawl_playwright:3000
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

  firecrawl_playwright:
    image: encha/firecrawl-playwright-service:latest
    networks:
      - ${net}
    environment:
      - PORT=3000
      - PROXY_SERVER=http://proxy-server.com:3128
      - PROXY_USERNAME=admin
      - PROXY_PASSWORD=admin
      - BLOCK_MEDIA=true
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

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_firecrawl}`,
  },
};
