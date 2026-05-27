import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_traccar: fqdn,
});

export const traccar: StackDefinition = {
  id: "traccar",
  repoUrl: "https://github.com/traccar/traccar",
  logoUrl: "https://raw.githubusercontent.com/traccar/traccar/master/web/app/view/images/logo.svg",
  name: "Traccar",
  description: "Servidor GPS para rastreamento de veículos.",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 76,
  installVia: "panel",
  fields: [
    { name: "url_traccar", label: "Domínio do Traccar", kind: "domain", placeholder: "traccar.suaempresa.com" },
  ],
  schema,
  generateSecrets: () => [
    { name: "gerar_senha_mysql", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  traccar:
    image: traccar/traccar:latest

    volumes:
      - traccar_data:/opt/traccar/

    networks:
      - ${net}

    environment:
      - JAVA_OPTS=-Xms1g -Xmx1g -Djava.net.preferIPv4Stack=true

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
        - traefik.http.routers.traccar.rule=Host(\`${v.url_traccar}\`)
        - traefik.http.services.traccar.loadbalancer.server.port=8082
        - traefik.http.routers.traccar.service=traccar
        - traefik.http.routers.traccar.tls.certresolver=letsencryptresolver
        - traefik.http.routers.traccar.entrypoints=websecure
        - traefik.http.routers.traccar.tls=true

  traccar_db:
    image: mysql:8.0

    volumes:
      - traccar_db:/var/lib/mysql

    networks:
      - ${net}

    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=traccar
      - MYSQL_USER=traccar
      - MYSQL_PASSWORD=${secrets.gerar_senha_mysql}

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
  traccar_data:
    external: true
    name: traccar_data
  traccar_db:
    external: true
    name: traccar_db

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_traccar: string }).url_traccar}`,
    notes: ["Usuário padrão: admin", "Senha padrão: admin"],
  },
};
