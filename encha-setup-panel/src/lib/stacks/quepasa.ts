import { z } from "zod";
import { type StackDefinition, fqdn, email } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_quepasa: fqdn,
  email_quepasa: email,
});

export const quepasa: StackDefinition = {
  id: "quepasa",
  repoUrl: "https://github.com/nocodeleaks/quepasa",
  name: "QuePasa",
  description: "API WhatsApp simples e estável usando Baileys.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 68,
  installVia: "panel",
  fields: [
    { name: "url_quepasa", label: "Domínio da Quepasa API", kind: "domain", placeholder: "quepasa.suaempresa.com", group: "Domínios" },
    { name: "email_quepasa", label: "E-mail de contato (Basic Auth)", kind: "email", placeholder: "contato@suaempresa.com", group: "Acesso" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_quepasa", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  quepasa:
    image: deividms/quepasa:latest
    volumes:
      - quepasa_volume:/opt/quepasa
    networks:
      - ${net}
    environment:
      - DOMAIN=${v.url_quepasa}
      - EMAIL=${v.email_quepasa}
      - QUEPASA_BASIC_AUTH_USER=${v.email_quepasa}
      - QUEPASA_BASIC_AUTH_PASSWORD=${v.email_quepasa}
      - APP_TITLE=Encha
      - TZ=America/Sao_Paulo
      - DBDRIVER=postgres
      - DBHOST=postgres
      - DBDATABASE=quepasa
      - DBPORT=5432
      - DBUSER=postgres
      - DBPASSWORD=${secrets.senha_postgres}
      - DBSSLMODE=disable
      - GROUPS=true
      - BROADCASTS=false
      - READRECEIPTS=forcedfalse
      - CALLS=true
      - READUPDATE=false
      - LOGLEVEL=DEBUG
      - QUEPASA_HOST_NAME=Quepasa
      - QUEPASA_MEMORY_LIMIT=4096M
      - WEBSOCKETSSL=true
      - REMOVEDIGIT9=true
      - SIGNING_SECRET=${secrets.key_quepasa}
      - WEBHOOK_QUEPASA=${v.url_quepasa}/webhook/quepasa
      - WEBHOOK_TESTE_QUEPASA=${v.url_quepasa}/webhook-test/quepasa
      - QUEPASA_EXTERNAL_PORT=31000
      - QUEPASA_INTERNAL_PORT=31000
      - WEBAPIPORT=31000
      - DEBUGREQUESTS=false
      - SYNOPSISLENGTH=500
      - METRICS_HOST=
      - METRICS_PORT=9392
      - MIGRATIONS=/builder/migrations
      - DEBUGJSONMESSAGES=false
      - HTTPLOGS=false
      - WHATSMEOW_LOGLEVEL=WARN
      - WHATSMEOW_DBLOGLEVEL=WARN
      - APP_ENV=production
      - NODE_ENV=production
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "2"
          memory: 2096M
      labels:
        - traefik.enable=true
        - traefik.http.routers.quepasa.rule=Host(\`${v.url_quepasa}\`)
        - traefik.http.routers.quepasa.tls=true
        - traefik.http.routers.quepasa.entrypoints=web,websecure
        - traefik.http.routers.quepasa.tls.certresolver=letsencryptresolver
        - traefik.http.routers.quepasa.service=quepasa
        - traefik.http.routers.quepasa.priority=1
        - traefik.http.middlewares.quepasa.headers.SSLRedirect=true
        - traefik.http.middlewares.quepasa.headers.STSSeconds=315360000
        - traefik.http.middlewares.quepasa.headers.browserXSSFilter=true
        - traefik.http.middlewares.quepasa.headers.contentTypeNosniff=true
        - traefik.http.middlewares.quepasa.headers.forceSTSHeader=true
        - traefik.http.middlewares.quepasa.headers.SSLHost=${v.url_quepasa}
        - traefik.http.middlewares.quepasa.headers.STSIncludeSubdomains=true
        - traefik.http.middlewares.quepasa.headers.STSPreload=true
        - traefik.http.services.quepasa.loadbalancer.server.port=31000
        - traefik.http.services.quepasa.loadbalancer.passHostHeader=true

volumes:
  quepasa_volume:
    external: true
    name: quepasa_volume

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_quepasa: string }).url_quepasa}/setup`,
    notes: ["Acesse a URL de setup para criar seu primeiro usuário admin"],
  },
};
