import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_stirling: fqdn,
  name_stirlingpdf: z.string().min(1),
  desc_stirlingpdf: z.string().min(1),
});

export const stirling: StackDefinition = {
  id: "stirling",
  repoUrl: "https://github.com/Stirling-Tools/Stirling-PDF",
  name: "Stirling PDF",
  description: "Suíte web de manipulação de PDFs (merge, split, OCR).",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 74,
  installVia: "panel",
  fields: [
    { name: "url_stirling", label: "Domínio do Stirling PDF", kind: "domain", placeholder: "stirling.suaempresa.com" },
    { name: "name_stirlingpdf", label: "Nome do App", kind: "text", placeholder: "enchaPdf" },
    { name: "desc_stirlingpdf", label: "Descrição do App", kind: "text", placeholder: "Meu app de PDF" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  stirlingpdf:
    image: frooodle/s-pdf:latest

    volumes:
      - stirlingpdf_data:/usr/share/tessdata
      - stirlingpdf_config:/configs
      - stirlingpdf_logs:/logs

    networks:
      - ${net}

    environment:
      - SECURITY_ENABLELOGIN=true
      - UI_APPNAME=${v.name_stirlingpdf}
      - UI_APPNAMENAVBAR=${v.name_stirlingpdf}
      - UI_HOMEDESCRIPTION=${v.desc_stirlingpdf}
      - DOCKER_ENABLE_SECURITY=false
      - SYSTEM_MAXFILESIZE=100
      - LANGS=en_GB,en_US,ar_AR,de_DE,fr_FR,es_ES,zh_CN,zh_TW,ca_CA,it_IT,sv_SE,pl_PL,ro_RO,ko_KR,pt_BR,ru_RU,el_GR,hi_IN,hu_HU,tr_TR,id_ID
      - SYSTEM_DEFAULTLOCALE=BR
      - METRICS_ENABLED=true
      - SYSTEM_GOOGLEVISIBILITY=false

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
        - traefik.http.routers.stirlingpdf.rule=Host(\`${v.url_stirling}\`)
        - traefik.http.services.stirlingpdf.loadbalancer.server.port=8080
        - traefik.http.routers.stirlingpdf.service=stirlingpdf
        - traefik.http.routers.stirlingpdf.tls.certresolver=letsencryptresolver
        - traefik.http.routers.stirlingpdf.entrypoints=websecure
        - traefik.http.routers.stirlingpdf.tls=true

volumes:
  stirlingpdf_data:
    external: true
    name: stirlingpdf_data
  stirlingpdf_config:
    external: true
    name: stirlingpdf_config
  stirlingpdf_logs:
    external: true
    name: stirlingpdf_logs

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_stirling: string }).url_stirling}`,
    notes: ["Crie sua conta no primeiro acesso."],
  },
};
