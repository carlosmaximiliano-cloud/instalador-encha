import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_hbbs: fqdn,
  url_hbbr: fqdn,
});

export const rustdesk: StackDefinition = {
  id: "rustdesk",
  repoUrl: "https://github.com/rustdesk/rustdesk",
  name: "RustDesk",
  description: "TeamViewer open-source em Rust.",
  category: "remote",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 58,
  installVia: "panel",
  fields: [
    { name: "url_hbbs", label: "Domínio servidor de ID (hbbs)", kind: "domain", placeholder: "hbbs-rustdesk.suaempresa.com", group: "Domínios" },
    { name: "url_hbbr", label: "Domínio servidor de Relay (hbbr)", kind: "domain", placeholder: "hbbr-rustdesk.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "rustdesk_api_key", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.8"
services:

  rustdesk_hbbs:
    image: rustdesk/rustdesk-server:latest
    command: hbbs

    volumes:
      - rustdesk_data:/root

    networks:
      - ${net}
    ports:
      - 21115:21115
      - 21116:21116/udp
      - 21118:21118/udp

    environment:
      - ALWAYS_USE_RELAY=N
      - RELAY=${v.url_hbbr}
      - KEY=${secrets.rustdesk_api_key}
      - PORT=21116
      - RUST_LOG=info

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.rustdesk_hbbs.rule=Host(\`${v.url_hbbs}\`)
        - traefik.http.routers.rustdesk_hbbs.entrypoints=websecure
        - traefik.http.routers.rustdesk_hbbs.priority=1
        - traefik.http.routers.rustdesk_hbbs.tls.certresolver=letsencryptresolver
        - traefik.http.routers.rustdesk_hbbs.service=rustdesk_hbbs
        - traefik.http.services.rustdesk_hbbs.loadbalancer.server.port=21116
        - traefik.http.services.rustdesk_hbbs.loadbalancer.passHostHeader=true

  rustdesk_hbbr:
    image: rustdesk/rustdesk-server:latest
    command: hbbr

    volumes:
      - rustdesk_data:/root

    networks:
      - ${net}

    environment:
      - KEY=${secrets.rustdesk_api_key}
      - PORT=21117
      - LIMIT_SPEED=200
      - SINGLE_BANDWIDTH=50
      - TOTAL_BANDWIDTH=500
      - RUST_LOG=info

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.rustdesk_hbbr.rule=Host(\`${v.url_hbbr}\`)
        - traefik.http.routers.rustdesk_hbbr.entrypoints=websecure
        - traefik.http.routers.rustdesk_hbbr.priority=1
        - traefik.http.routers.rustdesk_hbbr.tls.certresolver=letsencryptresolver
        - traefik.http.routers.rustdesk_hbbr.service=rustdesk_hbbr
        - traefik.http.services.rustdesk_hbbr.loadbalancer.server.port=21117
        - traefik.http.services.rustdesk_hbbr.loadbalancer.passHostHeader=true

volumes:
  rustdesk_data:
    external: true
    name: rustdesk_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_hbbs: string }).url_hbbs}`,
    notes: ["Servidor de ID (hbbs) e Relay (hbbr) configurados. Use a API Key gerada no cliente RustDesk."],
  },
};
