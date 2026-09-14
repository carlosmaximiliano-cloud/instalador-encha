import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getStack } from "@/lib/stacks/registry";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";

const ERROS = {
  stack_desconhecida: { pt: "Stack desconhecida", en: "Unknown stack", es: "Stack desconocida" },
} satisfies Record<string, Record<import("@/lib/locale-shared").Locale, string>>;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  const { id } = await ctx.params;
  const def = getStack(id);
  if (!def) return apiError(ERROS, "stack_desconhecida", locale, 404);

  return NextResponse.json({
    id: def.id,
    name: def.name,
    description: def.description,
    fields: def.fields,
    // Só o subconjunto que a UI precisa pra saber ONDE renderizar o
    // componente de pareamento e quais campos do form ele preenche —
    // consoleBaseUrl/edicao ficam só no servidor (installer.ts e as rotas
    // /api/license/pair/*), o browser nunca fala direto com o Console.
    pairing: def.pairing
      ? { targetField: def.pairing.targetField, sessionField: def.pairing.sessionField, group: def.pairing.group }
      : null,
    // emailActivation (Ciclo 20b) NÃO é mais exposto aqui: desde o Ciclo D
    // o e-mail é só mais um campo comum de `fields` (kind:"email"), sem
    // componente dedicado no wizard — nenhuma metadata extra é necessária
    // pro browser.
  });
}
