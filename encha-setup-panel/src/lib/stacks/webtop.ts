import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";

const schema = z.object({
  url_webtop: fqdn,
  user_webtop: username,
  pass_webtop: z.string().min(1),
});

export const webtop: StackDefinition = {
  id: "webtop",
  repoUrl: "https://github.com/linuxserver/docker-webtop",
  name: "Webtop",
  description: "Desktop Linux completo via navegador (Linuxserver.io).",
  category: "monitoring",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 82,
  installVia: "panel",
  fields: [
    { name: "url_webtop", label: "Domínio do Webtop", kind: "domain", placeholder: "linux.suaempresa.com" },
    { name: "user_webtop", label: "Usuário do Linux", kind: "username", placeholder: "admin" },
    { name: "pass_webtop", label: "Senha de Acesso", kind: "password", sensitive: true, placeholder: "Mudar@123" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  webtop:
    image: lscr.io/linuxserver/webtop:ubuntu-xfce
    networks:
      - ${net}
    security_opt:
      - seccomp:unconfined
    volumes:
      - webtop_config:/config
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Sao_Paulo
      - SUBFOLDER=/
      - TITLE=EnchaLinux
      - CUSTOM_USER=${v.user_webtop}
      - PASSWORD=${v.pass_webtop}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.webtop.rule=Host(\`${v.url_webtop}\`)"
        - "traefik.http.services.webtop.loadbalancer.server.port=3000"
        - "traefik.http.routers.webtop.entrypoints=websecure"
        - "traefik.http.routers.webtop.tls.certresolver=letsencryptresolver"
    shm_size: "1gb"

volumes:
  webtop_config:
    external: true
    name: webtop_config

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_webtop: string }).url_webtop}`,
  },
};
