import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_duplicati: fqdn,
  pass_duplicati: z.string().optional().default(""),
  dir_origem: z.string().min(1),
});

export const duplicati: StackDefinition = {
  id: "duplicati",
  repoUrl: "https://github.com/duplicati/duplicati",
  logoUrl: "https://raw.githubusercontent.com/duplicati/duplicati/master/Duplicati/Server/webroot/img/logo.svg",
  name: "Duplicati",
  description: "Backup automático criptografado para nuvem.",
  category: "storage",
  icon: "hard-drive",
  dependsOn: ["traefik-portainer"],
  optionNumber: 81,
  installVia: "panel",
  fields: [
    { name: "url_duplicati", label: "Domínio do Duplicati", kind: "domain", placeholder: "backup.suaempresa.com" },
    { name: "pass_duplicati", label: "Senha da Interface Web", kind: "password", sensitive: true, optional: true, placeholder: "Deixe em branco para não usar" },
    { name: "dir_origem", label: "Diretório de Origem para Backup", kind: "text", placeholder: "/var/lib/docker/volumes" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key_duplicati", value: randomBytes(32).toString("base64") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  duplicati:
    image: lscr.io/linuxserver/duplicati:latest
    networks:
      - ${net}
    volumes:
      - duplicati_config:/config
      - duplicati_backups:/backups
      - ${v.dir_origem}:/source
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Sao_Paulo
      - SETTINGS_ENCRYPTION_KEY=${secrets.encryption_key_duplicati}
      - DUPLICATI__WEBSERVICE_PASSWORD=${v.pass_duplicati}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.duplicati.rule=Host(\`${v.url_duplicati}\`)"
        - "traefik.http.services.duplicati.loadbalancer.server.port=8200"
        - "traefik.http.routers.duplicati.service=duplicati"
        - "traefik.http.routers.duplicati.entrypoints=websecure"
        - "traefik.http.routers.duplicati.tls.certresolver=letsencryptresolver"

volumes:
  duplicati_config:
    external: true
    name: duplicati_config
  duplicati_backups:
    external: true
    name: duplicati_backups

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_duplicati: string }).url_duplicati}`,
    notes: ["Dentro do Duplicati, a pasta '/source' corresponde ao diretório de origem configurado no servidor."],
  },
  i18n: {
    en: {
      description: "Automatic encrypted backup to the cloud.",
      fields: {
        url_duplicati: { label: "Duplicati Domain", placeholder: "backup.yourcompany.com" },
        pass_duplicati: { label: "Web Interface Password", placeholder: "Leave blank to not use one" },
        dir_origem: { label: "Source Directory for Backup", placeholder: "/var/lib/docker/volumes" },
      },
      notes: ["Inside Duplicati, the '/source' folder corresponds to the source directory configured on the server."],
    },
    es: {
      description: "Copia de seguridad automática cifrada en la nube.",
      fields: {
        url_duplicati: { label: "Dominio de Duplicati", placeholder: "backup.suempresa.com" },
        pass_duplicati: { label: "Contraseña de la interfaz web", placeholder: "Deja en blanco para no usar" },
        dir_origem: { label: "Directorio de origen para el backup", placeholder: "/var/lib/docker/volumes" },
      },
      notes: ["Dentro de Duplicati, la carpeta '/source' corresponde al directorio de origen configurado en el servidor."],
    },
  },
};
