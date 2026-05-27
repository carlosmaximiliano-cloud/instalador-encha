import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_odoo: fqdn,
});

export const odoo: StackDefinition = {
  id: "odoo",
  repoUrl: "https://github.com/odoo/odoo",
  name: "Odoo",
  description: "ERP completo (vendas, estoque, contabilidade, RH).",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 10,
  installVia: "panel",
  fields: [
    { name: "url_odoo", label: "Domínio do Odoo", kind: "domain", placeholder: "odoo.suaempresa.com" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_postgres_odoo", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  odoo_app:
    image: odoo:18.0

    volumes:
      - odoo_app_data:/var/lib/odoo
      - odoo_app_config:/etc/odoo
      - odoo_app_addons:/mnt/extra-addons

    networks:
      - ${net}

    environment:
      - HOST=odoo_db
      - USER=odoo
      - PASSWORD=${secrets.senha_postgres_odoo}

    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.odoo_app.rule=Host(\`${v.url_odoo}\`)
        - traefik.http.routers.odoo_app.entrypoints=websecure
        - traefik.http.routers.odoo_app.tls=true
        - traefik.http.routers.odoo_app.service=odoo_app
        - traefik.http.routers.odoo_app.tls.certresolver=letsencryptresolver
        - traefik.http.services.odoo_app.loadbalancer.server.port=8069

  odoo_db:
    image: postgres:15

    volumes:
      - odoo_db_data:/var/lib/postgresql/data/pgdata

    networks:
      - ${net}

    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres_odoo}
      - POSTGRES_USER=odoo
      - PGDATA=/var/lib/postgresql/data/pgdata
    deploy:
      placement:
        constraints:
          - node.role == manager

volumes:
  odoo_app_data:
    external: true
    name: odoo_app_data
  odoo_app_config:
    external: true
    name: odoo_app_config
  odoo_app_addons:
    external: true
    name: odoo_app_addons
  odoo_db_data:
    external: true
    name: odoo_db_data

networks:
  ${net}:
    external: true
    attachable: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_odoo: string }).url_odoo}`,
    notes: ["Crie seu usuário no primeiro acesso do Odoo"],
  },
};
