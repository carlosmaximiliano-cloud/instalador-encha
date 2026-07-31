import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

// Versão fixa da Evolution API. NUNCA usar "latest": a tag `latest` do
// evoapicloud não acompanha as releases — o build publicado nela em 2026-05-06
// saiu junto da 2.4.0-rc1 e tem digest próprio, que não bate com nenhuma
// release. Isso faz duas VPS instaladas em semanas diferentes rodarem códigos
// diferentes, sem ninguém ter decidido isso.
//
// Linha 2.4.x é a única que recebe correções: `main` não tem commit funcional
// desde a 2.3.7 (dez/2025), todo desenvolvimento está em `develop`.
//
// ⚠️ Nomenclatura: tags stable levam prefixo "v" (v2.3.7); as RC não
// (2.4.0-rc2). `evoapicloud/evolution-api:2.3.7` (sem "v") dá 404.
// Rollback conhecido: "evoapicloud/evolution-api:v2.3.7".
export const EVOLUTION_IMAGE = "evoapicloud/evolution-api:2.4.0-rc2";

// redis:latest é hoje o Redis 8. Fixamos no MESMO major de propósito: cair
// para 7 seria downgrade, e o Redis 7 pode recusar carregar um AOF gravado
// pelo 8 — o que travaria o serviço no rolling update de quem já tem dados
// no volume evolution_redis.
export const EVOLUTION_REDIS_IMAGE = "redis:8-alpine";

const schema = z.object({
  url_evolution: fqdn,
  // Opcional: liga a auto-ativação headless de licença da 2.4.x. Vazio =
  // comportamento antigo (ativação manual pelo /manager).
  email_operador: z.string().email("E-mail inválido").or(z.literal("")).optional(),
});

export const evolution: StackDefinition = {
  id: "evolution",
  repoUrl: "https://github.com/EvolutionAPI/evolution-api",
  logoUrl: "https://raw.githubusercontent.com/EvolutionAPI/evolution-api/main/public/logo.svg",
  name: "Evolution API",
  description: "API multi-instância de WhatsApp com integração nativa para N8N, Chatwoot e Typebot.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["evolution"],
  // O YAML declara estes volumes como `external: true`, então o Swarm NÃO os
  // cria — quem cria é o installer.ts a partir deste campo. Sem isto o deploy
  // falha em VPS limpa. É também o que preserva as instâncias pareadas de
  // WhatsApp num redeploy/upgrade.
  externalVolumes: ["evolution_instances", "evolution_redis"],
  updatableImages: [
    { service: "evolution_api", image: EVOLUTION_IMAGE },
    { service: "evolution_redis", image: EVOLUTION_REDIS_IMAGE },
  ],
  optionNumber: 3,
  fields: [
    {
      name: "url_evolution",
      label: "Domínio da Evolution API",
      kind: "domain",
      placeholder: "evolution.suaempresa.com",
      group: "Domínios",
    },
    {
      name: "email_operador",
      label: "E-mail do operador (ativação automática)",
      kind: "email",
      optional: true,
      placeholder: "voce@suaempresa.com",
      group: "Licença",
      helpText:
        "Opcional. Ativa a licença sozinho no boot, sem abrir o /manager. O e-mail precisa já estar registrado no servidor de licenças da Evolution — se não estiver, a API sobe normalmente e você ativa manualmente pelo /manager.",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "apikeyglobal", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const san = (x: unknown) => String(x ?? "").replace(/[`"\n\r]/g, "");
    const emailOperador = san(v.email_operador);
    // Só emite a env quando preenchida — a 2.4.x decide pela PRESENÇA da
    // variável, então mandá-la vazia mudaria o comportamento do boot.
    const linhaAtivacao = emailOperador
      ? `\n      - EVOLUTION_OPERATOR_EMAIL=${emailOperador}`
      : "";
    return `version: "3.7"
services:
  evolution_api:
    image: ${EVOLUTION_IMAGE}
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - ${net}
    environment:
      - SERVER_URL=https://${v.url_evolution}
      - AUTHENTICATION_API_KEY=${secrets.apikeyglobal}
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - DEL_INSTANCE=false
      - QRCODE_LIMIT=1902
      - LANGUAGE=pt-BR
      - CONFIG_SESSION_PHONE_CLIENT=Encha
      - CONFIG_SESSION_PHONE_NAME=Chrome
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/evolution
      - DATABASE_CONNECTION_CLIENT_NAME=evolution
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - DATABASE_SAVE_MESSAGE_UPDATE=true
      - DATABASE_SAVE_DATA_CONTACTS=true
      - DATABASE_SAVE_DATA_CHATS=true
      - DATABASE_SAVE_DATA_LABELS=true
      - DATABASE_SAVE_DATA_HISTORIC=true
      - N8N_ENABLED=true
      - OPENAI_ENABLED=true
      - DIFY_ENABLED=true
      - TYPEBOT_ENABLED=true
      - TYPEBOT_API_VERSION=latest
      - CHATWOOT_ENABLED=true
      - CHATWOOT_MESSAGE_READ=true
      - CHATWOOT_MESSAGE_DELETE=true
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://evolution_redis:6379/1
      - CACHE_REDIS_PREFIX_KEY=evolution
      - CACHE_REDIS_SAVE_INSTANCES=false
      - CACHE_LOCAL_ENABLED=false
      - TELEMETRY=false
      - TELEMETRY_ENABLED=false
      - TELEMETRY_URL=
      - WEBSOCKET_ENABLED=false${linhaAtivacao}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evolution.rule=Host(\`${v.url_evolution}\`)
        - traefik.http.routers.evolution.entrypoints=websecure
        - traefik.http.routers.evolution.priority=1
        - traefik.http.routers.evolution.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evolution.service=evolution
        - traefik.http.services.evolution.loadbalancer.server.port=8080
        - traefik.http.services.evolution.loadbalancer.passHostHeader=true

  evolution_redis:
    image: ${EVOLUTION_REDIS_IMAGE}
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]
    volumes:
      - evolution_redis:/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  evolution_instances:
    external: true
    name: evolution_instances
  evolution_redis:
    external: true
    name: evolution_redis

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_evolution: string }).url_evolution}/manager`,
    notes: [
      "Acesse o Manager para criar instâncias",
      "Sua API key global foi gerada e salva criptografada — recupere em Logs > Detalhes da instalação",
      "A partir da 2.4.x a Evolution pede ativação de licença (gratuita) no primeiro acesso ao /manager. Se você preencheu o e-mail do operador, a ativação acontece sozinha no boot.",
    ],
  },
};
