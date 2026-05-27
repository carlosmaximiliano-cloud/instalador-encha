"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Trash2, ListChecks, Inbox } from "lucide-react";

type InstalledStack = { id: number; name: string; createdAt: number; external?: boolean };

export default function StacksPage() {
  const [stacks, setStacks] = useState<InstalledStack[]>([]);
  const [csrf, setCsrf] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/stacks");
    const d = await r.json();
    setStacks(d.installed ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((d) => setCsrf(d.token));
    load();
  }, []);

  async function remove(id: number, name: string) {
    if (!confirm(`Remover a stack "${name}"? Isso vai derrubar os containers e apagar volumes não-externos.`)) return;
    const r = await fetch(`/api/stacks/${id}`, {
      method: "DELETE",
      headers: { "x-csrf-token": csrf },
    });
    if (!r.ok) {
      const j = await r.json();
      alert("Erro: " + (j.error ?? r.status));
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Stacks instaladas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o que está rodando no Swarm.
        </p>
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
              <CardContent className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Instalada em {new Date(s.createdAt * 1000).toLocaleString("pt-BR")}
                </div>
                <Button variant="destructive" size="sm" onClick={() => remove(s.id, s.name)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
