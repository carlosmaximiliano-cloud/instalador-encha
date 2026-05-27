# Encha Setup Panel

Painel web visual para instalar stacks no Portainer Swarm — substitui o instalador bash interativo por uma UX moderna, segura e sem terminal.

## Stack tecnológica

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + componentes shadcn/ui
- **React Hook Form** + **Zod** para validação tipada
- **SQLite** (better-sqlite3) para audit log + secrets cifrados
- **node:crypto** para AES-256-GCM
- **undici** como cliente HTTP do Portainer API

## Recursos do MVP

- Login reutilizando o JWT do Portainer (sem armazenar senhas)
- Catálogo visual com 10 stacks principais (Traefik+Portainer, N8N, Evolution, Chatwoot, Minio, Typebot, Directus, Ollama, PgAdmin, MongoDB)
- Wizard de instalação com validação inline, campos sensíveis mascarados e geração automática de secrets
- Deploy real via `POST /api/stacks/create/swarm/file` do Portainer mantendo labels Traefik + rede overlay
- Remoção de stacks instaladas
- Audit log append-only com IP, usuário, ação, alvo
- Rate limit no login (5/15min/IP)
- CSRF double-submit + Origin check
- Cookies `__Host-` httpOnly Secure SameSite=Strict
- HSTS + CSP + X-Frame-Options DENY

## Segurança em camadas

1. **Chave mestra**: Swarm Secret de 32 bytes, montado em `/run/secrets/master_key`
2. **Cripto em repouso**: env vars sensíveis cifradas com AES-256-GCM antes de gravar
3. **Cripto em trânsito**: TLS 1.3 forçado pelo Traefik
4. **Container hardening**: usuário não-root, filesystem read-only, sem capabilities extras
5. **Rate limiting** + **audit logging** em SQLite

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
npm run dev    # localhost:3000
```

Para subir Portainer fake junto:

```bash
docker compose -f docker-compose.dev.yaml up
```

## Deploy em produção (no Swarm já existente)

```bash
# 1. Gerar a master key como Swarm Secret
openssl rand 32 | docker secret create encha_panel_master_key -

# 2. Criar volume persistente
docker volume create encha_panel_data

# 3. Build da imagem
docker build -t enchaai/setup-panel:latest .

# 4. Deploy
SETUP_URL=setup.suaempresa.com SWARM_NETWORK=enchaNet \
  docker stack deploy -c docker-stack.yaml encha-panel
```

Acesse `https://setup.suaempresa.com` e entre com seu usuário do Portainer.

## Estrutura

```
src/
├── app/               # Next.js App Router
│   ├── (dashboard)/   # Páginas autenticadas
│   ├── api/           # Routes server-side
│   └── login/
├── lib/
│   ├── stacks/        # Definições das stacks (1 .ts por stack)
│   ├── security/      # master-key, rate-limit
│   ├── crypto.ts      # AES-256-GCM
│   ├── portainer.ts   # cliente API
│   ├── installer.ts   # orquestrador
│   ├── audit.ts       # logger
│   └── csrf.ts
└── components/
    ├── ui/            # shadcn primitives
    └── wizard/        # wizard de instalação
```

## Adicionando uma nova stack

1. Crie `src/lib/stacks/<minha-stack>.ts` exportando uma `StackDefinition`
2. Registre em `src/lib/stacks/registry.ts`
3. Pronto — aparece no catálogo automaticamente

## Roadmap

- Editor de env vars + redeploy
- 2FA TOTP próprio
- Suporte às 82 stacks (atualmente 10)
- Backup/restore de configurações
- Multi-VPS
