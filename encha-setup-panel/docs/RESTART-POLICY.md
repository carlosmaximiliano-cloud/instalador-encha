# Reconciliador da restart_policy

Contexto: incidente de 16/10/2026 (`on-failure` + Postgres saindo com exit 0 no reboot da VPS).
Regra: serviço de vida longa usa `restart_policy.condition: any`, sem `max_attempts`.

- **Instalações novas:** os templates (`stacks/enchat.ts`, `stacks/encha-tracker.ts`,
  `docker-stack.yaml`, `secondary.sh`) já saem em `any`. Gates: `restart-policy-templates.test.ts`
  e `tests/test-restart-policy.sh`.
- **Instalações existentes:** `restart-policy-runtime.ts` corrige o arquivo da stack no Portainer
  e, na janela 02h–05h (America/Sao_Paulo), o serviço ao vivo (banco primeiro).
  Allowlist fechada em `restart-policy.ts`.
- **Desligado por padrão.** Liga só com `reconciliar_restart` ligado no Console
  (`/api/v1/setup/flags`). Kill switch local: `ENCHA_RECONCILIAR_RESTART=off`.
- **O próprio painel** não se reinicia por isso: o `updater.ts` aplica o patch no arquivo da stack
  `encha-panel` na autoatualização (vale a partir da atualização seguinte à que trouxe o código).
