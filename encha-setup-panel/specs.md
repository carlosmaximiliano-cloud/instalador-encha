# Encha Setup Panel — Especificações Técnicas

## Visão Geral

Painel web de instalação de stacks Docker Swarm para a infraestrutura Encha AI.
Permite instalar, configurar e monitorar serviços via Portainer API, sem acesso direto ao terminal.

- **URL produção:** `https://painel.alunaencha.shop`
- **VPS:** `31.97.144.25` (Alpine Linux, Docker Swarm, stack `encha-panel`)
- **Imagem Docker:** `enchaai/setup-panel:latest`

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS 3.4 + CSS custom properties |
| Banco local | better-sqlite3 (audit log + sessões) |
| Validação | Zod |
| HTTP interno | undici (calls à Portainer API) |
| Runtime | Node 20 Alpine (Docker) |

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── layout.tsx              # Root layout — anti-flash dark mode script + ThemeProvider
│   ├── globals.css             # Classes utilitárias glass, hover halo
│   ├── tokens.css              # CSS custom properties (paleta coral/warm, glass, sombras)
│   ├── page.tsx                # Redirect → /catalog
│   ├── login/page.tsx          # Login com senha mestra
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + main content (Suspense wrapper)
│   │   ├── catalog/page.tsx    # Catálogo de stacks (filtro por categoria + busca)
│   │   ├── stacks/page.tsx     # Stacks instaladas
│   │   └── logs/page.tsx       # Audit log
│   └── api/
│       ├── auth/route.ts       # POST login / DELETE logout
│       ├── csrf/route.ts       # GET token CSRF
│       ├── health/route.ts     # Health check
│       ├── audit/route.ts      # GET log de ações
│       ├── vps-context/route.ts# GET dados da VPS (nome servidor, rede, email SSL)
│       ├── stacks/route.ts     # GET catálogo com status instalado/não-instalado
│       ├── stacks/[id]/route.ts        # POST install / DELETE uninstall
│       └── stacks/[id]/schema/route.ts # GET campos do formulário
├── components/
│   ├── sidebar.tsx             # Navegação + accordion de categorias
│   ├── stack-card.tsx          # Card do catálogo (instalar / SSH hint / instalado)
│   ├── ssh-install-hint.tsx    # Modal com comando bash para stubs
│   ├── theme-provider.tsx      # Context de dark/light/system
│   ├── theme-toggle.tsx        # Botão cicla light → dark → system
│   ├── wizard/
│   │   └── install-wizard.tsx  # Formulário multi-step de instalação
│   └── ui/
│       ├── badge.tsx           # success | neutral | warning
│       ├── button.tsx          # primary | secondary | outline | destructive
│       ├── card.tsx            # variant glass
│       ├── collapsible.tsx     # Accordion sem dependência Radix
│       ├── dialog.tsx          # Modal acessível
│       ├── input.tsx           # Campo de texto
│       ├── label.tsx
│       └── empty-state.tsx
├── lib/
│   ├── portainer.ts            # Portainer REST API client (undici)
│   ├── installer.ts            # Orquestra deploy: valida → gera YAML → chama Portainer
│   ├── session.ts              # Cria/verifica cookies de sessão (HMAC-SHA256)
│   ├── csrf.ts                 # Tokens CSRF (HMAC duplo-submit)
│   ├── crypto.ts               # Wrappers AES-GCM (Node crypto)
│   ├── audit.ts                # Grava ações no SQLite
│   ├── db.ts                   # Singleton better-sqlite3
│   ├── vps-context.ts          # Lê /app/vps-context/*.conf do bind mount
│   ├── utils.ts                # cn() e helpers
│   ├── security/
│   │   ├── master-key.ts       # Lê Docker Secret /run/secrets/master_key
│   │   └── rate-limit.ts       # Rate limit em memória (login)
│   └── stacks/
│       ├── types.ts            # StackDefinition, StackField, SwarmContext, Zod helpers
│       ├── registry.ts         # ALL_STACKS[], getPublicCatalog(), findStack()
│       └── *.ts                # Uma stack por arquivo (83 total)
└── middleware.ts               # Proteção de rotas + exclusão de assets estáticos
```

---

## Sistema de Stacks

### `StackDefinition` (src/lib/stacks/types.ts)

```ts
type StackDefinition = {
  id: string;               // kebab-case, único
  name: string;             // Label exibido
  description: string;      // Descrição curta (card)
  category: Category;       // Ver categorias abaixo
  icon: string;             // Chave do mapa ICONS em stack-card.tsx
  dependsOn: string[];      // IDs de stacks que devem estar instaladas antes
  optionNumber: number;     // N° da opção no secondary.sh (positivo)
  fields: StackField[];     // Campos do formulário de instalação
  schema: z.ZodTypeAny;     // Validação dos campos
  repoUrl?: string;         // Link GitHub (aparece no nome do card)
  logoUrl?: string;         // URL da logo oficial (raw GitHub). Fallback: ícone lucide
  installVia?: "panel"|"bash"; // "panel" = wizard; "bash" = SshInstallHint
  swarmStackNames?: string[]; // Nomes Swarm se diferente de id_com_underscores
  externalVolumes?: string[]; // Volumes Docker pré-criados antes do deploy
  generateSecrets?: (values) => GeneratedSecret[];
  generateYaml: (values, secrets, ctx) => string;
  postInstall?: { accessUrl?, notes? };
}
```

### Categorias (20)

`infra` · `database` · `messaging` · `automation` · `ai` · `crm` · `cms` ·
`communication` · `marketing` · `scheduling` · `storage` · `monitoring` ·
`erp` · `analytics` · `auth` · `chatbot` · `media` · `remote` · `design` · `admin`

### Stacks com instalação completa via painel (11)

| ID | Categoria |
|---|---|
| traefik-portainer | infra |
| postgres | database |
| evolution | messaging |
| n8n | automation |
| chatwoot | crm |
| minio | storage |
| typebot | chatbot |
| directus | cms |
| ollama | ai |
| pgadmin | database |
| mongodb | database |

### Stubs metadata-only — installVia: "bash" (72)

Mostram card completo com link de repositório e badge "Em breve".
Botão "Instalar via SSH" abre modal com:
```
ssh root@<servidor>
bash /root/secondary.sh
# Escolha a opção N° X
```
Migrar um stub para instalação completa = implementar `fields`, `schema`, `generateYaml` e mudar `installVia` para `"panel"`.

---

## API Routes

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /api/auth | ❌ + RateLimit | Login com senha mestra |
| DELETE | /api/auth | ✅ + CSRF | Logout |
| GET | /api/csrf | ✅ | Token CSRF (httpOnly) |
| GET | /api/health | ❌ | Ping (status Portainer) |
| GET | /api/stacks | ✅ | Catálogo + `installed`/`ready`/`portainerOnline` |
| GET | /api/stacks/[id]/schema | ✅ | Campos do formulário |
| POST | /api/stacks | ✅ + CSRF + RateLimit | Instalar stack (idempotente: 409 se já existe) |
| GET | /api/audit | ✅ | Log de ações (últimas 200) |
| GET | /api/vps-context | ✅ | Dados da VPS (nome, rede, email) |

Painel é **somente instalação**: não há endpoint DELETE de stack — remoção/edição usa o Portainer.

---

## Autenticação e Segurança

- **Senha mestra:** validada via `authenticate()` no Portainer (não armazena hash local)
- **Sessão:** cookie `__Host-encha_session` (SameSite=Strict, Secure em prod, HttpOnly). Conteúdo cifrado com chave do Docker Secret `encha_panel_master_key`
- **Expiração:** dupla — `session.exp` (8h após login) + verificação de `jwt.exp` (do Portainer) a cada request. Qualquer um vencido → 401 → redirect para `/login`
- **CSRF:** token duplo-submit no cookie `__Host-encha_csrf` + header `x-csrf-token`. Aplicado em todos os POST/DELETE de mutação (auth DELETE, /api/stacks POST)
- **Origin check:** todas as mutações verificam header `Origin` contra host do servidor
- **Rate limit (SQLite):**
  - Login: 5 tentativas / 15 min por IP
  - POST /api/stacks: 3 tentativas / 1 min por IP+stackId
- **Idempotência:** POST /api/stacks checa `listSwarmStackStatuses` antes de deploy. Retorna 409 se stack já existe — protege contra duplo-clique e duas abas
- **TLS Portainer:** `PORTAINER_TLS_INSECURE=1` só funciona se `NODE_ENV != production` (defesa contra desabilitação acidental)
- **Container:** `read_only: true` + `tmpfs: /tmp, /app/.next/cache`. Banco SQLite no volume `encha_panel_data:/app/data`
- **Middleware:** protege todas as rotas exceto `/login`, `/api/auth`, `/api/csrf`, `/api/health` e assets estáticos

---

## VPS Context

O instalador bash grava `/root/dados_vps/*.conf` no host.
O container monta esse diretório em `/app/vps-context` (read-only bind mount).
`src/lib/vps-context.ts` parseia os arquivos e expõe:

```ts
{ nome_servidor, nome_rede_interna, email_ssl, url_portainer }
```

O catálogo usa esses valores como `default` nos campos do wizard de instalação.

---

## Portainer API

Client em `src/lib/portainer.ts` (undici, sem axios).

- `PORTAINER_URL` (env) — padrão `http://portainer_portainer:9000`
- `PORTAINER_TLS_INSECURE=1` — só ativa quando `NODE_ENV != production`
- **Detecção de stacks instaladas** — `listSwarmStackStatuses()` consulta
  `/api/endpoints/{id}/docker/services?status=true` (Docker Engine via proxy
  Portainer). Agrega por label `com.docker.stack.namespace`, retorna
  `{ name, desired, running, ready }`. Detecta tanto stacks deployadas pelo
  Portainer quanto stacks externas (criadas via `docker stack deploy` no bash)
- **Critério `ready`**: `desired === 0 || running >= desired` (scale=0 considerado
  intencional)
- Fluxo de deploy:
  1. `authenticate()` → JWT
  2. `listEndpoints()` → endpoint ID
  3. `getSwarm()` → swarm ID
  4. `ensureSwarmVolume()` para cada `externalVolumes` da stack (idempotente — 409 = ok)
  5. `deploySwarmStack()` — multipart form com YAML

## Estados visuais no catálogo

| Estado | Condição | Visual |
|---|---|---|
| Não instalado | stack ausente do Swarm | Botão "Instalar" laranja |
| Instalando | stack existe, `running < desired` | Badge amarelo "Instalando..." + spinner. Botão desabilitado |
| Pronto | stack existe, `running >= desired` | Badge verde "Instalado" (texto amarelo em dark mode) |

**Dependências:** só desbloqueiam quando a stack-pai está `installed && ready`
(não basta o YAML ter sido aceito).

**Polling:** catálogo refaz `GET /api/stacks` a cada 5s **apenas enquanto** há
stack em estado "Instalando". Timeout de 10 min — após isso, polling para mesmo
que stack continue não-ready (provavelmente falha de pull / config inválida).
  2. `listEndpoints()` → endpoint ID
  3. `getSwarm()` → swarm ID
  4. `deploySwarmStack()` — multipart form com YAML

---

## Design System

### Paleta principal

- **Coral** — CTA, accent, elementos ativos (`--coral-500: 16 85% 58%`)
- **Warm** — textos e backgrounds (`--warm-50` → `--warm-950`)
- **Glass** — backgrounds translúcidos com `backdrop-filter`

### Classes utilitárias

| Classe | Uso |
|---|---|
| `glass-md` | Painel principal (backdrop-blur, multi-layer shadow) |
| `glass-hover` | Cards com lift + halo coral no hover |
| `glass-frost` | Frosted glass mais opaco |

### Dark mode

Bootstrap inline no `<head>` (antes da hidratação) lê `localStorage.theme` e aplica `.dark` no `<html>`.
ThemeProvider React mantém estado sincronizado.
Ciclo: `light → dark → system`.

### Tokens críticos em dark mode

`--warning-foreground: 38 95% 82%` — amarelo âmbar claro para legibilidade.
Sem override = herda `38 92% 20%` (texto escuro ilegível em fundo escuro).

---

## Docker Deploy

### Pré-requisitos na VPS

```bash
# 1. Secret
openssl rand 32 | docker secret create encha_panel_master_key -

# 2. Volume
docker volume create encha_panel_data

# 3. Diretório VPS context (criado pelo secondary.sh)
ls /root/dados_vps/
```

### Build e deploy

```bash
cd /root/encha-setup-panel
docker build --no-cache -t enchaai/setup-panel:latest .
docker stack rm encha-panel
sleep 12
docker stack deploy -c docker-stack.yaml encha-panel
docker service logs encha-panel_panel --tail 30 --follow
```

### Variáveis de ambiente relevantes

| Variável | Valor padrão | Descrição |
|---|---|---|
| PORTAINER_URL | http://portainer_portainer:9000 | Portainer interno |
| DB_PATH | /app/data/panel.db | SQLite audit+sessões |
| VPS_CONTEXT_DIR | /app/vps-context | Bind mount dados VPS |
| NODE_ENV | production | |

---

## Adicionar uma Nova Stack (Portaria Total)

1. Criar `src/lib/stacks/<id>.ts` implementando `StackDefinition` completa
   - `installVia: "panel"`
   - `fields` com os campos do formulário
   - `schema` Zod validando os campos
   - `generateYaml` retornando o Docker Compose YAML para o Swarm
2. Importar e adicionar em `src/lib/stacks/registry.ts`
3. Adicionar ícone em `ICONS` de `src/components/stack-card.tsx` se necessário
4. Build + deploy na VPS

### Migrar um stub para instalação completa

Editar o arquivo existente do stub:
- Substituir `fields: []`, `schema: z.object({})`, `generateYaml: () => ""`
- Implementar os três acima conforme padrão das stacks completas
- Mudar `installVia: "bash"` para `installVia: "panel"`
- Rebuild e deploy
