import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";
import { aplicarFixacao, FixarVersoesError, preverFixacao, STACK_ENCHAT, type CodigoErroFixacao } from "@/lib/fixar-versoes";
import type { Locale } from "@/lib/locale-shared";

type Ctx = { params: Promise<{ id: string }> };

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF", es: "CSRF inválido" },
  confirmacao_ausente: {
    pt: "É preciso confirmar a ação.",
    en: "The action must be confirmed.",
    es: "Hay que confirmar la acción.",
  },
  stack_desconhecida: { pt: "Stack desconhecida", en: "Unknown stack", es: "Stack desconocida" },
  falha_portainer: {
    pt: "Falha ao consultar o Portainer. Nada foi alterado.",
    en: "Failed to query Portainer. Nothing was changed.",
    es: "Fallo al consultar Portainer. No se cambió nada.",
  },
  stack_nao_instalada: {
    pt: "A stack enchat não está instalada.",
    en: "The enchat stack is not installed.",
    es: "La stack enchat no está instalada.",
  },
  nao_convergida: {
    pt: "A stack ainda não está estável (há serviços subindo). Espere terminar e tente de novo. Nada foi alterado.",
    en: "The stack is not stable yet (services are still starting). Wait and try again. Nothing was changed.",
    es: "La stack aún no está estable (hay servicios arrancando). Espere y reintente. No se cambió nada.",
  },
  imagens_invalidas: {
    pt: "As imagens em execução não são as esperadas do EnchaT. Nada foi alterado.",
    en: "The running images are not the expected EnchaT ones. Nothing was changed.",
    es: "Las imágenes en ejecución no son las esperadas de EnchaT. No se cambió nada.",
  },
  versoes_divergentes: {
    pt: "O app e o Pinfy estão em versões diferentes (há uma atualização em andamento ou incompleta). Conclua-a antes. Nada foi alterado.",
    en: "The app and Pinfy are on different versions (an update is in progress or incomplete). Finish it first. Nothing was changed.",
    es: "La app y Pinfy están en versiones distintas (hay una actualización en curso o incompleta). Termínela antes. No se cambió nada.",
  },
  stack_externa: {
    pt: "Esta stack não foi criada pelo Portainer (sem arquivo para editar). Nada foi alterado.",
    en: "This stack was not created through Portainer (no stack file to edit). Nothing was changed.",
    es: "Esta stack no se creó por Portainer (sin archivo para editar). No se cambió nada.",
  },
  compose_inesperado: {
    pt: "O arquivo da stack foi editado de um jeito que esta ação não sabe tratar com segurança. Nada foi alterado.",
    en: "The stack file was edited in a way this action cannot handle safely. Nothing was changed.",
    es: "El archivo de la stack fue editado de una forma que esta acción no puede tratar con seguridad. No se cambió nada.",
  },
  mudou_durante: {
    pt: "Uma imagem mudou durante a operação (atualização em andamento?). Nada foi alterado; tente de novo em alguns minutos.",
    en: "An image changed during the operation (update in progress?). Nothing was changed; try again in a few minutes.",
    es: "Una imagen cambió durante la operación (¿actualización en curso?). No se cambió nada; reintente en unos minutos.",
  },
  registro_recusou: {
    pt: "Não foi possível renovar o acesso às imagens (registro). Nada foi alterado.",
    en: "Could not refresh access to the images (registry). Nothing was changed.",
    es: "No se pudo renovar el acceso a las imágenes (registro). No se cambió nada.",
  },
  em_andamento: {
    pt: "Já há uma fixação em andamento.",
    en: "A pinning operation is already in progress.",
    es: "Ya hay una fijación en curso.",
  },
  muitas_tentativas: { pt: "Muitas tentativas", en: "Too many attempts", es: "Demasiados intentos" },
} satisfies Record<string, Record<Locale, string>>;

const STATUS: Record<CodigoErroFixacao, number> = {
  stack_nao_instalada: 404,
  nao_convergida: 409,
  imagens_invalidas: 422,
  versoes_divergentes: 409,
  stack_externa: 422,
  compose_inesperado: 422,
  mudou_durante: 409,
  registro_recusou: 502,
  em_andamento: 409,
};

function respostaErro(e: unknown, locale: Locale): NextResponse {
  if (e instanceof FixarVersoesError) return apiError(ERROS, e.codigo, locale, STATUS[e.codigo]);
  console.error("[api/stacks/enchat/fixar-versoes]", e);
  return apiError(ERROS, "falha_portainer", locale, 502);
}

/** Prévia: o que seria mudado. Não altera nada. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const locale = await resolveLocale();
  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { id } = await params;
  if (id !== STACK_ENCHAT) return apiError(ERROS, "stack_desconhecida", locale, 404);
  try {
    return NextResponse.json({ ok: true, previa: await preverFixacao(auth.token) });
  } catch (e) {
    return respostaErro(e, locale);
  }
}

/** Aplica. Exige `{ confirmar: true }`. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);
  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { id } = await params;
  if (id !== STACK_ENCHAT) return apiError(ERROS, "stack_desconhecida", locale, 404);

  const ip = getClientIp(req);
  const rl = checkRateLimit(`fixar:${ip}:${id}`, 3, 60_000);
  if (!rl.allowed) return apiError(ERROS, "muitas_tentativas", locale, 429);

  const corpo = (await req.json().catch(() => null)) as { confirmar?: unknown } | null;
  if (corpo?.confirmar !== true) return apiError(ERROS, "confirmacao_ausente", locale, 400);

  try {
    const resultado = await aplicarFixacao({ token: auth.token, user: auth.session.user, ip });
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    return respostaErro(e, locale);
  }
}
