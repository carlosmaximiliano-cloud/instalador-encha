import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_evoai_front: fqdn,
  url_evoai_api: fqdn,
  email_evoai: email,
  pass_evoai: z.string().min(6),
  smtp_email_evoai: email,
  smtp_user_evoai: z.string().min(1),
  smtp_pass_evoai: z.string().min(1),
  smtp_host_evoai: z.string().min(1),
  smtp_port_evoai: portNum,
});

// Fernet keys are 32 random bytes encoded with URL-safe base64 (44 chars with padding).
function fernetKey(): string {
  return randomBytes(32).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export const evoai: StackDefinition = {
  id: "evoai",
  repoUrl: "https://github.com/EvolutionAPI/evo-ai",
  name: "EvoAI",
  description: "Camada de IA conversacional sobre Evolution API.",
  category: "ai",
  icon: "bot",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 52,
  installVia: "panel",
  fields: [
    { name: "url_evoai_front", label: "Domínio do painel EvoAI", kind: "domain", placeholder: "evo.suaempresa.com", group: "Domínios" },
    { name: "url_evoai_api", label: "Domínio da API EvoAI", kind: "domain", placeholder: "api-evo.suaempresa.com", group: "Domínios" },
    { name: "email_evoai", label: "E-mail do admin", kind: "email", group: "Admin" },
    { name: "pass_evoai", label: "Senha do admin", kind: "password", sensitive: true, group: "Admin" },
    { name: "smtp_host_evoai", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "smtp_port_evoai", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "smtp_email_evoai", label: "E-mail remetente", kind: "email", placeholder: "noreply@suaempresa.com", group: "SMTP" },
    { name: "smtp_user_evoai", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "smtp_pass_evoai", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key", value: fernetKey() },
    { name: "jwt_secret_key", value: randomBytes(32).toString("base64") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const useSsl = Number(v.smtp_port_evoai) === 465;
    const smtpUseTls = useSsl ? "false" : "true";
    const smtpUseSsl = useSsl ? "true" : "false";
    return `version: "3.7"
services:
  evoai_api:
    image: evoapicloud/evo-ai:latest
    volumes:
      - evoai_logs:/app/logs
      - evoai_static:/app/static
    networks:
      - ${net}
    environment:
      - API_URL=https://${v.url_evoai_api}
      - APP_URL=https://${v.url_evoai_front}
      - ADMIN_EMAIL=${v.email_evoai}
      - ADMIN_INITIAL_PASSWORD=${v.pass_evoai}
      - EMAIL_PROVIDER=smtp
      - SMTP_FROM=${v.smtp_email_evoai}
      - SMTP_USER=${v.smtp_user_evoai}
      - SMTP_PASSWORD=${v.smtp_pass_evoai}
      - SMTP_HOST=${v.smtp_host_evoai}
      - SMTP_PORT=${v.smtp_port_evoai}
      - SMTP_USE_TLS=${smtpUseTls}
      - SMTP_USE_SSL=${smtpUseSsl}
      - POSTGRES_CONNECTION_STRING=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/evoai
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_DB=9
      - REDIS_KEY_PREFIX=a2a
      - REDIS_SSL=false
      - REDIS_TTL=3600
      - TOOLS_CACHE_TTL=3600
      - ENCRYPTION_KEY=${secrets.encryption_key}
      - JWT_SECRET_KEY=${secrets.jwt_secret_key}
      - JWT_ALGORITHM=HS256
      - JWT_EXPIRATION_TIME=3600
      - LOG_LEVEL=INFO
      - LOG_DIR=logs
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evoai_api.rule=Host(\`${v.url_evoai_api}\`)
        - traefik.http.routers.evoai_api.entrypoints=websecure
        - traefik.http.routers.evoai_api.priority=1
        - traefik.http.routers.evoai_api.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evoai_api.service=evoai_api
        - traefik.http.services.evoai_api.loadbalancer.server.port=8000
        - traefik.http.services.evoai_api.loadbalancer.passHostHeader=true

  evoai_frontend:
    image: evoapicloud/evo-ai-frontend:latest
    networks:
      - ${net}
    environment:
      - NEXT_PUBLIC_API_URL=https://${v.url_evoai_api}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evoai_frontend.rule=Host(\`${v.url_evoai_front}\`)
        - traefik.http.routers.evoai_frontend.entrypoints=websecure
        - traefik.http.routers.evoai_frontend.priority=1
        - traefik.http.routers.evoai_frontend.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evoai_frontend.service=evoai_frontend
        - traefik.http.services.evoai_frontend.loadbalancer.server.port=3000
        - traefik.http.services.evoai_frontend.loadbalancer.passHostHeader=true

volumes:
  evoai_logs:
    external: true
    name: evoai_logs
  evoai_static:
    external: true
    name: evoai_static

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_evoai_front: string }).url_evoai_front}`,
    notes: ["Login no painel com o e-mail e senha de admin que você definiu"],
  },
};
