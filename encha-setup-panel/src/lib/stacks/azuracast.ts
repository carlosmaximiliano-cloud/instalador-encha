import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_azuracast: fqdn,
});

export const azuracast: StackDefinition = {
  id: "azuracast",
  repoUrl: "https://github.com/AzuraCast/AzuraCast",
  name: "AzuraCast",
  description: "Rádio web self-hosted (streaming + automação).",
  category: "media",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 57,
  installVia: "panel",
  fields: [
    { name: "url_azuracast", label: "Domínio do AzuraCast", kind: "domain", placeholder: "radio.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "azuracast_mysql_password", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  azuracast_web:
    image: ghcr.io/azuracast/azuracast:latest

    volumes:
      - azuracast_station_data:/var/azuracast/stations
      - azuracast_backups:/var/azuracast/backups
      - azuracast_db_data:/var/lib/mysql
      - azuracast_www_uploads:/var/azuracast/storage/uploads
      - azuracast_shoutcast2_install:/var/azuracast/storage/shoutcast2
      - azuracast_stereo_tool_install:/var/azuracast/storage/stereo_tool
      - azuracast_rsas_install:/var/azuracast/storage/rsas
      - azuracast_geolite_install:/var/azuracast/storage/geoip
      - azuracast_sftpgo_data:/var/azuracast/storage/sftpgo
      - azuracast_acme:/var/azuracast/storage/acme

    networks:
      - ${net}
    ports:
      - target: 2022
        published: 2022
        protocol: tcp
        mode: host
      - target: 8005
        published: 8005
        protocol: tcp
        mode: host

    environment:
      - COMPOSE_PROJECT_NAME=azuracast
      - AZURACAST_HTTP_PORT=80
      - AZURACAST_HTTPS_PORT=443
      - AZURACAST_SFTP_PORT=2022
      - AZURACAST_PUID=1000
      - AZURACAST_PGID=1000
      - NGINX_TIMEOUT=1800
      - ENABLE_INTERNAL_MYSQL=true
      - MYSQL_ROOT_PASSWORD=${secrets.azuracast_mysql_password}
      - MYSQL_DATABASE=azuracast
      - MYSQL_USER=azuracast
      - MYSQL_PASSWORD=${secrets.azuracast_mysql_password}
      - MYSQL_CHARACTER_SET_SERVER=utf8mb4
      - MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.azuracast_web.rule=Host(\`${v.url_azuracast}\`)
        - traefik.http.routers.azuracast_web.entrypoints=websecure
        - traefik.http.routers.azuracast_web.priority=1
        - traefik.http.routers.azuracast_web.tls.certresolver=letsencryptresolver
        - traefik.http.routers.azuracast_web.service=azuracast_web
        - traefik.http.services.azuracast_web.loadbalancer.server.port=80
        - traefik.http.services.azuracast_web.loadbalancer.passHostHeader=true

  azuracast_updater:
    image: ghcr.io/azuracast/updater:latest

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

    networks:
      - ${net}

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  azuracast_station_data:
    external: true
    name: azuracast_station_data
  azuracast_backups:
    external: true
    name: azuracast_backups
  azuracast_db_data:
    external: true
    name: azuracast_db_data
  azuracast_www_uploads:
    external: true
    name: azuracast_www_uploads
  azuracast_shoutcast2_install:
    external: true
    name: azuracast_shoutcast2_install
  azuracast_stereo_tool_install:
    external: true
    name: azuracast_stereo_tool_install
  azuracast_rsas_install:
    external: true
    name: azuracast_rsas_install
  azuracast_geolite_install:
    external: true
    name: azuracast_geolite_install
  azuracast_sftpgo_data:
    external: true
    name: azuracast_sftpgo_data
  azuracast_acme:
    external: true
    name: azuracast_acme

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_azuracast: string }).url_azuracast}`,
    notes: ["Acesse o domínio para completar a instalação e criar sua conta."],
  },
};
