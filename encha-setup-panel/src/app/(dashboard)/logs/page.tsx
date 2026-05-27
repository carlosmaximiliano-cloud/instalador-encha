"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

type Row = {
  id: number;
  ts: number;
  user: string;
  ip: string;
  action: string;
  target: string | null;
  result: string;
  meta: string | null;
};

export default function LogsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setRows(d.entries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-primary" />
          Audit log
        </h1>
        <p className="text-sm text-muted-foreground">
          Toda ação relevante registrada (append-only).
        </p>
      </header>
      <Card variant="glass">
        <CardContent className="p-0 overflow-hidden rounded-lg">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Sem registros ainda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-glass-strong backdrop-blur-md border-b border-glass-border">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Quando</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Usuário</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">IP</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Ação</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Alvo</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-glass-border last:border-0 hover:bg-glass-strong/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs">{new Date(r.ts).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2.5">{r.user}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.ip}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.action}</td>
                    <td className="px-4 py-2.5">{r.target ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={r.result === "ok" ? "success" : "destructive"}>{r.result}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
