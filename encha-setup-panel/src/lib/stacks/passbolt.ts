import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";

const schema = z.object({
  url_passbolt: fqdn,
  email_user_passbolt: email,
  smtp_email_passbolt: email,
  smtp_user_passbolt: z.string().min(1),
  smtp_pass_passbolt: z.string().min(1),
  smtp_host_passbolt: z.string().min(1),
  smtp_port_passbolt: portNum,
});

export const passbolt: StackDefinition = {
  id: "passbolt",
  repoUrl: "https://github.com/passbolt/passbolt_api",
  logoUrl: "https://raw.githubusercontent.com/passbolt/passbolt_api/master/docs/logo.svg",
  name: "Passbolt",
  description: "Gerenciador de senhas em time open-source.",
  category: "auth",
  icon: "shield",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 54,
  installVia: "panel",
  fields: [
    { name: "url_passbolt", label: "Domínio do Passbolt", kind: "domain", placeholder: "pass.suaempresa.com", group: "Domínios" },
    { name: "email_user_passbolt", label: "E-mail do administrador", kind: "email", group: "Admin" },
    { name: "smtp_email_passbolt", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "smtp_user_passbolt", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "smtp_pass_passbolt", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "smtp_host_passbolt", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "smtp_port_passbolt", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_mysql", value: "REUSE_MYSQL" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpTls = Number(v.smtp_port_passbolt) === 465 ? "false" : "true";
    return `version: "3.7"
services:

  passbolt:
    image: passbolt/passbolt:latest

    volumes:
      - passbolt_data:/var/www/passbolt/webroot

    networks:
      - ${net}

    environment:
      - APP_FULL_BASE_URL=https://${v.url_passbolt}
      - PASSBOLT_REGISTRATION_PUBLIC=false
      - DATASOURCES_DEFAULT_HOST=mysql
      - DATASOURCES_DEFAULT_PORT=3306
      - DATASOURCES_DEFAULT_DATABASE=passbolt
      - DATASOURCES_DEFAULT_USERNAME=root
      - DATASOURCES_DEFAULT_PASSWORD=${secrets.senha_mysql}
      - EMAIL_DEFAULT_FROM_NAME=Suporte
      - EMAIL_DEFAULT_FROM=${v.smtp_email_passbolt}
      - EMAIL_TRANSPORT_DEFAULT_USERNAME=${v.smtp_user_passbolt}
      - EMAIL_TRANSPORT_DEFAULT_PASSWORD=${v.smtp_pass_passbolt}
      - EMAIL_TRANSPORT_DEFAULT_HOST=${v.smtp_host_passbolt}
      - EMAIL_TRANSPORT_DEFAULT_PORT=${v.smtp_port_passbolt}
      - EMAIL_TRANSPORT_DEFAULT_TLS=${smtpTls}

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
        - traefik.http.routers.passbolt.rule=Host(\`${v.url_passbolt}\`)
        - traefik.http.services.passbolt.loadbalancer.server.port=80
        - traefik.http.routers.passbolt.service=passbolt
        - traefik.http.routers.passbolt.tls.certresolver=letsencryptresolver
        - traefik.http.routers.passbolt.entrypoints=websecure
        - traefik.http.routers.passbolt.tls=true

volumes:
  passbolt_data:
    external: true
    name: passbolt_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_passbolt: string }).url_passbolt}`,
    notes: ["Um e-mail de configuração será enviado ao administrador. Siga o link para definir sua senha."],
  },
  i18n: {
    en: {
      description: "Open-source team password manager.",
      fields: {
        url_passbolt: { label: "Passbolt Domain", placeholder: "pass.yourcompany.com", group: "Domains" },
        email_user_passbolt: { label: "Administrator email", group: "Admin" },
        smtp_email_passbolt: { label: "SMTP sending email", group: "SMTP" },
        smtp_user_passbolt: { label: "SMTP User", group: "SMTP" },
        smtp_pass_passbolt: { label: "SMTP Password", group: "SMTP" },
        smtp_host_passbolt: { label: "SMTP Host", placeholder: "smtp.hostinger.com", group: "SMTP" },
        smtp_port_passbolt: { label: "SMTP Port", placeholder: "465", group: "SMTP" },
      },
      notes: ["A setup email will be sent to the administrator. Follow the link to set your password."],
    },
    es: {
      description: "Gestor de contraseñas en equipo open-source.",
      fields: {
        url_passbolt: { label: "Dominio de Passbolt", placeholder: "pass.suempresa.com", group: "Dominios" },
        email_user_passbolt: { label: "Correo del administrador", group: "Admin" },
        smtp_email_passbolt: { label: "Correo de envío SMTP", group: "SMTP" },
        smtp_user_passbolt: { label: "Usuario SMTP", group: "SMTP" },
        smtp_pass_passbolt: { label: "Contraseña SMTP", group: "SMTP" },
        smtp_host_passbolt: { label: "Host SMTP", placeholder: "smtp.hostinger.com", group: "SMTP" },
        smtp_port_passbolt: { label: "Puerto SMTP", placeholder: "465", group: "SMTP" },
      },
      notes: ["Se enviará un correo de configuración al administrador. Siga el enlace para definir su contraseña."],
    },
  },
};
