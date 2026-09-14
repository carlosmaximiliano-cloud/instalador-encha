"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check } from "lucide-react";
import { useDict } from "@/lib/i18n/use-dict";
import { sshInstallHintText } from "./ssh-install-hint.i18n";

export function SshInstallHint({
  stackName,
  optionNumber,
  open,
  onClose,
}: {
  stackName: string;
  optionNumber?: number;
  open: boolean;
  onClose: () => void;
}) {
  const t = useDict(sshInstallHintText);
  const [copied, setCopied] = useState(false);
  const cmd = `ssh root@<seu-servidor>\nbash /root/secondary.sh${
    optionNumber && optionNumber > 0 ? `\n${t.chooseOptionComment(optionNumber)}` : ""
  }`;

  function copy() {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-coral-600" />
            {t.title(stackName)}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <pre className="bg-warm-900 dark:bg-warm-50 text-warm-50 dark:text-warm-900 text-xs font-mono rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
{cmd}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-warm-700/50 hover:bg-warm-700 text-warm-50 transition-colors"
            title={t.copy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {optionNumber && optionNumber > 0 ? (
          <p className="text-xs text-muted-foreground">
            {t.menuInstructions(optionNumber)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t.fallbackInstructions}</p>
        )}

        <div className="rounded-md bg-info-soft text-info-foreground px-3 py-2 text-xs">
          <strong>{t.comingSoonLabel}</strong> {t.comingSoonText}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t.gotIt}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
