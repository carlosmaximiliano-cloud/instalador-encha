import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_humhub: fqdn,
});

export const humhub: StackDefinition = {
  id: "humhub",
  repoUrl: "https://github.com/humhub/humhub",
  name: "HumHub",
  description: "Rede social privada para comunidades e empresas.",
  category: "communication",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 33,
  installVia: "panel",
  fields: [
    { name: "url_humhub", label: "Domínio do HumHub", kind: "domain", placeholder: "social.encha.ai", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_mysql", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  humhub:
    image: mriedmann/humhub:latest
    volumes:
      - humhub_uploads:/var/www/localhost/htdocs/uploads
    networks:
      - ${net}
    environment:
      - HUMHUB_DB_HOST=mysql
      - HUMHUB_DB_USER=root
      - HUMHUB_DB_PASSWORD=${secrets.senha_mysql}
      - HUMHUB_DB_NAME=humhub
      - HUMHUB_AUTO_INSTALL=false
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.humhub.rule=Host(\`${v.url_humhub}\`)"
        - "traefik.http.services.humhub.loadbalancer.server.port=80"
        - "traefik.http.routers.humhub.service=humhub"
        - "traefik.http.routers.humhub.entrypoints=websecure"
        - "traefik.http.routers.humhub.tls.certresolver=letsencryptresolver"

volumes:
  humhub_uploads:

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_humhub}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário admin."],
  },
};
