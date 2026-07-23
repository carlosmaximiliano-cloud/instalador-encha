import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_wuzapi: fqdn,
});

export const wuzapi: StackDefinition = {
  id: "wuzapi",
  repoUrl: "https://github.com/asternic/wuzapi",
  logoUrl: "https://raw.githubusercontent.com/asternic/wuzapi/main/logo.png",
  name: "WuzAPI",
  description: "API REST e webhooks para WhatsApp via WhatsMeow.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["wuzapi"],
  optionNumber: 78,
  installVia: "panel",
  fields: [
    { name: "url_wuzapi", label: "Domínio da Wuzapi", kind: "domain", placeholder: "wuzapi.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "apikey_wuzapi", value: randomBytes(16).toString("hex") },
    { name: "encryption_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  wuzapi:
    image: asternic/wuzapi:latest
    volumes:
      - wuzapi_dbdata:/app/dbdata
      - wuzapi_files:/app/files
    networks:
      - ${net}
    environment:
      - WUZAPI_ADMIN_TOKEN=${secrets.apikey_wuzapi}
      - SECRET_KEY=${secrets.encryption_key}
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_NAME=wuzapi
      - DB_PORT=5432
      - DB_DRIVER=postgres
      - TZ=America/Sao_Paulo
      - WEBHOOK_FORMAT=json
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.wuzapi.rule=Host(\`${v.url_wuzapi}\`)
        - traefik.http.services.wuzapi.loadbalancer.server.port=8080
        - traefik.http.routers.wuzapi.service=wuzapi
        - traefik.http.routers.wuzapi.tls.certresolver=letsencryptresolver
        - traefik.http.routers.wuzapi.entrypoints=websecure
        - traefik.http.routers.wuzapi.tls=true

volumes:
  wuzapi_dbdata:
    external: true
    name: wuzapi_dbdata
  wuzapi_files:
    external: true
    name: wuzapi_files

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_wuzapi: string }).url_wuzapi}/dashboard`,
    notes: ["A API Key foi gerada automaticamente e está disponível na seção de segredos da stack"],
  },
};
