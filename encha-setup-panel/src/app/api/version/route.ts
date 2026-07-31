import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { fetchLatestVersion } from "@/lib/monitor";
import { APP_VERSION, compareSemver } from "@/lib/version";
import { getLocalAdmin } from "@/lib/auth/local-admin";

export const dynamic = "force-dynamic";

// Versão local + última publicada no Monitor. Best-effort: se o Monitor cair,
// retorna apenas a versão atual sem aviso de update.
export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const release = await fetchLatestVersion();
  const latest = release?.latest_version ?? null;
  const updateAvailable = !!latest && compareSemver(latest, APP_VERSION) > 0;

  return NextResponse.json(
    {
      current: APP_VERSION,
      latest,
      updateAvailable,
      releaseUrl: release?.release_url ?? null,
      releaseNotesHtml: release?.release_notes_html ?? null,
      publishedAt: release?.published_at ?? null,
      // "local" = admin próprio do painel (PANEL_ADMIN_USER); "portainer" =
      // login em passthrough direto para o Portainer (instalações antigas).
      // Exposto para o suporte identificar o modo sem precisar de SSH.
      authMode: getLocalAdmin() ? "local" : "portainer",
    },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
