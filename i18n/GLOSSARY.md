# Glossário — Encha Setup em pt-BR / en / es

Aprovado pelo Carlos em 2026-09-14. Qualquer tradução (instalador, painel,
notas de release) segue este glossário. Mudar uma entrada aqui é decisão de
produto, não de tradução — peça aprovação antes de alterar.

Variante de espanhol: **neutro / América Latina**. Tratamento `usted`/
`ustedes`, nunca `vosotros`. Vocabulário sem regionalismo forte — prefira
`computadora` a `ordenador`, `celular` a `móvil`.

## Marcas Encha — nunca traduzir, grafia fixa

| Termo | Grafia oficial | Observação |
|---|---|---|
| Encha Setup | `Encha Setup` | |
| EnchaT | `EnchaT` | **Não** `ENCHAT`. 43 ocorrências de `ENCHAT` no painel ficam pendentes de uniformizar (Fase 2). |
| EnchaT Grátis | `EnchaT Free` (en/es) | Nome de produto — vira "Free" nos três idiomas, não descreve preço na frase. |
| Encha Tracker | `Encha Tracker` | Produto fica só em português (fora deste plano). |
| Encha AI | `Encha AI` | |
| Pinfy | `Pinfy` | |
| N8N Formação Encha | `N8N Encha` (pt/en/es) | Deixa de ser frase descritiva — vira nome curto de produto, igual nos 3 idiomas. |

## Software de terceiros — nunca traduzir

Nome de cada aplicativo do catálogo, grafado como o projeto original grafa:
`n8n`, `Chatwoot`, `Evolution API`, `Portainer`, `Traefik`, `Docker`, `Docker
Swarm`, `Swarm`, `Chatwoot`, `Supabase`, etc. — e os demais ~85 nomes de stack
em `encha-setup-panel/src/lib/stacks/*.ts` (campo `name`).

Termos de infraestrutura que também não traduzem: `VPS`, `SSL`, `DNS`, `SMTP`,
`API`, `token`, `stack`.

## Traduzido — substantivo comum

| pt-BR | en | es |
|---|---|---|
| Painel | Panel | Panel |

## Identificadores técnicos — nunca traduzir

- Caminhos e arquivos: `/root/SetupEnchaAI`, `main.sh`, `dados_vps`,
  `encha_locale`.
- Variáveis de ambiente (`ENCHA_*`, `PANEL_*`) e nomes de stack/serviço
  (`encha-panel`, `portainer`, `traefik`).
- Números e atalhos de menu (`00`–`84`, `97`–`100`, `P1`/`P2`).
- Códigos vindos do Console (`numero_sem_licenca`, `cpf_nao_confere`, etc.) —
  nunca aparecem na tela; sempre mapeados para frase no idioma do usuário.

## Chaves dos arquivos `dados_*` — migram para inglês

Decisão: essas chaves (hoje em português, formato de fio lido de volta por
`grep`/`awk`/`cut` no instalador e pelo painel) migram para inglês, **igual
nos três idiomas de instalação** — não seguem o locale escolhido pelo usuário.
É um formato de fio único, não conteúdo traduzido.

Inventário exaustivo (Fase 0): **94 blocos de escrita**, **304 linhas
`Chave: valor`**, **125 rótulos distintos** — mas só **~11 grupos de chave**
têm leitor programático (`grep`/`awk`/`cut` em `main.sh`/`secondary.sh`, ou o
parser do painel). Os outros ~114 rótulos só aparecem em `echo` de resumo pro
usuário, sem nenhum código lendo de volta.

**Migrados nesta fase** (têm leitor — mudar escrita e leitura juntas, com
compatibilidade pra chave antiga):

| Arquivo | Chave atual (pt-BR) | Nova chave (en) | Leitor |
|---|---|---|---|
| `dados_vps` | `Nome do Servidor:` | `Server Name:` | `secondary.sh: dados()`, painel |
| `dados_vps` | `Rede interna:` | `Internal Network:` | idem |
| `dados_vps` | `Email para SSL:` | `SSL Email:` | painel só |
| `dados_vps` | `Link do Portainer:` | `Portainer Link:` | painel só |
| `dados_portainer` | `Dominio:` | `Domain:` | 6 pontos (main.sh + secondary.sh) |
| `dados_portainer` | `Usuario:` | `Username:` | idem |
| `dados_portainer` | `Senha:` | `Password:` | idem |
| `dados_portainer` | `Token:` | *(sem mudança)* | só checagem de existência |
| `dados_rabbitmq` | `Usuario:`/`Senha:` | `Username:`/`Password:` | `pegar_user_senha_rabbitmq()` |
| `dados_mysql` | `Senha:` | `Password:` | `pegar_senha_mysql_da_stack()` |
| `dados_clickhouse` | `Usuario:`/`Senha:` | `Username:`/`Password:` | `ferramenta_clickhouse()` |
| `dados_evolution` | `URL:`/`Global API Key:` | *(já em inglês, nada a fazer)* | `ferramenta_woofedcrm()` |

Compatibilidade: todo ponto de leitura aceita a chave nova **e** a antiga
(`grep -E "^(Nova|Antiga):"`), porque `dados_vps`/`dados_portainer` só são
regravados numa instalação completa nova — a frota já instalada mantém
arquivos com chave em português indefinidamente. Os arquivos por stack
(`dados_postgres`, `dados_rabbitmq`, etc.) são regravados sempre que aquela
stack é (re)instalada, mas nada força isso a acontecer — então a mesma regra
vale. Coberto por teste: `encha-setup-panel/src/lib/vps-context.test.ts`
(painel) e `i18n/test-t-function.sh`/verificação manual (bash).

**Adiados para a Fase 4** (só exibição, sem leitor — zero risco funcional em
deixar como estão até lá, onde são traduzidos junto com o texto ao redor):
as outras ~114 chaves — `Dominio:`/`Usuario:`/`Senha:` dos ~70 stacks
restantes, `Host Mysql:`, `Porta Mysql:`, `ENCHAT_MASTER_KEY:`, `JWT Key:`,
`Anon Key:`, `Service Key:`, `ApiKey do RustDesk:`, `Documentação:`,
`Config:`, `String de Conexão:`, `URL de Conexão:`, `URL de Callback:`,
`Login:`, `Authorization:`, `API_KEY:`, `Auth Token:`, `Versão:`, `Arquivos
do site:`, `Arquivos do php:`, `Diretório de Origem Mapeado:`, `Senha da
Interface:`, `Banco de dados:`, e cada `Dominio do <App>:` específico.

**Achados durante o inventário, registrados para a Fase 4 (não corrigidos
agora — fora do escopo de "nada muda"):**
- `Dominio do Chatwoot:` é lida em `secondary.sh` mas nunca escrita (o bloco
  de escrita do Chatwoot só grava `Dominio:`) — `url_chatwoot` sempre vem
  vazio hoje. Comportamento preservado; decisão de corrigir fica para quem
  mexer nessa função depois.
- `verificar_arquivo()` chama `nome_credenciais`/`verificar_campos`, que não
  existem em nenhum dos dois scripts — código morto adjacente, sem relação
  com leitura de chave.
- Inconsistência pré-existente de acento: `Usuário:` (com acento, em
  `dados_minio`/`dados_directus`) vs `Usuario:` (sem, no resto) — nenhum
  leitor toca essas duas, então nunca foi bug; dá pra normalizar de graça na
  Fase 4.

## Fase 2 — arquitetura de tradução do painel

- UI chrome: um arquivo `<componente>.i18n.ts` ao lado de cada componente
  traduzido, exportando `Record<Locale, T>` (pt/en/es), lido via
  `useDict()` (`src/lib/i18n/use-dict.ts`). Entrada com variável vira função
  (`(arg: string) => string`), não string com placeholder.
- Erros de API: `apiError(errors, code, locale, status, extra?)`
  (`src/lib/api-error.ts`) — cada rota declara seu próprio dicionário local
  de códigos e chama `resolveLocale()` (`src/lib/locale.ts`) no início do
  handler. Resposta sempre `{error: <código estável>, message: <traduzida>}`
  — o cliente mostra `data.message`, nunca `data.error` cru. 401 de "não
  autenticado" é compartilhado (`unauthenticatedResponse()`), repetido em
  ~24 rotas antes.
- `middleware.ts` (Edge runtime) tem sua própria cópia simplificada da
  mesma mensagem de 401 — não importa de `api-error.ts`/`locale.ts` porque
  esses dependem de `next/headers`/`node:fs`, incompatíveis com Edge. Só lê
  o cookie de locale, sem arquivo da instalação nem Accept-Language.
- **Gap conhecido**: `src/lib/installer.ts`, `updater.ts`, `host-updater.ts`
  ainda retornam erro como prosa em português — as rotas que os chamam
  repassam esse texto sem traduzir. Fora do escopo desta fase (só as
  mensagens hardcoded nos arquivos `route.ts` foram migradas).

## Pendências deste glossário

Nenhuma no momento. Itens anteriores (grafia da marca, `EnchaT Grátis`, `N8N
Formação Encha`, tradução de "Painel") foram decididos pelo Carlos em
2026-09-14.
