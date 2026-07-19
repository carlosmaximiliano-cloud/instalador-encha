import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_phpmyadmin: fqdn,
  host_phpmyadmin: z.string().min(1, "Informe o host do MySQL"),
});

export const phpmyadmin: StackDefinition = {
  id: "phpmyadmin",
  repoUrl: "https://github.com/phpmyadmin/phpmyadmin",
  logoUrl: "https://raw.githubusercontent.com/phpmyadmin/phpmyadmin/master/docs/images/logo.png",
  name: "phpMyAdmin",
  description: "Interface web para administrar bancos MySQL/MariaDB.",
  category: "database",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 44,
  installVia: "panel",
  fields: [
    { name: "url_phpmyadmin", label: "Domínio do phpMyAdmin", kind: "domain", placeholder: "phpmyadmin.suaempresa.com" },
    { name: "host_phpmyadmin", label: "Host MySQL", kind: "text", placeholder: "mysql ou 1.1.1.1:3306", helpText: "Use 'mysql' se o MySQL estiver na mesma rede Swarm." },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin:latest
    command: ["apache2-foreground"]
    networks:
      - ${net}
    environment:
      - PMA_HOSTS=${v.host_phpmyadmin}
      - PMA_PORT=3306
      - PMA_ABSOLUTE_URI=https://${v.url_phpmyadmin}
      - UPLOAD_LIMIT=10M
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 2048M
      labels:
        - traefik.enable=true
        - traefik.http.routers.phpmyadmin.rule=Host(\`${v.url_phpmyadmin}\`)
        - traefik.http.routers.phpmyadmin.entrypoints=web,websecure
        - traefik.http.routers.phpmyadmin.tls.certresolver=letsencryptresolver
        - traefik.http.services.phpmyadmin.loadbalancer.server.port=80
        - traefik.http.routers.phpmyadmin.service=phpmyadmin

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_phpmyadmin: string }).url_phpmyadmin}`,
    notes: ["Use as credenciais do seu banco MySQL para fazer login."],
  },
};
