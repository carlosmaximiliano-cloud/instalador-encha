import type { Locale } from "@/lib/locale-shared";

export type BannerAdText = { fallbackAlt: string };

export const bannerAdText: Record<Locale, BannerAdText> = {
  pt: { fallbackAlt: "Propaganda" },
  en: { fallbackAlt: "Advertisement" },
  es: { fallbackAlt: "Publicidad" },
};
