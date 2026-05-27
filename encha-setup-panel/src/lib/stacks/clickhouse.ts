import { z } from "zod";
import { type StackDefinition, fqdn, username, strongPassword } from "./types";

const schema = z.object({
  url_clickhouse: fqdn,
  user_clickhouse: username,
  pass_clickhouse: strongPassword,
});

export const clickhouse: StackDefinition = {
  id: "clickhouse",
  repoUrl: "https://github.com/ClickHouse/ClickHouse",
  name: "ClickHouse",
  description: "Banco colunar analítico para queries OLAP em bilhões de linhas.",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 65,
  installVia: "panel",
  fields: [
    {
      name: "url_clickhouse",
      label: "Domínio do ClickHouse",
      kind: "domain",
      placeholder: "clickhouse.suaempresa.com",
    },
    {
      name: "user_clickhouse",
      label: "Usuário admin",
      kind: "username",
      placeholder: "admin",
    },
    {
      name: "pass_clickhouse",
      label: "Senha do usuário",
      kind: "password",
      sensitive: true,
    },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  clickhouse:
    image: clickhouse/clickhouse-server:23.8.8.20-alpine
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - clickhouse_log:/var/log/clickhouse-server
    networks:
      - ${net}
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=${v.user_clickhouse}
      - CLICKHOUSE_PASSWORD=${v.pass_clickhouse}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.clickhouse.rule=Host(\`${v.url_clickhouse}\`)
        - traefik.http.services.clickhouse.loadbalancer.server.port=8123
        - traefik.http.routers.clickhouse.service=clickhouse
        - traefik.http.routers.clickhouse.tls.certresolver=letsencryptresolver
        - traefik.http.services.clickhouse.loadbalancer.passHostHeader=true
        - traefik.http.routers.clickhouse.entrypoints=websecure
        - traefik.http.routers.clickhouse.tls=true

volumes:
  clickhouse_data:
    external: true
    name: clickhouse_data
  clickhouse_log:
    external: true
    name: clickhouse_log

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_clickhouse: string }).url_clickhouse}/play`,
    notes: ["Dashboard de queries em https://<dominio>/play", "API HTTP na porta 8123"],
  },
};
