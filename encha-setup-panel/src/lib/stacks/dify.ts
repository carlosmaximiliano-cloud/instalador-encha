import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_dify: fqdn,
  url_dify_api: fqdn,
  url_s3: fqdn,
  email_dify: email,
  user_email_dify: z.string().min(1),
  senha_email_dify: z.string().min(1),
  smtp_email_dify: z.string().min(1),
  porta_smtp_dify: portNum,
});

export const dify: StackDefinition = {
  id: "dify",
  repoUrl: "https://github.com/langgenius/dify",
  logoUrl: "https://raw.githubusercontent.com/langgenius/dify/main/docs/assets/dify-logo.svg",
  name: "Dify",
  description: "Plataforma LLMOps para apps e agentes IA em produção.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer", "postgres", "redis", "minio"],
  optionNumber: 39,
  installVia: "panel",
  fields: [
    { name: "url_dify", label: "Domínio Web do Dify", kind: "domain", placeholder: "dify.suaempresa.com", group: "Domínios" },
    { name: "url_dify_api", label: "Domínio da API do Dify", kind: "domain", placeholder: "api-dify.suaempresa.com", group: "Domínios" },
    { name: "url_s3", label: "Domínio S3 (MinIO)", kind: "domain", placeholder: "s3.suaempresa.com", group: "Domínios" },
    { name: "smtp_email_dify", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_dify", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "email_dify", label: "E-mail remetente (SMTP)", kind: "email", group: "SMTP" },
    { name: "user_email_dify", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_email_dify", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret_key", value: randomBytes(16).toString("hex") },
    { name: "token_weaviate", value: randomBytes(16).toString("hex") },
    { name: "token_apikey_plugins", value: randomBytes(16).toString("hex") },
    { name: "token_deamon", value: randomBytes(16).toString("hex") },
    { name: "sandbox_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
    { name: "minio_access", value: "REUSE_MINIO" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  dify_api:
    image: langgenius/dify-api:latest
    volumes:
      - dify_storage:/app/api/storage
    networks:
      - ${net}
    environment:
      - MODE=api
      - CONSOLE_WEB_URL=https://${v.url_dify}
      - APP_WEB_URL=https://${v.url_dify}
      - CONSOLE_API_URL=https://${v.url_dify_api}
      - SERVICE_API_URL=https://${v.url_dify_api}
      - APP_API_URL=https://${v.url_dify_api}
      - FILES_URL=https://${v.url_dify_api}
      - MAIL_TYPE=smtp
      - MAIL_DEFAULT_SEND_FROM=${v.email_dify}
      - SMTP_SERVER=${v.smtp_email_dify}
      - SMTP_PORT=${v.porta_smtp_dify}
      - SMTP_USERNAME=${v.user_email_dify}
      - SMTP_PASSWORD=${v.senha_email_dify}
      - SMTP_USE_TLS=true
      - SMTP_OPPORTUNISTIC_TLS=false
      - INVITE_EXPIRY_HOURS=24
      - RESET_PASSWORD_TOKEN_EXPIRY_MINUTES=5
      - DIFY_BIND_ADDRESS=0.0.0.0
      - DIFY_PORT=5001
      - SERVER_WORKER_AMOUNT=1
      - SERVER_WORKER_CLASS=gevent
      - SERVER_WORKER_CONNECTIONS=10
      - API_TOOL_DEFAULT_CONNECT_TIMEOUT=10
      - API_TOOL_DEFAULT_READ_TIMEOUT=60
      - WEB_API_CORS_ALLOW_ORIGINS=*
      - CONSOLE_CORS_ALLOW_ORIGINS=*
      - MIGRATION_ENABLED=true
      - DB_USERNAME=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=dify
      - SQLALCHEMY_POOL_SIZE=50
      - SQLALCHEMY_POOL_RECYCLE=1800
      - SQLALCHEMY_ECHO=false
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_USERNAME=
      - REDIS_PASSWORD=
      - REDIS_USE_SSL=false
      - REDIS_DB=0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - BROKER_USE_SSL=false
      - STORAGE_TYPE=s3
      - S3_ENDPOINT=https://${v.url_s3}
      - S3_BUCKET_NAME=dify
      - S3_ACCESS_KEY=${secrets.minio_access}
      - S3_SECRET_KEY=${secrets.minio_access}
      - S3_REGION=us-east
      - S3_USE_AWS_MANAGED_IAM=false
      - UPLOAD_FILE_SIZE_LIMIT=15
      - UPLOAD_FILE_BATCH_LIMIT=5
      - UPLOAD_IMAGE_FILE_SIZE_LIMIT=10
      - UPLOAD_VIDEO_FILE_SIZE_LIMIT=100
      - UPLOAD_AUDIO_FILE_SIZE_LIMIT=50
      - VECTOR_STORE=weaviate
      - WEAVIATE_ENDPOINT=http://dify_weaviate:8080
      - WEAVIATE_API_KEY=${secrets.token_weaviate}
      - CODE_EXECUTION_ENDPOINT=http://dify_sandbox:8194
      - CODE_EXECUTION_API_KEY=${secrets.sandbox_key}
      - CODE_MAX_NUMBER=9223372036854775807
      - CODE_MIN_NUMBER=-9223372036854775808
      - CODE_MAX_DEPTH=5
      - CODE_MAX_PRECISION=20
      - CODE_MAX_STRING_LENGTH=80000
      - CODE_MAX_STRING_ARRAY_LENGTH=30
      - CODE_MAX_OBJECT_ARRAY_LENGTH=30
      - CODE_MAX_NUMBER_ARRAY_LENGTH=1000
      - CODE_EXECUTION_CONNECT_TIMEOUT=10
      - CODE_EXECUTION_READ_TIMEOUT=60
      - CODE_EXECUTION_WRITE_TIMEOUT=10
      - TEMPLATE_TRANSFORM_MAX_LENGTH=80000
      - PLUGIN_DAEMON_URL=http://dify_plugin_daemon:5002
      - PLUGIN_DAEMON_KEY=${secrets.token_deamon}
      - PLUGIN_MAX_PACKAGE_SIZE=52428800
      - INNER_API_KEY_FOR_PLUGIN=${secrets.token_apikey_plugins}
      - PLUGIN_REMOTE_INSTALL_HOST=localhost
      - PLUGIN_REMOTE_INSTALL_PORT=5003
      - CELERY_WORKER_CLASS=
      - CELERY_WORKER_AMOUNT=
      - CELERY_AUTO_SCALE=false
      - CELERY_MAX_WORKERS=
      - CELERY_MIN_WORKERS=
      - WORKFLOW_MAX_EXECUTION_STEPS=500
      - WORKFLOW_MAX_EXECUTION_TIME=1200
      - WORKFLOW_CALL_MAX_DEPTH=5
      - MAX_VARIABLE_SIZE=204800
      - WORKFLOW_PARALLEL_DEPTH_LIMIT=3
      - WORKFLOW_FILE_UPLOAD_LIMIT=10
      - LOOP_NODE_MAX_COUNT=100
      - MAX_TOOLS_NUM=10
      - MAX_PARALLEL_LIMIT=10
      - MAX_ITERATIONS_NUM=5
      - HTTP_REQUEST_NODE_MAX_BINARY_SIZE=10485760
      - HTTP_REQUEST_NODE_MAX_TEXT_SIZE=1048576
      - HTTP_REQUEST_NODE_SSL_VERIFY=True
      - TEXT_GENERATION_TIMEOUT_MS=60000
      - PROMPT_GENERATION_MAX_TOKENS=512
      - CODE_GENERATION_MAX_TOKENS=1024
      - MULTIMODAL_SEND_FORMAT=base64
      - ETL_TYPE=dify
      - INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH=4000
      - APP_MAX_ACTIVE_REQUESTS=0
      - APP_MAX_EXECUTION_TIME=1200
      - FILES_ACCESS_TIMEOUT=300
      - GUNICORN_TIMEOUT=360
      - SECRET_KEY=${secrets.secret_key}
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - REFRESH_TOKEN_EXPIRE_DAYS=30
      - INIT_PASSWORD=
      - LOG_LEVEL=INFO
      - LOG_FILE=/app/logs/server.log
      - LOG_FILE_MAX_SIZE=20
      - LOG_FILE_BACKUP_COUNT=5
      - LOG_DATEFORMAT=%d-%m-%Y %H:%M:%S
      - LOG_TZ=UTC
      - DEBUG=false
      - FLASK_DEBUG=false
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
        - traefik.http.routers.dify_api.rule=Host(\`${v.url_dify_api}\`)
        - traefik.http.services.dify_api.loadbalancer.server.port=5001
        - traefik.http.routers.dify_api.service=dify_api
        - traefik.http.routers.dify_api.tls.certresolver=letsencryptresolver
        - traefik.http.routers.dify_api.entrypoints=websecure
        - traefik.http.routers.dify_api.tls=true
        - traefik.http.middlewares.corsMiddleware.headers.accessControlAllowMethods=GET,POST,PUT,DELETE,OPTIONS
        - traefik.http.middlewares.corsMiddleware.headers.accessControlAllowHeaders=Content-Type,Authorization

  dify_worker:
    image: langgenius/dify-api:latest
    volumes:
      - dify_storage:/app/api/storage
    networks:
      - ${net}
    environment:
      - MODE=worker
      - CONSOLE_WEB_URL=https://${v.url_dify}
      - APP_WEB_URL=https://${v.url_dify}
      - CONSOLE_API_URL=https://${v.url_dify_api}
      - SERVICE_API_URL=https://${v.url_dify_api}
      - APP_API_URL=https://${v.url_dify_api}
      - FILES_URL=https://${v.url_dify_api}
      - MAIL_TYPE=smtp
      - MAIL_DEFAULT_SEND_FROM=${v.email_dify}
      - SMTP_SERVER=${v.smtp_email_dify}
      - SMTP_PORT=${v.porta_smtp_dify}
      - SMTP_USERNAME=${v.user_email_dify}
      - SMTP_PASSWORD=${v.senha_email_dify}
      - SMTP_USE_TLS=true
      - SMTP_OPPORTUNISTIC_TLS=false
      - INVITE_EXPIRY_HOURS=24
      - RESET_PASSWORD_TOKEN_EXPIRY_MINUTES=5
      - DIFY_BIND_ADDRESS=0.0.0.0
      - DIFY_PORT=5001
      - SERVER_WORKER_AMOUNT=1
      - SERVER_WORKER_CLASS=gevent
      - SERVER_WORKER_CONNECTIONS=10
      - API_TOOL_DEFAULT_CONNECT_TIMEOUT=10
      - API_TOOL_DEFAULT_READ_TIMEOUT=60
      - WEB_API_CORS_ALLOW_ORIGINS=*
      - CONSOLE_CORS_ALLOW_ORIGINS=*
      - MIGRATION_ENABLED=true
      - DB_USERNAME=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=dify
      - SQLALCHEMY_POOL_SIZE=50
      - SQLALCHEMY_POOL_RECYCLE=1800
      - SQLALCHEMY_ECHO=false
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_USERNAME=
      - REDIS_PASSWORD=
      - REDIS_USE_SSL=false
      - REDIS_DB=0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - BROKER_USE_SSL=false
      - STORAGE_TYPE=s3
      - S3_ENDPOINT=https://${v.url_s3}
      - S3_BUCKET_NAME=dify
      - S3_ACCESS_KEY=${secrets.minio_access}
      - S3_SECRET_KEY=${secrets.minio_access}
      - S3_REGION=us-east
      - S3_USE_AWS_MANAGED_IAM=false
      - UPLOAD_FILE_SIZE_LIMIT=15
      - UPLOAD_FILE_BATCH_LIMIT=5
      - UPLOAD_IMAGE_FILE_SIZE_LIMIT=10
      - UPLOAD_VIDEO_FILE_SIZE_LIMIT=100
      - UPLOAD_AUDIO_FILE_SIZE_LIMIT=50
      - VECTOR_STORE=weaviate
      - WEAVIATE_ENDPOINT=http://dify_weaviate:8080
      - WEAVIATE_API_KEY=${secrets.token_weaviate}
      - CODE_EXECUTION_ENDPOINT=http://dify_sandbox:8194
      - CODE_EXECUTION_API_KEY=${secrets.sandbox_key}
      - CODE_MAX_NUMBER=9223372036854775807
      - CODE_MIN_NUMBER=-9223372036854775808
      - CODE_MAX_DEPTH=5
      - CODE_MAX_PRECISION=20
      - CODE_MAX_STRING_LENGTH=80000
      - CODE_MAX_STRING_ARRAY_LENGTH=30
      - CODE_MAX_OBJECT_ARRAY_LENGTH=30
      - CODE_MAX_NUMBER_ARRAY_LENGTH=1000
      - CODE_EXECUTION_CONNECT_TIMEOUT=10
      - CODE_EXECUTION_READ_TIMEOUT=60
      - CODE_EXECUTION_WRITE_TIMEOUT=10
      - TEMPLATE_TRANSFORM_MAX_LENGTH=80000
      - PLUGIN_DAEMON_URL=http://dify_plugin_daemon:5002
      - PLUGIN_DAEMON_KEY=${secrets.token_deamon}
      - PLUGIN_MAX_PACKAGE_SIZE=52428800
      - INNER_API_KEY_FOR_PLUGIN=${secrets.token_apikey_plugins}
      - PLUGIN_REMOTE_INSTALL_HOST=localhost
      - PLUGIN_REMOTE_INSTALL_PORT=5003
      - CELERY_WORKER_CLASS=
      - CELERY_WORKER_AMOUNT=
      - CELERY_AUTO_SCALE=false
      - CELERY_MAX_WORKERS=
      - CELERY_MIN_WORKERS=
      - WORKFLOW_MAX_EXECUTION_STEPS=500
      - WORKFLOW_MAX_EXECUTION_TIME=1200
      - WORKFLOW_CALL_MAX_DEPTH=5
      - MAX_VARIABLE_SIZE=204800
      - WORKFLOW_PARALLEL_DEPTH_LIMIT=3
      - WORKFLOW_FILE_UPLOAD_LIMIT=10
      - LOOP_NODE_MAX_COUNT=100
      - MAX_TOOLS_NUM=10
      - MAX_PARALLEL_LIMIT=10
      - MAX_ITERATIONS_NUM=5
      - HTTP_REQUEST_NODE_MAX_BINARY_SIZE=10485760
      - HTTP_REQUEST_NODE_MAX_TEXT_SIZE=1048576
      - HTTP_REQUEST_NODE_SSL_VERIFY=True
      - TEXT_GENERATION_TIMEOUT_MS=60000
      - PROMPT_GENERATION_MAX_TOKENS=512
      - CODE_GENERATION_MAX_TOKENS=1024
      - MULTIMODAL_SEND_FORMAT=base64
      - ETL_TYPE=dify
      - INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH=4000
      - APP_MAX_ACTIVE_REQUESTS=0
      - APP_MAX_EXECUTION_TIME=1200
      - FILES_ACCESS_TIMEOUT=300
      - GUNICORN_TIMEOUT=360
      - SECRET_KEY=${secrets.secret_key}
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - REFRESH_TOKEN_EXPIRE_DAYS=30
      - INIT_PASSWORD=
      - LOG_LEVEL=INFO
      - LOG_FILE=/app/logs/server.log
      - LOG_FILE_MAX_SIZE=20
      - LOG_FILE_BACKUP_COUNT=5
      - LOG_DATEFORMAT=%d-%m-%Y %H:%M:%S
      - LOG_TZ=UTC
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

  dify_web:
    image: langgenius/dify-web:latest
    networks:
      - ${net}
    environment:
      - CONSOLE_API_URL=https://${v.url_dify_api}
      - APP_API_URL=https://${v.url_dify_api}
      - MARKETPLACE_API_URL=https://marketplace.dify.ai
      - MARKETPLACE_URL=https://marketplace.dify.ai
      - SENTRY_DSN=
      - NEXT_TELEMETRY_DISABLED=1
      - TEXT_GENERATION_TIMEOUT_MS=60000
      - TOP_K_MAX_VALUE=10
      - CSP_WHITELIST=
      - INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH=4000
      - PM2_INSTANCES=2
      - LOOP_NODE_MAX_COUNT=100
      - MAX_TOOLS_NUM=10
      - MAX_PARALLEL_LIMIT=10
      - MAX_ITERATIONS_NUM=5
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
        - traefik.http.routers.dify_web.rule=Host(\`${v.url_dify}\`)
        - traefik.http.services.dify_web.loadbalancer.server.port=3000
        - traefik.http.routers.dify_web.service=dify_web
        - traefik.http.routers.dify_web.tls.certresolver=letsencryptresolver
        - traefik.http.routers.dify_web.entrypoints=websecure
        - traefik.http.routers.dify_web.tls=true
        - traefik.http.middlewares.corsMiddleware.headers.accessControlAllowMethods=GET,POST,PUT,DELETE,OPTIONS
        - traefik.http.middlewares.corsMiddleware.headers.accessControlAllowHeaders=Content-Type,Authorization

  dify_sandbox:
    image: langgenius/dify-sandbox:0.2.11
    networks:
      - ${net}
    environment:
      - API_KEY=${secrets.sandbox_key}
      - GIN_MODE=release
      - WORKER_TIMEOUT=15
      - ENABLE_NETWORK=true
      - SANDBOX_PORT=8194
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

  dify_weaviate:
    image: semitechnologies/weaviate:1.19.0
    volumes:
      - dify_weaviate:/var/lib/weaviate
    networks:
      - ${net}
    environment:
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
      - AUTHENTICATION_APIKEY_ENABLED=true
      - AUTHENTICATION_APIKEY_ALLOWED_KEYS=${secrets.token_weaviate}
      - AUTHENTICATION_APIKEY_USERS=${ctx.email}
      - AUTHORIZATION_ADMINLIST_ENABLED=true
      - AUTHORIZATION_ADMINLIST_USERS=${ctx.email}
      - CLUSTER_HOSTNAME=node1
      - DISABLE_TELEMETRY=true
      - DEFAULT_VECTORIZER_MODULE=none
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

  dify_plugin_daemon:
    image: langgenius/dify-plugin-daemon:latest-local
    networks:
      - ${net}
    volumes:
      - dify_plugin_daemon_storage:/app/storage
    environment:
      - DB_USERNAME=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=dify_plugin
      - SERVER_PORT=5002
      - SERVER_KEY=${secrets.token_deamon}
      - MAX_PLUGIN_PACKAGE_SIZE=52428800
      - PPROF_ENABLED=false
      - DIFY_INNER_API_URL=https://${v.url_dify_api}
      - DIFY_INNER_API_KEY=${secrets.token_apikey_plugins}
      - PLUGIN_REMOTE_INSTALLING_HOST=0.0.0.0
      - PLUGIN_REMOTE_INSTALLING_PORT=5003
      - PLUGIN_WORKING_PATH=/app/storage/cwd
      - FORCE_VERIFYING_SIGNATURE=true
      - PYTHON_ENV_INIT_TIMEOUT=120
      - PLUGIN_MAX_EXECUTION_TIMEOUT=600
      - PIP_MIRROR_URL=
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - LOG_LEVEL=DEBUG
      - LOG_FILE=/app/storage/plugin_daemon.log
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

volumes:
  dify_storage:
    external: true
    name: dify_storage
  dify_weaviate:
    external: true
    name: dify_weaviate
  dify_plugin_daemon_storage:
    external: true
    name: dify_plugin_daemon_storage

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_dify: string }).url_dify}`,
    notes: [
      "Usuário e senha criados no primeiro acesso",
      "Aguarde alguns minutos para a migração do banco antes do primeiro acesso",
    ],
  },
};
