// Cliente server-side do Monitor Encha (backend central). Server-to-server, sem CORS.
// Todas as chamadas são best-effort: timeout curto + try/catch, nunca lançam pro caller.

const MONITOR_BASE_URL = process.env.MONITOR_BASE_URL ?? "https://monitor.encha.com.br";

export type BannerPosition = "top" | "sidebar";
const TIMEOUT_MS = 4000;

export type MonitorBanner = {
  id: number;
  image_url: string;
  link_url: string;
  alt_text: string;
  etag: string;
};

export type MonitorTerms = {
  version: string;
  content_md: string;
};

export type MonitorRelease = {
  latest_version: string;
  release_url: string | null;
  release_notes_html: string | null;
  published_at: number;
};

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    console.warn("[monitor] fetch falhou:", url, (e as Error).message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function fetchBanner(position: BannerPosition = "top"): Promise<MonitorBanner | null> {
  const pos = position === "sidebar" ? "sidebar" : "top";
  const res = await fetchWithTimeout(`${MONITOR_BASE_URL}/setup/banner.json?position=${pos}`, {
    cache: "no-store",
  });
  if (!res || res.status === 204 || !res.ok) return null;
  try {
    const data = (await res.json()) as MonitorBanner;
    if (!data?.id || !data?.image_url) return null;
    return data;
  } catch {
    return null;
  }
}

// Memo curto em processo: TermsGate roda a cada navegação do dashboard
// (server component, sem cache do Next entre requests distintos), então sem
// isso cada clique pagaria os 4s de timeout do Monitor sempre que ele cair.
let termsCache: { at: number; value: MonitorTerms | null } | null = null;
const TERMS_CACHE_MS = 60_000;

export async function fetchTerms(): Promise<MonitorTerms | null> {
  if (termsCache && Date.now() - termsCache.at < TERMS_CACHE_MS) return termsCache.value;

  const res = await fetchWithTimeout(`${MONITOR_BASE_URL}/setup/terms.json`, {
    cache: "no-store",
  });
  if (!res || res.status === 204 || !res.ok) {
    termsCache = { at: Date.now(), value: null };
    return null;
  }
  try {
    const data = (await res.json()) as MonitorTerms;
    const value = data?.version ? data : null;
    termsCache = { at: Date.now(), value };
    return value;
  } catch {
    termsCache = { at: Date.now(), value: null };
    return null;
  }
}

// Última release publicada do Encha Setup no Monitor. O painel compara com APP_VERSION.
export async function fetchLatestVersion(): Promise<MonitorRelease | null> {
  const res = await fetchWithTimeout(`${MONITOR_BASE_URL}/api/version`, {
    cache: "no-store",
  });
  if (!res || res.status === 404 || !res.ok) return null;
  try {
    const data = (await res.json()) as MonitorRelease;
    if (!data?.latest_version) return null;
    return data;
  } catch {
    return null;
  }
}

export async function reportBannerClick(input: {
  bannerId: number;
  deviceId: string;
  userAgent: string;
  ts: number;
}): Promise<boolean> {
  const res = await fetchWithTimeout(`${MONITOR_BASE_URL}/api/v1/banner-clicks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      banner_id: input.bannerId,
      app_slug: "setup",
      device_id: input.deviceId,
      user_agent: input.userAgent,
      ts: input.ts,
    }),
  });
  return !!res && res.ok;
}

export async function reportTermsAcceptance(input: {
  deviceId: string;
  hostname: string;
  userAgent: string;
  termsVersion: string;
  stackId: string;
  ip: string;
  ts: number;
}): Promise<boolean> {
  const res = await fetchWithTimeout(`${MONITOR_BASE_URL}/api/terms/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: input.deviceId,
      hostname: input.hostname,
      ip: input.ip,
      user_agent: input.userAgent,
      terms_version: input.termsVersion,
      agreed: true,
      ts: input.ts,
      // contexto extra preservado em request_payload_raw (JSONB) no Monitor
      stack_id: input.stackId,
      source: "encha-setup-panel",
    }),
  });
  return !!res && res.ok;
}
