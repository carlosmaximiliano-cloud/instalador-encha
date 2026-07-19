import { z } from "zod";
import { type StackDefinition, fqdn, email } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_mautic: fqdn,
  user_mautic: z.string().min(1),
  email_mautic: email,
  senha_mautic: z.string().min(1),
});

export const mautic: StackDefinition = {
  id: "mautic",
  repoUrl: "https://github.com/mautic/mautic",
  logoUrl: "https://raw.githubusercontent.com/mautic/mautic/master/app/assets/images/mautic_logo.png",
  name: "Mautic",
  description: "Automação de marketing open-source enterprise.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 19,
  installVia: "panel",
  fields: [
    { name: "url_mautic", label: "Domínio do Mautic", kind: "domain", placeholder: "mautic.encha.ai", group: "Domínios" },
    { name: "user_mautic", label: "Usuário Admin", kind: "username", placeholder: "enchaAdmin", group: "Admin" },
    { name: "email_mautic", label: "Email Admin", kind: "email", placeholder: "admin@encha.ai", group: "Admin" },
    { name: "senha_mautic", label: "Senha Admin", kind: "password", sensitive: true, group: "Admin" },
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

  mautic_app:
    image: mautic/mautic:latest
    volumes:
      - mautic_data:/var/www/html
    networks:
      - ${net}
    environment:
      - MAUTIC_DB_HOST=mysql
      - MAUTIC_DB_USER=root
      - MAUTIC_DB_PASSWORD=${secrets.senha_mysql}
      - MAUTIC_DB_NAME=mautic
      - MAUTIC_ADMIN_EMAIL=${v.email_mautic}
      - MAUTIC_ADMIN_USERNAME=${v.user_mautic}
      - MAUTIC_ADMIN_PASSWORD=${v.senha_mautic}
      - MAUTIC_TRUSTED_PROXIES=["0.0.0.0/0"]
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.mautic.rule=Host(\`${v.url_mautic}\`)"
        - "traefik.http.services.mautic.loadbalancer.server.port=80"
        - "traefik.http.routers.mautic.entrypoints=websecure"
        - "traefik.http.routers.mautic.tls.certresolver=letsencryptresolver"

volumes:
  mautic_data:

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_mautic}`,
  },
};
