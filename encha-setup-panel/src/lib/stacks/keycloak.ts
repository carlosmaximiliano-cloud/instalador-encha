import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";

const schema = z.object({
  url_keycloak: fqdn,
  user_keycloak: username,
  senha_keycloak: z.string().min(8),
});

export const keycloak: StackDefinition = {
  id: "keycloak",
  repoUrl: "https://github.com/keycloak/keycloak",
  logoUrl: "https://raw.githubusercontent.com/keycloak/keycloak/master/docs/logo.svg",
  name: "Keycloak",
  description: "Identity Provider (SSO, OAuth, SAML) enterprise.",
  category: "auth",
  icon: "shield",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["keycloak"],
  optionNumber: 53,
  installVia: "panel",
  fields: [
    { name: "url_keycloak", label: "Domínio do Keycloak", kind: "domain", placeholder: "auth.suaempresa.com" },
    { name: "user_keycloak", label: "Usuário admin", kind: "username", placeholder: "admin" },
    { name: "senha_keycloak", label: "Senha admin", kind: "password", sensitive: true },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    command: start

    networks:
      - ${net}

    volumes:
      - keycloak_data:/opt/keycloak/data

    environment:
      - KC_DB=postgres
      - KC_DB_URL_HOST=postgres
      - KC_DB_URL_DATABASE=keycloak
      - KC_DB_PASSWORD=${secrets.senha_postgres}
      - KC_DB_USERNAME=postgres
      - KC_DB_SCHEMA=public
      - KC_BOOTSTRAP_ADMIN_USERNAME=${v.user_keycloak}
      - KC_BOOTSTRAP_ADMIN_PASSWORD=${v.senha_keycloak}
      - KC_HOSTNAME=${v.url_keycloak}
      - KC_HTTP_ENABLED=true
      - KC_PROXY_HEADERS=xforwarded
      - KC_HOSTNAME_STRICT=false

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
        - traefik.http.routers.keycloak.rule=Host(\`${v.url_keycloak}\`)
        - traefik.http.services.keycloak.loadbalancer.server.port=8080
        - traefik.http.routers.keycloak.service=keycloak
        - traefik.http.routers.keycloak.tls.certresolver=letsencryptresolver
        - traefik.http.routers.keycloak.entrypoints=websecure
        - traefik.http.routers.keycloak.tls=true

volumes:
  keycloak_data:
    external: true
    name: keycloak_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_keycloak: string }).url_keycloak}/admin`,
  },
};
