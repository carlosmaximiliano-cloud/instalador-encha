import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";

const schema = z.object({
  url_yourls: fqdn,
  user_yourls: username,
  pass_yourls: z.string().min(1),
});

export const yourls: StackDefinition = {
  id: "yourls",
  repoUrl: "https://github.com/YOURLS/YOURLS",
  logoUrl: "https://raw.githubusercontent.com/YOURLS/YOURLS/master/images/yourls-logo.png",
  name: "YOURLS",
  description: "Encurtador de URLs PHP simples e auto-hospedado.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 50,
  installVia: "panel",
  fields: [
    { name: "url_yourls", label: "Domínio do YOURLS", kind: "domain", placeholder: "link.suaempresa.com", group: "Domínios" },
    { name: "user_yourls", label: "Usuário do painel", kind: "username", group: "Admin" },
    { name: "pass_yourls", label: "Senha do usuário", kind: "password", sensitive: true, group: "Admin" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_mysql", value: "REUSE_MYSQL" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  yourls:
    image: yourls:latest

    networks:
      - ${net}

    environment:
      - APACHE_SERVER_NAME=${v.url_yourls}
      - YOURLS_SITE=https://${v.url_yourls}
      - YOURLS_USER=${v.user_yourls}
      - YOURLS_PASS=${v.pass_yourls}
      - YOURLS_DB_HOST=mysql
      - YOURLS_DB_NAME=yourls
      - YOURLS_DB_USER=root
      - YOURLS_DB_PASS=${secrets.senha_mysql}

    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.yourls.rule=Host(\`${v.url_yourls}\`)
        - traefik.http.routers.yourls.entrypoints=websecure
        - traefik.http.routers.yourls.tls.certresolver=letsencryptresolver
        - traefik.http.routers.yourls.service=yourls
        - traefik.http.services.yourls.loadbalancer.server.port=80

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_yourls: string }).url_yourls}/admin`,
  },
};
