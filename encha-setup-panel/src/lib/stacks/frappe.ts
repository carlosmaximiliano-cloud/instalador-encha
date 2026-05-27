import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_frappe: fqdn,
  senha_frappe: z.string().min(8),
});

export const frappe: StackDefinition = {
  id: "frappe",
  repoUrl: "https://github.com/frappe/frappe",
  name: "Frappe / ERPNext",
  description: "ERP open-source em Python (vendas, estoque, contabilidade).",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 64,
  installVia: "panel",
  fields: [
    { name: "url_frappe", label: "Domínio do Frappe ERPNext", kind: "domain", placeholder: "erp.suaempresa.com", group: "Domínios" },
    { name: "senha_frappe", label: "Senha do Administrator", kind: "password", sensitive: true, group: "Admin" },
  ],
  schema,
  generateSecrets: () => [
    { name: "DB_PASSWORD", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  erpnext_frontend:
    image: frappe/erpnext:v15.49.3
    command: ["nginx-entrypoint.sh"]

    volumes:
      - erpnext_sites:/home/frappe/frappe-bench/sites
      - erpnext_logs:/home/frappe/frappe-bench/logs

    networks:
      - ${net}

    environment:
      - BACKEND=erpnext_backend:8000
      - FRAPPE_SITE_NAME_HEADER=${v.url_frappe}
      - FRAPPE_SITE=${v.url_frappe}
      - SOCKETIO=erpnext_websocket:9000
      - UPSTREAM_REAL_IP_ADDRESS=127.0.0.1
      - UPSTREAM_REAL_IP_HEADER=X-Forwarded-For
      - UPSTREAM_REAL_IP_RECURSIVE=off
      - PROXY_READ_TIMEOUT=120
      - CLIENT_MAX_BODY_SIZE=50m

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
        - traefik.http.routers.erpnext_frontend.rule=Host(\`${v.url_frappe}\`)
        - traefik.http.services.erpnext_frontend.loadbalancer.server.port=8080
        - traefik.http.routers.erpnext_frontend.service=erpnext_frontend
        - traefik.http.routers.erpnext_frontend.tls.certresolver=letsencryptresolver
        - traefik.http.routers.erpnext_frontend.entrypoints=websecure
        - traefik.http.routers.erpnext_frontend.tls=true

  erpnext_backend:
    image: frappe/erpnext:v15.49.3

    volumes:
      - erpnext_sites:/home/frappe/frappe-bench/sites
      - erpnext_logs:/home/frappe/frappe-bench/logs

    networks:
      - ${net}

    environment:
      - DB_HOST=erpnext_db
      - DB_PORT=3306
      - DB_USER=frappe
      - DB_PASSWORD=${secrets.DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${secrets.DB_PASSWORD}
      - MARIADB_ROOT_PASSWORD=${secrets.DB_PASSWORD}

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

  erpnext_configurator:
    image: frappe/erpnext:v15.49.3

    volumes:
      - erpnext_sites:/home/frappe/frappe-bench/sites
      - erpnext_logs:/home/frappe/frappe-bench/logs

    networks:
      - ${net}

    environment:
      - DB_HOST=erpnext_db
      - DB_PORT=3306
      - REDIS_CACHE=erpnext_cache:6379
      - REDIS_QUEUE=erpnext_queue:6379
      - REDIS_SOCKETIO=erpnext_socketio:6379
      - SOCKETIO_PORT=9000
      - HOST_URL=${v.url_frappe}

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

  erpnext_websocket:
    image: frappe/erpnext:v15.49.3
    command: ["node", "/home/frappe/frappe-bench/apps/frappe/socketio.js"]

    volumes:
      - erpnext_sites:/home/frappe/frappe-bench/sites
      - erpnext_logs:/home/frappe/frappe-bench/logs

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
          cpus: "2"
          memory: 4096M

  erpnext_db:
    image: mariadb:10.6
    command: ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci", "--skip-character-set-client-handshake", "--skip-innodb-read-only-compressed"]

    volumes:
      - erpnext_db:/var/lib/mysql

    networks:
      - ${net}

    environment:
      - MYSQL_ROOT_PASSWORD=${secrets.DB_PASSWORD}
      - MARIADB_ROOT_PASSWORD=${secrets.DB_PASSWORD}

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

  erpnext_cache:
    image: redis:latest
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]

    volumes:
      - erpnext_cache:/data

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

  erpnext_queue:
    image: redis:latest
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]

    volumes:
      - erpnext_queue:/data

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

  erpnext_socketio:
    image: redis:latest
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]

    volumes:
      - erpnext_socketio:/data

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
  erpnext_sites:
    external: true
    name: erpnext_sites
  erpnext_logs:
    external: true
    name: erpnext_logs
  erpnext_db:
    external: true
    name: erpnext_db
  erpnext_cache:
    external: true
    name: erpnext_cache
  erpnext_queue:
    external: true
    name: erpnext_queue
  erpnext_socketio:
    external: true
    name: erpnext_socketio

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_frappe: string }).url_frappe}`,
    notes: ["Usuário: Administrator. Pode levar alguns minutos para o site estar totalmente acessível após a configuração."],
  },
};
