import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";

const schema = z.object({
  url_vaultwarden: fqdn,
  email_vaultwarden: email,
  senha_vaultwarden: z.string().min(1),
  host_vaultwarden: z.string().min(1),
  porta_vaultwarden: portNum,
});

export const vaultwarden: StackDefinition = {
  id: "vaultwarden",
  repoUrl: "https://github.com/dani-garcia/vaultwarden",
  name: "Vaultwarden",
  description: "Servidor Bitwarden open-source em Rust.",
  category: "storage",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 41,
  installVia: "panel",
  fields: [
    { name: "url_vaultwarden", label: "Domínio do Vaultwarden", kind: "domain", placeholder: "senhas.encha.ai", group: "Domínios" },
    { name: "email_vaultwarden", label: "E-mail de envio SMTP", kind: "email", placeholder: "noreply@encha.ai", group: "SMTP" },
    { name: "senha_vaultwarden", label: "Senha do e-mail SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "host_vaultwarden", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_vaultwarden", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [],
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const ssl = (v.porta_vaultwarden === 465 || v.porta_vaultwarden === 25) ? "force_tls" : "starttls";
    return `version: "3.7"
services:

  vaultwarden:
    image: vaultwarden/server:latest
    volumes:
      - vaultwarden_data:/data
    networks:
      - ${net}
    environment:
      - DOMAIN=https://${v.url_vaultwarden}
      - SIGNUPS_ALLOWED=true
      - SMTP_FROM=${v.email_vaultwarden}
      - SMTP_USERNAME=${v.email_vaultwarden}
      - SMTP_PASSWORD=${v.senha_vaultwarden}
      - SMTP_HOST=${v.host_vaultwarden}
      - SMTP_PORT=${v.porta_vaultwarden}
      - SMTP_SECURITY=${ssl}
      - WEBSOCKET_ENABLED=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.vaultwarden.rule=Host(\`${v.url_vaultwarden}\`)"
        - "traefik.http.routers.vaultwarden.service=vaultwarden"
        - "traefik.http.routers.vaultwarden.entrypoints=websecure"
        - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"
        - "traefik.http.routers.vaultwarden.tls.certresolver=letsencryptresolver"

volumes:
  vaultwarden_data:
    name: vaultwarden_data
    external: true

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_vaultwarden}`,
    notes: ["Crie sua conta no primeiro acesso ao domínio."],
  },
};
