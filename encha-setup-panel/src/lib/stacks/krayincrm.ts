import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_krayincrm: fqdn,
  email_krayincrm: email,
  usuario_email_krayincrm: z.string().min(1),
  senha_email_krayincrm: z.string().min(1),
  smtp_email_krayincrm: z.string().min(1),
  porta_smtp_krayincrm: portNum,
});

export const krayincrm: StackDefinition = {
  id: "krayincrm",
  repoUrl: "https://github.com/krayin/laravel-crm",
  name: "Krayin CRM",
  description: "CRM Laravel completo com pipeline de vendas e leads.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 79,
  installVia: "panel",
  fields: [
    { name: "url_krayincrm", label: "Domínio do Krayin CRM", kind: "domain", placeholder: "krayincrm.encha.ai", group: "Domínios" },
    { name: "email_krayincrm", label: "E-mail SMTP", kind: "email", group: "SMTP" },
    { name: "smtp_email_krayincrm", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_krayincrm", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "usuario_email_krayincrm", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_email_krayincrm", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret_key", value: `base64:${randomBytes(32).toString("base64")}` },
    { name: "senha_mysql_krayin", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const dominio_smtp = v.email_krayincrm.split("@")[1] ?? "";
    const smtp_secure = v.porta_smtp_krayincrm === 465 ? "ssl" : "tls";
    return `version: "3.7"
services:

  krayincrm_app:
    image: francisbreit/crmk:v2.0.5-fr
    volumes:
      - krayincrm_data:/var/www/html/
    networks:
      - ${net}
    environment:
      - APP_URL=https://${v.url_krayincrm}
      - SANCTUM_STATEFUL_DOMAINS=https://${v.url_krayincrm}/public
      - krayin_PUBLIC_URL=https://${v.url_krayincrm}
      - krayin_CADDY_ADDRESSES=:80
      - APP_NAME=Krayin CRM - Encha
      - APP_LOCALE=pt_BR
      - APP_CURRENCY=BRL
      - APP_TIMEZONE=America/Sao_Paulo
      - LOG_CHANNEL=stack
      - LOG_LEVEL=debug
      - APP_DEBUG=false
      - BROADCAST_DRIVER=log
      - CACHE_DRIVER=file
      - QUEUE_CONNECTION=sync
      - SESSION_DRIVER=file
      - SESSION_LIFETIME=120
      - MAIL_MAILER=smtp
      - MAIL_FROM_ADDRESS=${v.email_krayincrm}
      - MAIL_DOMAIN=${dominio_smtp}
      - MAIL_USERNAME=${v.usuario_email_krayincrm}
      - MAIL_PASSWORD=${v.senha_email_krayincrm}
      - MAIL_HOST=${v.smtp_email_krayincrm}
      - MAIL_PORT=${v.porta_smtp_krayincrm}
      - MAIL_ENCRYPTION=${smtp_secure}
      - MAIL_FROM_NAME=Krayin CRM
      - DB_CONNECTION=mysql
      - DB_HOST=krayin_db
      - DB_PORT=3306
      - DB_DATABASE=krayincrm
      - DB_USERNAME=root
      - DB_PREFIX=
      - DB_PASSWORD=${secrets.senha_mysql_krayin}
      - REDIS_HOST=krayin_redis
      - REDIS_PASSWORD=null
      - REDIS_PORT=6379
      - MEMCACHED_HOST=127.0.0.1
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "2"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.krayincrm_app.rule=Host(\`${v.url_krayincrm}\`) && PathPrefix(\`/\`)
        - traefik.http.services.krayincrm_app.loadbalancer.server.port=80
        - traefik.http.routers.krayincrm_app.service=krayincrm_app
        - traefik.http.routers.krayincrm_app.tls.certresolver=letsencryptresolver
        - traefik.http.routers.krayincrm_app.entrypoints=websecure
        - traefik.http.routers.krayincrm_app.tls=true

  krayin_db:
    image: percona/percona-server:latest
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_general_ci
      - --sql-mode=
      - --default-authentication-plugin=mysql_native_password
      - --max-allowed-packet=512MB
      - --expire_logs_days=7
      - --max_binlog_size=100M
    volumes:
      - krayin_db:/var/lib/mysql
    networks:
      - ${net}
    environment:
      - MYSQL_ROOT_PASSWORD=${secrets.senha_mysql_krayin}
      - MYSQL_DATABASE=krayincrm
      - TZ=America/Sao_Paulo
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

  krayin_redis:
    image: redis:latest
    command: >
      redis-server
      --port 6379
      --appendonly yes
      --save 900 1
      --save 300 10
      --save 60 10000
      --appendfsync everysec
    volumes:
      - krayin_redis:/data
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

volumes:
  krayincrm_data:
    external: true
    name: krayincrm_data
  krayin_db:
    external: true
    name: krayin_db
  krayin_redis:
    external: true
    name: krayin_redis

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_krayincrm: string }).url_krayincrm}`,
    notes: ["Crie seu usuário no primeiro acesso ao Krayin CRM."],
  },
};
