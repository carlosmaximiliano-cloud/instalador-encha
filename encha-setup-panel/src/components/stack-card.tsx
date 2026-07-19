"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Workflow, MessageCircle, Headphones, HardDrive, Bot, LayoutDashboard,
  Brain, TableProperties, DatabaseZap, Database, CheckCircle2, ExternalLink,
  UsersRound, FileText, Calendar, BarChart3, KeyRound, Radio, Monitor as MonitorIcon,
  PencilRuler, Activity, Mail, Loader2,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  workflow: Workflow,
  "message-circle": MessageCircle,
  headphones: Headphones,
  "hard-drive": HardDrive,
  bot: Bot,
  "layout-dashboard": LayoutDashboard,
  brain: Brain,
  "table-properties": TableProperties,
  "database-zap": DatabaseZap,
  database: Database,
  users: UsersRound,
  "file-text": FileText,
  calendar: Calendar,
  "bar-chart": BarChart3,
  key: KeyRound,
  radio: Radio,
  monitor: MonitorIcon,
  pencil: PencilRuler,
  activity: Activity,
  mail: Mail,
};

const CATEGORY_LABEL: Record<string, string> = {
  infra: "Infraestrutura",
  database: "Banco de dados",
  messaging: "Mensageria",
  automation: "Automação",
  ai: "IA",
  crm: "CRM & Suporte",
  cms: "CMS & No-Code",
  communication: "Comunicação",
  marketing: "Marketing & Formulários",
  scheduling: "Agendamento",
  storage: "Armazenamento",
  monitoring: "Monitoramento & Infra",
  erp: "ERP & Negócios",
  analytics: "Analytics & BI",
  auth: "Autenticação",
  chatbot: "Chatbots",
  media: "Mídia & Streaming",
  remote: "Acesso Remoto",
  design: "Design & Whiteboard",
  admin: "Admin",
};

export type CatalogEntry = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dependsOn: string[];
  installed: boolean;
  ready: boolean;
  repoUrl?: string;
  logoUrl?: string;
  installVia?: "panel" | "bash";
  optionNumber?: number;
};

export function StackCard({
  stack,
  readySet,
  onInstall,
}: {
  stack: CatalogEntry;
  readySet: Set<string>;
  onInstall: (id: string) => void;
}) {
  const Icon = ICONS[stack.icon] ?? Shield;
  const [logoOk, setLogoOk] = useState(true);
  const missingDeps = stack.dependsOn.filter((d) => !readySet.has(d));
  const canInstall = missingDeps.length === 0;
  const isBash = stack.installVia === "bash";
  const isDeploying = stack.installed && !stack.ready;

  let buttonLabel = "Instalar";
  if (stack.installed && stack.ready) buttonLabel = "Já instalado";
  else if (isDeploying) buttonLabel = "Instalando...";
  else if (!canInstall) buttonLabel = "Aguardando dependências";
  else if (isBash) buttonLabel = "Instalar via SSH";

  return (
    <Card variant="glass" className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="h-[52px] w-[52px] rounded-md bg-coral-100/60 dark:bg-coral-900/20 flex items-center justify-center text-coral-600 dark:text-coral-300 shrink-0 overflow-hidden p-1.5">
            {stack.logoUrl && logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stack.logoUrl}
                alt={stack.name}
                className="max-h-full max-w-full object-contain"
                onError={() => setLogoOk(false)}
                loading="lazy"
              />
            ) : (
              <Icon className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              {stack.repoUrl ? (
                <a
                  href={stack.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-coral-600 dark:hover:text-coral-400 hover:underline underline-offset-2 transition-colors"
                  title="Abrir repositório no GitHub"
                >
                  {stack.name}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              ) : (
                stack.name
              )}
              {stack.installed && stack.ready && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Instalado
                </Badge>
              )}
              {isDeploying && (
                <Badge variant="warning" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Instalando...
                </Badge>
              )}
              {isBash && !stack.installed && (
                <Badge variant="neutral" className="text-[10px]">
                  Em breve
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {CATEGORY_LABEL[stack.category] ?? stack.category}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{stack.description}</p>
        {missingDeps.length > 0 && !stack.installed && (
          <div className="mt-3 text-xs rounded-md bg-warning-soft text-warning-foreground px-3 py-2">
            Instale primeiro: {missingDeps.join(", ")}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={stack.installed ? "secondary" : isBash ? "outline" : "primary"}
          disabled={stack.installed || !canInstall}
          onClick={() => onInstall(stack.id)}
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
