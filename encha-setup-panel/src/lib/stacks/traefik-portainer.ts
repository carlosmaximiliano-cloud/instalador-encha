import { z } from "zod";
import { type StackDefinition, fqdn, slug, strongPassword, username, email } from "./types";

const schema = z.object({
  url_portainer: fqdn,
  user_portainer: username,
  pass_portainer: strongPassword,
  nome_servidor: slug,
  nome_rede_interna: slug,
  email_ssl: email,
});

export const traefikPortainer: StackDefinition = {
  id: "traefik-portainer",
  repoUrl: "https://github.com/portainer/portainer",
  logoUrl: "https://raw.githubusercontent.com/portainer/portainer/develop/app/assets/images/logo_alt.png",
  name: "Traefik + Portainer",
  description: "Proxy reverso com SSL automático (Let's Encrypt) + UI de gerenciamento de containers. Base para todas as outras stacks.",
  category: "infra",
  icon: "shield",
  dependsOn: [],
  optionNumber: 2,
  swarmStackNames: ["traefik", "portainer"],
  fields: [
    {
      name: "url_portainer",
      label: "Domínio do Portainer",
      kind: "domain",
      placeholder: "portainer.suaempresa.com",
      helpText: "Subdomínio onde a UI do Portainer ficará acessível",
      group: "Domínios",
    },
    {
      name: "user_portainer",
      label: "Usuário admin",
      kind: "username",
      placeholder: "admin",
      group: "Credenciais",
    },
    {
      name: "pass_portainer",
      label: "Senha admin",
      kind: "password",
      sensitive: true,
      helpText: "Mínimo 12 chars, com maiúsculas, números e símbolos",
      group: "Credenciais",
    },
    {
      name: "nome_servidor",
      label: "Nome do servidor",
      kind: "slug",
      placeholder: "encha",
      group: "Servidor",
    },
    {
      name: "nome_rede_interna",
      label: "Nome da rede overlay Swarm",
      kind: "slug",
      placeholder: "enchaNet",
      group: "Servidor",
    },
    {
      name: "email_ssl",
      label: "E-mail para Let's Encrypt",
      kind: "email",
      placeholder: "admin@suaempresa.com",
      helpText: "Usado para notificações de SSL pelo Let's Encrypt",
      group: "SSL",
    },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = v.nome_rede_interna || ctx.networkName;
    return `version: "3.7"
services:
  traefik:
    image: traefik:v3.4.0
    environment:
      - DOCKER_API_VERSION=1.44
    command:
      - "--api.dashboard=true"
      - "--providers.swarm=true"
      - "--providers.swarm.endpoint=unix:///var/run/docker.sock"
      - "--providers.swarm.exposedbydefault=false"
      - "--providers.swarm.network=${net}"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencryptresolver.acme.storage=/etc/traefik/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencryptresolver.acme.email=${v.email_ssl}"
      - "--log.level=INFO"
      - "--accesslog=true"
    volumes:
      - "vol_certificates:/etc/traefik/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - ${net}
    ports:
      - target: 80
        published: 80
        mode: host
      - target: 443
        published: 443
        mode: host
    deploy:
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=false"
        - "traefik.http.middlewares.redirect-https.redirectscheme.scheme=https"
        - "traefik.http.middlewares.redirect-https.redirectscheme.permanent=true"
        - "traefik.http.routers.http-catchall.rule=Host(\`{host:.+}\`)"
        - "traefik.http.routers.http-catchall.entrypoints=web"
        - "traefik.http.routers.http-catchall.middlewares=redirect-https@docker"
        - "traefik.http.routers.http-catchall.priority=1"

  portainer-agent:
    image: portainer/agent:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker/volumes:/var/lib/docker/volumes
    networks:
      - ${net}
    deploy:
      mode: global
      placement:
        constraints: [node.platform.os == linux]

  portainer:
    image: portainer/portainer-ce:latest
    command: -H tcp://tasks.portainer-agent:9001 --tlsskipverify
    volumes:
      - portainer_data:/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.portainer.rule=Host(\`${v.url_portainer}\`)"
        - "traefik.http.services.portainer.loadbalancer.server.port=9000"
        - "traefik.http.routers.portainer.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.portainer.service=portainer"
        - "traefik.swarm.network=${net}"
        - "traefik.http.routers.portainer.entrypoints=websecure"

volumes:
  vol_certificates:
    external: true
    name: volume_swarm_certificates
  portainer_data:
    external: true
    name: portainer_data

networks:
  ${net}:
    external: true
    attachable: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_portainer: string }).url_portainer}`,
    notes: [
      "Após instalado, acesse a URL e crie a conta admin",
      "Anote suas credenciais — elas controlam toda a infraestrutura",
    ],
  },
};
