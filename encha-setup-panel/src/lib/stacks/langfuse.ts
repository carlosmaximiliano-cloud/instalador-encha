import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_langfuse: fqdn,
  url_s3: fqdn,
  s3_access_key: z.string().min(1),
  s3_secret_key: z.string().min(1),
  api_clickhouse: z.string().min(1),
  usuario_clickhouse: z.string().min(1),
  senha_clickhouse: z.string().min(1),
});

export const langfuse: StackDefinition = {
  id: "langfuse",
  repoUrl: "https://github.com/langfuse/langfuse",
  name: "Langfuse",
  description: "Observabilidade e analytics para aplicações LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer", "postgres", "clickhouse", "minio"],
  optionNumber: 66,
  installVia: "panel",
  fields: [
    {
      name: "url_langfuse",
      label: "Domínio do Langfuse",
      kind: "domain",
      placeholder: "langfuse.encha.ai",
      group: "Domínios",
    },
    {
      name: "url_s3",
      label: "Domínio do MinIO (S3)",
      kind: "domain",
      placeholder: "s3.encha.ai",
      group: "MinIO",
    },
    {
      name: "s3_access_key",
      label: "Access Key do MinIO",
      kind: "text",
      placeholder: "minio_access_key",
      group: "MinIO",
    },
    {
      name: "s3_secret_key",
      label: "Secret Key do MinIO",
      kind: "password",
      placeholder: "minio_secret_key",
      sensitive: true,
      group: "MinIO",
    },
    {
      name: "api_clickhouse",
      label: "URL HTTP do ClickHouse",
      kind: "text",
      placeholder: "http://clickhouse:8123",
      group: "ClickHouse",
    },
    {
      name: "usuario_clickhouse",
      label: "Usuário do ClickHouse",
      kind: "text",
      placeholder: "default",
      group: "ClickHouse",
    },
    {
      name: "senha_clickhouse",
      label: "Senha do ClickHouse",
      kind: "password",
      placeholder: "senha",
      sensitive: true,
      group: "ClickHouse",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_encryption", value: randomBytes(32).toString("hex") },
    { name: "key_secret", value: randomBytes(32).toString("hex") },
    { name: "key_salt", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  langfuse_app:
    image: langfuse/langfuse:latest
    networks:
      - ${net}
    environment:
      - NEXTAUTH_URL=https://${v.url_langfuse}
      - NEXT_PUBLIC_SIGN_UP_DISABLED=false
      - ENCRYPTION_KEY=${secrets.key_encryption}
      - NEXTAUTH_SECRET=${secrets.key_secret}
      - SALT=${secrets.key_salt}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/langfuse
      - CLICKHOUSE_MIGRATION_URL=clickhouse://clickhouse:9000
      - CLICKHOUSE_URL=${v.api_clickhouse}
      - CLICKHOUSE_USER=${v.usuario_clickhouse}
      - CLICKHOUSE_PASSWORD=${v.senha_clickhouse}
      - CLICKHOUSE_CLUSTER_ENABLED=false
      - CLICKHOUSE_DB=langfuse
      - REDIS_CONNECTION_STRING=redis://langfuse_redis:6379
      - LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT=https://${v.url_s3}
      - LANGFUSE_S3_EVENT_UPLOAD_BUCKET=langfuse
      - LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID=${v.s3_access_key}
      - LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - LANGFUSE_S3_EVENT_UPLOAD_REGION=auto
      - LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE=true
      - LANGFUSE_S3_EVENT_UPLOAD_PREFIX=events/
      - LANGFUSE_S3_MEDIA_UPLOAD_ENDPOINT=https://${v.url_s3}
      - LANGFUSE_S3_MEDIA_UPLOAD_BUCKET=langfuse
      - LANGFUSE_S3_MEDIA_UPLOAD_ACCESS_KEY_ID=${v.s3_access_key}
      - LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - LANGFUSE_S3_MEDIA_UPLOAD_REGION=auto
      - LANGFUSE_S3_MEDIA_UPLOAD_FORCE_PATH_STYLE=true
      - LANGFUSE_S3_MEDIA_UPLOAD_PREFIX=media/
      - TELEMETRY_ENABLED=false
      - LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=false
      - NODE_ENV=production
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
        - traefik.http.routers.langfuse.rule=Host(\`${v.url_langfuse}\`)
        - traefik.http.routers.langfuse.entrypoints=websecure
        - traefik.http.routers.langfuse.tls.certresolver=letsencryptresolver
        - traefik.http.routers.langfuse.service=langfuse
        - traefik.http.services.langfuse.loadbalancer.passHostHeader=true
        - traefik.http.services.langfuse.loadbalancer.server.port=3000

  langfuse_worker:
    image: langfuse/langfuse-worker:latest
    networks:
      - ${net}
    environment:
      - NEXTAUTH_URL=https://${v.url_langfuse}
      - NEXT_PUBLIC_SIGN_UP_DISABLED=false
      - ENCRYPTION_KEY=${secrets.key_encryption}
      - NEXTAUTH_SECRET=${secrets.key_secret}
      - SALT=${secrets.key_salt}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/langfuse
      - CLICKHOUSE_MIGRATION_URL=clickhouse://clickhouse:9000
      - CLICKHOUSE_URL=${v.api_clickhouse}
      - CLICKHOUSE_USER=${v.usuario_clickhouse}
      - CLICKHOUSE_PASSWORD=${v.senha_clickhouse}
      - CLICKHOUSE_CLUSTER_ENABLED=false
      - CLICKHOUSE_DB=langfuse
      - REDIS_CONNECTION_STRING=redis://langfuse_redis:6379
      - LANGFUSE_S3_EVENT_UPLOAD_ENDPOINT=https://${v.url_s3}
      - LANGFUSE_S3_EVENT_UPLOAD_BUCKET=langfuse
      - LANGFUSE_S3_EVENT_UPLOAD_ACCESS_KEY_ID=${v.s3_access_key}
      - LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - LANGFUSE_S3_EVENT_UPLOAD_REGION=auto
      - LANGFUSE_S3_EVENT_UPLOAD_FORCE_PATH_STYLE=true
      - LANGFUSE_S3_EVENT_UPLOAD_PREFIX=events/
      - LANGFUSE_S3_MEDIA_UPLOAD_ENDPOINT=https://${v.url_s3}
      - LANGFUSE_S3_MEDIA_UPLOAD_BUCKET=langfuse
      - LANGFUSE_S3_MEDIA_UPLOAD_ACCESS_KEY_ID=${v.s3_access_key}
      - LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - LANGFUSE_S3_MEDIA_UPLOAD_REGION=auto
      - LANGFUSE_S3_MEDIA_UPLOAD_FORCE_PATH_STYLE=true
      - LANGFUSE_S3_MEDIA_UPLOAD_PREFIX=media/
      - TELEMETRY_ENABLED=false
      - LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=false
      - NODE_ENV=production
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

  langfuse_redis:
    image: redis:latest
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --port
      - "6379"
    volumes:
      - langfuse_redis:/data
    networks:
      - ${net}
    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

volumes:
  langfuse_redis:
    external: true
    name: langfuse_redis

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_langfuse}`,
    notes: ["Crie sua conta no primeiro acesso."],
  },
};
