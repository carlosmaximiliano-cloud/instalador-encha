import { z } from "zod";
import { type StackDefinition, fqdn, username, strongPassword } from "./types";
import { randomBytes, createHmac } from "node:crypto";

const schema = z.object({
  url_supabase: fqdn,
  user_supabase: username,
  pass_supabase: strongPassword,
  url_s3: fqdn,
  s3_access_key: z.string().min(3),
  s3_secret_key: z.string().min(3),
});

function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateSupabaseJwts(): { secret: string; anonKey: string; serviceKey: string } {
  const secret = randomBytes(20).toString("hex");
  const header = base64url('{"alg":"HS256","typ":"JWT"}');

  const anonPayload = base64url(
    JSON.stringify({ role: "anon", iss: "supabase", iat: 1715050800, exp: 1872817200 })
  );
  const servicePayload = base64url(
    JSON.stringify({ role: "service_role", iss: "supabase", iat: 1715050800, exp: 1872817200 })
  );

  const anonSig = base64url(
    createHmac("sha256", secret).update(`${header}.${anonPayload}`).digest()
  );
  const serviceSig = base64url(
    createHmac("sha256", secret).update(`${header}.${servicePayload}`).digest()
  );

  return {
    secret,
    anonKey: `${header}.${anonPayload}.${anonSig}`,
    serviceKey: `${header}.${servicePayload}.${serviceSig}`,
  };
}

export const supabase: StackDefinition = {
  id: "supabase",
  repoUrl: "https://github.com/supabase/supabase",
  name: "Supabase",
  description: "Backend completo open-source (Postgres + Auth + Storage + Realtime).",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer", "minio"],
  optionNumber: 45,
  installVia: "panel",
  fields: [
    {
      name: "url_supabase",
      label: "Domínio do Supabase",
      kind: "domain",
      placeholder: "supabase.suaempresa.com",
      group: "Acesso",
    },
    {
      name: "user_supabase",
      label: "Usuário do Dashboard",
      kind: "username",
      placeholder: "admin",
      group: "Acesso",
    },
    {
      name: "pass_supabase",
      label: "Senha do Dashboard",
      kind: "password",
      sensitive: true,
      helpText: "Sem caracteres especiais @ ! # $",
      group: "Acesso",
    },
    {
      name: "url_s3",
      label: "URL do S3 (MinIO)",
      kind: "domain",
      placeholder: "s3.suaempresa.com",
      group: "MinIO/S3",
    },
    {
      name: "s3_access_key",
      label: "S3 Access Key",
      kind: "text",
      sensitive: true,
      group: "MinIO/S3",
    },
    {
      name: "s3_secret_key",
      label: "S3 Secret Key",
      kind: "password",
      sensitive: true,
      group: "MinIO/S3",
    },
  ],
  schema,
  generateSecrets: () => {
    const jwt = generateSupabaseJwts();
    return [
      { name: "jwt_secret", value: jwt.secret },
      { name: "anon_key", value: jwt.anonKey },
      { name: "service_key", value: jwt.serviceKey },
      { name: "senha_postgres", value: randomBytes(16).toString("hex") },
      { name: "logflare_key", value: randomBytes(16).toString("hex") },
      { name: "logflare_key_public", value: randomBytes(16).toString("hex") },
      { name: "secret_key_base", value: randomBytes(32).toString("hex") },
      {
        name: "vault_enc_key",
        value: randomBytes(32).toString("base64").replace(/\n/g, "").slice(0, 32),
      },
    ];
  },
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const senhaPg = secrets.senha_postgres;
    const jwt = secrets.jwt_secret;
    const anon = secrets.anon_key;
    const service = secrets.service_key;
    const logflare = secrets.logflare_key;
    const logflarePub = secrets.logflare_key_public;
    const skb = secrets.secret_key_base;
    const vault = secrets.vault_enc_key;

    return `version: "3.7"
services:
  studio:
    image: supabase/studio:2025.06.30-sha-6f5982d
    networks:
      - ${net}
    environment:
      - HOSTNAME=0.0.0.0
      - DEBUG=next:*
      - NEXT_PUBLIC_ENABLE_LOGS=true
      - NEXT_ANALYTICS_BACKEND_PROVIDER=postgres
      - DEFAULT_ORGANIZATION_NAME=Encha
      - DEFAULT_PROJECT_NAME=Encha
      - POSTGRES_PASSWORD=${senhaPg}
      - STUDIO_PG_META_URL=http://meta:8080
      - SUPABASE_URL=http://kong:8000
      - SUPABASE_PUBLIC_URL=https://${v.url_supabase}
      - LOGFLARE_API_KEY=${logflare}
      - LOGFLARE_URL=http://analytics:4000
      - LOGFLARE_PRIVATE_ACCESS_TOKEN=${logflare}
      - SUPABASE_ANON_KEY=${anon}
      - SUPABASE_SERVICE_KEY=${service}
      - AUTH_JWT_SECRET=${jwt}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  kong:
    image: kong:2.8.1
    entrypoint: bash -c 'eval "echo \\"\\$$(cat ~/temp.yml)\\"" > ~/kong.yml && /docker-entrypoint.sh kong docker-start'
    volumes:
      - /root/supabase/docker/volumes/api/kong.yml:/home/kong/temp.yml:ro
    networks:
      - ${net}
    environment:
      - DASHBOARD_USERNAME=${v.user_supabase}
      - DASHBOARD_PASSWORD=${v.pass_supabase}
      - JWT_SECRET=${jwt}
      - SUPABASE_ANON_KEY=${anon}
      - SUPABASE_SERVICE_KEY=${service}
      - KONG_DATABASE=off
      - KONG_DECLARATIVE_CONFIG=/home/kong/kong.yml
      - KONG_DNS_ORDER=LAST,A,CNAME
      - KONG_PLUGINS=request-transformer,cors,key-auth,acl,basic-auth
      - KONG_NGINX_PROXY_PROXY_BUFFER_SIZE=160k
      - KONG_NGINX_PROXY_PROXY_BUFFERS=64 160k
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.kong.rule=Host(\`${v.url_supabase}\`) && PathPrefix(\`/\`)
        - traefik.http.services.kong.loadbalancer.server.port=8000
        - traefik.http.routers.kong.service=kong
        - traefik.http.routers.kong.entrypoints=websecure
        - traefik.http.routers.kong.tls.certresolver=letsencryptresolver
        - traefik.http.routers.kong.tls=true

  auth:
    image: supabase/gotrue:v2.176.1
    networks:
      - ${net}
    environment:
      - GOTRUE_API_HOST=0.0.0.0
      - GOTRUE_API_PORT=9999
      - API_EXTERNAL_URL=https://${v.url_supabase}
      - GOTRUE_DB_DRIVER=postgres
      - GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:${senhaPg}@db:5432/postgres
      - GOTRUE_SITE_URL=https://${v.url_supabase}
      - GOTRUE_URI_ALLOW_LIST=
      - GOTRUE_DISABLE_SIGNUP=false
      - GOTRUE_JWT_ADMIN_ROLES=service_role
      - GOTRUE_JWT_AUD=authenticated
      - GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
      - GOTRUE_JWT_EXP=31536000
      - GOTRUE_JWT_SECRET=${jwt}
      - GOTRUE_EXTERNAL_EMAIL_ENABLED=false
      - GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=false
      - GOTRUE_MAILER_URLPATHS_INVITE=/auth/v1/verify
      - GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
      - GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify
      - GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify
      - GOTRUE_EXTERNAL_PHONE_ENABLED=false
      - GOTRUE_SMS_AUTOCONFIRM=false
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  rest:
    image: postgrest/postgrest:v12.2.12
    command: "postgrest"
    networks:
      - ${net}
    environment:
      - PGRST_DB_URI=postgres://authenticator:${senhaPg}@db:5432/postgres
      - PGRST_DB_SCHEMAS=public,storage,graphql_public
      - PGRST_DB_ANON_ROLE=anon
      - PGRST_JWT_SECRET=${jwt}
      - PGRST_APP_SETTINGS_JWT_SECRET=${jwt}
      - PGRST_APP_SETTINGS_JWT_EXP=31536000
      - PGRST_DB_USE_LEGACY_GUCS="false"
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  realtime:
    image: supabase/realtime:v2.34.47
    networks:
      - ${net}
    environment:
      - PORT=4000
      - API_JWT_SECRET=${jwt}
      - SECRET_KEY_BASE=${skb}
      - APP_NAME=realtime
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=supabase_admin
      - DB_PASSWORD=${senhaPg}
      - DB_NAME=postgres
      - DB_AFTER_CONNECT_QUERY='SET search_path TO _realtime'
      - DB_ENC_KEY=supabaserealtime
      - ERL_AFLAGS=-proto_dist inet_tcp
      - DNS_NODES="''"
      - RLIMIT_NOFILE=10000
      - SEED_SELF_HOST=true
      - RUN_JANITOR=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  storage:
    image: supabase/storage-api:v1.22.17
    volumes:
      - /root/supabase/docker/volumes/storage:/var/lib/storage:z
    networks:
      - ${net}
    environment:
      - ANON_KEY=${anon}
      - SERVICE_KEY=${service}
      - POSTGREST_URL=http://rest:3000
      - PGRST_JWT_SECRET=${jwt}
      - DATABASE_URL=postgres://supabase_storage_admin:${senhaPg}@db:5432/postgres
      - FILE_SIZE_LIMIT=52428800
      - STORAGE_BACKEND=s3
      - GLOBAL_S3_BUCKET=supabase
      - GLOBAL_S3_ENDPOINT=https://${v.url_s3}
      - GLOBAL_S3_PROTOCOL=https
      - GLOBAL_S3_FORCE_PATH_STYLE=true
      - AWS_ACCESS_KEY_ID=${v.s3_access_key}
      - AWS_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - AWS_DEFAULT_REGION=eu-south
      - FILE_STORAGE_BACKEND_PATH=/var/lib/storage
      - ENABLE_IMAGE_TRANSFORMATION="true"
      - IMGPROXY_URL=http://imgproxy:5001
      - TENANT_ID=stub
      - REGION=eu-south
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  imgproxy:
    image: darthsim/imgproxy:v3.8.0
    volumes:
      - /root/supabase/docker/volumes/storage:/var/lib/storage:z
    networks:
      - ${net}
    environment:
      - IMGPROXY_BIND=:5001
      - IMGPROXY_LOCAL_FILESYSTEM_ROOT=/
      - IMGPROXY_USE_ETAG=true
      - IMGPROXY_ENABLE_WEBP_DETECTION=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  meta:
    image: supabase/postgres-meta:v0.89.3
    networks:
      - ${net}
    environment:
      - PG_META_PORT=8080
      - PG_META_DB_HOST=db
      - PG_META_DB_PORT=5432
      - PG_META_DB_NAME=postgres
      - PG_META_DB_USER=supabase_admin
      - PG_META_DB_PASSWORD=${senhaPg}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  functions:
    image: supabase/edge-runtime:v1.67.4
    command:
      - start
      - --main-service
      - /home/deno/functions/main
    volumes:
      - /root/supabase/docker/volumes/functions:/home/deno/functions:Z
    networks:
      - ${net}
    environment:
      - VERIFY_JWT="false"
      - JWT_SECRET=${jwt}
      - SUPABASE_URL=http://kong:8000
      - SUPABASE_ANON_KEY=${anon}
      - SUPABASE_SERVICE_ROLE_KEY=${service}
      - SUPABASE_DB_URL=postgresql://postgres:${senhaPg}@db:5432/postgres
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  analytics:
    image: supabase/logflare:1.14.2
    networks:
      - ${net}
    environment:
      - DB_USERNAME=supabase_admin
      - DB_DATABASE=_supabase
      - DB_HOSTNAME=db
      - DB_PORT=5432
      - DB_PASSWORD=${senhaPg}
      - DB_SCHEMA=_analytics
      - POSTGRES_BACKEND_URL=postgresql://supabase_admin:${senhaPg}@db:5432/_supabase
      - POSTGRES_BACKEND_SCHEMA=_analytics
      - LOGFLARE_NODE_HOST=127.0.0.1
      - LOGFLARE_API_KEY=${logflare}
      - LOGFLARE_PUBLIC_ACCESS_TOKEN=${logflarePub}
      - LOGFLARE_PRIVATE_ACCESS_TOKEN=${logflare}
      - LOGFLARE_SINGLE_TENANT=true
      - LOGFLARE_SUPABASE_MODE=true
      - LOGFLARE_MIN_CLUSTER_SIZE=1
      - LOGFLARE_FEATURE_FLAG_OVERRIDE=multibackend=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  db:
    image: supabase/postgres:15.8.1.060
    command:
      - postgres
      - '-c'
      - config_file=/etc/postgresql/postgresql.conf
      - '-c'
      - log_min_messages=fatal
    volumes:
      - /root/supabase/docker/volumes/db/realtime.sql:/docker-entrypoint-initdb.d/migrations/99-realtime.sql:Z
      - /root/supabase/docker/volumes/db/webhooks.sql:/docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql:Z
      - /root/supabase/docker/volumes/db/roles.sql:/docker-entrypoint-initdb.d/init-scripts/99-roles.sql:Z
      - /root/supabase/docker/volumes/db/jwt.sql:/docker-entrypoint-initdb.d/init-scripts/99-jwt.sql:Z
      - /root/supabase/docker/volumes/db/data:/var/lib/postgresql/data:Z
      - /root/supabase/docker/volumes/db/_supabase.sql:/docker-entrypoint-initdb.d/migrations/97-_supabase.sql:Z
      - /root/supabase/docker/volumes/db/logs.sql:/docker-entrypoint-initdb.d/migrations/99-logs.sql:Z
      - /root/supabase/docker/volumes/db/pooler.sql:/docker-entrypoint-initdb.d/migrations/99-pooler.sql:Z
      - supabase_db_config:/etc/postgresql-custom
    networks:
      - ${net}
    environment:
      - POSTGRES_HOST=/var/run/postgresql
      - PGPORT=5432
      - POSTGRES_PORT=5432
      - PGPASSWORD=${senhaPg}
      - POSTGRES_PASSWORD=${senhaPg}
      - POSTGRES_DB=postgres
      - PGDATABASE=postgres
      - JWT_SECRET=${jwt}
      - JWT_EXP=31536000
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  vector:
    image: timberio/vector:0.28.1-alpine
    command:
      - '--config'
      - etc/vector/vector.yml
    volumes:
      - /root/supabase/docker/volumes/logs/vector.yml:/etc/vector/vector.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - ${net}
    environment:
      - LOGFLARE_API_KEY=${logflare}
      - LOGFLARE_PUBLIC_ACCESS_TOKEN=${logflarePub}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  supavisor:
    image: supabase/supavisor:2.5.1
    command:
      - /bin/sh
      - -c
      - /app/bin/migrate && /app/bin/supavisor eval "\\$$(cat /etc/pooler/pooler.exs)" && /app/bin/server
    volumes:
      - /root/supabase/docker/volumes/pooler/pooler.exs:/etc/pooler/pooler.exs:ro
    networks:
      - ${net}
    environment:
      - POSTGRES_PORT=5432
      - POSTGRES_DB=postgres
      - POSTGRES_PASSWORD=${senhaPg}
      - DATABASE_URL=ecto://supabase_admin:${senhaPg}@db:5432/_supabase
      - CLUSTER_POSTGRES=true
      - API_JWT_SECRET=${jwt}
      - METRICS_JWT_SECRET=${jwt}
      - SECRET_KEY_BASE=${skb}
      - VAULT_ENC_KEY=${vault}
      - REGION=local
      - ERL_AFLAGS=-proto_dist inet_tcp
      - POOLER_TENANT_ID=1
      - POOLER_DEFAULT_POOL_SIZE=20
      - POOLER_MAX_CLIENT_CONN=100
      - POOLER_POOL_MODE=transaction
      - DB_POOL_SIZE=5
      - PORT=4000
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  supabase_db_config:
    external: true
    name: supabase_db_config

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_supabase: string }).url_supabase}`,
    notes: [
      "Requer setup prévio de arquivos em /root/supabase/docker/volumes (kong.yml, scripts SQL).",
      "O bucket 'supabase' precisa existir no MinIO antes da inicialização do Storage.",
    ],
  },
};
