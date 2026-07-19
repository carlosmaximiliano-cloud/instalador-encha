import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_calcom: fqdn,
  email_calcom: email,
  user_calcom: z.string().min(1),
  senha_email_calcom: z.string().min(1),
  smtp_email_calcom: z.string().min(1),
  porta_smtp_calcom: portNum,
});

export const calcom: StackDefinition = {
  id: "calcom",
  repoUrl: "https://github.com/calcom/cal.com",
  logoUrl: "https://raw.githubusercontent.com/calcom/cal/main/public/logo.svg",
  name: "Cal.com",
  description: "Calendly open-source — agendamento de reuniões.",
  category: "scheduling",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 18,
  installVia: "panel",
  fields: [
    { name: "url_calcom", label: "Domínio do Cal.com", kind: "domain", placeholder: "cal.encha.ai", group: "Domínios" },
    { name: "email_calcom", label: "E-mail de envio (SMTP)", kind: "email", placeholder: "noreply@encha.ai", group: "SMTP" },
    { name: "user_calcom", label: "Usuário SMTP", kind: "text", placeholder: "noreply@encha.ai", group: "SMTP" },
    { name: "senha_email_calcom", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "smtp_email_calcom", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_calcom", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  calcom:
    image: calcom/cal.com:latest
    command: sh -c "yarn prisma migrate deploy && yarn start"
    networks:
      - ${net}
    environment:
      - NEXT_PUBLIC_WEBAPP_URL=https://${v.url_calcom}
      - DATABASE_DIRECT_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/calcom
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/calcom
      - NEXTAUTH_SECRET=${secrets.secret}
      - CALENDSO_ENCRYPTION_KEY=${secrets.secret}
      - EMAIL_FROM=${v.email_calcom}
      - EMAIL_SERVER_USER=${v.user_calcom}
      - EMAIL_SERVER_PASSWORD=${v.senha_email_calcom}
      - EMAIL_SERVER_HOST=${v.smtp_email_calcom}
      - EMAIL_SERVER_PORT=${v.porta_smtp_calcom}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.calcom.rule=Host(\`${v.url_calcom}\`)"
        - "traefik.http.services.calcom.loadbalancer.server.port=3000"
        - "traefik.http.routers.calcom.entrypoints=websecure"
        - "traefik.http.routers.calcom.tls.certresolver=letsencryptresolver"

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_calcom}`,
    notes: ["Crie seu usuário no primeiro acesso."],
  },
};
