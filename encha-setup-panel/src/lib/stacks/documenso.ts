import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_documenso: fqdn,
  url_s3: fqdn,
  email_documenso: email,
  usuario_email_documenso: z.string().min(1),
  senha_email_documenso: z.string().min(1),
  smtp_email_documenso: z.string().min(1),
  porta_smtp_documenso: portNum,
  s3_access_key: z.string().min(1),
  s3_secret_key: z.string().min(1),
});

export const documenso: StackDefinition = {
  id: "documenso",
  repoUrl: "https://github.com/documenso/documenso",
  name: "Documenso",
  description: "DocuSign open-source — assinatura digital de PDFs.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres", "minio"],
  optionNumber: 71,
  installVia: "panel",
  fields: [
    { name: "url_documenso", label: "Domínio do Documenso", kind: "domain", placeholder: "doc.suaempresa.com", group: "Domínios" },
    { name: "url_s3", label: "Domínio do endpoint S3 (MinIO)", kind: "domain", placeholder: "s3.suaempresa.com", group: "MinIO" },
    { name: "s3_access_key", label: "Access Key do MinIO", kind: "text", group: "MinIO" },
    { name: "s3_secret_key", label: "Secret Key do MinIO", kind: "password", sensitive: true, group: "MinIO" },
    { name: "email_documenso", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "usuario_email_documenso", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_email_documenso", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "smtp_email_documenso", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_documenso", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_documenso1", value: randomBytes(16).toString("hex") },
    { name: "key_documenso2", value: randomBytes(16).toString("hex") },
    { name: "key_documenso3", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpSecure = Number(v.porta_smtp_documenso) === 465 ? "true" : "false";
    return `version: "3.7"
services:

  documenso:
    image: documenso/documenso:latest

    volumes:
      - documenso_cert:/opt/documenso/cert.p12

    networks:
      - ${net}

    environment:
      - PORT=3000
      - NEXTAUTH_URL=https://${v.url_documenso}
      - NEXT_PUBLIC_WEBAPP_URL=https://${v.url_documenso}
      - NEXT_PUBLIC_MARKETING_URL=https://encha.ai/
      - NEXTAUTH_SECRET=${secrets.key_documenso1}
      - NEXT_PRIVATE_ENCRYPTION_KEY=${secrets.key_documenso2}
      - NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY=${secrets.key_documenso3}
      - NEXT_PRIVATE_DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/documenso
      - NEXT_PRIVATE_DIRECT_DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/documenso
      - NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
      - NEXT_PRIVATE_UPLOAD_ENDPOINT=https://${v.url_s3}
      - NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE=true
      - NEXT_PRIVATE_UPLOAD_REGION=eu-south
      - NEXT_PRIVATE_UPLOAD_BUCKET=documenso
      - NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID=${v.s3_access_key}
      - NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - NEXT_PRIVATE_SMTP_TRANSPORT=smtp-auth
      - NEXT_PRIVATE_SMTP_FROM_ADDRESS=${v.email_documenso}
      - NEXT_PRIVATE_SMTP_USERNAME=${v.usuario_email_documenso}
      - NEXT_PRIVATE_SMTP_PASSWORD=${v.senha_email_documenso}
      - NEXT_PRIVATE_SMTP_HOST=${v.smtp_email_documenso}
      - NEXT_PRIVATE_SMTP_PORT=${v.porta_smtp_documenso}
      - NEXT_PRIVATE_SMTP_SECURE=${smtpSecure}
      - NEXT_PRIVATE_SMTP_FROM_NAME=Suporte
      - NEXT_PUBLIC_DOCUMENT_SIZE_UPLOAD_LIMIT=10
      - NEXT_PUBLIC_DISABLE_SIGNUP=false
      - NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH=/opt/documenso/cert.p12

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
        - traefik.http.routers.documenso.rule=Host(\`${v.url_documenso}\`)
        - traefik.http.services.documenso.loadbalancer.server.port=3000
        - traefik.http.routers.documenso.service=documenso
        - traefik.http.routers.documenso.tls.certresolver=letsencryptresolver
        - traefik.http.routers.documenso.entrypoints=websecure
        - traefik.http.routers.documenso.tls=true

volumes:
  documenso_cert:
    external: true
    name: documenso_cert

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_documenso: string }).url_documenso}`,
    notes: ["Aguarde alguns minutos para a migração do banco antes do primeiro acesso."],
  },
};
