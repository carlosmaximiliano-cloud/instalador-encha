"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ListChecks, Inbox, Info } from "lucide-react";

type InstalledStack = { id: number; name: string; createdAt: number; external?: boolean };

export default function StacksPage() {
  const [stacks, setStacks] = useState<InstalledStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/stacks");
        if (r.ok) {
          const d = await r.json();
          setStacks(d.installed ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Stacks instaladas
        </h1>
        <p className="text-sm text-muted-foreground">
          Lista do que está rodando no Swarm.
        </p>
        <div className="flex items-start gap-2 p-3 rounded-md bg-info-soft text-info-foreground text-sm">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Edição e remoção devem ser feitas pelo Portainer. O painel é exclusivo para instalação.
          </span>
        </div>
      </header>

      {loading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : stacks.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma stack ainda"
          description="Vá ao Catálogo para instalar sua primeira stack."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stacks.map((s) => (
            <Card key={s.id} variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate">{s.name}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {s.external && <Badge variant="neutral">externa</Badge>}
                    <Badge variant="success">ativa</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Instalada em {new Date(s.createdAt * 1000).toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
