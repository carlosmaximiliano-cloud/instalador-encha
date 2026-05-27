import { z } from "zod";
import { type StackDefinition } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({});

export const mysql: StackDefinition = {
  id: "mysql",
  repoUrl: "https://github.com/mysql/mysql-server",
  name: "MySQL",
  description: "Banco relacional clássico para aplicações web e CMS.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: 0,
  installVia: "panel",
  fields: [],
  schema,
  generateSecrets: () => [{ name: "senha_mysql", value: randomBytes(16).toString("hex") }],
  generateYaml(_v, secrets, ctx) {
    const net = ctx.networkName;
    const senha = secrets.senha_mysql;
    return `version: "3.7"
services:
  mysql:
    image: percona/percona-server:8.0
    command:
      - "--character-set-server=utf8mb4"
      - "--collation-server=utf8mb4_unicode_ci"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ${net}
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${senha}
      - TZ=America/Sao_Paulo
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 2048M

volumes:
  mysql_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
};
