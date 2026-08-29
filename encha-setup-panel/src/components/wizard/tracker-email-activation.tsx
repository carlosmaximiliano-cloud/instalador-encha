"use client";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

// Ativação síncrona por e-mail do Encha Tracker (Ciclo 20b) — DELIBERADAMENTE
// sem polling, sem sessão: um POST, uma resposta. Não é uma versão
// simplificada de LicensePairing (license-pairing.tsx) — é um componente
// próprio, porque o problema é mais simples (o Console devolve a chave num
// passo só, POST /api/v1/tracker/ativar, Ciclo 7). Reusar a máquina de
// polling daquele componente importaria complexidade de um problema que
// este fluxo não tem.
//
// Fica dentro do grupo "Licença" do wizard, ao lado do campo `chave_licenca`
// manual — os dois convivem: ativar por e-mail PREENCHE o campo; quem já
// tem uma chave de outro canal pode digitar/colar direto por baixo.

type EmailActivationSpecUI = { targetField: string };

type Estado = { kind: "form" } | { kind: "enviando" } | { kind: "sucesso" } | { kind: "erro"; mensagem: string };

export function TrackerEmailActivation({
  stackId,
  csrfToken,
  spec,
  form,
}: {
  stackId: string;
  csrfToken: string;
  spec: EmailActivationSpecUI;
  form: UseFormReturn<Record<string, unknown>>;
}) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>({ kind: "form" });

  async function ativar() {
    if (!email) return;
    setEstado({ kind: "enviando" });
    try {
      const res = await fetch("/api/license/tracker/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ stackId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEstado({ kind: "erro", mensagem: data.message ?? data.error ?? "Não foi possível ativar." });
        return;
      }
      form.setValue(spec.targetField, data.chave, { shouldValidate: true });
      setEstado({ kind: "sucesso" });
    } catch {
      setEstado({ kind: "erro", mensagem: "Erro de rede — tente de novo." });
    }
  }

  if (estado.kind === "sucesso") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        <span>Licença ativada — a chave foi preenchida abaixo.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tracker-email-ativacao">Ativar pelo e-mail da compra</Label>
      <div className="flex gap-2">
        <Input
          id="tracker-email-ativacao"
          type="email"
          placeholder="cliente@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={estado.kind === "enviando"}
        />
        <Button type="button" onClick={ativar} disabled={!email || estado.kind === "enviando"}>
          {estado.kind === "enviando" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ativar"}
        </Button>
      </div>
      {estado.kind === "erro" && <p className="text-sm text-destructive">{estado.mensagem}</p>}
      <p className="text-xs text-muted-foreground">Ou cole uma chave já emitida no campo abaixo.</p>
    </div>
  );
}
