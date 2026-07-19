import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_grafana: fqdn,
  url_prometheus: fqdn,
  url_cadvisor: fqdn,
  url_nodeexporter: fqdn,
});

export const monitor: StackDefinition = {
  id: "monitor",
  repoUrl: "https://github.com/louislam/uptime-kuma",
  name: "Monitor",
  description: "Painel agregado de saúde do servidor (CPU, RAM, disco).",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 38,
  installVia: "panel",
  fields: [
    { name: "url_grafana", label: "Domínio do Grafana", kind: "domain", placeholder: "grafana.encha.ai", group: "Domínios" },
    { name: "url_prometheus", label: "Domínio do Prometheus", kind: "domain", placeholder: "prometheus.encha.ai", group: "Domínios" },
    { name: "url_cadvisor", label: "Domínio do cAdvisor", kind: "domain", placeholder: "cadvisor.encha.ai", group: "Domínios" },
    { name: "url_nodeexporter", label: "Domínio do NodeExporter", kind: "domain", placeholder: "node.encha.ai", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [],
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: '3.7'
services:

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - /opt/monitor-stack/prometheus:/etc/prometheus
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.prometheus.rule=Host(\`${v.url_prometheus}\`)"
        - "traefik.http.services.prometheus.loadbalancer.server.port=9090"
        - "traefik.http.routers.prometheus.service=prometheus"
        - "traefik.http.routers.prometheus.entrypoints=websecure"
        - "traefik.http.routers.prometheus.tls.certresolver=letsencryptresolver"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - /opt/monitor-stack/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.grafana.rule=Host(\`${v.url_grafana}\`)"
        - "traefik.http.services.grafana.loadbalancer.server.port=3000"
        - "traefik.http.routers.grafana.service=grafana"
        - "traefik.http.routers.grafana.entrypoints=websecure"
        - "traefik.http.routers.grafana.tls.certresolver=letsencryptresolver"

  node-exporter:
    image: prom/node-exporter:latest
    networks:
      - ${net}
    deploy:
      mode: global
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.node-exporter.rule=Host(\`${v.url_nodeexporter}\`)"
        - "traefik.http.services.node-exporter.loadbalancer.server.port=9100"
        - "traefik.http.routers.node-exporter.service=node-exporter"
        - "traefik.http.routers.node-exporter.entrypoints=websecure"
        - "traefik.http.routers.node-exporter.tls.certresolver=letsencryptresolver"

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - ${net}
    deploy:
      mode: global
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.cadvisor.rule=Host(\`${v.url_cadvisor}\`)"
        - "traefik.http.services.cadvisor.loadbalancer.server.port=8080"
        - "traefik.http.routers.cadvisor.service=cadvisor"
        - "traefik.http.routers.cadvisor.entrypoints=websecure"
        - "traefik.http.routers.cadvisor.tls.certresolver=letsencryptresolver"

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_grafana}`,
    notes: ["Grafana: usuário admin, senha admin (alterar no primeiro acesso)"],
  },
};
