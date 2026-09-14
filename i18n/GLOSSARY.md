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

## Fase 3 — catálogo de stacks

- Conteúdo editorial (`description`, `fields[].label/placeholder/helpText/
  group`, `postInstall.notes` estático, `secretLabels`) resolvido via
  `i18n?: {en?, es?}` em `StackDefinition` (`StackTextOverlay`,
  `src/lib/stacks/i18n-resolve.ts`) — sempre no servidor, nas rotas
  `GET /api/stacks`, `GET /api/stacks/[id]/schema` e `POST /api/stacks`.
  87/87 stacks traduzidas.
- `notes` como função (varia por `values`, ex. pareamento self-service vs.
  chave colada à mão) fica fora do overlay de propósito — o resolver cai
  no pt-BR automaticamente.
- **Gap conhecido**: mensagens de validação do Zod (`.refine()` dentro do
  `schema` de cada stack) continuam só em português — fora do escopo do
  `StackTextOverlay`.

## Fase 4 — instalador (`main.sh` + `secondary.sh`)

- Mesma arquitetura `t()`/`MSG_PT`/`MSG_EN`/`MSG_ES` da Fase 0/1, agora
  aplicada a todo o conteúdo de UI dos dois scripts (~2.050 chaves de
  catálogo). Executada em 10 lotes de agentes em paralelo, um por grupo de
  função, com chaves prefixadas pelo nome da função para nunca colidir entre
  lotes concorrentes editando o mesmo arquivo.
- Tecla de atalho `V` ("Voltar") continua fixa nos 3 idiomas — só o rótulo
  exibido ao lado dela é que traduz. Trocar o atalho por idioma quebraria
  scripts/hábito de quem já usa o menu.
- As larguras de coluna de `exibir_pagina1`/`exibir_pagina2` (antes fixas,
  `width=39`/`width=15`) agora são calculadas a partir do rótulo mais longo
  de cada idioma, recalculadas a cada render — porque `en`/`es` mudam o
  comprimento do texto e a Fase 0 tinha adiado esse cálculo para cá de
  propósito (ver Fase 0 do plano).
- As ~114 chaves de exibição dos arquivos `dados_*` que a Fase 0 tinha
  adiado (`Dominio:`, `Usuario:`, `Senha:` de ~70 stacks, `Host Mysql:`,
  `JWT Key:`, etc. — ver seção acima) **continuam sem leitor programático,
  logo continuam gravadas em português** nos arquivos de fio; só o texto ao
  redor delas na tela (os `echo` que as apresentam ao usuário) foi traduzido.
  Nenhum heredoc `dados_*` foi alterado nesta fase — confirmado via `git
  diff`.
- **Gaps de fronteira entre lotes, encontrados na varredura pós-hoc e
  corrigidos**: como os lotes rodaram em paralelo sobre o mesmo arquivo,
  limites de linha atribuídos a um lote podiam ficar desatualizados se um
  lote anterior já tivesse inserido linhas de catálogo antes daquele ponto.
  Achados dois casos reais: a cauda de `ferramenta_outline` (mensagem de
  sucesso final) e a função inteira `criar_bucket.minio()`, que tinha ficado
  fora do escopo de todos os 10 lotes. Ambos corrigidos manualmente depois.
  Método de verificação (reaplicável em qualquer fase futura que toque
  muitas funções em paralelo): `grep -n -E '\b(echo|printf|read)\b.*[áéíóú
  âêôãõçÁÉÍÓÚÂÊÔÃÕÇ]'` no arquivo, e inspecionar cada acerto — só sobram
  comentários e trechos de heredoc protegido depois de tudo tradução real
  convertida.
- **Bugs pré-existentes encontrados e deliberadamente preservados** (fora do
  escopo de "só traduzir"): `ferramenta_minio` (prompt de senha rotulado
  "Portainer"), `ferramenta_rustdesk` (`$rustdesk_config_string` vs. variável
  real `$rustdesk_string`, e um emoji corrompido), `ferramenta_hoppscotch` /
  `ferramenta_moodle` (checam a porta SMTP do Typebot em vez da própria),
  `ferramenta_passbolt` ("Passo 6/7" duplicado + typo "DDigite"),
  `instalar_ambiente_completo` (resumo final mostra usuário SMTP em vez de
  senha, por variável/escape errados). Cada um preservado byte a byte no
  texto traduzido — quem for mexer nessas funções por outro motivo decide se
  conserta.

## Fase 5 — Monitor (release notes, termos, banner)

- Backend fica no repositório separado `Monitor Encha` (fora deste repo) —
  ver `migrations/0019_setup_i18n.sql`, `src/app/api/version/route.ts`,
  `src/app/setup/terms.json/route.ts`, `src/app/setup/banner.json/route.ts`
  e os admins de releases/termos/banners lá.
- Padrão: coluna irmã `_en`/`_es` (nullable) ao lado da coluna pt-BR
  original, nunca tabela de tradução separada — não havia precedente disso
  no Monitor, e o conteúdo é 1 string por idioma, não dado relacional.
- Todo endpoint público aceita `?lang=pt|en|es` (default e fallback `pt`).
  Ausente ou desconhecido nunca é "sem filtro" — sempre cai em pt-BR,
  igual ao padrão que `canal`/`edicao` já usavam em `/api/version`.
- EN/ES só aparecem no admin quando o app selecionado é `setup` — os outros
  apps do Monitor (EnchaT, Scrify) não entram no escopo de i18n deste plano.
- `fetchTerms()` no painel (`src/lib/monitor.ts`) tinha um cache em processo
  de 60s pra não pagar o timeout do Monitor a cada navegação — teve que
  virar indexado por locale, senão uma resposta pt em cache esconderia
  en/es até o cache expirar.

## Teste end-to-end (2026-09-14) — 7 bugs reais achados ao vivo

O primeiro teste de ponta a ponta numa VPS real (`31.97.144.25`) achou 7
gaps que nenhum `bash -n`, scanner por acento ou teste automatizado tinha
pego — todos consertados na hora (commits `a3da914`, `dcae32c`, `2559821`,
`bb342e3`, `4f7f27e`). Detalhe de cada um no plano
(`~/.claude/plans/instalei-o-encha-setup-playful-biscuit.md`, seção
"Resultado dos passos 0–4"). Resumo dos padrões que causaram os gaps, pra
não repetir:

- **`declare -A` precisa vir antes de QUALQUER `MSG_PT[chave]=` no
  arquivo** — bash cria a variável como array indexado na primeira
  atribuição desse tipo se ainda não foi declarada, e um `declare -A`
  tardio falha em silêncio, corrompendo o catálogo inteiro. Isso só
  aparece em runtime, nunca em `bash -n`.
- **Módulos/componentes que não são nem "UI chrome" nem "overlay de
  stack"** escapam da varredura de qualquer fase que pense em termos
  dessas duas categorias (`category-labels.ts`, `theme-toggle.tsx`,
  `locale-toggle.tsx`, as páginas `logs`/`stacks` inteiras).
- **Fetch client-side que roda uma vez no mount** não se atualiza sozinho
  quando o locale muda depois — `setLocale()` só afeta Server Components
  via `router.refresh()`. Todo componente que busca conteúdo
  locale-dependente do servidor precisa de `locale` nas deps do efeito.
- **Funções auxiliares de cabeçalho curtas** (`banner()`,
  `msg_resumo_informacoes()`), chamadas por dezenas de outras funções, são
  fáceis de escapar de qualquer atribuição de lote por range de linha —
  mesmo padrão do gap já achado em `criar_bucket.minio()` na Fase 4.

## Pendências deste glossário

Nenhuma no momento. Itens anteriores (grafia da marca, `EnchaT Grátis`, `N8N
Formação Encha`, tradução de "Painel") foram decididos pelo Carlos em
2026-09-14.
