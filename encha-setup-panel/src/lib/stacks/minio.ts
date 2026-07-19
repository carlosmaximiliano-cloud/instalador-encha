import { z } from "zod";
import { type StackDefinition, fqdn, username, strongPassword } from "./types";

const schema = z.object({
  url_minio: fqdn,
  url_s3: fqdn,
  user_minio: username,
  senha_minio: strongPassword,
});

export const minio: StackDefinition = {
  id: "minio",
  repoUrl: "https://github.com/minio/minio",
  logoUrl: "https://raw.githubusercontent.com/minio/minio/master/docs/screenshots/minio-logo.svg",
  name: "MinIO",
  description: "Storage S3-compatível open-source. Necessário para Typebot, Directus e backups.",
  category: "storage",
  icon: "hard-drive",
  dependsOn: ["traefik-portainer"],
  optionNumber: 7,
  fields: [
    { name: "url_minio", label: "Domínio do Console", kind: "domain", placeholder: "minio.suaempresa.com", group: "Domínios" },
    { name: "url_s3", label: "Domínio do endpoint S3", kind: "domain", placeholder: "s3.suaempresa.com", group: "Domínios" },
    { name: "user_minio", label: "Usuário admin", kind: "username", placeholder: "admin", group: "Credenciais" },
    { name: "senha_minio", label: "Senha admin", kind: "password", sensitive: true, group: "Credenciais" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    networks:
      - ${net}
    environment:
      - MINIO_ROOT_USER=${v.user_minio}
      - MINIO_ROOT_PASSWORD=${v.senha_minio}
      - MINIO_BROWSER_REDIRECT_URL=https://${v.url_minio}
      - MINIO_SERVER_URL=https://${v.url_s3}
    volumes:
      - minio_data:/data
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.minio_console.rule=Host(\`${v.url_minio}\`)
        - traefik.http.routers.minio_console.entrypoints=websecure
        - traefik.http.routers.minio_console.tls.certresolver=letsencryptresolver
        - traefik.http.routers.minio_console.service=minio_console
        - traefik.http.services.minio_console.loadbalancer.server.port=9001
        - traefik.http.routers.minio_s3.rule=Host(\`${v.url_s3}\`)
        - traefik.http.routers.minio_s3.entrypoints=websecure
        - traefik.http.routers.minio_s3.tls.certresolver=letsencryptresolver
        - traefik.http.routers.minio_s3.service=minio_s3
        - traefik.http.services.minio_s3.loadbalancer.server.port=9000

volumes:
  minio_data:
    external: true
    name: minio_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_minio: string }).url_minio}`,
    notes: ["O endpoint S3 fica disponível em https://<url_s3>"],
  },
};
