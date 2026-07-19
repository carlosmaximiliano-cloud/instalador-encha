import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_infisical: fqdn,
  smtp_host: z.string().optional(),
  smtp_port: portNum.optional(),
  smtp_user: z.string().optional(),
  smtp_pass: z.string().optional(),
  smtp_from: email.optional(),
});

export const infisical: StackDefinition = {
  id: "infisical",
  repoUrl: "https://github.com/Infisical/infisical",
  name: "Infisical",
  description: "Cofre de segredos open-source (Vault) para aplicações — API, versionamento e injeção em runtime.",
  category: "auth",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 83,
  installVia: "panel",
  externalVolumes: ["infisical_postgres_data", "infisical_redis_data"],
  fields: [
    { name: "url_infisical", label: "Domínio do Infisical", kind: "domain", placeholder: "secrets.encha.ai", group: "Domínios" },
    { name: "smtp_host", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", optional: true, helpText: "Opcional — necessário para convites e reset de senha.", group: "SMTP (opcional)" },
    { name: "smtp_port", label: "Porta SMTP", kind: "port", placeholder: "587", optional: true, group: "SMTP (opcional)" },
    { name: "smtp_user", label: "Usuário SMTP", kind: "text", optional: true, group: "SMTP (opcional)" },
    { name: "smtp_pass", label: "Senha SMTP", kind: "password", sensitive: true, optional: true, group: "SMTP (opcional)" },
    { name: "smtp_from", label: "E-mail de envio (From)", kind: "email", placeholder: "noreply@encha.ai", optional: true, group: "SMTP (opcional)" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key", value: randomBytes(16).toString("hex") },
    { name: "auth_secret", value: randomBytes(32).toString("base64") },
    { name: "senha_postgres", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const san = (x: unknown) => String(x ?? "").replace(/[`"\n\r]/g, "");
    const smtpBlock = v.smtp_host
      ? `
      - SMTP_HOST=${san(v.smtp_host)}
      - SMTP_PORT=${v.smtp_port ?? 587}
      - SMTP_USERNAME=${san(v.smtp_user)}
      - SMTP_PASSWORD=${san(v.smtp_pass)}
      - SMTP_FROM_ADDRESS=${san(v.smtp_from)}
      - SMTP_FROM_NAME=Infisical`
      : "";
    return `version: "3.7"
services:

  infisical_app:
    image: infisical/infisical:latest-postgres
    networks:
      - ${net}
    environment:
      - NODE_ENV=production
      - ENCRYPTION_KEY=${secrets.encryption_key}
      - AUTH_SECRET=${secrets.auth_secret}
      - DB_CONNECTION_URI=postgresql://infisical:${secrets.senha_postgres}@infisical_postgres:5432/infisical
      - REDIS_URL=redis://infisical_redis:6379
      - SITE_URL=https://${v.url_infisical}${smtpBlock}
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
        - traefik.http.routers.infisical.rule=Host(\`${v.url_infisical}\`)
        - traefik.http.routers.infisical.entrypoints=websecure
        - traefik.http.routers.infisical.tls.certresolver=letsencryptresolver
        - traefik.http.routers.infisical.service=infisical
        - traefik.http.services.infisical.loadbalancer.passHostHeader=true
        - traefik.http.services.infisical.loadbalancer.server.port=8080

  infisical_postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=infisical
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DB=infisical
      - TZ=America/Sao_Paulo
    volumes:
      - infisical_postgres_data:/var/lib/postgresql/data
    networks:
      - ${net}
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

  infisical_redis:
    image: redis:7-alpine
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --port
      - "6379"
    volumes:
      - infisical_redis_data:/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 512M

volumes:
  infisical_postgres_data:
    external: true
    name: infisical_postgres_data
  infisical_redis_data:
    external: true
    name: infisical_redis_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_infisical}`,
    notes: [
      "Crie a conta de administrador no primeiro acesso ao domínio.",
      "As migrações do banco rodam automaticamente no boot (imagem -postgres).",
      "SMTP é opcional — sem ele, convites e reset de senha ficam limitados.",
    ],
  },
};
