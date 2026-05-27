import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_rabbitmq: fqdn,
  user_rabbitmq: username,
});

export const rabbitmq: StackDefinition = {
  id: "rabbitmq",
  repoUrl: "https://github.com/rabbitmq/rabbitmq-server",
  name: "RabbitMQ",
  description: "Message broker AMQP usado por sistemas distribuídos.",
  category: "messaging",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 16,
  installVia: "panel",
  fields: [
    { name: "url_rabbitmq", label: "Domínio do RabbitMQ", kind: "domain", placeholder: "rabbit.encha.ai", group: "Domínios" },
    { name: "user_rabbitmq", label: "Usuário", kind: "username", placeholder: "encha_user", group: "Acesso" },
  ],
  schema,
  generateSecrets: () => [
    { name: "pass_rabbitmq", value: randomBytes(16).toString("hex") },
    { name: "key_cookie", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  rabbitmq:
    image: rabbitmq:management
    command: rabbitmq-server
    hostname: rabbitmq
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - ${net}
    environment:
      RABBITMQ_DEFAULT_USER: ${v.user_rabbitmq}
      RABBITMQ_DEFAULT_PASS: ${secrets.pass_rabbitmq}
      RABBITMQ_ERLANG_COOKIE: ${secrets.key_cookie}
      RABBITMQ_DEFAULT_VHOST: "/"
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
        - traefik.http.routers.rabbitmq.rule=Host(\`${v.url_rabbitmq}\`)
        - traefik.http.routers.rabbitmq.entrypoints=websecure
        - traefik.http.routers.rabbitmq.tls.certresolver=letsencryptresolver
        - traefik.http.routers.rabbitmq.service=rabbitmq
        - traefik.http.services.rabbitmq.loadbalancer.server.port=15672

volumes:
  rabbitmq_data:
    external: true

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_rabbitmq}`,
    notes: ["URL de conexão AMQP: amqp://<user>:<senha>@rabbitmq:5672"],
  },
};
