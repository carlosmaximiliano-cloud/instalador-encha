import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_outline: fqdn,
  id_google_outline: z.string().min(1),
  key_google_outline: z.string().min(1),
});

export const outline: StackDefinition = {
  id: "outline",
  repoUrl: "https://github.com/outline/outline",
  name: "Outline",
  description: "Wiki de conhecimento bonita para times modernos.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 25,
  installVia: "panel",
  fields: [
    { name: "url_outline", label: "Domínio do Outline", kind: "domain", placeholder: "wiki.encha.ai", group: "Domínios" },
    { name: "id_google_outline", label: "ID de Cliente do Google", kind: "text", placeholder: "xxx.apps.googleusercontent.com", group: "Google OAuth" },
    { name: "key_google_outline", label: "Chave Secreta do Google", kind: "password", sensitive: true, group: "Google OAuth" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key1", value: randomBytes(32).toString("hex") },
    { name: "key2", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  outline:
    image: outlinewiki/outline:latest
    networks:
      - ${net}
    volumes:
      - outline_uploads:/var/lib/outline/uploads
    environment:
      - URL=https://${v.url_outline}
      - PORT=3000
      - SECRET_KEY=${secrets.key1}
      - UTILS_SECRET=${secrets.key2}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/outline
      - REDIS_URL=redis://redis_redis:6379
      - PGSSLMODE=disable
      - OIDC_CLIENT_ID=${v.id_google_outline}
      - OIDC_CLIENT_SECRET=${v.key_google_outline}
      - OIDC_AUTH_URI=https://accounts.google.com/o/oauth2/auth
      - OIDC_TOKEN_URI=https://accounts.google.com/o/oauth2/token
      - OIDC_USERINFO_URI=https://www.googleapis.com/oauth2/v3/userinfo
      - OIDC_DISPLAY_NAME=Google
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.outline.rule=Host(\`${v.url_outline}\`)"
        - "traefik.http.services.outline.loadbalancer.server.port=3000"
        - "traefik.http.routers.outline.entrypoints=websecure"
        - "traefik.http.routers.outline.tls.certresolver=letsencryptresolver"

volumes:
  outline_uploads:

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_outline}`,
    notes: ["Adicione a URL de Callback nas credenciais do Google: https://<seu-dominio>/auth/oidc.callback"],
  },
};
