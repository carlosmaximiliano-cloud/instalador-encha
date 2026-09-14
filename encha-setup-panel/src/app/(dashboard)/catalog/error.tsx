"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-dict";
import { catalogErrorText } from "./error.i18n";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useDict(catalogErrorText);
  useEffect(() => {
    console.error("[Catalog Error]", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="font-semibold text-destructive">{t.title}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
            {error.message || t.unknownError}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 mt-2">{t.digest(error.digest)}</p>
          )}
        </div>
      </div>
      <Button onClick={reset} variant="primary">
        {t.retry}
      </Button>
    </div>
  );
}
