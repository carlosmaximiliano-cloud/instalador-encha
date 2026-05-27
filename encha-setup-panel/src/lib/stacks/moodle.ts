import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_moodle: fqdn,
  project_name_moodle: z.string().min(1),
  user_moodle: z.string().min(3),
  pass_moodle: z.string().min(8),
  mail_moodle: email,
  email_smtp_moodle: email,
  usuario_smtp_moodle: z.string().min(1),
  senha_smtp_moodle: z.string().min(1),
  host_smtp_moodle: z.string().min(1),
  porta_smtp_moodle: portNum,
});

export const moodle: StackDefinition = {
  id: "moodle",
  repoUrl: "https://github.com/moodle/moodle",
  name: "Moodle",
  description: "LMS líder mundial para EAD e cursos online.",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 72,
  installVia: "panel",
  fields: [
    { name: "url_moodle", label: "Domínio do Moodle", kind: "domain", placeholder: "moodle.suaempresa.com", group: "Domínios" },
    { name: "project_name_moodle", label: "Nome do projeto", kind: "text", placeholder: "enchaProject", group: "Admin" },
    { name: "user_moodle", label: "Nome de usuário admin", kind: "text", placeholder: "encha", group: "Admin" },
    { name: "pass_moodle", label: "Senha do usuário admin", kind: "password", sensitive: true, group: "Admin" },
    { name: "mail_moodle", label: "E-mail do usuário admin", kind: "email", group: "Admin" },
    { name: "email_smtp_moodle", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "usuario_smtp_moodle", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_smtp_moodle", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "host_smtp_moodle", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_moodle", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_marinadb", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpProtocol = Number(v.porta_smtp_moodle) === 465 ? "ssl" : "tls";
    return `version: "3.7"
services:

  moodle_app:
    image: bitnami/moodle:latest

    volumes:
      - moodle_data:/bitnami/moodle
      - moodledata_data:/bitnami/moodledata

    networks:
      - ${net}

    environment:
      - MOODLE_SITE_NAME=${v.project_name_moodle}
      - MOODLE_HOST=${v.url_moodle}
      - MOODLE_USERNAME=${v.user_moodle}
      - MOODLE_PASSWORD=${v.pass_moodle}
      - MOODLE_EMAIL=${v.mail_moodle}
      - MOODLE_SMTP_USER=${v.usuario_smtp_moodle}
      - MOODLE_SMTP_PASSWORD=${v.senha_smtp_moodle}
      - MOODLE_SMTP_HOST=${v.host_smtp_moodle}
      - MOODLE_SMTP_PORT_NUMBER=${v.porta_smtp_moodle}
      - MOODLE_SMTP_PROTOCOL=${smtpProtocol}
      - MOODLE_LANG=pt
      - MOODLE_DATABASE_HOST=moodle_mariadb
      - MOODLE_DATABASE_PORT_NUMBER=3306
      - MOODLE_DATABASE_USER=encha_moodle
      - MOODLE_DATABASE_PASSWORD=${secrets.senha_marinadb}
      - MOODLE_DATABASE_NAME=enchabase_moodle
      - ALLOW_EMPTY_PASSWORD=no

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
        - traefik.http.routers.moodle.rule=Host(\`${v.url_moodle}\`)
        - traefik.http.services.moodle.loadbalancer.server.port=8080
        - traefik.http.routers.moodle.service=moodle
        - traefik.http.routers.moodle.tls.certresolver=letsencryptresolver
        - traefik.http.routers.moodle.entrypoints=websecure
        - traefik.http.routers.moodle.tls=true

  moodle_mariadb:
    image: bitnami/mariadb:latest

    volumes:
      - moodle_mariadb_data:/bitnami/mariadb

    networks:
      - ${net}

    environment:
      - MARIADB_USER=encha_moodle
      - MARIADB_ROOT_PASSWORD=${secrets.senha_marinadb}
      - MARIADB_DATABASE=enchabase_moodle
      - MARIADB_PASSWORD=${secrets.senha_marinadb}
      - MARIADB_CHARACTER_SET=utf8mb4
      - MARIADB_COLLATE=utf8mb4_unicode_ci
      - ALLOW_EMPTY_PASSWORD=no

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

volumes:
  moodle_data:
    external: true
    name: moodle_data
  moodledata_data:
    external: true
    name: moodledata_data
  moodle_mariadb_data:
    external: true
    name: moodle_mariadb_data

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_moodle: string }).url_moodle}`,
    notes: ["Acesse o domínio para completar a instalação e criar sua conta de administrador."],
  },
};
