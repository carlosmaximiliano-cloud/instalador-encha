import type { StackDefinition } from "./types";

// Stacks com instalação completa via painel (Portainer API)
import { traefikPortainer } from "./traefik-portainer";
import { postgres } from "./postgres";
import { evolution } from "./evolution";
import { n8n } from "./n8n";
import { chatwoot } from "./chatwoot";
import { minio } from "./minio";
import { typebot } from "./typebot";
import { directus } from "./directus";
import { ollama } from "./ollama";
import { pgadmin } from "./pgadmin";
import { mongodb } from "./mongodb";

// Stubs metadata-only (instalação via secondary.sh por enquanto)
import { mysql } from "./mysql";
import { redis } from "./redis";
import { supabase } from "./supabase";
import { clickhouse } from "./clickhouse";
import { redisinsight } from "./redisinsight";
import { phpmyadmin } from "./phpmyadmin";
import { qdrant } from "./qdrant";
import { wppconnect } from "./wppconnect";
import { unoapi } from "./unoapi";
import { quepasa } from "./quepasa";
import { wuzapi } from "./wuzapi";
import { evoai } from "./evoai";
import { flowise } from "./flowise";
import { langflow } from "./langflow";
import { dify } from "./dify";
import { anythingllm } from "./anythingllm";
import { langfuse } from "./langfuse";
import { firecrawl } from "./firecrawl";
import { bolt } from "./bolt";
import { zep } from "./zep";
import { woofedcrm } from "./woofedcrm";
import { twentycrm } from "./twentycrm";
import { krayincrm } from "./krayincrm";
import { strapi } from "./strapi";
import { nocobase } from "./nocobase";
import { nocodb } from "./nocodb";
import { baserow } from "./baserow";
import { appsmith } from "./appsmith";
import { tooljet } from "./tooljet";
import { lowcoder } from "./lowcoder";
import { wordpress } from "./wordpress";
import { mattermost } from "./mattermost";
import { humhub } from "./humhub";
import { outline } from "./outline";
import { focalboard } from "./focalboard";
import { planka } from "./planka";
import { affine } from "./affine";
import { wiki } from "./wiki";
import { hoppscotch } from "./hoppscotch";
import { mautic } from "./mautic";
import { formbricks } from "./formbricks";
import { documenso } from "./documenso";
import { docuseal } from "./docuseal";
import { shlink } from "./shlink";
import { yourls } from "./yourls";
import { wisemapping } from "./wisemapping";
import { calcom } from "./calcom";
import { easyappointments } from "./easyappointments";
import { nextcloud } from "./nextcloud";
import { vaultwarden } from "./vaultwarden";
import { duplicati } from "./duplicati";
import { uptimekuma } from "./uptimekuma";
import { ntfy } from "./ntfy";
import { traccar } from "./traccar";
import { rabbitmq } from "./rabbitmq";
import { gotenberg } from "./gotenberg";
import { browserless } from "./browserless";
import { stirling } from "./stirling";
import { monitor } from "./monitor";
import { webtop } from "./webtop";
import { odoo } from "./odoo";
import { frappe } from "./frappe";
import { glpi } from "./glpi";
import { openproject } from "./openproject";
import { moodle } from "./moodle";
import { metabase } from "./metabase";
import { keycloak } from "./keycloak";
import { passbolt } from "./passbolt";
import { botpress } from "./botpress";
import { azuracast } from "./azuracast";
import { rustdesk } from "./rustdesk";
import { excalidraw } from "./excalidraw";
import { infisical } from "./infisical";

export const ALL_STACKS: StackDefinition[] = [
  // Implementadas (instalam pelo painel)
  traefikPortainer,
  postgres,
  evolution,
  n8n,
  chatwoot,
  minio,
  typebot,
  directus,
  ollama,
  pgadmin,
  mongodb,
  infisical,
  // Stubs (instalação via SSH no momento)
  mysql,
  redis,
  supabase,
  clickhouse,
  redisinsight,
  phpmyadmin,
  qdrant,
  wppconnect,
  unoapi,
  quepasa,
  wuzapi,
  evoai,
  flowise,
  langflow,
  dify,
  anythingllm,
  langfuse,
  firecrawl,
  bolt,
  zep,
  woofedcrm,
  twentycrm,
  krayincrm,
  strapi,
  nocobase,
  nocodb,
  baserow,
  appsmith,
  tooljet,
  lowcoder,
  wordpress,
  mattermost,
  humhub,
  outline,
  focalboard,
  planka,
  affine,
  wiki,
  hoppscotch,
  mautic,
  formbricks,
  documenso,
  docuseal,
  shlink,
  yourls,
  wisemapping,
  calcom,
  easyappointments,
  nextcloud,
  vaultwarden,
  duplicati,
  uptimekuma,
  ntfy,
  traccar,
  rabbitmq,
  gotenberg,
  browserless,
  stirling,
  monitor,
  webtop,
  odoo,
  frappe,
  glpi,
  openproject,
  moodle,
  metabase,
  keycloak,
  passbolt,
  botpress,
  azuracast,
  rustdesk,
  excalidraw,
];

export const STACKS_BY_ID: Record<string, StackDefinition> = Object.fromEntries(
  ALL_STACKS.map((s) => [s.id, s])
);

export function getStack(id: string): StackDefinition | undefined {
  return STACKS_BY_ID[id];
}

export function getPublicCatalog(): StackDefinition[] {
  return ALL_STACKS.filter((s) => s.optionNumber >= 0);
}
