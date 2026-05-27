import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_easyappointments: fqdn,
});

export const easyappointments: StackDefinition = {
  id: "easyappointments",
  repoUrl: "https://github.com/alextselegidis/easyappointments",
  name: "Easy Appointments",
  description: "Sistema PHP de agendamento de horários.",
  category: "scheduling",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 70,
  installVia: "panel",
  fields: [
    { name: "url_easyappointments", label: "Domínio do Easy Appointments", kind: "domain", placeholder: "agenda.suaempresa.com" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_mysql", value: "REUSE_MYSQL" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  easyapointments:
    image: alextselegidis/easyappointments:latest

    volumes:
      - easyapointments_data:/var/www/html

    networks:
      - ${net}

    environment:
      - BASE_URL=https://${v.url_easyappointments}
      - APACHE_SERVER_NAME=${v.url_easyappointments}
      - DB_HOST=mysql
      - DB_NAME=easyapointments
      - DB_USERNAME=root
      - DB_PASSWORD=${secrets.senha_mysql}
      - GOOGLE_SYNC_FEATURE=false
      - GOOGLE_PRODUCT_NAME=
      - GOOGLE_CLIENT_ID=
      - GOOGLE_CLIENT_SECRET=
      - GOOGLE_API_KEY=
      - DEBUG_MODE=TRUE

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
        - traefik.http.routers.easyapointments.rule=Host(\`${v.url_easyappointments}\`)
        - traefik.http.services.easyapointments.loadbalancer.server.port=80
        - traefik.http.routers.easyapointments.service=easyapointments
        - traefik.http.routers.easyapointments.tls.certresolver=letsencryptresolver
        - traefik.http.routers.easyapointments.entrypoints=websecure
        - traefik.http.routers.easyapointments.tls=true

volumes:
  easyapointments_data:
    external: true
    name: easyapointments_data

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_easyappointments: string }).url_easyappointments}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário."],
  },
};
