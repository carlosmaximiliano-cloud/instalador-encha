"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        setError(data.error ?? "Falha ao entrar");
        return;
      }
      router.push("/catalog");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle className="glass-sm" />
      </div>
      {/* Hero */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden p-12">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-coral-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-coral-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-warning/20 blur-3xl"
        />

        <div className="relative z-10 max-w-md space-y-6 animate-fade-blur-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Encha AI"
            width={280}
            height={56}
            className="h-14 w-auto dark:brightness-0 dark:invert"
          />
          <h1 className="text-4xl font-bold tracking-tight text-warm-900">
            Painel visual de instalação
          </h1>
          <p className="text-lg text-warm-700">
            Configure stacks no seu Portainer Swarm sem terminal. Tudo visual,
            seguro e com SSL automático.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Traefik+Portainer", "N8N", "Evolution", "Chatwoot", "Minio", "Typebot"].map((s) => (
              <span
                key={s}
                className="rounded-full glass-sm px-3 py-1 text-xs font-medium text-warm-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md glass-lg rounded-xl p-8 space-y-6 animate-spring-in">
          <div className="lg:hidden flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Encha AI"
              width={200}
              height={40}
              className="h-10 w-auto dark:brightness-0 dark:invert"
            />
          </div>
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais do Portainer
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div role="alert" className="text-sm text-destructive bg-destructive-soft rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !username || !password}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
