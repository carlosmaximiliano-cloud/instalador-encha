import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_docuseal: fqdn,
  email_smtp_docuseal: email,
  user_smtp_docuseal: z.string().min(1),
  senha_smtp_docuseal: z.string().min(1),
  host_smtp_docuseal: z.string().min(1),
  porta_smtp_docuseal: portNum,
});

export const docuseal: StackDefinition = {
  id: "docuseal",
  repoUrl: "https://github.com/docusealco/docuseal",
  logoUrl: "https://raw.githubusercontent.com/docusealco/docuseal/master/app/assets/images/logo.svg",
  name: "DocuSeal",
  description: "Assinatura eletrônica em documentos PDF.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 37,
  installVia: "panel",
  fields: [
    { name: "url_docuseal", label: "Domínio do DocuSeal", kind: "domain", placeholder: "assine.encha.ai", group: "Domínios" },
    { name: "email_smtp_docuseal", label: "Email SMTP", kind: "email", placeholder: "noreply@encha.ai", group: "SMTP" },
    { name: "user_smtp_docuseal", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_smtp_docuseal", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "host_smtp_docuseal", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_docuseal", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_docuseal", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  docuseal:
    image: docuseal/docuseal:latest
    volumes:
      - docuseal_data:/data
    networks:
      - ${net}
    environment:
      - HOST=${v.url_docuseal}
      - FORCE_SSL=true
      - SECRET_KEY_BASE=${secrets.key_docuseal}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/docuseal
      - SMTP_USERNAME=${v.user_smtp_docuseal}
      - SMTP_PASSWORD=${v.senha_smtp_docuseal}
      - SMTP_ADDRESS=${v.host_smtp_docuseal}
      - SMTP_PORT=${v.porta_smtp_docuseal}
      - SMTP_FROM=${v.email_smtp_docuseal}
      - SMTP_DOMAIN=${v.email_smtp_docuseal}
      - SMTP_AUTHENTICATION=login
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.docuseal.rule=Host(\`${v.url_docuseal}\`)
        - traefik.http.services.docuseal.loadbalancer.server.port=3000
        - traefik.http.routers.docuseal.service=docuseal
        - traefik.http.routers.docuseal.tls.certresolver=letsencryptresolver
        - traefik.http.routers.docuseal.entrypoints=websecure
        - traefik.http.routers.docuseal.tls=true

volumes:
  docuseal_data:
    external: true
    name: docuseal_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_docuseal}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário."],
  },
};
